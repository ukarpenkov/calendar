#!/usr/bin/env python3
"""USB Android animation stress/regression tests; preserves app data and settings.

Runs only against the explicitly supplied serial. The handset must be unlocked.
--section settings/stress/reduced can repeat an affected group after a fix.
"""
import argparse
import json
import pathlib
import re
import subprocess
import struct
import tempfile
import time
import xml.etree.ElementTree as ET

APP = 'com.prodyk.calendar'
LABELS = {
    'settings': ('Настройки', 'Settings', 'Ajustes'),
    'next': ('Следующий месяц', 'Next month', 'Mes siguiente'),
    'previous': ('Предыдущий месяц', 'Previous month', 'Mes anterior'),
    'back': ('Назад', 'Back', 'Atrás'),
    'year': ('К году', 'Back to year', 'Volver al año'),
}
MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--serial', required=True)
    parser.add_argument('--adb', default='adb')
    parser.add_argument('--output')
    parser.add_argument('--section', choices=['all', 'settings', 'stress', 'reduced', 'interruptions', 'visual', 'paging'], default='all')
    args = parser.parse_args()
    output = pathlib.Path(args.output or tempfile.mkdtemp(prefix='phone-animations-'))
    output.mkdir(parents=True, exist_ok=True)
    results = []
    requested_rotation = 0

    def adb(*command):
        return subprocess.check_output([args.adb, '-s', args.serial, *map(str, command)],
                                       stderr=subprocess.STDOUT, timeout=40)

    def shell(*command):
        action = ' '.join(map(str, command))
        if any(value in action for value in ('input tap', 'input swipe', 'input keyevent KEYCODE_BACK')):
            activity = adb('shell', 'dumpsys', 'activity', 'activities').decode()
            foreground = next((line for line in activity.splitlines() if 'topResumedActivity=' in line), '')
            assert 'com.prodyk.calendar/' in foreground, 'Another app took foreground; test interrupted before input'
        return adb('shell', *command).decode().strip()

    def identifier(node):
        return node.get('resource-id', '').split('/')[-1]

    def nodes(root, name):
        return [n for n in root.iter('node') if identifier(n) == name]

    def one(root, name):
        found = nodes(root, name)
        assert len(found) == 1, f'{name}: {len(found)} visible nodes'
        return found[0]

    def bounds(node):
        return tuple(map(int, re.findall(r'\d+', node.attrib['bounds'])))

    def tap(node):
        x1, y1, x2, y2 = bounds(node)
        shell('input', 'tap', (x1+x2)//2, (y1+y2)//2)

    def button(root, name):
        # Full layout dumps may include covered scenes; target the active scene.
        if nodes(root, 'settings-screen'):
            scope = one(root, 'settings-screen')
        elif nodes(root, 'month-title') and nodes(root, 'month-layer'):
            scope = one(root, 'month-layer')
        elif nodes(root, 'year-layer'):
            scope = one(root, 'year-layer')
        else:
            scope = root
        found = [n for n in scope.iter('node') if n.get('content-desc') in LABELS[name]]
        assert len(found) == 1, f'button {name}: {len(found)} matches'
        return found[0]

    def taps(root, sequence):
        commands = []
        for name in sequence:
            x1, y1, x2, y2 = bounds(button(root, name))
            commands.append(f'input tap {(x1+x2)//2} {(y1+y2)//2}')
        shell('; '.join(commands))

    def snapshot(name):
        for attempt in range(3):
            result = shell('uiautomator', 'dump', '/sdcard/calendar-animation-test.xml')
            if 'dumped to:' in result:
                break
            time.sleep(.25)
        else:
            raise AssertionError(f'{name}: failed fresh accessibility dump: {result}')
        xml = adb('exec-out', 'cat', '/sdcard/calendar-animation-test.xml')
        root = ET.fromstring(xml)
        assert any(n.get('package') == APP for n in root.iter('node')), f'{name}: app is not in foreground'
        (output/f'{name}.xml').write_bytes(xml)
        png=adb('exec-out','screencap','-p')
        (output/f'{name}.png').write_bytes(png)
        screen_width,screen_height=struct.unpack('>II',png[16:24])
        assert (screen_width>screen_height)==(requested_rotation in (1,3)), f'{name}: system display orientation has not settled'
        return root

    def passed(name, **data):
        results.append(dict(name=name, **data))
        (output/'results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
        print(f'PASS {name}: {data}', flush=True)

    def current(root):
        found = [identifier(n) for n in root.iter('node') if identifier(n).startswith('month-content-')]
        assert len(found) == 1, f'visible month content: {found}'
        return int(found[0].split('-')[-1])

    def check(month, name, selected=None, split=None):
        root = snapshot(name)
        assert current(root) == month, f'{name}: expected {month}, got {current(root)}'
        title = one(root, 'month-title').get('text')
        assert title, f'{name}: empty title'
        days = [n for n in root.iter('node') if identifier(n).startswith('calendar-day-')]
        assert days, f'{name}: no dates'
        assert all(int(identifier(n).split('-')[-2]) == month for n in days), f'{name}: wrong dates'
        if selected:
            assert one(root, selected).get('selected') == 'true', f'{name}: lost selection'
        images = [n for n in one(root, 'month-pager').iter('node') if n.get('class') == 'android.widget.ImageView']
        assert len(images) == 1, f'{name}: {len(images)} images after settling'
        if split is not None:
            banner = bounds(one(root, 'month-holiday-banner'))
            calendar = bounds(one(root, 'month-calendar-column'))
            assert abs((banner[2]-banner[0])/(banner[3]-banner[1])-21/9)<.02, f'{name}: banner aspect wrong: {banner}'
            if split:
                assert banner[0] > calendar[2] and abs(banner[1]-calendar[1]) <= 2, f'{name}: stale portrait geometry: {banner}, {calendar}'
            else:
                assert banner[3] < calendar[1], f'{name}: stale landscape geometry'
        passed(name, month=month, title=title, dates=len(days))
        return root

    def swipe(root, forward, fraction=.72, duration=300):
        x1,y1,x2,y2 = bounds(one(root, 'month-pager'))
        w = x2-x1
        start = .86 if forward else .14
        end = start - fraction if forward else start + fraction
        y = y1+80
        shell('input', 'swipe', x1+int(w*start), y, x1+int(w*end), y, duration)

    def navigate(root, month, name):
        diff = month-current(root)
        if diff:
            taps(root, ['next' if diff > 0 else 'previous'] * abs(diff))
        return check(month, name)

    def year(name):
        for i in range(4):
            root = snapshot(f'{name}-{i}')
            if not nodes(root, 'month-title') and not nodes(root, 'settings-screen'):
                return root
            shell('input', 'keyevent', 'KEYCODE_BACK')
        raise AssertionError('could not return to year')

    def open_month(month, name):
        root = year(name+'-year')
        # Scroll from a remembered year position to its top without changing data.
        size = re.findall(r'\d+', shell('wm', 'size'))[-2:]
        w,h = map(int, size)
        for _ in range(2):
            shell('input', 'swipe', w//2, h//5, w//2, 4*h//5, 250)
        root = snapshot(name+'-year-top')
        for attempt in range(6):
            found = [n for n in root.iter('node') if n.get('content-desc') == MONTHS[month-1]]
            if found:
                tap(found[0])
                return check(month, name)
            shell('input', 'swipe', w//2, 4*h//5, w//2, h//4, 350)
            root = snapshot(name+f'-year-scroll-{attempt}')
        raise AssertionError(f'month {month} card not found')

    def rotate(value):
        nonlocal requested_rotation
        requested_rotation=value
        shell('wm', 'user-rotation', 'lock', value)

    def settings_open(root, name):
        if not any(n.get('content-desc') in LABELS['settings'] for n in root.iter('node')):
            size = list(map(int, re.findall(r'\d+', shell('wm', 'size'))[-2:]))
            w,h = size
            for _ in range(2):
                shell('input','swipe',w//2,h//5,w//2,4*h//5,250)
            root = snapshot(name+'-scroll-top')
        tap(button(root, 'settings'))
        result = snapshot(name)
        one(result, 'settings-screen')
        # The full dump includes FLAG_INCLUDE_NOT_IMPORTANT_VIEWS. Check the
        # compressed accessibility hierarchy, not the full native layout tree.
        dump = shell('uiautomator','dump','--compressed','/sdcard/calendar-accessible-test.xml')
        assert 'dumped to:' in dump, f'{name}: compressed dump failed'
        xml = adb('exec-out','cat','/sdcard/calendar-accessible-test.xml')
        (output/f'{name}-accessible.xml').write_bytes(xml)
        accessible = ET.fromstring(xml)
        assert not nodes(accessible, 'month-title'), f'{name}: underlying month exposed to accessibility'
        assert not any(n.get('content-desc') in MONTHS for n in accessible.iter('node')), f'{name}: underlying year exposed to accessibility'
        passed(name)
        return result

    rotation = shell('wm', 'user-rotation').split()
    scales = {name: shell('settings', 'get', 'global', name) for name in
              ['animator_duration_scale', 'transition_animation_scale', 'window_animation_scale']}
    changed_scales = False
    try:
        rotate(0)
        shell('dumpsys', 'gfxinfo', APP, 'reset')
        if args.section in ('all', 'stress'):
            root = open_month(1, 'stress-january')
            swipe(root, False)
            root = check(1, 'first-month-boundary')
            taps(root, ['next']*20)
            root = check(12, 'twenty-next-clamp-december')
            swipe(root, True)
            root = check(12, 'last-month-boundary')
            taps(root, ['previous']*20)
            root = check(1, 'twenty-previous-clamp-january')
            root = navigate(root, 6, 'middle-month')
            for i in range(3):
                taps(root, ['next','next','previous','previous'])
                root = check(6, f'rapid-arrow-reversal-{i}')
            swipe(root, True, fraction=.03, duration=1200)
            root = check(6, 'cancelled-short-slow-swipe')
            swipe(root, True, duration=1400)
            root = check(7, 'long-slow-swipe')
            for rotation_value in [1,3,0]:
                rotate(rotation_value)
                root = check(7, f'orientation-swipe-start-{rotation_value}')
                swipe(root, True)
                root = check(8, f'orientation-next-{rotation_value}')
                swipe(root, False)
                root = check(7, f'orientation-previous-{rotation_value}')
            rotate(0)
            for i in range(5):
                shell('input','keyevent','KEYCODE_BACK')
                root = open_month(7, f'reopen-same-month-{i}')
            # Interrupt a long gesture with a rotation; accept whichever page the
            # native pager confirms, then prove it can move in both directions.
            x1,y1,x2,y2 = bounds(one(root,'month-pager'))
            process = subprocess.Popen([args.adb,'-s',args.serial,'shell','input','swipe',
                str(int(x2*.85)),str(y1+90),str(int(x2*.15)),str(y1+90),'1000'])
            time.sleep(.15)
            rotate(1)
            process.wait(timeout=15)
            root = snapshot('rotate-during-gesture')
            month = current(root)
            assert 6 <= month <= 8, f'unexpected jump to {month}'
            root = check(month, 'interrupted-gesture-settled')
            root = navigate(root, month+1, 'after-interrupted-gesture-next')
            root = navigate(root, month, 'after-interrupted-gesture-previous')
            rotate(0)

        if args.section in ('all', 'settings'):
            root = year('settings-from-year')
            for i in range(4):
                opened = settings_open(root, f'year-settings-open-{i}')
                if i % 2: tap(button(opened,'back'))
                else: shell('input','keyevent','KEYCODE_BACK')
                root = snapshot(f'year-settings-back-{i}')
                assert not nodes(root,'settings-screen') and not nodes(root,'month-title')
                passed(f'year-settings-back-{i}')
            root = open_month(7, 'settings-source-july')
            day = next(n for n in root.iter('node') if identifier(n).startswith('calendar-day-')
                       and identifier(n).endswith('-15'))
            selected = identifier(day)
            tap(day)
            root = check(7,'selected-before-settings',selected)
            for rotation_value in [0,1,3]:
                rotate(rotation_value)
                root = check(7,f'settings-source-orientation-{rotation_value}',selected)
                anchor = bounds(one(root,selected))
                for i in range(3):
                    opened = settings_open(root,f'month-settings-open-{rotation_value}-{i}')
                    if i % 2: tap(button(opened,'back'))
                    else: shell('input','keyevent','KEYCODE_BACK')
                    root = check(7,f'month-settings-back-{rotation_value}-{i}',selected)
                    assert all(abs(a-b)<=2 for a,b in zip(bounds(one(root,selected)),anchor)), 'settings shifted month scroll'
                opened = settings_open(root,f'settings-background-open-{rotation_value}')
                shell('input','keyevent','KEYCODE_HOME')
                shell('am','start','-W','-n',APP+'/.MainActivity')
                time.sleep(1)
                opened = snapshot(f'settings-resume-{rotation_value}')
                one(opened,'settings-screen')
                shell('input','keyevent','KEYCODE_BACK')
                root = check(7,f'settings-resume-back-{rotation_value}',selected)
            rotate(0)
            root = check(7,'settings-rotation-source',selected)
            settings_open(root,'settings-rotate-open')
            rotate(1)
            opened = snapshot('settings-rotated')
            one(opened,'settings-screen')
            shell('input','keyevent','KEYCODE_BACK')
            root = check(7,'settings-rotated-back',selected)
            swipe(root,True)
            root = check(8,'swipe-after-settings')
            rotate(0)

        if args.section in ('all','interruptions'):
            root = open_month(7,'interruptions-july')
            day = next(n for n in root.iter('node') if identifier(n).startswith('calendar-day-')
                       and identifier(n).endswith('-15'))
            selected = identifier(day)
            tap(day)
            root = check(7,'interruptions-selected',selected)
            for i in range(5):
                x1,y1,x2,y2 = bounds(button(root,'settings'))
                shell(f'input tap {(x1+x2)//2} {(y1+y2)//2}; sleep 0.05; input keyevent KEYCODE_BACK')
                root = check(7,f'back-during-settings-entry-{i}',selected)
            x1,y1,x2,y2 = bounds(button(root,'settings'))
            shell(f'input tap {(x1+x2)//2} {(y1+y2)//2}; sleep 0.05; wm user-rotation lock 1')
            requested_rotation = 1
            opened = snapshot('rotation-during-settings-entry')
            one(opened,'settings-screen')
            passed('rotation-during-settings-entry')
            shell('input','keyevent','KEYCODE_BACK')
            root = check(7,'rotation-during-settings-back',selected)
            rotate(0)
            root = check(7,'interruptions-portrait',selected)
            # Selection changes race decoding/crossfades, without moving the grid.
            days = {int(identifier(n).split('-')[-1]): n for n in root.iter('node')
                    if identifier(n).startswith('calendar-day-')}
            commands=[]
            for number in [1,15,2,16,3,17,4,18,5]:
                x1,y1,x2,y2 = bounds(days[number])
                commands.append(f'input tap {(x1+x2)//2} {(y1+y2)//2}')
            shell('; '.join(commands))
            selected=identifier(days[5])
            root=check(7,'rapid-image-selection',selected)
            x1,y1,x2,y2=bounds(days[1])
            shell(f'input tap {(x1+x2)//2} {(y1+y2)//2}; wm user-rotation lock 1')
            requested_rotation = 1
            selected=identifier(days[1])
            root=check(7,'rotation-during-image-change',selected)
            rotate(0)
            root=check(7,'image-change-return-portrait',selected)
            # Interrupt a page change with Back, then reopen the intended month.
            x1,y1,x2,y2=bounds(button(root,'next'))
            shell(f'input tap {(x1+x2)//2} {(y1+y2)//2}; input keyevent KEYCODE_BACK')
            root=open_month(7,'back-during-month-transition-reopen')
            swipe(root,True)
            check(8,'swipe-after-interrupted-close')
        # Keep normal-motion interruption checks before changing global scales.
        if args.section in ('all','reduced'):
            changed_scales = True
            for name in scales: shell('settings','put','global',name,'0')
            shell('am','force-stop',APP)
            shell('am','start','-W','-n',APP+'/.MainActivity')
            root = open_month(1,'reduced-january')
            for month in [2,3,4]:
                taps(root,['next'])
                root=check(month,f'reduced-arrow-{month}')
            swipe(root,True)
            root=check(5,'reduced-swipe')
            settings_open(root,'reduced-settings')
            shell('input','keyevent','KEYCODE_BACK')
            root=check(5,'reduced-settings-back')
            rotate(1)
            time.sleep(.5)
            root=check(5,'reduced-rotation',split=True)
            rotate(0)
            time.sleep(.5)
            check(5,'reduced-rotation-back',split=False)
        if args.section == 'paging':
            open_month(1,'paging-source-january')
            subprocess.check_call(['python3',str(pathlib.Path(__file__).with_name('test-month-paging.py')),
                '--adb',args.adb,'--serial',args.serial,'--output',str(output/'paging')])
            passed('all-months-native-paging')
        if args.section == 'visual':
            open_month(7,'visual-source-month')
            subprocess.check_call(['python3',str(pathlib.Path(__file__).with_name('test-phone-visual.py')),
                '--serial',args.serial,'--output',str(output/'recording')])
            passed('visual-three-settings-round-trips')
        (output/'gfxinfo.txt').write_text(shell('dumpsys','gfxinfo',APP))
        print(f'All {len(results)} animation checks passed. Artifacts: {output}',flush=True)
    finally:
        if changed_scales:
            for name,value in scales.items():
                if value == 'null': shell('settings','delete','global',name)
                else: shell('settings','put','global',name,value)
        shell('wm','user-rotation',*rotation)
        if changed_scales:
            shell('am','force-stop',APP)
            shell('am','start','-W','-n',APP+'/.MainActivity')


if __name__ == '__main__':
    main()

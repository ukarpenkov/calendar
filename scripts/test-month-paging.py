#!/usr/bin/env python3
"""Check real native month pages. Open January first; calendar data is preserved.

python3 scripts/test-month-paging.py --serial emulator-5554
Artifacts (accessibility XML and screenshots) are written to /tmp by default.
"""
import argparse
import pathlib
import re
import subprocess
import tempfile
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--adb', default='adb')
    parser.add_argument('--serial', default='emulator-5554')
    parser.add_argument('--output')
    parser.add_argument('--quick', action='store_true', help='Check January–April plus rapid arrows and resume')
    args = parser.parse_args()
    output = pathlib.Path(args.output or tempfile.mkdtemp(prefix='month-paging-'))
    output.mkdir(parents=True, exist_ok=True)

    def adb(*command):
        return subprocess.check_output([args.adb, '-s', args.serial, *map(str, command)],
                                       stderr=subprocess.STDOUT, timeout=30)

    def shell(*command):
        action = ' '.join(map(str, command))
        if any(value in action for value in ('input tap', 'input swipe', 'input keyevent KEYCODE_BACK')):
            activity = adb('shell', 'dumpsys', 'activity', 'activities').decode()
            foreground = next((line for line in activity.splitlines() if 'topResumedActivity=' in line), '')
            assert 'com.prodyk.calendar/' in foreground, 'Another app took foreground; test interrupted before input'
        return adb('shell', *command).decode().strip()

    def identifier(node):
        return node.get('resource-id', '').split('/')[-1]

    def unique(root, name):
        nodes = [n for n in root.iter('node') if identifier(n) == name]
        assert len(nodes) == 1, f'{name}: {len(nodes)} visible nodes'
        return nodes[0]

    def bounds(node):
        return tuple(map(int, re.findall(r'\d+', node.attrib['bounds'])))

    def snapshot(name):
        result = shell('uiautomator', 'dump', '/sdcard/calendar-paging-test.xml')
        assert 'dumped to:' in result, f'{name}: fresh UI dump failed: {result}'
        xml = adb('exec-out', 'cat', '/sdcard/calendar-paging-test.xml')
        root = ET.fromstring(xml)
        assert any(n.get('package') == 'com.prodyk.calendar' for n in root.iter('node')), f'{name}: another app took foreground; test interrupted'
        (output / f'{name}.xml').write_bytes(xml)
        (output / f'{name}.png').write_bytes(adb('exec-out', 'screencap', '-p'))
        return root

    titles = {}

    def check(month, name):
        root = snapshot(name)
        months = [n for n in root.iter('node') if identifier(n).startswith('month-content-')]
        assert len(months) == 1, f'{name}: visible months: {[identifier(n) for n in months]}'
        assert identifier(months[0]) == f'month-content-{month}', f'{name}: wrong month'
        days = [n for n in root.iter('node') if identifier(n).startswith('calendar-day-')]
        assert days, f'{name}: blank calendar'
        assert all(int(identifier(n).split('-')[-2]) == month for n in days), f'{name}: wrong dates'
        title = unique(root, 'month-title').get('text')
        assert title, f'{name}: blank title'
        if month in titles:
            assert title == titles[month], f'{name}: title changed: {title}'
        else:
            assert title not in titles.values(), f'{name}: repeated month title: {title}'
            titles[month] = title
        unique(root, 'month-totals')
        banner = bounds(unique(root, 'month-holiday-banner'))
        assert banner[2] > banner[0] and banner[3] > banner[1], f'{name}: blank banner'
        print(f'PASS {name}: {title}, {len(days)} dates', flush=True)
        return root

    def swipe(root, forward):
        x1, y1, x2, y2 = bounds(unique(root, 'month-pager'))
        width = x2 - x1
        start, end = (.85, .15) if forward else (.15, .85)
        # Cross the image rather than a day/vertical scroll control.
        y = y1 + min(90, (y2 - y1) // 4)
        shell('input', 'swipe', x1 + int(width * start), y,
              x1 + int(width * end), y, 280)

    def button(root, forward):
        # Current supported test languages on the emulator/USB handset.
        labels = ('Next month', 'Следующий месяц', 'Mes siguiente', 'Sonraki ay', 'Bulan berikutnya', '次の月') if forward else ('Previous month', 'Предыдущий месяц', 'Mes anterior', 'Önceki ay', 'Bulan sebelumnya', '前の月')
        nodes = [n for n in root.iter('node') if n.get('content-desc') in labels]
        assert len(nodes) == 1, f'Navigation button not found: {labels}'
        x1, y1, x2, y2 = bounds(nodes[0])
        return (x1 + x2) // 2, (y1 + y2) // 2

    root = check(1, 'start-january')
    last_month = 4 if args.quick else 12
    for month in range(2, last_month + 1):
        swipe(root, True)
        root = check(month, f'swipe-forward-{month:02}')
    for month in range(last_month - 1, 0, -1):
        swipe(root, False)
        root = check(month, f'swipe-back-{month:02}')

    # One remote shell command sends the taps without ADB startup delays.
    x, y = button(root, True)
    shell(f'input tap {x} {y}; input tap {x} {y}; input tap {x} {y}')
    root = check(4, 'three-rapid-next')
    x, y = button(root, False)
    shell(f'input tap {x} {y}; input tap {x} {y}; input tap {x} {y}')
    root = check(1, 'three-rapid-previous')

    for month in [2, 1, 2, 3, 2, 1]:
        current = int(identifier(next(n for n in root.iter('node')
                                     if identifier(n).startswith('month-content-'))).split('-')[-1])
        swipe(root, month > current)
        root = check(month, f'alternating-{current}-{month}')

    shell('input', 'keyevent', 'KEYCODE_HOME')
    shell('am', 'start', '-n', 'com.prodyk.calendar/.MainActivity')
    root = check(1, 'resume')
    swipe(root, True)
    check(2, 'after-resume')
    print(f'Native paging checks passed. Artifacts: {output}', flush=True)


if __name__ == '__main__':
    main()

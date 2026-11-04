#!/usr/bin/env python3
"""Native regression checks on Android with a month open at its top.

Run after installing the app:
  python3 scripts/test-month-layout.py --adb "$ANDROID_HOME/platform-tools/adb"
Checks actual native bounds and image count; saves XML/screenshots to /tmp.
The emulator is rotated, locked/unlocked and sent to the home screen. App data
is preserved. Rotation settings and the sensor are restored on completion/failure.
"""

import argparse
import pathlib
import re
import subprocess
import struct
import tempfile
import time
import xml.etree.ElementTree as ET


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--adb', default='adb')
    parser.add_argument('--serial', default='emulator-5554')
    parser.add_argument('--output', default=None)
    parser.add_argument('--scroll-only', action='store_true', help='Repeat the final scroll restoration checks')
    parser.add_argument('--resume-after-locks', action='store_true', help='Resume after the three orientation unlock checks')
    parser.add_argument('--lifecycle-only', action='store_true', help='Resume at lock/background/scroll checks')
    parser.add_argument('--physical', action='store_true', help='Run authorized rotation/lock tests on a USB handset')
    args = parser.parse_args()
    physical = not args.serial.startswith('emulator-')
    if physical and not args.physical:
        parser.error('For authorized handset testing, pass --physical; this test locks and rotates the device.')
    output = pathlib.Path(args.output or tempfile.mkdtemp(prefix='month-layout-'))
    output.mkdir(parents=True, exist_ok=True)

    def adb(*command):
        return subprocess.check_output(
            [args.adb, '-s', args.serial, *map(str, command)],
            stderr=subprocess.STDOUT, timeout=25,
        )

    def shell(*command):
        action = ' '.join(map(str, command))
        if any(value in action for value in ('input tap', 'input swipe', 'input keyevent KEYCODE_BACK')):
            activity = adb('shell', 'dumpsys', 'activity', 'activities').decode()
            foreground = next((line for line in activity.splitlines() if 'topResumedActivity=' in line), '')
            assert 'com.prodyk.calendar/' in foreground, 'Another app took foreground; test interrupted before input'
        return adb('shell', *command).decode().strip()

    def bounds(node):
        return tuple(map(int, re.findall(r'\d+', node.attrib['bounds'])))

    def node_id(node):
        return node.get('resource-id', '').split('/')[-1]

    def unique(root, identifier):
        matches = [n for n in root.iter('node') if node_id(n) == identifier]
        assert len(matches) == 1, f'{identifier}: found {len(matches)} nodes'
        return matches[0]

    def snapshot(name):
        result = shell('uiautomator', 'dump', '/sdcard/calendar-layout-test.xml')
        assert 'dumped to:' in result, f'{name}: fresh UI dump failed: {result}'
        xml = adb('exec-out', 'cat', '/sdcard/calendar-layout-test.xml')
        root = ET.fromstring(xml)
        assert any(n.get('package') == 'com.prodyk.calendar' for n in root.iter('node')), f'{name}: another app took foreground; test interrupted'
        (output / f'{name}.xml').write_bytes(xml)
        png = adb('exec-out', 'screencap', '-p')
        (output / f'{name}.png').write_bytes(png)
        screen_width,screen_height = struct.unpack('>II',png[16:24])
        root.set('screen-width',str(screen_width))
        root.set('screen-height',str(screen_height))
        return root

    requested_rotation = 0

    def rotate(rotation):
        nonlocal requested_rotation
        requested_rotation = rotation
        # Use a physical orientation: Android can reset a forced wm rotation
        # to portrait when the keyguard opens, independently of the app.
        if physical:
            shell('wm', 'user-rotation', 'lock', rotation)
        else:
            acceleration = {0: '0:9.81:0', 1: '9.81:0:0', 3: '-9.81:0:0'}[rotation]
            adb('emu', 'sensor', 'set', 'acceleration', acceleration)

    def wake(wait=True):
        shell('input', 'keyevent', 'KEYCODE_WAKEUP')
        shell('wm', 'dismiss-keyguard')
        if physical and wait:
            deadline = time.monotonic() + 300
            announced = False
            while time.monotonic() < deadline:
                trust = shell('dumpsys','trust')
                current = next((line for line in trust.splitlines() if '(current)' in line), '')
                if 'deviceLocked=0' in current or 'deviceLocked=false' in current:
                    break
                if not announced:
                    print('WAIT: unlock the handset normally to continue the lock/resume test.', flush=True)
                    announced = True
                time.sleep(1)
            else:
                raise AssertionError('Manual unlock required; app regression was not evaluated')
            # This handset's keyguard forces portrait. Reapply the physical test
            # orientation after authentication, then check app layout/state.
            shell('wm','user-rotation','lock',requested_rotation)

    selected_id = None
    month_id = None

    def wait_for_display(split):
        if not physical:
            return
        deadline=time.monotonic()+10
        while time.monotonic()<deadline:
            png=adb('exec-out','screencap','-p')
            width,height=struct.unpack('>II',png[16:24])
            state=shell('dumpsys','window','displays')
            rotation=re.search(r'mRotation=(\d+) mDeferredRotationPauseCount',state)
            if ((width>height)==split and rotation
                    and int(rotation.group(1))==requested_rotation):
                # Allow the app's configuration/reflow commit before attaching
                # UiAutomation, which can otherwise capture the launcher surface.
                time.sleep(.35)
                return
            time.sleep(.15)
        raise AssertionError(f'System display did not reach rotation {requested_rotation}')

    def snapshot_in_viewport(name, split):
        wait_for_display(split)
        # Sensor input returns before configuration reaches the activity. Wait only
        # for the requested native viewport; wrong banner geometry still fails.
        for attempt in range(4):
            root = snapshot(name)
            pagers = [n for n in root.iter('node') if node_id(n) == 'month-pager']
            if pagers:
                x1, y1, x2, y2 = bounds(pagers[0])
                screen_width=int(root.get('screen-width'))
                screen_height=int(root.get('screen-height'))
                if ((screen_width>screen_height)==split
                        and abs(x2-x1-screen_width)<=2
                        and (x2-x1>y2-y1)==split):
                    break
            time.sleep(.15)
        else:
            raise AssertionError(f'{name}: native viewport did not settle')
        return root

    def check(name, split):
        root = snapshot_in_viewport(name, split)
        months = [n for n in root.iter('node') if node_id(n).startswith('month-content-')]
        assert len(months) == 1, f'{name}: visible months: {len(months)}'
        assert node_id(months[0]) == month_id, f'{name}: month changed'
        # Fabric flattens layout-only ancestors into siblings in accessibility
        # dumps. Use the visible pager and compare native bounds, not XML nesting.
        body = unique(root, 'month-pager')
        banner = unique(body, 'month-holiday-banner')
        images = [n for n in body.iter('node') if n.get('class') == 'android.widget.ImageView']
        assert len(images) == 1, f'{name}: {len(images)} visible images'
        b, image = bounds(banner), bounds(images[0])
        assert b == image, f'{name}: image escaped banner: {image} / {b}'
        assert b[2] > b[0] and b[3] > b[1], f'{name}: empty banner'
        assert abs((b[2] - b[0]) / (b[3] - b[1]) - 21 / 9) < .02, f'{name}: distorted/clipped banner'
        total = bounds(unique(body, 'month-totals'))
        assert total[1] >= b[3], f'{name}: totals overlap banner'
        if split:
            side = bounds(unique(body, 'month-banner-position'))
            assert (b[0], b[2]) == (side[0], side[2]) and b[1] == side[1]
            column = bounds(unique(body, 'month-calendar-column'))
            assert b[0] > column[2], f'{name}: banner overlaps calendar'
            assert abs(b[1] - column[1]) <= 2, f'{name}: incorrect banner top'
            assert (b[0], b[2]) == (total[0], total[2]), f'{name}: banner/totals misaligned'
        else:
            day = next(n for n in body.iter('node') if node_id(n).startswith('calendar-day-'))
            assert b[3] < bounds(day)[1], f'{name}: banner overlaps days'
        if selected_id:
            assert unique(body, selected_id).get('selected') == 'true', f'{name}: selection lost'
        print(f'PASS {name}: banner={b}, totals={total}', flush=True)
        return root

    rotation = shell('wm', 'user-rotation').split()
    acceleration = None if physical else re.search(
        r'acceleration = ([^\r\n]+)',
        adb('emu', 'sensor', 'get', 'acceleration').decode(),
    ).group(1)
    try:
        shell('wm', 'user-rotation', 'free')
        rotate(0)
        root = snapshot('start')
        month_nodes = [n for n in root.iter('node') if node_id(n).startswith('month-content-')]
        assert len(month_nodes) == 1, 'Open a month before running this test.'
        month_id = node_id(month_nodes[0])
        if not args.lifecycle_only:
            check('portrait', False)
            rotate(1)
            check('landscape', True)

            # Change the image, then rotate immediately, interrupting its crossfade.
            day = next(n for n in snapshot('before-selection').iter('node')
                       if node_id(n).startswith('calendar-day-') and node_id(n).endswith('-15'))
            selected_id = node_id(day)
            x1, y1, x2, y2 = bounds(day)
            shell('input', 'tap', (x1 + x2) // 2, (y1 + y2) // 2)
            rotate(0)
            check('selection-and-rotation', False)

            for index, target in enumerate([1, 0, 3, 0, 1, 0]):
                rotate(target)
                check(f'repeated-{index}', target in (1, 3))

            # No idle wait between changes: supersede pending Android layouts.
            for target in [1, 0, 3, 0, 1, 3, 0, 1]:
                rotate(target)
                time.sleep(.08)
            check('rapid-rotation', True)

        else:
            day = next(n for n in root.iter('node')
                       if node_id(n).startswith('calendar-day-') and node_id(n).endswith('-15'))
            selected_id = node_id(day)
            x1,y1,x2,y2 = bounds(day)
            shell('input','tap',(x1+x2)//2,(y1+y2)//2)
            check('lifecycle-start',False)

        if not args.resume_after_locks:
            for target in [0, 1, 3]:
                rotate(target)
                for cycle in range(1 if physical else 2):
                    shell('input', 'keyevent', 'KEYCODE_SLEEP')
                    time.sleep(.25)
                    wake()
                    check(f'lock-unlock-{target}-{cycle}', target in (1, 3))

            shell('input', 'keyevent', 'KEYCODE_SLEEP')
            rotate(0)
            wake()
            check('rotate-while-locked', False)

        if not args.scroll_only:
            shell('input', 'keyevent', 'KEYCODE_HOME')
            rotate(1)
            shell('am', 'start', '-W', '-n', 'com.prodyk.calendar/.MainActivity')
            # Let the system finish the launcher/display transition before attaching
            # UiAutomation; otherwise it can capture the old portrait surface.
            time.sleep(1)
            check('background-rotate-resume', True)

            shell('input', 'keyevent', 'KEYCODE_SLEEP')
            wake()
            rotate(0)
            rotate(1)
            rotate(0)
            check('rotate-during-resume', False)

            # Interrupt a partial swipe with the lock screen before it can settle.
            pager = bounds(unique(snapshot('before-interrupted-swipe'), 'month-pager'))
            width, y = pager[2] - pager[0], (pager[1] + pager[3]) // 2
            swipe = subprocess.Popen([
                args.adb, '-s', args.serial, 'shell', 'input', 'swipe',
                str(int(width * .8)), str(y), str(int(width * .65)), str(y), '600',
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            try:
                time.sleep(.15)
                shell('input', 'keyevent', 'KEYCODE_SLEEP')
                swipe.wait(timeout=10)
            finally:
                if swipe.poll() is None:
                    swipe.terminate()
                    swipe.wait(timeout=5)
            wake()
            check('lock-during-swipe', False)

        # Restore a nonzero vertical offset, then rerender the selected day.
        # The page's initial offset must not become a controlled live position.
        rotate(1)
        root = check('before-vertical-scroll', True)
        original_day = bounds(unique(root, selected_id))
        pager = bounds(unique(root, 'month-pager'))
        x = (pager[0] + pager[2]) // 2
        y = (pager[1] + pager[3]) // 2
        shell('input', 'swipe', x, y + 100, x, y - 100, 600)
        scrolled = snapshot('vertical-scrolled')
        anchor = bounds(unique(scrolled, selected_id))
        assert anchor[1] < original_day[1] - 20, 'Vertical swipe did not scroll'

        def check_scrolled(name):
            root = snapshot_in_viewport(name, True)
            actual = bounds(unique(root, selected_id))
            assert all(abs(a - b) <= 2 for a, b in zip(actual, anchor)), (
                f'{name}: vertical position changed: {actual} / {anchor}'
            )
            images = [n for n in unique(root, 'month-pager').iter('node')
                      if n.get('class') == 'android.widget.ImageView']
            assert len(images) == 1, f'{name}: {len(images)} visible images'
            print(f'PASS {name}: retained day bounds={actual}', flush=True)
            return root

        shell('input', 'keyevent', 'KEYCODE_SLEEP')
        wake()
        check_scrolled('scrolled-lock-unlock')
        rotate(0)
        check('scrolled-rotate-portrait', False)
        rotate(1)
        root = check_scrolled('scrolled-rotate-return')
        next_day = unique(root, selected_id[:-2] + '16')
        x1, y1, x2, y2 = bounds(next_day)
        shell('input', 'tap', (x1 + x2) // 2, (y1 + y2) // 2)
        root = check_scrolled('scrolled-selection')
        assert unique(root, selected_id[:-2] + '16').get('selected') == 'true'
        print(f'Native layout checks passed. Artifacts: {output}', flush=True)
    finally:
        if not physical:
            adb('emu', 'sensor', 'set', 'acceleration', acceleration)
        shell('wm', 'user-rotation', *rotation)
        wake(wait=False)


if __name__ == '__main__':
    main()

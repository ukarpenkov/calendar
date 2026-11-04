#!/usr/bin/env python3
"""Record three settings round trips from an open month; restore rotation."""
import argparse
import json
import pathlib
import re
import subprocess
import time
import xml.etree.ElementTree as ET


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--serial',required=True)
    parser.add_argument('--output',required=True)
    args=parser.parse_args()
    output=pathlib.Path(args.output)
    output.mkdir(parents=True,exist_ok=True)
    base=['adb','-s',args.serial]
    def adb(*c): return subprocess.check_output([*base,*map(str,c)],stderr=subprocess.STDOUT,timeout=35)
    def shell(*c):
        action = ' '.join(map(str,c))
        if any(value in action for value in ('input tap','input keyevent KEYCODE_BACK')):
            activity=adb('shell','dumpsys','activity','activities').decode()
            foreground=next((line for line in activity.splitlines() if 'topResumedActivity=' in line),'')
            assert 'com.prodyk.calendar/' in foreground,'Another app took foreground; test interrupted before input'
        return adb('shell',*c).decode().strip()
    def snapshot(name):
        result=shell('uiautomator','dump','--compressed','/sdcard/calendar-visual-test.xml')
        assert 'dumped to:' in result,result
        xml=adb('exec-out','cat','/sdcard/calendar-visual-test.xml')
        root=ET.fromstring(xml)
        assert any(n.get('package')=='com.prodyk.calendar' for n in root.iter('node')),'Another app took foreground'
        (output/f'{name}.xml').write_bytes(xml)
        return root
    rotation=shell('wm','user-rotation').split()
    try:
        shell('wm','user-rotation','lock','0')
        root=snapshot('before')
        title=next(n.get('text') for n in root.iter('node') if n.get('resource-id','').endswith('month-title'))
        gear=next(n for n in root.iter('node') if n.get('content-desc') in ['Настройки','Settings','Ajustes'])
        x1,y1,x2,y2=map(int,re.findall(r'\d+',gear.get('bounds')))
        shell('dumpsys','gfxinfo','com.prodyk.calendar','reset')
        recorder=subprocess.Popen([*base,'shell','screenrecord','--size','640x1386',
            '--bit-rate','8000000','--time-limit','10','/sdcard/calendar-settings-validation.mp4'],
            stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        time.sleep(.8)
        for _ in range(3):
            shell('input','tap',(x1+x2)//2,(y1+y2)//2)
            time.sleep(.65)
            shell('input','keyevent','KEYCODE_BACK')
            time.sleep(.65)
        stdout,_=recorder.communicate(timeout=20)
        assert recorder.returncode==0,stdout.decode()
        adb('pull','/sdcard/calendar-settings-validation.mp4',output/'settings-round-trips.mp4')
        # Check the motion itself: a cut between two valid endpoints must fail.
        decoder=subprocess.Popen(['ffmpeg','-v','error','-i',str(output/'settings-round-trips.mp4'),
            '-vf','scale=320:693','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
        counts=[]
        frame_size=320*693*3
        while True:
            frame=decoder.stdout.read(frame_size)
            if not frame: break
            assert len(frame)==frame_size
            colored=0
            for y in range(125,200,2):
                for x in range(15,305,2):
                    start=(y*320+x)*3
                    rgb=frame[start:start+3]
                    if max(rgb)-min(rgb)>40 and max(rgb)>80: colored+=1
            counts.append(colored)
        assert decoder.wait()==0
        maximum=max(counts)
        intermediate=[value for value in counts if .1*maximum<value<.9*maximum]
        measured=dict(frames=len(counts),intermediate_frames=len(intermediate),
                      distinct_intermediate_frames=len(set(intermediate)))
        (output/'motion-frames.json').write_text(json.dumps(measured,indent=2))
        assert len(intermediate)>=3 and len(set(intermediate))>=3, f'transition jumped between endpoints: {measured}'
        after=snapshot('after')
        actual=next(n.get('text') for n in after.iter('node') if n.get('resource-id','').endswith('month-title'))
        assert actual==title,f'{title} -> {actual}'
        assert not any(n.get('resource-id','').endswith('settings-screen') for n in after.iter('node'))
        (output/'gfxinfo.txt').write_text(shell('dumpsys','gfxinfo','com.prodyk.calendar'))
        print(f'PASS visual round trips: {title}; video and gfxinfo: {output}',flush=True)
    finally:
        shell('wm','user-rotation',*rotation)


if __name__=='__main__': main()

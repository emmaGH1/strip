#!/usr/bin/env python3
"""Strip product film. Deterministic source assembly; no product pixels are synthesized.
Run from any directory: python3 demo/film/tools/build-film.py [--prepare-media]
Capture edit decisions use the source clock in demo/capture/takeA.timeline.json.
The narration's word timing is retained in caption-groups.json; the cut is 0.9x
that timing (pitch-preserving free draft voice, never the founder's clone).
"""
from pathlib import Path
import json, html, subprocess, sys, concurrent.futures, shutil, os
ROOT = Path(__file__).resolve().parents[1]
CAPTURE = ROOT.parent / 'capture'
FFMPEG = os.environ.get('STRIP_FFMPEG', shutil.which('ffmpeg') or '/data/home/.strip-tools/node_modules/ffmpeg-static/ffmpeg')
S = .9
END = 93.6
# old film clock in/out, real source in, source rate BEFORE 0.9 timing compression,
# editorial focus (source percent), camera magnification. All accelerations labelled.
SHOTS = [
 ('library',22,24,4,1,50,45,1),
 ('source',24,26,17,4,43,35,1.35),
 ('find-joke',26,27.5,22.55,1,39,41,1.45),
 ('angles-wait',27.5,30,25,4,44,42,1.18),
 ('three-angles',30,34,43,1,42,48,1.48),
 ('choose',34,35.6,49.5,4,34,45,1.6),
 ('draft-request',35.6,36.6,57,4,44,58,1.32),
 ('draft-result',36.6,38,130,1,48,51,1.3),
 ('blue',38,41.6,132,1,48,46,1.7),
 ('edit',41.6,45.2,143,4,35,29,2.15),
 ('mine',45.2,47.2,157.8,1,35,29,2.15),
 ('funnier',47.2,50.6,175,4,36,38,1.95),
 ('revision-wait',50.6,52.8,190,4,48,40,1.55),
 ('revision-result',52.8,56,218,1,48,42,1.7),
 ('kept-line',56,61.6,233,1,35,28,2.35),
 ('ink',61.6,63.68,250,1.5,89,69,3.1),
 ('erase',63.68,65.04,252.8,2,89,72,3.1),
 ('ending',65.04,66.5,267,1.5,45,56,1.55),
 ('export',66.5,68.32,329.7,4,80,50,1.3),
]

def sec(v): return f'{v:.4f}'.rstrip('0').rstrip('.')
def run(args): subprocess.run(args, check=True, stdout=subprocess.DEVNULL)

if '--prepare-media' in sys.argv:
    (ROOT/'assets/capture').mkdir(parents=True, exist_ok=True)
    def cut(row):
        name, a,b,src,rate,*_ = row
        # Rate labels in the HTML name the exact final source/film ratio.
        dst=ROOT/f'assets/capture/{name}.mp4'
        run([FFMPEG,'-y','-loglevel','error','-ss',str(src),'-i',str(CAPTURE/'takeA.mp4'),
          '-t',str((b-a)*S*rate),'-an','-vf',f'setpts=(PTS-STARTPTS)/{rate},fps=30',
          '-c:v','libx264','-preset','fast','-crf','18','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',str(dst)])
        return name
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        for name in pool.map(cut, SHOTS): print('cut',name,flush=True)
    run([FFMPEG,'-y','-loglevel','error','-ss','19','-i',str(CAPTURE/'takeB-studio.mp4'),'-t','5.1','-an',
        '-c:v','libx264','-preset','fast','-crf','18','-threads','2','-pix_fmt','yuv420p','-movflags','+faststart',str(ROOT/'assets/capture/mcp-refusal.mp4')])
    shutil.copyfile(CAPTURE/'exported-strip.png',ROOT/'assets/ui/final-export.png')
    shutil.copyfile(CAPTURE/'shots/b-05-library-fresh.png',ROOT/'assets/ui/library-after-reload.png')
if '--prepare-media' in sys.argv or '--prepare-audio' in sys.argv:
    # Assemble the existing seven free Kokoro segments at their word-aligned placements.
    starts=[.6,14,22,38,61.6,70.6,97.4]
    cmd=[FFMPEG,'-y','-loglevel','error']
    for i in range(1,8): cmd+=['-i',str(ROOT/f'assets/draft-vo/s{i}.wav')]
    filt=[]
    for i,start in enumerate(starts): filt.append(f'[{i}:a]atempo={1/S},adelay={round(start*S*1000)}:all=1[v{i}]')
    filt.append(''.join(f'[v{i}]' for i in range(7))+f'amix=inputs=7:normalize=0,apad,atrim=duration={END},loudnorm=I=-18:TP=-2:LRA=8[vo]')
    cmd+=['-filter_complex',';'.join(filt),'-map','[vo]','-ar','48000','-c:a','pcm_s16le',str(ROOT/'assets/draft-vo/film-voice.wav')]
    run(cmd)

FONT='''@font-face{font-family:Bricolage;src:url("assets/fonts/bricolage-grotesque-latin-800-normal.woff2") format("woff2");font-weight:800}@font-face{font-family:Bricolage;src:url("assets/fonts/bricolage-grotesque-latin-500-normal.woff2") format("woff2");font-weight:500}'''
BASE=FONT+'''*{box-sizing:border-box;margin:0}#root{position:absolute;inset:0;overflow:hidden;font-family:Bricolage,sans-serif;color:#1A1714;--ink:#1A1714;--paper:#F4EFE6;--red:#D2432F;--blue:#3B6FD8;--butter:#E7B85A}.ground{position:absolute;inset:0;background:var(--paper)}.dots{position:absolute;inset:-240px;background-image:radial-gradient(circle,currentColor 1.8px,transparent 2px);background-size:25px 25px;opacity:.13}.panel{position:absolute;border:3px solid currentColor;opacity:.2}.kicker{font-weight:500;font-size:25px;letter-spacing:.14em;text-transform:uppercase}.red-dot{width:38px;height:38px;border-radius:50%;background:var(--red);position:absolute}'''
HELPERS='''const tl=gsap.timeline({paused:true}); const m=(q,a,b,t,d,e="power4.out")=>tl.fromTo(q,a,{...b,duration:d,ease:e},t); const set=(q,v,t)=>tl.set(q,v,t);'''
def scene(name, duration, css, markup, js):
    out=f'''<template><style>{BASE}\n{css}</style><div id="root" data-composition-id="{name}" data-duration="{duration}" data-width="1920" data-height="1080">{markup}</div><script>(()=>{{{HELPERS}\n{js}\nwindow.__timelines["{name}"]=tl;}})();</script></template>'''
    (ROOT/f'compositions/{name}.html').write_text(out)

def bg(prefix, dark=False):
    return f'''<div class="ground" style="background:{'#1A1714' if dark else '#F4EFE6'}"></div><div id="{prefix}-dots" class="dots" style="color:{'#F4EFE6' if dark else '#1A1714'}" data-layout-ignore></div><div id="{prefix}-panel1" class="panel" style="left:-200px;top:760px;width:840px;height:500px;color:#D2432F" data-layout-ignore></div><div id="{prefix}-panel2" class="panel" style="left:1560px;top:-160px;width:620px;height:640px;color:{'#F4EFE6' if dark else '#1A1714'}" data-layout-ignore></div>'''
def bgmove(p,d):
    return f'''m("#{p}-dots",{{backgroundPosition:"0px 0px"}},{{backgroundPosition:"125px -75px"}},0,{d},"none");m("#{p}-panel1",{{x:-80,rotation:-10}},{{x:170,rotation:5}},0,{d},"none");m("#{p}-panel2",{{x:100,y:0,rotation:8}},{{x:-120,y:100,rotation:-3}},0,{d},"none");'''

# 01: Typography is supplied by the one caption composition; no duplicate words.
scene('open',12.24, '''#op-note{position:absolute;left:1280px;top:200px;width:450px;height:620px;background:var(--paper);padding:45px 35px;box-shadow:19px 19px 0 var(--red);transform-origin:50% 100%}#op-note h2{font-size:45px;line-height:1.03;letter-spacing:-.04em;margin:25px 0 38px}.op-line{height:10px;background:var(--ink);margin:18px 0;transform-origin:0 50%}#op-note .kicker{font-size:28px;color:var(--red)}#op-panels{position:absolute;left:1280px;top:320px;width:440px;height:440px;display:grid;grid-template-columns:1fr 1fr;gap:22px}.op-cell{border:4px solid var(--paper);position:relative}.op-cell:after{content:"";position:absolute;left:22px;top:25px;width:128px;height:40px;border:3px solid var(--paper);border-radius:28px}#op-motif{left:110px;top:250px}''', bg('op',True)+'''<div class="kicker" style="position:absolute;left:150px;top:170px;color:#F4EFE6;font-size:28px">A better way to tell what shipped</div><div id="op-first" style="position:absolute;left:150px;top:360px;color:#F4EFE6;font-size:130px;font-weight:800;letter-spacing:-.045em">Release notes<span style="color:#D2432F">.</span></div><div id="op-note"><div class="kicker">Release notes</div><h2>What shipped<br>this week.</h2>'''+''.join(f'<div class="op-line" id="op-line{i}" style="width:{[100,85,64,100,80,92,58][i]}%"></div>' for i in range(7))+'''</div><div id="op-panels">'''+''.join(f'<div class="op-cell" id="op-cell{i}"></div>' for i in range(4))+'''</div><div class="red-dot" id="op-motif" data-layout-ignore></div>''', bgmove('op',12.24)+'''m("#op-first",{opacity:1},{opacity:0},.34,.16,"power2.in");m("#op-note",{x:280,y:100,rotationY:-35,rotationX:9,opacity:0},{x:0,y:0,rotationY:-12,rotationX:3,opacity:1},1.65,.8);for(let i=0;i<7;i++)m("#op-line"+i,{scaleX:0},{scaleX:1},2.1+i*.31,.32);m("#op-note",{y:0,rotation:-3},{y:500,rotation:19,opacity:0},6.1,1.6,"power3.in");for(let i=0;i<4;i++)m("#op-cell"+i,{opacity:0,rotationY:70,x:120,scale:.7},{opacity:1,rotationY:0,x:0,scale:1},9.45+i*.15,.65);set("#op-motif",{opacity:0,x:830,y:260},0);set("#op-motif",{opacity:1},11.65);m("#op-motif",{scale:1},{scale:70},11.65,.59,"power3.in");''')

# 02: The real human-selected logo, with its actual paths.
logo=(ROOT/'assets/brand/logo.svg').read_text()
scene('logo',7.56,'''#lg-mark{position:absolute;left:580px;top:350px;width:760px;height:285px}#lg-mark svg{width:100%;height:100%;overflow:visible}#lg-mark path{transform-box:fill-box;transform-origin:50% 100%}#lg-disc{position:absolute;left:1303px;top:548px;width:62px;height:62px;background:var(--red);border-radius:50%}#lg-equation{position:absolute;left:0;right:0;top:680px;text-align:center;font-size:55px;font-weight:800;letter-spacing:-.04em}#lg-equation em{font-style:normal;color:var(--blue)}''', bg('lg')+f'<div id="lg-mark">{logo}</div>'+'''<div id="lg-equation"><span id="lg-one">1 update</span> <span id="lg-arrow">→</span> <em id="lg-four">4 panels</em></div><div id="lg-disc" data-layout-ignore></div>''',bgmove('lg',7.56)+'''m("#lg-disc",{scale:50},{scale:1},0,.85,"power4.inOut");const ps=["custom-s","letter-t","letter-r","letter-i","letter-p"];ps.forEach((p,i)=>m('#lg-mark [data-part="'+p+'"]',{opacity:0,y:50,scaleY:.5},{opacity:1,y:0,scaleY:1},.5+i*.075,.45));m("#lg-mark",{rotation:-3},{rotation:0},.65,.8);set("#lg-disc",{opacity:0},1.3);m("#lg-one",{opacity:0,x:-90},{opacity:1,x:0},2.0,.55);m("#lg-arrow",{opacity:0,scaleX:0},{opacity:1,scaleX:1},2.6,.4);m("#lg-four",{opacity:0,y:60},{opacity:1,y:0},3.2,.6);m("#lg-mark",{y:0},{y:-28},3.8,2.6,"power2.inOut");set("#lg-disc",{opacity:1,scale:1},6.85);m("#lg-disc",{scale:1},{scale:70},6.85,.71,"power3.in");''')

# 03: The real walkthrough. Window and camera wrappers are untimed; only media is timed.
shotmarkup=[]
ratemarkup=[]
shotjs=[]
edl=[]
for i,(name,a,b,src,rate,cx,cy,mag) in enumerate(SHOTS):
    st=(a-22)*S; dur=(b-a)*S; exact_rate=rate
    shotmarkup.append(f'''<div class="wk-shot" id="wk-shot{i}"><div class="wk-lens" id="wk-lens{i}"><video id="footage-{name}" class="clip" src="assets/capture/{name}.mp4" data-start="{sec(st)}" data-duration="{sec(dur)}" data-track-index="1" muted playsinline></video></div></div>''')
    # Centre the focus, clamped so a zoom never reveals blank pixels.
    fx=max(1/(2*mag),min(cx/100,1-1/(2*mag)))
    fy=max(1/(2*mag),min(cy/100,1-1/(2*mag)))
    x=1204*(.5-fx)*mag; y=753*(.5-fy)*mag
    shotjs.append(f'''set("#wk-shot{i}",{{opacity:1}},{st});set("#wk-shot{i}",{{opacity:0}},{st+dur});m("#wk-lens{i}",{{scale:{mag},x:{x+18},y:{y+8},transformOrigin:"50% 50%"}},{{scale:{mag},x:{x},y:{y}}},{st},{min(.65,dur*.42)},"power3.out");''')
    # Exact speed, not a fictional generation time.
    if rate>1:
        label=f'{exact_rate:.1f}×' if rate!=4 else '4×'
        # 4x pre-cuts are 4.444x including overall pacing; explicitly label the exact rate.
        label=f'{exact_rate:.2f}×'.replace('.00','')
        ratemarkup.append(f'''<div class="wk-rate clip" id="rate-{name}" data-start="{sec(st)}" data-duration="{sec(dur)}" data-track-index="2">{label} · edited recording</div>''')
    edl.append(dict(name=name,filmStart=a*S,filmEnd=b*S,source='takeA.mp4',sourceStart=src,sourceEnd=src+(b-a)*S*rate,playbackRate=exact_rate))
# Output is the real downloaded PNG, not a recreated comic.
shotmarkup.append('''<div id="wk-output"><img id="real-export" class="clip" src="assets/ui/final-export.png" data-start="41.688" data-duration="1.872" data-track-index="1" alt="The Reliable Bug, the actual downloaded PNG"/></div>''')
scene('walkthrough',43.56,'''#wk-world{position:absolute;inset:0;perspective:2400px}#wk-window{position:absolute;left:620px;top:157px;width:1210px;height:800px;border:3px solid var(--paper);background:var(--paper);box-shadow:18px 26px 0 #00000080,0 30px 65px #00000060;transform-style:preserve-3d}#wk-bar{height:40px;border-bottom:2px solid var(--ink);font-size:26px;font-weight:500;letter-spacing:.06em;text-align:center;padding-top:8px;background:#EAE3D6}#wk-screen{position:relative;width:1204px;height:753px;overflow:hidden;background:var(--paper)}.wk-shot{position:absolute;inset:0;opacity:0}.wk-lens{position:absolute;inset:0}.wk-lens video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.wk-rate{position:absolute;left:150px;top:920px;right:auto;bottom:auto;color:var(--paper);padding:6px 0;font-size:28px;font-weight:500;z-index:20}#wk-output{position:absolute;inset:0;opacity:0;background:var(--paper)}#wk-output img{position:absolute;left:225px;top:0;width:753px;height:753px;object-fit:contain}#wk-chapter{position:absolute;left:150px;top:180px;width:420px;color:var(--paper);font-size:28px;font-weight:500;letter-spacing:.09em;line-height:1.4}#wk-rail{position:absolute;left:150px;top:275px;width:70px;height:7px;background:var(--red);transform-origin:left center}#wk-folio{position:absolute;left:150px;top:800px;color:#F4EFE680;font-size:28px;font-weight:500;line-height:1.45}#wk-inkline{position:absolute;left:150px;top:700px;width:340px;height:4px;background:var(--blue);transform-origin:left center}''',bg('wk',True)+'''<div id="wk-chapter">01 / FIND THE JOKE<br>02 / MAKE IT YOURS</div><div id="wk-rail"></div><div id="wk-folio">REAL APP CAPTURE<br>Slack /rename update</div><div id="wk-inkline" data-layout-ignore></div><div id="wk-paper" style="position:absolute;left:620px;top:157px;width:1210px;height:800px;background:#F4EFE6;opacity:0" data-layout-ignore></div><div id="wk-world"><div id="wk-window"><div id="wk-bar">strip-kappa.vercel.app · recorded session</div><div id="wk-screen" data-layout-allow-overflow>'''+''.join(shotmarkup)+'''</div></div></div>'''+''.join(ratemarkup)+'''<div id="wk-mine" style="position:absolute;left:150px;top:670px;border:5px solid #D2432F;padding:2px 18px;color:#F06A56;font-size:62px;font-weight:800;opacity:0">MINE</div><div id="wk-transition" class="red-dot" style="left:1740px;top:150px;width:60px;height:60px" data-layout-ignore></div>''',bgmove('wk',43.56)+'''m("#wk-transition",{scale:70},{scale:0},0,.65,"power4.inOut");set("#wk-transition",{opacity:0},.65);set("#wk-paper",{opacity:1},43.0);set("#wk-folio,#wk-chapter,#wk-rail,#wk-inkline",{opacity:0},43.0);m("#wk-paper",{scale:1},{scale:6},43.0,.56,"power2.inOut");m("#wk-window",{rotationY:-7,rotationX:2,rotation:-1.2,x:220,scale:.85},{rotationY:-1.5,rotationX:1,rotation:.4,x:0,scale:1},0,.8);m("#wk-window",{rotationY:-1.5,rotationX:1,rotation:.4},{rotationY:1.2,rotationX:-.6,rotation:-.4},.8,42.76,"none");m("#wk-rail",{scaleX:1},{scaleX:5},0,43.56,"none");m("#wk-inkline",{scaleX:0},{scaleX:1},14.4,.65);tl.to("#wk-inkline",{backgroundColor:"#D2432F",duration:.2},21.05);'''+''.join(shotjs)+'''m("#wk-mine",{scale:1.6,rotation:-16,opacity:0},{scale:1,rotation:-6,opacity:1},21.35,.22);set("#wk-mine",{opacity:0},35.64);set("#wk-output",{opacity:1},41.688);m("#wk-output",{scale:1,transformOrigin:"66% 74%"},{scale:1.8},41.688,1.87,"power2.inOut");''')
(ROOT/'tools/edit-decisions.json').write_text(json.dumps(edl,indent=2)+'\n')

# 04: Diagram first, then verifiable recorded output + actual capture/still.
scene('framework',24.3,'''#an-logo{position:absolute;left:410px;top:180px;width:1100px;height:129px}#an-by{position:absolute;left:0;right:0;top:330px;text-align:center;font-size:38px;font-weight:500}#an-diagram{position:absolute;inset:0}#an-action{position:absolute;left:700px;top:465px;width:520px;height:132px;background:var(--ink);color:var(--paper);border:3px solid var(--ink);box-shadow:12px 12px 0 var(--red);display:flex;align-items:center;justify-content:center;font-size:56px;font-weight:800;letter-spacing:-.04em}.an-port{position:absolute;top:750px;width:370px;height:112px;border:3px solid var(--ink);background:var(--paper);display:flex;align-items:center;justify-content:center;font-size:37px;font-weight:800}.an-port.blue{color:var(--blue);border-color:var(--blue)}#an-ui{left:190px}#an-agent{left:775px}#an-mcp{left:1360px}#an-wires{position:absolute;inset:0;width:1920px;height:1080px}#an-wires path{fill:none;stroke:var(--ink);stroke-width:4;stroke-dasharray:600;stroke-dashoffset:600}#an-proof{position:absolute;inset:0;opacity:0}#an-proof-head{position:absolute;left:150px;top:160px;font-size:34px;letter-spacing:.01em}#an-proof-head img{width:520px;height:62px;vertical-align:middle;margin-right:70px}#an-library{position:absolute;left:140px;top:300px;width:760px;height:475px;border:3px solid var(--ink);box-shadow:14px 14px 0 var(--ink);overflow:hidden}#an-library img{width:100%;height:100%;object-fit:contain}#an-library-note{position:absolute;left:150px;top:800px;font-size:28px;font-weight:500}#an-transcript{position:absolute;left:990px;top:305px;width:760px}#an-transcript .kicker{font-size:28px;color:var(--blue);margin-bottom:28px}.an-record{font-size:40px;line-height:1.2;font-weight:500;white-space:pre-line}.an-record b{font-weight:800}.an-record .tool{font-size:29px;color:var(--blue);font-weight:800;margin-bottom:26px}#an-refusal{position:absolute;inset:0;opacity:0}#an-refusal-window{position:absolute;left:140px;top:300px;width:760px;height:475px;border:3px solid var(--ink);box-shadow:14px 14px 0 var(--ink);overflow:hidden;background:var(--paper)}#an-refusal-lens{position:absolute;inset:0}#an-refusal video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}#an-error{position:absolute;left:990px;top:315px;width:780px;font-size:39px;font-weight:500;line-height:1.22}#an-error .tool{color:var(--blue);font-size:28px;font-weight:800;margin-bottom:22px}#an-error b{color:var(--red);font-weight:800}#an-error-code{margin-top:25px;border:3px solid var(--red);color:var(--red);padding:12px 18px;display:inline-block;font-size:31px;font-weight:800}#an-unchanged{position:absolute;left:150px;top:810px;font-size:28px;font-weight:500}''',bg('an')+'''<div id="an-diagram"><img id="an-logo" src="assets/brand/agent-native-logo-light.svg" alt="Agent-Native"/><div id="an-by">from Builder.io</div><svg id="an-wires" viewBox="0 0 1920 1080" data-layout-ignore><path id="an-wire1" d="M960 597 V660 H375 V750"/><path id="an-wire2" d="M960 597 V750"/><path id="an-wire3" d="M960 597 V660 H1545 V750"/></svg><div id="an-action">update-strip</div><div class="an-port" id="an-ui">UI button</div><div class="an-port blue" id="an-agent">In-app agent</div><div class="an-port blue" id="an-mcp">MCP</div><div id="an-dot" class="red-dot" style="left:941px;top:575px;opacity:0" data-layout-ignore></div></div><div id="an-proof"><div id="an-proof-head"><img src="assets/brand/agent-native-logo-light.svg" alt="Agent-Native"/>One action. Every surface.</div><div id="an-library"><img id="library-still" class="clip" src="assets/ui/library-after-reload.png" data-start="15.84" data-duration="3.4" data-track-index="1" alt="Real Library screenshot after reload"/></div><div id="an-library-note">Library after reload · actual still</div><div id="an-transcript"><div class="kicker">Claude Code / recorded tool output</div><div class="an-record"><div class="tool">mcp__strip__create-strip</div>“<b>‘Undo, Emboldened’</b> …<br>saved … as<br>an illustrative draft.”</div></div></div><div id="an-refusal"><div style="position:absolute;left:150px;top:160px;font-size:34px"><img src="assets/brand/agent-native-logo-light.svg" alt="Agent-Native" style="width:520px;height:62px;vertical-align:middle;margin-right:70px"/>Shared action. Same protection.</div><div id="an-refusal-window" data-layout-allow-overflow><div id="an-refusal-lens"><video id="mcp-refusal-capture" class="clip" src="assets/capture/mcp-refusal.mp4" data-start="19.2" data-duration="5.1" data-track-index="1" muted playsinline></video></div></div><div id="an-error"><div class="tool">mcp__strip__update-strip</div><b>Error:</b> This contribution is protected by the human.<br>Leave it unchanged and revise other objects.<div id="an-error-code">protected_element</div></div><div id="an-unchanged">Same line. Same revision. Actual capture.</div></div>''',bgmove('an',24.3)+'''set("#an-wires",{opacity:0},0);set("#an-wires",{opacity:1},7.6);m("#an-logo",{y:100,opacity:0},{y:0,opacity:1},.2,.65);m("#an-by",{opacity:0},{opacity:1},1.7,.3);m("#an-action",{scale:.65,rotation:-8,opacity:0},{scale:1,rotation:0,opacity:1},5.5,.65);["#an-ui","#an-agent","#an-mcp"].forEach((q,i)=>m(q,{y:100,opacity:0,rotationY:-35},{y:0,opacity:1,rotationY:0},8.0+i*.7,.65));[1,2,3].forEach((i)=>m("#an-wire"+i,{strokeDashoffset:600},{strokeDashoffset:0},7.6+i*.6,.9));set("#an-dot",{opacity:1},8.4);m("#an-dot",{x:0,y:0},{x:0,y:66},8.4,.3,"power2.inOut");m("#an-dot",{x:0,y:66},{x:-585,y:66},8.7,.55,"power2.inOut");m("#an-dot",{x:-585,y:66},{x:-585,y:160},9.25,.3);m("#an-dot",{x:-585,y:160},{x:0,y:160},10.0,.7,"power2.inOut");m("#an-dot",{x:0,y:160},{x:585,y:160},12.0,.7,"power2.inOut");m("#an-diagram",{x:0,opacity:1},{x:-1920,opacity:0},15.4,.44,"power3.in");set("#an-proof",{opacity:1},15.84);m("#an-library",{x:180,rotation:-3},{x:0,rotation:.5},15.84,.55);m("#an-transcript",{x:350,opacity:0},{x:0,opacity:1},16.0,.55);set("#an-proof",{opacity:0},19.2);set("#an-refusal",{opacity:1},19.2);m("#an-refusal-lens",{scale:2.6,x:296,y:284,transformOrigin:"50% 50%"},{scale:2.7,x:307,y:295},19.2,5.1,"power2.inOut");m("#an-error",{x:100,opacity:0},{x:0,opacity:1},19.2,.4);m("#an-error-code",{scale:1.4,rotation:-5,opacity:0},{scale:1,rotation:-2,opacity:1},20.2,.25);''')

# 05: A held, readable destination; the dot settles as the actual logo period.
scene('close',5.94,'''#cl-logo{position:absolute;left:670px;top:510px;width:580px;height:218px}#cl-logo img{width:100%;height:100%}#cl-links{position:absolute;left:0;right:0;top:790px;text-align:center;color:var(--paper);font-size:32px;font-weight:500;line-height:1.5}#cl-built{position:absolute;left:0;right:0;top:935px;text-align:center;color:var(--paper);font-size:30px;font-weight:500;letter-spacing:.04em}#cl-disc{position:absolute;left:1203px;top:666px;width:48px;height:48px;border-radius:50%;background:var(--red)}''',bg('cl',True)+'''<div id="cl-logo"><img src="assets/brand/logo-reversed.svg" alt="Strip"/></div><div id="cl-links">strip-kappa.vercel.app<br>github.com/emmaGH1/strip</div><div id="cl-built">Built with Agent-Native</div><div id="cl-music" style="position:absolute;left:100px;right:100px;top:1022px;text-align:center;color:#F4EFE6;font-size:22px;font-weight:500">Music: “Pizzicato” — Ehma · “Synths and Arps” — Julius Nox · CC BY 3.0</div><div id="cl-disc" data-layout-ignore></div>''',bgmove('cl',5.94)+'''m("#cl-logo",{scale:.8,y:60,opacity:0},{scale:1,y:0,opacity:1},2.4,.6);m("#cl-disc",{x:-780,y:-280,scale:.6},{x:0,y:0,scale:1},.0,2.95,"power3.inOut");set("#cl-disc",{opacity:0},3.0);m("#cl-links",{opacity:0,y:30},{opacity:1,y:0},2.9,.5);m("#cl-built",{opacity:0},{opacity:1},3.2,.4);m("#cl-music",{opacity:0},{opacity:1},3.2,.4);''')

# One word-timed caption lane. Typography lives in the composition, not a subtitle bar.
seed=json.loads((ROOT/'tools/caption-groups.json').read_text())
captionparts=[]; captionjs=[]
for i,g in enumerate(seed['groups']):
    start=g['start']*S; end=min(g['end']*S,END)
    seg=g['seg']
    mode={1:'opening',2:'logo-caption',3:'side',4:'side',5:'side',6:'framework-caption',7:'close-caption'}[seg]
    spans=[]
    for j,w in enumerate(g['words']):
        ws=w['start']*S
        tag=w['tag']
        # Human pen is ink/paper, not red. Red is reserved for MINE/refusal.
        if seg==7 and i==51: tag='ink'
        cursor=f'<i class="type-dot" id="cursor{i}-{j}"></i>' if seg==1 else ''
        spans.append(f'<span id="w{i}-{j}" class="word {tag}">{html.escape(w["text"])}{cursor}</span>')
        captionjs.append(f'm("#w{i}-{j}",{{opacity:0,y:16}},{{opacity:1,y:0}},{sec(ws)},.12,"power3.out");')
        if seg==1:
            nextword=g['words'][j+1]['start']*S if j+1<len(g['words']) else end
            captionjs.append(f'm("#cursor{i}-{j}",{{opacity:1,scale:1.45}},{{opacity:1,scale:1}},{sec(ws)},.16);set("#cursor{i}-{j}",{{opacity:0}},{sec(max(ws+.02,nextword-.01))});')
    captionparts.append(f'<div id="caption-{i}" class="clip caption {mode}" data-start="{sec(start)}" data-duration="{sec(end-start)}" data-track-index="0"><div class="caption-line" id="line-{i}">'+ ' '.join(spans)+ '</div></div>')
    captionjs.append(f'm("#line-{i}",{{opacity:1}},{{opacity:0}},{sec(end-.10)},.10,"power2.in");')
scene('captions',END,'''#root{overflow:visible;pointer-events:none}.caption{position:absolute;left:0;right:0;inset:auto 0 auto 0;font-weight:800;letter-spacing:-.035em;line-height:1.08;text-align:center;overflow:visible}.word{position:relative;display:inline-block;opacity:0}.type-dot{position:absolute;right:-.22em;bottom:.13em;width:.15em;height:.15em;border-radius:50%;background:var(--red);opacity:0}.word.blue{color:#3B6FD8}.word.red{color:#D2432F}.opening{left:150px;right:auto;top:360px;width:1050px;text-align:left;font-size:92px;color:var(--paper)}.opening .blue{color:#7FA3F0}.opening .red{color:#F06A56}.logo-caption{top:875px;font-size:46px;color:var(--ink)}.side{left:150px;right:auto;top:350px;width:420px;text-align:left;font-size:59px;color:var(--paper)}.side .blue{color:#85A8EE}.side .red{color:#F06A56}.framework-caption{top:930px;left:160px;right:160px;font-size:45px;color:var(--ink)}.close-caption{top:285px;left:180px;right:180px;font-size:83px;color:var(--paper)}.close-caption .blue{color:#85A8EE}.close-caption .red{color:#F06A56}''',''.join(captionparts),''.join(captionjs))

# Root owns the scene mounts and sound. Captions-only is the default source.
mounts=[('open',0,12.24),('logo',12.24,7.56),('walkthrough',19.8,43.56),('framework',63.36,24.3),('close',87.66,5.94)]
scenehosts=''.join(f'<div id="{n}" class="clip scene" data-composition-id="{n}" data-composition-src="compositions/{n}.html" data-start="{st}" data-duration="{d}" data-track-index="0" data-track-kind="graphics" data-width="1920" data-height="1080"></div>' for n,st,d in mounts)
scenehosts+=f'<div id="captions" class="clip scene" style="z-index:100" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{END}" data-track-index="3" data-track-kind="captions" data-width="1920" data-height="1080"></div>'
# Recorded source has no audio. Earned effects: keys for the opening, pencil on a
# proposal, tactile impact for MINE; no swoosh, riser, chime or notification.
audio='''<audio id="music-bed" src="assets/bgm/pizzicato-ehma.mp3" class="clip" data-start="0" data-duration="63.36" data-track-index="4" data-volume="0.58" data-fade-in="0.6" data-fade-out="0.3"></audio><audio id="music-framework" src="assets/bgm/synths-and-arps-julius-nox.mp3" class="clip" data-start="63.36" data-duration="30.24" data-track-index="4" data-media-start="16" data-volume="0.48" data-fade-in="0.25" data-fade-out="1.2"></audio>'''
for name,src,st,dur,gain in [('key-open','key-press',.6,.25,.4),('keys-note','typing',2.12,1.49,.2),('pencil-draft','pencil',32.94,1.1,.32),('mine-stamp','impact-bass-1',41.2,.7,.6),('ink-click','click',56.85,.3,.5),('erase-click','click-soft',57.8,.3,.5),('ending-click','click',59.4,.3,.45),('action-land','key-press',68.9,.3,.5),('refusal-stamp','impact-bass-1',83.6,.7,.5),('logo-land','pop',90.3,.4,.38)]:
    audio+=f'<audio id="sfx-{name}" class="clip" src="assets/sfx/{src}.mp3" data-start="{st}" data-duration="{dur}" data-track-index="5" data-volume="{gain}" data-fade-out="0.08"></audio>'
index=f'''<!doctype html><html lang="en" data-composition-variables='[{{"id":"paper","type":"color","label":"Paper","default":"#F4EFE6"}},{{"id":"ink","type":"color","label":"Ink","default":"#1A1714"}}]'><head><meta charset="UTF-8"><meta name="viewport" content="width=1920,height=1080"><title>Strip — Your agent pencils. You hold the pen.</title><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>*{{box-sizing:border-box;margin:0}}html,body{{width:1920px;height:1080px;overflow:hidden;background:#1A1714}}#root{{position:absolute;inset:0}}.scene{{position:absolute;inset:0;overflow:hidden}}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1920" data-height="1080" data-fps="30">{scenehosts}{audio}</div><script>window.__timelines=window.__timelines||{{}};window.__timelines.main=gsap.timeline({{paused:true}});</script></body></html>'''
(ROOT/'index.html').write_text(index)
print('Built all five scenes + the one caption lane. Duration:',END)

#!/usr/bin/env python3
"""Check both sources; decode/probe/measure both deliveries; save compact evidence."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)
F = os.environ.get('STRIP_FFMPEG') or shutil.which('ffmpeg') or '/data/home/.strip-tools/node_modules/ffmpeg-static/ffmpeg'
P = os.environ.get('STRIP_FFPROBE') or shutil.which('ffprobe') or '/data/home/.strip-tools/node_modules/ffprobe-static/bin/linux/x64/ffprobe'

def output(args):
    return subprocess.check_output(args, text=True)

result = {
    'verifiedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'hyperframes': '0.9.28', 'checks': {}, 'outputs': {},
    'contactSheet': {'file': 'review/final-sheet.png', 'sampleSeconds': list(range(0, 94, 3)), 'grid': '4x8 row-major'},
}
original = Path('index.html').read_bytes()
try:
    for version in ['captions', 'voice']:
        if version == 'voice':
            Path('index.html').write_bytes(Path('voice.source').read_bytes())
        check = json.loads(output(['bash', 'tools/hf.sh', 'check', '--json']))
        summary = {'ok': check['ok']}
        for section in ['lint', 'runtime', 'layout', 'contrast', 'craft', 'audio']:
            s = check[section]
            findings = s.get('findings', s.get('issues', []))
            summary[section] = {
                'errors': s.get('errorCount', 0), 'warnings': s.get('warningCount', 0),
                'warningCodes': sorted({x.get('code', '') for x in findings if x.get('severity') == 'warning'}),
            }
        result['checks'][version] = summary
        assert check['ok'], f'{version} source check failed'
finally:
    Path('index.html').write_bytes(original)

for version in ['captions', 'voice']:
    path = Path(f'renders/final-{version}.mp4')
    decoded = subprocess.run([F, '-v', 'error', '-threads', '2', '-i', str(path), '-f', 'null', '-'], capture_output=True, text=True, check=True)
    assert not decoded.stderr.strip(), decoded.stderr
    probe = json.loads(output([P, '-v', 'quiet', '-show_entries', 'stream=codec_name,codec_type,width,height,r_frame_rate,duration,nb_frames,sample_rate,channels:format=duration,size', '-of', 'json', str(path)]))
    video_hash = output([F, '-v', 'error', '-i', str(path), '-map', '0:v:0', '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-']).strip()
    audio = json.loads(output(['bash', 'tools/hf.sh', 'audio', str(path), '--json']))['items'][0]
    assert int(probe['format']['size']) < 200_000_000
    assert float(probe['format']['duration']) == 93.6
    video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    sound = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
    assert (video['codec_name'], video['width'], video['height'], video['r_frame_rate'], video['nb_frames']) == ('h264', 1920, 1080, '30/1', '2808')
    assert (sound['codec_name'], sound['sample_rate'], sound['channels']) == ('aac', '48000', 2)
    result['outputs'][version] = {
        'file': str(path), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'videoPacketHash': video_hash, 'decode': 'passed; no error output',
        'probe': probe, 'loudness': audio['loudness'], 'audioWarnings': audio['warnings'],
    }
result['identicalEncodedVisualStream'] = result['outputs']['captions']['videoPacketHash'] == result['outputs']['voice']['videoPacketHash']
assert result['identicalEncodedVisualStream'], 'Variants must use the exact same visual stream'
Path('review/verification.json').write_text(json.dumps(result, indent=2) + '\n')
print('PASS: sources, full decode, 1080p/30, 93.6 s, <200 MB, identical video streams. See review/verification.json.')

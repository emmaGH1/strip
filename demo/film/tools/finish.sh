#!/usr/bin/env bash
# Normalize the HyperFrames mixes without re-encoding H.264, and make the sheet.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg=${STRIP_FFMPEG:-/data/home/.strip-tools/node_modules/ffmpeg-static/ffmpeg}
cap=${1:-renders/captions-v2-raw.mp4}
voice=${2:-renders/voice-v2-raw.mp4}
for variant in captions voice; do
  if [[ "$variant" == captions ]]; then input=$cap; else input=$voice; fi
  # Always reuse the captions video stream: variants are pixel-identical.
  "$ffmpeg" -y -hide_banner -i "$cap" -i "$input" -map 0:v -map 1:a -c:v copy \
    -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -ar 48000 \
    -c:a aac -b:a 192k -t 93.6 -movflags +faststart \
    -metadata title='Strip — Your agent pencils. You hold the pen.' \
    -metadata comment='Music: Pizzicato by Ehma (jamendo.com/track/1687311); Synths and Arps by Julius Nox - Giulio’s Page (jamendo.com/track/2179902). CC BY 3.0, creativecommons.org/licenses/by/3.0/. Trimmed, faded and mixed. Full credits: demo/film/CREDITS.md.' \
    "renders/final-$variant.mp4" 2>"renders/normalize-$variant.log"
done
# Exactly t=0,3,6,...,93 seconds, row-major, four columns and eight rows.
"$ffmpeg" -y -loglevel error -i renders/final-captions.mp4 \
  -vf "select='not(mod(n,90))',scale=480:270,tile=4x8" -fps_mode vfr \
  -frames:v 1 review/final-sheet.png
printf 'Finished: final-captions.mp4, final-voice.mp4, review/final-sheet.png\n'

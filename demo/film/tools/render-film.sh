#!/usr/bin/env bash
# Complete local delivery. Never publishes, spends or touches the app/capture.
set -euo pipefail
cd "$(dirname "$0")/.."
# The committed editorial clips are enough to render; raw captures are optional.
python3 tools/build-film.py --prepare-audio
# Only one HTML entry point may exist. Voice is stored as .source to avoid the
# HyperFrames duplicate-root discovery error.
bin=$(mktemp -d /tmp/strip-voice-tools.XXXXXX)
backup=$(mktemp /tmp/strip-captions-index.XXXXXX)
cp index.html "$backup"
trap 'cp "$backup" index.html; rm -f "$backup"; rm -rf "$bin"' EXIT
ln -s "${STRIP_FFMPEG:-/data/home/.strip-tools/node_modules/ffmpeg-static/ffmpeg}" "$bin/ffmpeg"
ln -s "${STRIP_FFPROBE:-/data/home/.strip-tools/node_modules/ffprobe-static/bin/linux/x64/ffprobe}" "$bin/ffprobe"
export PATH="$bin:$PATH"
node tools/prepare-voice.mjs
bash tools/hf.sh check --json
bash tools/hf.sh snapshot --review --output review/director
bash tools/hf.sh render --quality delivery --fps 30 --workers 2 --no-low-memory-mode \
  --crf 18 --max-bitrate 12M --buffer-size 24M --strict --no-best-effort \
  -o renders/captions-v2-raw.mp4
cp voice.source index.html
bash tools/hf.sh check --json
bash tools/hf.sh render --quality delivery --fps 30 --workers 2 --no-low-memory-mode \
  --crf 18 --max-bitrate 12M --buffer-size 24M --strict --no-best-effort \
  -o renders/voice-v2-raw.mp4
cp "$backup" index.html
bash tools/finish.sh
python3 tools/verify-film.py

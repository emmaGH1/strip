#!/usr/bin/env bash
# Local, pinned HyperFrames runner with this VM's supplied FFmpeg/Chrome tools.
set -euo pipefail
cd "$(dirname "$0")/.."
bin=$(mktemp -d /tmp/strip-film-tools.XXXXXX)
trap 'rm -rf "$bin"' EXIT
ffmpeg=${STRIP_FFMPEG:-/data/home/.strip-tools/node_modules/ffmpeg-static/ffmpeg}
ffprobe=${STRIP_FFPROBE:-/data/home/.strip-tools/node_modules/ffprobe-static/bin/linux/x64/ffprobe}
if [[ -x "$ffmpeg" ]]; then ln -s "$ffmpeg" "$bin/ffmpeg"; fi
if [[ -x "$ffprobe" ]]; then ln -s "$ffprobe" "$bin/ffprobe"; fi
export PATH="$bin:$PATH"
shell=/data/home/.t3/tools/chrome-headless-shell/linux64/156.0.8078.80/chrome-headless-shell
if [[ -x "$shell" ]]; then export HYPERFRAMES_BROWSER_PATH="${HYPERFRAMES_BROWSER_PATH:-$shell}"; fi
npx --yes hyperframes@0.9.28 "$@"

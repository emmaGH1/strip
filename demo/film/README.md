# Strip — product film

Finished 93.6-second, 1920×1080, 30 fps HyperFrames cut. See [REVIEW.md](REVIEW.md) for the delivery and known limitations, and [CREDITS.md](CREDITS.md) for attribution required when posting.

## Deliverables (local, deliberately not in git)

- `renders/final-captions.mp4`: music/SFX and word-following captions, **no narration**.
- `renders/final-voice.mp4`: same visual cut, plus free local **synthetic draft** narration. Not a founder voice clone.
- `review/final-sheet.png`: decoded final frames at 0, 3, 6 … 93 seconds; four columns, eight rows, row-major.

Both MP4s use H.264/AAC and fast-start metadata. They are approximately 35.4 MB each.

## Edit / render on this machine

```sh
cd demo/film
npm install --ignore-scripts
npm run dev                 # start editable HyperFrames Studio; URL is printed
npm run check
npm run render:final        # both variants, normalization and contact sheet
```

`tools/hf.sh` pins HyperFrames **0.9.28** and locates the installed Chrome/FFmpeg tools. The full render script uses the existing HyperFrames audio skill's spectral-carve helper. Set `STRIP_FFMPEG`, `STRIP_FFPROBE`, or `HYPERFRAMES_BROWSER_PATH` for different local binaries; the helper path in `tools/prepare-voice.mjs` must also exist. No paid service is required or called.

`tools/build-film.py` is the canonical scene/root generator. Edit it, not just its generated HTML. It preserves the approved narration's word groups in `tools/caption-groups.json`, compressing the original timing by 0.9. `--prepare-audio` rebuilds the local narration mix from the seven bundled draft WAVs. The committed short editorial clips suffice to render; optional `--prepare-media` re-cuts them from the original, unmodified recordings in `demo/capture/`. `tools/edit-decisions.json` records source in/out/rate and camera focus.

Keep exactly one root HTML entry point: `index.html` defaults to captions-only. `voice.source` is its generated voiced variant, deliberately not named `.html`; the render script temporarily swaps it into `index.html` and restores the original on exit. Do not introduce a second root HTML file: HyperFrames flags duplicate roots/audio.

Unused registry components and illustrative strip assets are retained from the preparation lane. They are not product proof or the final film's UI. All displayed product screens are actual capture pixels or explicitly labelled actual stills.

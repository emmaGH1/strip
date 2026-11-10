# Strip — final film review

Finished and verified locally on **2026-11-10, 06:16 UTC**, ahead of the 07:00 target. No upload, submission, push, deployment, app edit, or original-capture edit was performed by this film lane.

## Watch / inspect

| File | Duration | Format | Size |
| --- | --- | --- | --- |
| `renders/final-captions.mp4` | 93.6 s | 1920×1080, 30 fps, H.264/AAC | 35,374,452 bytes |
| `renders/final-voice.mp4` | 93.6 s | Same visual cut; synthetic draft voice | 35,380,521 bytes |

Both have 2,808 video frames, stereo 48 kHz AAC, and fast-start MP4 headers. Their encoded visual streams are hash-identical. Measured integrated loudness is −15.1 LUFS (captions) / −15.9 LUFS (voice), with −1.4 dBTP and zero detected clipping in both. The captions version has music and tactile SFX but **no narration**. The voice version uses the existing free local Kokoro `am_michael` draft, pitch-preserving 1.111× tempo; **not the founder's voice, not an ElevenLabs clone**. No paid provider was used.

- **`review/final-sheet.png`**: frames decoded from the delivered captions MP4, every three seconds, including t=0 and t=93. Four columns × eight rows, left-to-right/top-to-bottom. This is not merely a source-HTML preview.
- `review/final-actions/contact-sheet.jpg`: additional inspected source-render moments at 23.25, 56.85, 57.95, 59.3, 60.9, 62.9, 65, 85, and 93 seconds. Shows Ink/Erase, actual ending choice, export, unchanged protected line, and closing links.
- `review/director/review-beats.jpg`, `review-phone.jpg`, and four `review-seam-*.jpg` sheets: scene/phone/seam review. These predate the final Ink/Erase/ending trim corrections; use the final sheet and final-actions sheet for those moments.
- `review/verification.json`: machine-readable checks, final media facts, audio measurements and hashes.

## Cut / visual direction

| Time | Scene |
| --- | --- |
| 0–12.24 | Release-notes opening, typing-dot punctuation, moving paper and four-panel geometry |
| 12.24–19.8 | Actual Strip logo; 1 update → 4 panels; red-dot zoom-through |
| 19.8–63.36 | Actual app walkthrough; controlled editorial camera, live interaction pixels, MINE motif, real exported comic payoff |
| 63.36–87.66 | Builder.io / Agent-Native shared action across UI, in-app agent, MCP; actual Library-after-reload still; recorded Claude Code creation/refusal excerpts and protected Studio footage |
| 87.66–93.6 | “Your agent pencils. You hold the pen.”; Strip logo, deployed and GitHub URLs, Built with Agent-Native, music credit |

Ink/paper/red/blue/butter, Bricolage Grotesque, flat shadows, halftone, comic geometry, continuous background/camera motion. Captions are individually word-timed and integrated into the composition, without subtitle bars. No whooshes, generated images, fake product screens, or gradients added to the product film. Music has scene-aware fades; the voiced mix additionally uses spectral carving and ducking. Full attribution and posting links: **[CREDITS.md](CREDITS.md)**; abbreviated credit is burned into the end card and links are embedded in MP4 metadata.

## Proof and honesty

Approximately **47 seconds are actual recorded product video**, plus about **five seconds of actual stills**. The balance is original typography, brand/motion graphics and an explicitly editorial architecture diagram. The exact EDL is `tools/edit-decisions.json`.

- Take A is a real AI interaction using the Slack `/rename` release note. Internal failure/warning intervals were excluded, and waits were cut/accelerated, never represented as instant generation. Accelerated segments carry their actual rate (including 1.5×, 2× and 4×).
- Direct edit, MINE protection, contextual “Funnier” revision, Ink/Erase, ending selection, export and the retained line are captured product behavior. Final trims were corrected after source inspection so Ink/Erase actually occur on screen rather than showing only their buttons.
- The protected line remains **“That crash was my coffee break.”** The downloaded artifact is the actual **The Reliable Bug** PNG, not an illustrative replacement; its final reaction is **“At last, a promotion for the bug.”** Dialogue is fictional, not source evidence.
- Take B's open Library **did not update without refresh**. The film uses an actual screenshot labelled **“Library after reload · actual still”**, never a fake live arrival or instant-sync claim.
- Claude Code saved **Undo, Emboldened** as an **illustrative draft**; that qualification is retained in the recorded-output excerpt. Terminal text is faithfully typeset from the real retained output, labelled **recorded tool output**, not simulated terminal footage.
- The refusal is the real action error: **“This contribution is protected by the human. Leave it unchanged and revise other objects.”** with **`protected_element`**. It is not shown as an in-app notification. Separate actual Studio footage shows the unchanged line; the underlying reread remained revision 6.
- The shared-action graphic is explanatory motion design, not fabricated app UI.

## Verification and limitations

HyperFrames **0.9.28** `check` passed for both final source variants: **zero lint/runtime/layout/contrast/audio errors**. Final captions source also had zero layout/contrast warnings. Remaining non-blocking warnings are recorded in `verification.json`: chiefly nested-media timing/discovery ambiguity, short speed-label/terminal reading windows, and small browser/credit text. They were not silently treated as a clean craft score.

Both final outputs were fully decoded for corruption checks, probed for codec/duration/frame count, and measured for loudness. Visual review covered 3-second decoded-frame sampling, scene seams, a phone-scale sheet and focused action frames. Automated checks and still sampling do **not** prove humour, ease of use, or a complete human real-time viewing/listening review.

Known weaknesses: the dense real UI begins as a 1600×1000 recording, so tight push-ins are softer than native 1080p design graphics; some incidental UI/credit text is small on phones. The approved full narration runs briskly and the free draft voice sounds synthetic. Ending-choice/export payoffs and closing slogan phrases are brief. Library proof is necessarily a labelled still after reload, and terminal proof is a faithful typeset excerpt rather than live terminal video. These limitations are preferable to inventing stronger behavior or delaying a finished cut.

Source/short assets are committed; rendered MP4s, caches, generated narration mix, and large transient review frames remain local/ignored. Original recordings are left outside the film commit. Reproduction/editing notes: [README.md](README.md).

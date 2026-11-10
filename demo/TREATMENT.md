# Strip demo film — treatment v2 (human-approved direction, 2026-11-10 ~02:00 UTC)

Deadline: submit by 07:59 UTC. Rough cut by 04:30 UTC, final render by 06:00 UTC.
Tooling: HyperFrames (human's explicit choice) for all motion, captions and sound. 1920x1080, 30 fps, ~115 s (hard range 90–150 s).

## What the human wants (their words, condensed)
- Think like a studio with a large budget making a product film for a multi-million-dollar company. Nothing generic.
- NOT a paper studio set. NOT generic gradients, slow gradient drifts, whoosh/swoosh sound effects or default "premium" tropes.
- Everything is always in motion; the app never rests. "The definition of motion."
- Runtime split: about 60% real app walkthrough, 40% motion graphics.
- Walkthrough: the real app window sits inside a beautiful designed backdrop (like an app floating on a desktop wallpaper), never a bare screen recording.
- Narration: a real founder explaining, immersive from the first second, with motion graphics illustrating every idea as it's said.
- Captions: not a generic subtitle bar. Words appear as they are spoken, beautifully set and integrated into the scene.
- Sound: narration in the human's own cloned voice, cleaned; music may change between sections; effects only where they are earned; everything in sync.
- Must showcase Builder.io / Agent-Native strongly and beautifully.
- Rules of the hackathon: the video must show the actual application in use. Nothing faked.

## Reference: demo/refs/ref-a.mp4 (47 s). Take the technique, never the content.
- A single small motif that never stops moving: it leads the eye from word to word and carries every transition.
- Words land one at a time and interact with shapes (a word bends along a ring, a highlight box draws around a key word).
- UI pieces assemble in 3D space, tilt, and resolve into the flat interface.
- Scene changes are continuous: zoom through an element, or a shape wipes into the next scene. Alternates dark and light sections.
- Do NOT take: its green glow gradients and blurred blobs.

## Our system
- Motif: the RED DOT from the Strip. logo (the full stop). It types the opening words, becomes the cursor, lands as the MINE stamp, pulses as the agent works, and settles as the full stop of "Strip." at the end.
- Palette: ink #1A1714, paper #F4EFE6, signal red #D2432F, pencil blue #3B6FD8, butter #E7B85A. Flat colour, hard edges, halftone dots and comic panel geometry instead of glows.
- Type: Bricolage Grotesque (UI/display), Comic Neue only inside comics. Fonts are in the app's node_modules/@fontsource packages; copy the files into the film's assets/fonts.
- Brand assets: public/logo.svg, public/logo-mark.svg, public/logo-reversed.svg, public/og.png; Agent-Native logos public/agent-native-logo-{light,dark}.svg; Open Peeps character SVGs in public/peeps/; the real strip renderer is shared/render-strip.ts (use it to render real strips as SVG for motion scenes).
- Walkthrough backdrop: our own designed, constantly moving scene (oversized halftone dot field and drifting comic panels in parallax, ink/red). The app window floats with a real shadow, slight 3D tilt, push-ins that follow the action, and never sits still.

## Beats (narration in demo/NARRATION.md)
1. Opening, motion only (~12 s): release notes nobody reads; the dot types and reacts to the words.
2. Logo (~6 s): "So we made Strip." Zoom through the red dot into the live app.
3. Walkthrough (~55 s, real capture from demo/capture/): paste note → three angles → pick → draft → edit a line → MINE stamp → "Funnier" → agent works around it → Ink/Erase → ending → export.
4. Builder.io / Agent-Native beat (~22 s): one action card fans out to three surfaces (button, in-app agent, MCP) with the Agent-Native logo; then real capture of Claude Code creating a strip that appears live in the Library, and being refused on the MINE line.
5. Close (~8 s): "Your agent pencils. You hold the pen." Logo, strip-kappa.vercel.app, github.com/emmaGH1/strip, "Built with Agent-Native".

## Honesty rules
Real capture only for the app. Speed-ramp slow AI waits with a small "4x" label. No invented metrics, users or posts. Illustrative strips are labelled.

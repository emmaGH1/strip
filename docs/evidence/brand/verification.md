# Brand options — bounded browser verification

2026-11-08 · GPT-6.1 Terra / high · fresh local Playwright Chromium, device scale 1. Screenshots taken after `document.fonts.ready` and all comic SVGs rendered; browser closed. External origins were blocked; none were requested. No accounts, existing sessions, AI, providers or external hosts were used.

## Result: functional PASS; visual issues to address

- Signed-out `/landing-a`, `/landing-b`, `/landing-c`: each returned 200 and stayed on its public URL. Both Make a strip links on each have `href="/home?new=1"`. `/` displayed the existing Strip poster, not an option; `/home` redirected to `/sign-in?c=...` and showed sign-in. This is a current-state root check, not a pixel comparison against a prior build.
- Document `clientWidth / scrollWidth` at 1440: 1440 / 1440 for all three; at 390: 390 / 390 for all three. No document horizontal overflow at those sizes. No browser page errors observed.
- B's explicitly **PREPARED INTERACTIVE EXAMPLE · NO AI REQUEST**: Pencil shows a blue balloon; Stamp MINE turns it black and adds the red stamp; Revise changes the character's pose/expression in blue while the protected “Just clearing the old drafts.” line and MINE stay unchanged. Ink makes that new character solid black; repeating Revise then Erase restores the original black character with the protected line still unchanged. Controls and status follow those states. This tests prepared renderer states, not a real model request or enforcement of writes.
- Hierarchy: all three have clear desktop headlines, CTAs and actual comic artwork; C gives the largest desktop sequential panels. Desktop sections have generous spacing without observed clipping. At 390 first fold, headline and CTA remain clear; comic dialogue and tiny captions are difficult to read at native size in all three, particularly A/B's 2×2 proof. B's comic extends beyond the first fold; this is normal vertical scroll, not horizontal overflow. C's phone deck visibly joins words at line-break boundaries: **“good.Give”** and **“characters,and”**. Restore explicit spaces at those boundaries. Consider larger mobile comic/panel treatment and larger disclosure/key text rather than relying on miniature lettering.
- Logo sheet rendered from local file at 2400px, full page, and inspected including native-size crops. At 64/512 the three concepts are distinct; wordmarks remain legible. At native 16px A's red stamp is barely a dot, B's blue dashed lower S loses its dashed detail and is hard to parse (especially on ink), and C's gutter is barely distinguishable from an ordinary S. Provide simplified, optically adjusted 16px marks or avoid claiming the full motif reads at favicon size. One-color variants were also included in the sheet; no final logo choice is implied.

## Evidence

- `docs/evidence/brand/landing-a-desktop.png` · `docs/evidence/brand/landing-a-phone.png`
- `docs/evidence/brand/landing-b-desktop.png` · `docs/evidence/brand/landing-b-phone.png`
- `docs/evidence/brand/landing-c-desktop.png` · `docs/evidence/brand/landing-c-phone.png`
- `docs/evidence/brand/logo-review.png` (from `docs/evidence/brand/logo-review.html`)

Desktop images are full page at 1440×900 viewport; phone images are first fold at 390×844. Viewport emulation is not a physical-phone test; visual readability is an observational assessment, not a usability study. No implementation changes, commit, deployment or real-AI testing.

## Final narrow recheck — evidence overwritten

The seven PNGs listed above were **overwritten** with final evidence after the small fixes: fresh local Chromium, device scale 1, fonts ready and all landing comic SVGs present; desktop 1440×900 full page, phone 390×844 first fold, logo sheet local file at 2400px full page. All seven images were inspected. External origins were blocked; no external requests were observed. No accounts, credentials, provider connections, AI requests, root or Studio interactions. Browsers closed.

- Each phone hero's Previous/Next pager advanced 1 → 2 → 3 → 4, with distinct corresponding SVG viewBoxes, correct labels, Next disabled at 4, and Previous returning to 3. Panel 1 and panel 4 lettering is materially larger and readable in these captures; panel 4 was separately inspected in temporary crops. This is not a physical-phone or comprehensive visual-acuity test. At the first fold, pager controls are partially cut off on A and C and below the fold on B; ordinary vertical scrolling is needed to reach them.
- C's phone deck now visibly separates “good. Give” and “characters, and”. The desktop full-comic/filmstrip presentations remain visible, and all three options show the intended real-renderer artwork. Phone proof caption/key/disclosure were not all visible in the first-fold captures; no broader small-text readability claim is made.
- Document clientWidth/scrollWidth was 1440/1440 desktop and 390/390 phone for all three, with no observed JavaScript page errors. These measurements are limited to the tested viewports and states.
- The refreshed logo sheet includes color and one-color marks and wordmarks. At 64 and 512px the concepts and their details remain distinguishable. At native 16px A's red accent is visible but still tiny; B's lower pencil treatment is present but its individual dashes and S shape remain difficult to resolve, especially on ink; C reads as an S with a fine cut, but the panel-gutter idea remains subtle. Do not claim all motifs communicate clearly as favicons; no final mark was selected.
- Test harness initially hit two strict-selector errors during capture; selectors were narrowed and the complete capture/recheck rerun. A separate temporary crop attempt found Python Pillow and ffmpeg unavailable; a local PNG reader was used instead. No production code or additional evidence sheets were changed. Human design, usability and physical-phone acceptance remain open.

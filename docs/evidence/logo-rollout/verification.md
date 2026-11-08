# Logo rollout — bounded local browser verification

Local production app at `127.0.0.1:8080`, headless Playwright / system Chromium, 1440×900 and 390×844 viewport emulation. Browser instances closed. The initial pass created one fresh disposable account; the two bounded Studio follow-ups each created one further disposable account (three total). Only their own data was accessed; no existing human accounts, provider connection or AI request. No app changes or service restart in these browser lanes.

**Final status:** all requested screenshots are captured and inspected, including saved Studio. Initial execution failures are retained below; Studio-specific DOM decode/scroll-width assertions remain unverified after the final class-selector timeout. The Studio screenshot itself shows the rendered wordmark and comic.

## Observed

- Landing header and footer display the new `/logo.svg`, alt `Strip`; the Library top bar displays the same integrated wordmark with red period. Landing's two images decode with natural dimensions 300×113; no broken `<img>` elements on landing. The reviewed `docs/evidence/brand/logo-final.png` shows the S as the first letter rather than a separate symbol; no diamond. It reads as Strip at the presented native 24/32/64 sizes and is clearly integrated at large size.
- At 390px, both loop thumbnail containers measure exactly 120 CSS px wide (their inner illustration measures 116px within borders). The screenshot shows real compact pencil and ink panel crops, not stretched empty surfaces. Small lettering is necessarily tiny.
- Landing hero comic computed transform matrix corresponds to −1.5° and shadow is `rgb(26, 23, 20) 3px 3px 0px 0px`. Landing document scroll width equals viewport width at both 390 and 1440px; this is not a physical-phone check.
- Framework-owned sign-in is a dark generic account form without an app logo; no override was expected.
- Served SVG favicon visually reads as the same cut S at 16/32/48px on its paper tile; at 16px the cut detail is small. ICO directory lists three entries: 16×16, 32×32, 48×48. Apple touch icon decodes 180×180; `/icon.png` 512×512, manifest PNGs decode at 192×192 and 512×512 matching their declarations. SVG favicon decodes, with natural dimensions 150×150.
- Rendered HTML includes SVG and ICO favicon links, 180px apple-touch link, manifest, absolute configured public-origin `/og.png` as `og:image`, and `twitter:card=summary_large_image`. The actual served OG PNG bytes decode 1200×630; image shows the new integrated wordmark, paper/ink graphic and an explicitly illustrative fictional comic crop.

## Initial gap / test failure (screenshot gap closed by final follow-up)

Studio top-bar capture **not obtained**. The browser containing the single permitted fresh account was inadvertently closed after Library and compose inspection, before opening and saving the prepared Undo example. Its generated credentials and session were memory-only and discarded. No second account, account recovery, or existing human account was used. Thus Studio and compose logo rendering and saved-record flow are not verified here; this is a test-execution gap, not an observed product failure. The account remains disposable and no strip was saved in this lane.

## Inspected artifacts

- `landing-1440.png`, `landing-390.png` — full landing pages.
- `phone-loop.png` — 02 and 03 thumbnails together at 390px.
- `library-topbar.png`, `sign-in.png` — disposable Library and blank framework form.
- `favicon.png` — served SVG at native 16/32/48 CSS pixels on paper and ink.
- `og.png` — actual served PNG bytes, not a screenshot.
- `compose-topbar.png`, `studio-topbar.png` — final direct-route follow-up; `studio-attempt-failure.png` retains the same visible Studio at the failed artwork-class assertion.

These captures and the brand review sheet were opened and visually inspected. Checks are limited to the observed pages/assets; they do not establish humor, general usability, real AI behavior, or physical-phone behavior.

## Narrow Studio follow-up — unsuccessful

A Terra/high follow-up used local headless Playwright and system Chromium at 1440×900 and submitted one fresh disposable account registration. The browser reached a `/home` URL, but the automation then timed out after 30 seconds waiting for an exact-name **button** `New strip`. The script closed the browser in its error cleanup before the page could be inspected. This locator failure does not establish that Library failed to render or that the control was absent; it may not be a button. No further account, recovery, or existing-account sign-in was attempted.

No compose or Studio screenshot was captured or inspected in this follow-up. The earlier compose/Studio logo and saved-record gap therefore **remained open at this point**; the Studio image source, alt text, decoding, visual mark and horizontal overflow were not checked. No provider connection or AI request was made, and no app code, build or service was changed. The failure is in test execution, not an observed product defect.

## Final bounded follow-up — Studio captured, selector limitation

Local production, headless system Chromium at 1440×900. One new disposable account was registered and logged in via the ordinary framework transport, with credentials held only in memory. Direct navigation to `/home?new=1` rendered compose; the actual **Open illustrative Undo strip** button created the prepared example and navigated to its saved Studio. No provider or AI request was made.

- `compose-topbar.png` was captured and visually inspected. The DOM reports `img[src="/logo.svg"]`, alt `Strip`, successfully decoded at 300×113 natural pixels, displayed approximately 85×32 CSS pixels. Document and body scroll widths were both 1440px, equal to the viewport.
- The Studio top bar and four-panel illustrative Undo artwork rendered. An incorrect `.studio .comic-svg` locator timed out after 45 seconds despite the visible artwork; the still-open page's actual text and screenshot were captured and inspected before browser cleanup. `studio-attempt-failure.png` preserves this diagnostic; the identical inspected capture is also saved as `studio-topbar.png`. The screenshot visibly shows the upright integrated S wordmark with red period and no apparent horizontal overflow at this viewport. The rendered artwork, not the failed class selector, establishes that the comic is present.
- Studio's image source and alt are confirmed **in source** (`app/routes/home.tsx`), not independently measured in the rendered DOM in this run. The visible Studio wordmark is not broken, but Studio-specific `decode()` and document scroll-width measurements were skipped when the selector timed out. Thus the screenshot gap is closed; those automated Studio checks remain unverified. This timeout is a test-selector failure, not evidence of a product failure.

Both captures were opened and visually inspected while the browser remained open; it was then closed. No existing account, account recovery, app edit, build or service restart was used. This is desktop viewport evidence, not proof of usability, physical-phone behavior or real AI generation.

# M1 browser verification — follow-up

Local headless Playwright Chromium against the existing Docker app, 1440×900 and 390×844 emulated viewports. One new disposable account and its own illustrative/seeded Undo strip; no provider connection, AI request, app change, build, restart, deployment, or other account. No JavaScript page errors observed. Phone emulation is not a physical phone.

## Follow-up results

- **PASS:** selected balloon 1, directly edited its line, protected it, reloaded and observed the edited line and Unprotect control; unprotected it, reloaded and observed Protect again. This confirms UI state persistence, not independent enforcement against an agent write.
- **PASS:** chose the second ending and after reload its button retained `aria-pressed=true`.
- **PASS:** the desktop balloon Ask popover was fully settled (computed opacity 1) with exactly one visible portal. `selection-ask-desktop.png` replaces the earlier animation-frame capture.
- **PASS:** at 390px selected panel 2 from the overview with no overlay obscuring it. Focus view shows an enlarged panel and Edit / Agent / Script underneath, as in `phone-focused-panel.png`.
- **PASS, qualified:** phone ending options measured 260px each, the horizontal container scrolled from 0 to 442px, and document and viewport widths were both 390px. The inspected `endings-phone.png` shows a clean isolated panel crop without neighbouring panel slices, and a readable first thumbnail at viewport scale; real-phone readability needs human judgment. Desktop thumbnails each contained a clipPath and measured roughly 175–177 × 156–157px, but see screenshot limitation below.
- **PASS, scripted review state only:** one real HTTP `update-strip` action, called directly from the authenticated browser session on the unprotected own item, returned 200. After reload the edited balloon appeared blue, desk Agent changes showed 1, and Ink / Erase buttons appeared (`review-desktop.png`). This was a **scripted action**, not an AI/model run; Ink and Erase were observed but not clicked in this follow-up.
- `library-phone.png` shows the user's own illustrative strip; `studio-phone.png` shows the overview without an agent overlay. The phone Library also had document width 390px.

## Incomplete evidence / test errors

- **Phone balloon Ask remains unverified:** after selecting panel 2, the test tried clicking the panel-1 balloon while panel 2 was focused. The element existed in the cropped SVG but was outside the visible crop, so the click timed out. It should first use Focus panel 1, then click the balloon and open Ask. No `selection-ask-phone.png` was created; there is no evidence here that phone Ask or single-portal behavior works. The test continued through remaining checks, but then inadvertently closed its disposable session without recovering this check. No further account was created.
- **Desktop ending crop screenshot incomplete:** `endings-desktop.png` was captured after scrolling only the heading into view; the thumbnails are below the viewport and cannot be visually inspected in this image. The clipPath measurement is structural, not a visual verification of all desktop thumbnails. Phone crop is visually verified as above.
- Phone overlay was already closed on entry in this fresh session, so closing an open overlay using its close button was not exercised. No fake pencil-working screenshot was made. Real agent generation, agent protection enforcement, Ink/Erase actions and real-phone usability remain unverified in this follow-up.

## Inspected follow-up images

`docs/evidence/m1/studio-desktop.png`, `selection-ask-desktop.png`, `endings-desktop.png` (incomplete tray), `phone-focused-panel.png`, `endings-phone.png`, `library-phone.png`, `review-desktop.png`, `studio-phone.png`. The requested phone Ask image does not exist.

---

# M1 browser verification — prior partial run

Local headless Chromium against the already-running localhost:8080, one newly signed-up disposable account and its own **illustrative / seeded** Undo strip. Viewports 1440×900 and 390×844; viewport emulation is not a physical phone. No AI connection or generation; no build, restart, app changes or deployment. No in-flight pencil screenshot: no real agent run occurred.

## Observed

- Signup continued to `/home?new=1`; after authentication, the landing Make a strip CTA also reached `/home?new=1`. Library and Studio New strip links each reached that URL.
- Compose accepted both names and traits. Pencil it emitted the actual `agentNative.submitChat` handoff with `submit:false`, `openSidebar:true`, source, and both name/trait pairs under stable `ari`/`sam` IDs. This verifies prefill, not model output or saved generated cast.
- Open illustrative Undo strip created a labeled illustrative / seeded Studio record. At 1440×900 the comic canvas measured **720×720 CSS px**, above the 640px height target. The real desk displayed Agent changes 0 and the empty-state copy.
- Panel 1 Ask agent opened inline quick chips and free text. Clicking Funnier filled the input; entering a custom note and sending emitted `submit:false`, `openSidebar:true`, with selectedId and panelId `panel-1`, strip ID and `expectedRevision:0`. This is a composer handoff only.
- Selected the second ending; after reload the Library thumbnail showed “Great. Can it restore my weekend?” and Rev 1. The ending-tray screenshot itself is from before the click.
- At 390px document width equaled viewport width (390px) on compose and Studio in the observed states. No JavaScript page errors recorded.

## Issues and limits

- The phone Studio capture shows the framework agent overlay still open after the prior handoff; it obscures most of the comic and controls until closed. This is consistent with the earlier reported overlay behavior, not a test of focused-panel layout.
- Phone focus automation looked for `Focus panel 2` before selecting a panel and found no visible button; it timed out. The test did not close the agent overlay or perform the intended panel-selection interaction first, so this is a **test failure, not evidence that panel focus is broken**. The browser session was then closed without retaining its disposable credentials/session; under the one-account constraint the remaining checks were not rerun.
- Consequently **direct edit/protect/reload, phone focused panel with Edit/Agent/Script, phone endings scrolling, phone Library and phone selection/Ask screenshots remain unverified in this run**. Ending reload is supported by the changed Library thumbnail, but selected-state accessibility was not separately asserted. Prior design-probe evidence is not evidence for this current build.
- `selection-ask-desktop.png` was captured immediately after opening and caught the popover's entry animation, so it looks transparent; do not treat that image alone as its settled appearance. The selection handoff and chip were exercised after opening.
- The desktop ending thumbnails and phone comic under the overlay appear small; readability/usability requires human review. No claim about actual model behavior, humour, protection enforcement or real-phone usability.

## Screenshots inspected

`compose-desktop.png`, `compose-phone.png`, `studio-desktop.png`, `selection-ask-desktop.png`, `endings-desktop.png`, `library-desktop.png`, `studio-phone.png`. All are viewport captures. The latter shows the open agent overlay, not the requested focused-panel view.

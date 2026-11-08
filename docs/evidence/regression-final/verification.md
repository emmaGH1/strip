# Public judge-path regression attempt — 2026-11-08

**INCOMPLETE.** Public URL `https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech`; Chromium with 1440×900 desktop and 390×844 touch-enabled viewport emulation, not a physical phone. No server restart, provider connection, AI submission or code change. Screenshots were captured after each attempted interaction, before any subsequent checks. One fresh disposable account was created; no other account was accessed.

## Results

1. **Landing: partial pass.** Desktop and phone landing rendered; screenshots `01`–`08`. Clicked and tapped the prepared Pencil, Stamp MINE and Revise around it controls; rendered text reflected the corresponding prepared states. The page explicitly calls the example prepared and says no AI request. Desktop DOM contained an icon link to `/favicon.ico`, absolute `og:image` pointing to `/og.png`, zero broken image elements and document width 1440 at viewport 1440. Header and footer are visible in the full-page screenshots. These observations do not establish actual favicon pixels or OG image retrieval, phone document width, or keyboard focus visibility.
2. **Signup / Library: pass.** Screenshots `21`, `22-signup-form`, `23-signup-library`. A disposable signup reached `/home` and its illustrative, not-generated example. No credentials were retained in evidence.
3. **Studio: not tested.** Compose opened (`24-compose`). The test incorrectly searched the prepared strip button for “example”; its actual accessible name is “Open illustrative Undo strip” (`25-example-studio-failed`). This is an automation selector failure, not evidence that the button is broken. The ephemeral browser was closed before the selector could be corrected; account credentials/session were not retained. To respect the one-account limit, the run was stopped rather than creating a second account. Edit/persist, MINE, endings, export/download/open/copy and history/restore are all unverified.
4. **New strip: partial.** Compose and its honest “No AI connected yet” state rendered (`24-compose`); source/cast entry, Pencil it and human-readable composer prefill were not tested. Nothing was submitted.
5. **Phone Studio: not tested**, blocked by the lost session above.
6. **Partial diagnostics.** No page errors observed in either bounded run. Four console resource errors with HTTP 401 appeared in the signed-out landing run; URLs and causes were not retained, so impact is unknown. The signup/compose run had no recorded console errors. Desktop landing had no measured document overflow or broken `img` elements. Other screens, phone overflow, image health and focus visibility were not measured.

## Findings ranked for demo

- **P1 — verification gap, not a confirmed product defect:** most of the judge path remains unverified in this run. Re-run with a retained session and the exact prepared-strip accessible name.
- **P2 — unclassified console 401s:** four observed while signed out; identify request URLs and impact before judging severity.

Automation failures: initial attempt incorrectly used a tab role for the auth control (`22-signup-form-failed`); after correction, signup succeeded. A separate prior form-submit locator ambiguity was corrected before account creation. The first navigation's `networkidle` timed out; the successful attempt used DOM content loaded. No app defect is inferred from these automation failures. No screenshot containing filled credentials is retained.

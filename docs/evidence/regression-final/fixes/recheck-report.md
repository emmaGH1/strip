# Signed-out landing recheck

Local headless Playwright with `/usr/bin/chromium`, public HTTPS root, fresh independent signed-out contexts: desktop 1440×900 and touch/mobile-emulated 390×844. Observed for 10 seconds after load. Browser and both contexts closed. No account created or used, no provider or model request. The first script attempts failed before launching a browser because the package import and bundled Chromium path were unavailable; corrected to `@playwright/test` and system Chromium before this run.

## Result

**PASS, bounded to these signed-out landing loads:** both returned HTTP 200, remained on `/`, and had no request to `/_agent-native/agent-engine/status`, no protected API request, no 401 or other HTTP error, no incomplete request and no captured request/page error. Explicit assertions checked the status path, 401/error statuses and all `/_agent-native/` paths against the public endpoint list below. The two contexts each recorded 269 requests. Exact paths, methods, resource types and statuses for _all_ requests are retained in `recheck-results.json`; query strings and bodies were not recorded.

All observed framework endpoints in **each** context (all 200):

- `GET /_agent-native/speculation-rules.json`
- `GET /_agent-native/auth/session` (twice)
- `POST /_agent-native/auth/attribution`
- `GET /_agent-native/auth/consent-region`
- `GET /_agent-native/ping`

These are public framework endpoints, not evidence of a protected call. Static asset filenames containing `auth` or `session` are assets, not API calls. Other requests were the landing document, static `/assets/`, `/peeps/`, logo and favicon; see the JSON for exact individual paths.

Inspected full-page screenshots `recheck-desktop.png` and `recheck-phone.png`: both render the landing, illustrative comic and lower sections. Document scroll widths were respectively 1440 and 390 pixels, equal to viewport width. Phone emulation does not establish physical-device usability or readability.

**Still unverified:** the authenticated P2 stale-context-chip fix and selection-change behavior were not rechecked; the sole disposable session was destroyed and no additional account or existing account was used. The original failure evidence and `verification.md` remain unchanged. No claim is made about authenticated real readiness or an AI turn. The noncredential script is `scripts/qa/signed-out-recheck.mjs`.

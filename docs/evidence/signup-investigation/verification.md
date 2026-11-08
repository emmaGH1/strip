# Signup investigation — 2026-11-08 22:29–22:34 UTC

## Result: original failure not reproduced; cause unresolved

Reviewed `docs/evidence/claude-code-mcp/verification.md`, the current auth plugin and commit `ebb9dca`. That plugin change only removes `/landing-a`, `/landing-b`, `/landing-c` from the public-path list; it does not add a signup hook or change credentials, origins or database settings.

`docker logs --timestamps --since 2026-11-08T19:20:00Z --until 2026-11-08T20:10:00Z strip-app` returned no entries. Broader inspection found no auth/signup/database/rate-limit error associated with the reported incident. Absence of a logged error does not establish successful signup: framework validation and handled failures need not log.

## HTTP reproduction and verification

Used Python standard-library HTTP clients (equivalent to curl), process-memory random passwords, unique `fix-check+<nanoseconds>@example.com` addresses, and no human account. No credentials retained or printed.

- Local `POST /_agent-native/auth/register`: 200 `{"ok":true}`.
- Public HTTPS `POST /_agent-native/auth/register`: 200 `{"ok":true}`.
- Two further consecutive public signups: both registration 200, login 200, session email matched each disposable account, authenticated `GET /home` 200 without sign-in redirect.
- Fresh cookie jar signing in again to the first of those two now-existing accounts: login 200, `GET /home` 200 without sign-in redirect.
- Accounts remain; no deletions or other users' records accessed.

**Limit:** `/home` HTML does not contain the Library text (client-rendered app). These HTTP checks prove authenticated route access, not rendered Library landing or automatic UI navigation. No Playwright/browser check was performed by this Sol implementation lane; project policy reserves browser verification for Terra/high. A follow-up authorized browser lane must verify the actual signup form, Library render and existing-account sign-in. The earlier failing run retained neither its request/response nor a reusable account session, so its specific cause cannot be reconstructed from this evidence.

## Why no speculative auth change

Installed Agent-Native 0.226.0 uses `auth.api.signUpEmail` in the register endpoint; its own source explicitly notes direct API calls skip Better Auth's IP rate limiter. The `rateLimit: { window: 60, max: 5 }` configuration in `better-auth-instance.js` belongs to magic-link issuance, not this password-register path. Successful fresh example.com registrations disprove an unconditional ban on that domain in the current service. No evidence supports disabling limits, changing origin trust, changing database state or patching the auth hook. Auth and protection remain unchanged. The historical bug is **not declared fixed**.

## Checks and service

56 tests pass; typecheck, Agent-Native doctor (clean), production build and changed-document oxfmt pass. Existing bundler warnings remain. Existing `strip-app` restarted after the successful build. No secrets printed, provider calls, push, new deployment or submission.

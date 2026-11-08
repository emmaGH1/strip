# Current state — 2026-11-08 · design-probe implementation; browser verification blocked

## Design probe — landing + Studio (build/app)

- Replaced the proof-facing landing and workspace with DESIGN.md v1's paper/ink direction: Bricolage Grotesque UI/display, Comic Neue lettering only, palette tokens, hard print shadows and red MINE stamps. Removed DM Sans/Bangers dependencies/imports; added the bundled Bricolage OFL and updated ASSETS.md. The user's staged README.md and assets/icon.svg remain untouched.
- Public `/` is now the poster: one framework sign-in CTA, a real shared-renderer illustrative comic with a blue-pencil panel and MINE balloon, and the one-row loop. Root auth interception is disabled while `/` remains explicitly public; authenticated domain actions and `/home` retain framework auth. Auth continuation is configured to `/home`, but is not browser-verified on this build.
- Studio has an editable title, PNG export and caption copy, Script/facts/cast rail, direct SVG panel/balloon/character selection, contextual Edit/Face/Pose/Protect/Ask-agent controls, inline balloon editor and actual panel-4 ending thumbnails. Phone layout has Edit/Agent/Script tabs in a lower sheet-like panel. Agent and free-text handoffs use the existing real AgentSidebar/composer, not another chat runtime. Free text opens the framework composer rather than a duplicate prompt box.
- New server-derived durable `pencils` metadata captures the exact prior field value of real agent edits, including legacy absent poses. Ink accepts and Erase restores through `update-strip`, with the same expected revision, owner scope, trusted caller and atomic compare-and-swap. Repeated agent proposals preserve the original prior value; direct human edits accept only their field. Agent no-ops do not acquire pencil attribution. New agent-created draft items are blue and can be inked, but Erase is disabled because there is no prior value to restore. Historical records without per-object metadata are not retroactively assigned fictional provenance.
- Working halftone/dashes are tied to the framework's actual working-thread state and correlated submission target; merely opening the composer or lacking a provider does not show a working state. No live provider/model turn was attempted. This correlation and initial-draft display are unit/typechecked, not end-to-end verified.
- Known design gaps: the compact pending-change log currently follows the artboard rather than being inserted inside the framework-owned right desk; the phone lower panel is an in-flow sheet-like surface, not a draggable modal sheet. Library remains out of scope; the wordmark link returns to the new-strip entry. No claim of final visual quality, usability, humour or phone readability is made without rendered review.
- Checks: `pnpm test` **34 passing**, `pnpm typecheck`, changed-file oxfmt, `pnpm agent-native:doctor` clean and `pnpm build` passed. No standalone lint script exists; build retains inherited vendor/chunk warnings. These checks do not substitute for a browser smoke.
- **Verification blocker:** at 16:46 UTC, port 8080 had no listener, and both `/tmp/claude-1000/strip/run-prod.sh` and its Node child were absent. The narrow Terra/high browser delegate independently confirmed local HTTP failure. The task only permits restarting the existing Node child, so no supervisor/new server was started. No account was created/accessed, and no provider connected. The new build is not running. **No redesign screenshots or export PNG exist yet.** Evidence/blocker details: `docs/evidence/design-probe/VERIFICATION_BLOCKED.md`. Restore the existing service, then capture/inspect landing and Studio at 1440×900 and 390×844 plus the actual PNG before Opus's design gate. Earlier proof screenshots do not verify this design.

---

# Prior state — approved fixes complete; Builder.io connection gate

## Bounded mobile usability pass — 2026-11-08

- The existing workspace already stacked below 800px, but at a 980px desktop-site-like viewport the app shell left only 257px for the comic alongside the inspector. A container-width breakpoint now stacks controls when the actual workspace is narrow: on the public built app the same viewport gave a 529px comic. This is evidence of a possible squeeze, not proof of the human screenshot's cause or browser mode. At 390/412 CSS pixels the workspace stacks comic before controls. Desktop 1440px before the final small control adjustment remained two columns. Viewport resizing is not a physical Android or touch-device test.
- Inspector identifies panel and selected line/character, distinguishes inherited panel protection and separately protected items, offers character selection before character controls, and hides unrelated controls while editing a line. Buttons for panel/line/save have 44px minimums. Real action and agent handoff paths are unchanged. The prepared example is labeled separate from a new result; changing example tabs no longer overwrites the source entry. Laptop label is plain language. Readiness remains framework-derived.
- The authenticated app document now allows zoom: `width=device-width, initial-scale=1, interactive-widget=resizes-content`. The separate framework-owned public sign-in document still reports `maximum-scale=1, user-scalable=no`; this pass did not replace that auth surface. No claim that auth-page zoom is fixed.
- Public HTTPS originally returned 502: no listener or supervisor was running. Restarted the existing detached `/tmp/claude-1000/strip/run-prod.sh` on the same approved port using its private environment. Rebuilt, then restarted its child under the same supervisor; public authenticated app returned the new bundle. During the restart transient 502s occurred. No new infrastructure, database reset, provider or model request. One new disposable account was necessary because no reusable test session was available; its random password was generated privately and not recorded. Existing accounts and records were not accessed.
- Public browser at 412px: opened and saved a prepared example, protected panel 1, selected its line, edited/saved and reloaded; the line and inherited protection persisted. A real framework agent composer opened with selection-aware prefill and Connect AI, without submitting. At 390px final bundle showed the same persisted state and handoff; no document horizontal overflow measured. 980px final bundle stacked; 1440px earlier build had two columns. Preview resizing does not emulate a mobile user agent or actual touch. An automation click timed out after opening the composer; inspection confirmed the handoff had occurred. Evidence: `docs/evidence/mobile/editor-390.png` (disposable content only).
- Checks after final edits: `pnpm test` 27 passed, `pnpm typecheck`, changed-file formatter check, `pnpm agent-native:doctor` clean, `pnpm build` passed with existing vendor/bundler warnings. No separate lint script. No real generated result or physical phone validation; readability and human usability remain review gates. User can reload the existing public link, open a saved comic or an explicitly prepared example, select a panel/line, then edit, protect or open the agent. Connecting and submitting remains a separate user decision.

## Authenticated public loading follow-up — 2026-11-08 12:24 UTC

The earlier unauthenticated check missed the critical path. With one clearly identified disposable local account, ordinary password signup on the public HTTPS host succeeded and redirected to `/home`; no email delivery was required. The authenticated session endpoint returned 200 with an org, and `/org/me` returned 200 with matching session identity and org. On first cold load, `/home` showed the loading skeleton, while Vite loaded hundreds of separate `lucide-react` icon modules: the navigation began around 12:20:01 and the home UI appeared around 12:20:39. The server recorded a 12.6-second first `/home` response with 2 ms measured DB time. The skeleton eventually resolved in this test; this establishes a severe development-mode loading bottleneck, **not** that the human's apparently indefinite loading had exactly the same cause. No relevant session, org, lazy route import or proxy failure was observed. A pre-existing “No available adapters” warning appeared; its significance remains unknown.

`vite.config.ts` now explicitly includes `lucide-react` in Vite dependency optimization. The installed framework's AgentKit Vite configuration defaults to `noDiscovery: true`; without an explicit include, the app's icon barrel caused individual icon requests before hydration. After the change, an authenticated public desktop `/home` loaded the actual Strip home with one optimized lucide dependency and zero individual icon requests (13.3 seconds load on a cold restarted dev server). At a 412×915 Pixel 7-sized viewport, authenticated public root redirected to `/home` and showed the actual home (9.8 seconds load, zero individual icon requests); this is viewport emulation, not Android Chrome. These timings are observations, not guaranteed performance targets. The same disposable session was used; no provider/model calls were made. Existing-account recovery has not been tested against the human's account.

At investigation start, the public port remained published but no process was listening and the proxy returned 502. The previously running dev server had stopped for an unknown reason. The approved port 8080 dev server was started; Vite's automatic config restart then aborted because PGlite cleanup did not acknowledge, so the investigation's own process was stopped gracefully and restarted on the same port. No database reset, auth bypass, dependency change or production deployment occurred. Checks: `pnpm test` 27 passed; typecheck, doctor, changed-file formatter and production build passed (build retains existing warnings). The dev server remains a public development service, not a production deployment. User may retry their existing public link; authenticated root-to-home and `/home` reload were verified with the disposable account only. Do not create another account or clear site data as a first step; if loading persists, report the time and exact screen without sharing credentials.

## Public loading investigation — 2026-11-08 12:16 UTC

The reported indefinite Android Chrome skeleton was **not reproduced**; its root cause remains unknown and no app/config fix is claimed. The existing Vite process (started 11:24 UTC) still listens on port 8080, and `instabox-port list` reports the approved public publication. It was not restarted; no database, authentication, dependencies or credentials were changed.

A fresh incognito preview browser reached the actual public HTTPS URL at desktop 1280×800 and a Pixel 7-sized 412×915 viewport. Both displayed the framework Welcome/create-account form, with session requests returning 200 and Vite reporting connected. The pixel preset changes viewport size only: this was **not actual Android Chrome** and did not use the user's existing session or network. Direct `/sign-in` displayed Welcome; unauthenticated `/home` eventually redirected to `/sign-in` and displayed Welcome back. One console 401 appeared during the `/home` attempt; no failing request URL was retained in the bounded network output, so its exact source is unconfirmed. The browser also logged “No available adapters.” on the initial visit, of unknown impact. The server log contains a prior 12:07 hydration attribute mismatch on the auth password input involving `aria-autocomplete`; its origin and relationship to the reported skeleton are unconfirmed, and it was not observed in the fresh check. No account was created or signed in; authenticated loading and actual phone conditions remain unverified.

Next: retry the public root link in a **new Android Chrome incognito tab** without clearing site data or records; if it still hangs, note the time, exact URL and whether it happens before or after signing in, plus Chrome version/network. Do not share passwords or tokens. If incognito works but the existing tab does not, that narrows the issue to browser/session-specific conditions but does not establish the cause. The human may use the existing Sign in control; Builder.io/provider authorization and model calls remain separate approval gates.

## Latest approval and public access

The user approved publishing existing dev port 8080 for phone access and Builder.io connection. Published URL: https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech . This is a public development link, not approval for a production deployment, paid API usage or submission. Remove it with `instabox-port unpublish 8080` when no longer needed.

A narrowly scoped GPT-6.1 Terra / high browser check loaded the link in incognito: unauthenticated visitors see **Welcome / Create an account to get started**, with Create account and Sign in controls, not the Strip editor. This verifies the visible login gate only, not all-route security. The browser reported a “No available adapters.” warning with unknown impact. No account, provider connection or model call was created; the inspection tab was closed.

User preference: **always use Terra 6.1 high for computer/browser work**; recorded in AGENTS.md. Next human step: sign in/create an account on the public link, open Agent / Connect AI / Use Builder.io, and review the account/credit terms. Free credits are advertised, but actual limits, card requirements and billing behavior are not verified. No paid fallback or upgrade authorized.

The older no-deployment wording below is historical; only the narrow public-port approval above supersedes it.

## Lane a — `proof/strip`

Single implementation lane. The human requested these seven bounded follow-up fixes and specified the **14:00 UTC proof go/no-go** in this task (superseding the earlier timing notes). Stopping here for review; no broader design rollout, paid calls, logo, deployment or submission is authorized.

## Saved before work

Existing proof scaffold, actions, research, licenses and evidence saved in commit `0cddfb6`. The user's pre-staged `README.md` and `assets/icon.svg` were excluded and remain staged exactly as supplied. No `.env` files, credentials, `data/`, PGlite database, dependencies or build output committed. `.env.example` remains untracked, not included in either task commit. No push/merge/deployment.

## Approved changes implemented

1. The prepared Undo comic visibly shows **File deleted → Undo → Restored ✓**, including a cursor at the Undo button in panel 3. The product change no longer depends on the title or a caption. `panel.screenState` is structured and editable; supported laptop UI states are none/files/deleted/undo/restored/search-results/scheduled. These are safe illustrated scene props, not simulated AI or an actual product integration.
2. Independent expression/pose fields; 50 local Open Peeps combinations. Pointing, alarmed open-hand, relaxed and crossed-arm bodies now differ visibly, with a wider crop that includes hands. New compositions require explicit poses and reject three identical consecutive bodies. Historical records retain their original assets/missing-pose representation rather than being silently rewritten, including protected work.
3. Smaller rounded balloons, centered lettering and tails directed toward speaker heads. The 12-word/2-balloon schema bounds remain. Overflow still uses actual font measurements and blocks PNG export.
4. Balloon text alone uses bundled **Comic Neue Bold** (`@fontsource/comic-neue@5.3.0`, OFL); license: `public/licenses/Comic-Neue-OFL.txt`. DM Sans remains the app/product UI font; Bangers remains the title font. See `docs/ASSETS.md`.
5. Sam appears in panel 1 before speaking in panel 4. New compositions validate early introduction of payoff speakers.
6. Captions are empty/off in the examples. Removed explanatory PHEW lettering. Original ending restored: **“Now add Undo to ‘Sure, Friday works.’”** Examples remain explicitly prepared/illustrative.
7. The existing real Agent-Native `AgentSidebar` opens beside the editor on desktop. The Agent button opens the same surface on phone or reopens it after collapse. No duplicate controller, fake chat, custom credential UI or provider SDK added.

## Real-agent wiring / honest blocker

- Draft and Revise this selection use framework `sendToAgentChat`, `openSidebar: true`, and the existing product-agent runtime. Composing uses `create-strip`; revision uses the same `update-strip` action as direct edits.
- Revision passes strip/object/panel ids and the observed expected revision as bounded context. The agent must re-read with `get-strip`, respect the selected target and use the current `expectedRevision`. Tool descriptions and the product system prompt describe poses, feature moments, early cast introduction and no explanatory captions.
- The framework's authoritative `useAgentEngineConfigured` controls submission. Without readiness, the request only prefills the actual composer (`submit: false`); the app explicitly says **Connect an AI engine**, links to Model settings, and the sidebar shows the framework's **Connect AI / Use Builder.io / Custom keys** flow. A ready connection enables real submission; this branch has **not** been exercised with a model.
- The existing allowlisted runtime still excludes generic SQL/code/unlock tools. Caller identity remains trusted framework context, never client actor/force fields. New pose/screen edits use the same protection, revision and atomic persistence path.

### Exactly what the human must do to connect

**Preferred Builder.io flow:**

1. Open a prepared comic; use the right-hand agent rail, or tap **Agent** on phone.
2. In **Connect AI**, click **Use Builder.io**. Alternatively, **Open AI setup →** goes to `/settings/model` (Settings → Agent → Model), where the same **Use Builder.io** button appears.
3. Complete the framework's Builder.io sign-in/connection and approve the intended personal/workspace connection. Do not assume the advertised free tier authorizes spending; approve a bounded test-call budget first.
4. Once connected, choose an available model in the chat model picker (or the Model page's Default model). Review the prefilled draft/revision request and send it. No environment variable or app code change is required for this path.

**Anthropic alternative:** Open **Open AI setup →**, then **Add provider**; select **Anthropic** in the Provider selector. Enter the key only in the framework's secure **API key** field, choose the available Models and intended **Who can use it** scope (Personal/Organization), then **Add provider**. Select the connected model. The sidebar's **Custom keys** is the alternative entry to shared provider setup. Never paste a key into chat, `.env`, docs or source; the implementation agent has not requested or entered one.

No connection button was activated to authorize a provider. We inspected the local Model/Add provider setup surfaces without entering a key. Provider callback success, credential validation and actual model/tool turns remain untested.

## Verification and evidence

- `pnpm test`: **27 passing** tests (scene/continuity validation, compatibility, shared rendering, locks/revisions/trusted caller/scoped store). Mocked store unit tests are not represented as database integration.
- `pnpm typecheck`: pass.
- Changed-task-file `pnpm exec oxfmt --check …`: pass. **Whole-repository `pnpm exec oxfmt --check` reports inherited formatting issues** in untouched framework skills, research/governance/config files; see `docs/evidence/proof/format-baseline.txt`. These were not reformatted to avoid unrelated churn/preserved research. No standalone lint script exists; no separate lint pass claimed.
- `pnpm agent-native:doctor`: clean, no findings.
- `pnpm build`: pass (Nitro node production bundle). Existing vendor source-map/chunk-size warnings remain. Build is not a production runtime/deployment test.
- `pnpm test:proof`: pass in local Chromium, normal local-dev sign-in, no JS page errors and no phone horizontal overflow. Real DB/action smoke covers persisted edits/locks, protected balloon/pose/screen rejection, human editing of a protected panel, human-only unlock, stale rejection and concurrent compare-and-swap (one success/one conflict).
- Browser smoke also captures the **actual framework handoffs** for draft and selection-aware revision without a provider: composer prefill, open sidebar, no submission. This is NOT a real model turn.
- Both clean prepared and protected-edited PNGs downloaded; the edited PNG reopened/decoded at **1200 × 1200**. Clean export displayed at phone width. Rendered artifacts opened and visually inspected by the implementation agent: the feature state, distinct hands/bodies, early cast, rounded balloons, original punchline and genuine desktop/phone setup surface are visible. Human phone readability/comprehension/humour acceptance remains pending.

### Artifacts (`docs/evidence/proof/`)

- `entry-desktop.png`, `workspace-desktop.png`, `workspace-phone.png`
- `strip-comic.png` — clean prepared illustrative example, original ending
- `protected-strip-comic.png`, `protected-workspace.png` — persisted protected human contribution, original ending selected after the concurrency test
- `draft-agent-setup.png`, `phone-agent-setup.png` — real framework setup/prefill, not a conversation with an AI
- `export-phone.png` — actual clean exported PNG displayed at phone width
- `http-boundary.json`, `smoke-result.json`, `verification.txt`, `format-baseline.txt`

Local server: `127.0.0.1:8080`; `pnpm test:proof` writes to `/tmp/strip-proof/` and creates fresh local prepared records. Do not commit the database. Screenshots capture the current viewport; the app uses inner scrolling, so a “fullPage” screenshot does not prove every inspector control fits above the fold.

## Stop / remaining gates

**No real LLM generation or model-driven revision has run.** All stories remain hand-authored fixtures; scripted HTTP action calls do not count as agent creativity or instruction-following. Connect/authorize a provider and bounded calls, then run three genuinely fresh ordinary drafts, a real selection-aware revision around protected human work, and unfamiliar-reader understanding/unprompted-smile checks. Review the art and phone export with the human. The full proof is not declared passed. No new features, push, deploy or submission started.

## Phone access fix (2026-11-08, Claude)

- Cause (likely): the public link at port 8080 was serving the Vite **dev** server. Dev mode sends hundreds of unbundled modules over the tunnel, which stalls on a phone after sign-in.
- Change: port 8080 now serves the **production build** (`pnpm start`, NODE_ENV=production). Production refuses PGlite, so a private local Postgres runs in Docker:
  - container `strip-pg`, volume `strip-pg-data`, bound to 127.0.0.1:55432 only;
  - migrated with `pnpm migrate:production`.
- `.env` (gitignored, mode 600) holds DATABASE_URL and BETTER_AUTH_SECRET. Never commit or print it.
- Accounts created on the old dev/PGlite database do not exist in Postgres. The user must create a new Strip account.
- Logs: /tmp/claude-1000/strip-prod.log. To go back to dev: stop the prod server, then run `pnpm dev`; dev uses PGlite unless DATABASE_URL is overridden.
- Not yet verified on a real Android phone.
- 13:50 UTC: the Builder.io connect step redirected the phone to `127.0.0.1:8080` because the server didn't know its public address. Set `APP_URL` and `BETTER_AUTH_URL` in `.env` to the instabox public URL and restarted the production server. Not yet re-verified on the phone.

## Production go-live test — 2026-11-08 14:30 UTC

Local headless Chromium, a newly registered disposable account and the existing production server/Postgres were used; no human account or credentials were accessed. The fresh account displayed **Connect AI / Use Builder.io**, so the human's connection is not available globally to this account. This establishes that it is not app-wide for all accounts, but does not distinguish personal from organization-scoped connection. No provider connection or generation was attempted. Human must test the requested scheduled-message draft and selection-aware revision with a protected line using their connected account (at most three generation requests); preserve and compare the protected bytes. Real phone/network behaviour also remains to be checked by the human.

- PASS: Opened prepared Undo example, edited and saved a balloon, reloaded and confirmed persistence.
- PASS: Protected balloon rejected a scripted agent-attributed HTTP edit with 400 `protected_element`; non-frontend action transport derives agent identity in framework context, not an actor input. Agent unlock returned 403. Protected pose and screen edits also rejected. This was not a model turn.
- PASS: Two concurrent writes with the same expected revision returned one 200 and one 409; earlier stale write returned 409.
- PASS: Exported 1200×1200 PNG opened and visually compared with the corresponding canvas: scene layout, text, characters and feature states match; canvas selection highlighting is editor-only. At phone width the rendered comic is small; real-world legibility requires human review.
- PASS: 390×844 emulated mobile editor saved a line and retained it after reload, with no horizontal page overflow. Not a physical phone test.
- PASS: Removed stale unconditional connected-model claim under revision. Existing setup/readiness messaging remains.
- PASS: `pnpm test` (27), `pnpm typecheck`, changed-file formatter, `pnpm agent-native:doctor`, `pnpm build`. No standalone lint script. No JS page errors in the browser smoke. Build has existing vendor warnings.
- Production child was restarted after build under the existing supervisor. Graceful SIGTERM closed the listener but left the child alive, preventing restart; SIGKILL to that child allowed the supervisor to restart it, and local HTTP returned 200. No dev-mode switch.
- Evidence: `docs/evidence/golive/` includes canvas/screenshots, `protected-strip-comic.png`, `strip-comic.png`, phone export and save views, and `http-boundary.json`. The smoke's initial signup selector failed due to two matching buttons; corrected and reran successfully. The first phone run did not actually exercise save, so a subsequent run added and passed that check.

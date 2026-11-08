# Current state — 2026-11-08 · approved fixes complete; review gate

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

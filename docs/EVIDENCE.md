# Strip proof evidence — 2026-11-08

## Scope/status

Technical vertical slice implemented and exercised locally on `proof/strip`. **The full three-hour proof has NOT passed:** model generation, contextual model revision, creative quality and human design approval remain outstanding. All prepared stories are hand-authored illustrative fixtures.

## Automated checks

- `pnpm test`: 22 passing tests across scene validation/protection, trusted caller + scoped-store boundary, and shared SVG rendering. Store-boundary unit tests mock execution and inspect SQL predicates; they are not a claim of production database integration.
- `pnpm typecheck`: passing.
- Oxfmt run on 26 changed source/config files with the repository configuration.
- `pnpm agent-native:doctor`: clean, no findings.
- `pnpm build`: passing Nitro `node` production build. This is not a deployment or production-runtime smoke test.
- No standalone ESLint/Oxlint command is configured in the scaffold; do not report a separate lint pass.

## Real browser + database smoke

Run `pnpm test:proof` against the local dev server at `127.0.0.1:8080`. System Chromium, Playwright. Uses ordinary local-dev sign-in; no production login bypass. The script creates a fresh prepared-example record and leaves it in the local database.

Observed:
1. Prepared four-panel comic opens through the real `create-strip` action.
2. Direct human line edit persists through `update-strip`.
3. Human protection persists through `set-strip-protection` and reload.
4. A non-frontend HTTP call to `update-strip` receives `protected_element` for the protected balloon.
5. Non-frontend protection removal receives HTTP 403.
6. A stale-revision write receives HTTP 409.
7. Two real concurrent, unprotected HTTP action writes using one revision produce exactly one success and one HTTP 409; the database revision advances once.
8. The protected human line remains intact while one permitted edit succeeds.
9. PNG is created from the current scene, downloaded, reopened/decoded and checked as 1200 × 1200.
10. Rendered desktop and touch-enabled 390 × 844 phone viewport inspected; no page-level JS errors and no horizontal page overflow in the smoke.

**Important:** scripted non-frontend HTTP calls are classified as `agent` by the app's trusted-context policy. They are NOT a real model turn, generated joke, or demonstration that an LLM followed selection context. That remains a separate gate.

## Saved artifacts

`docs/evidence/proof/`:
- `entry-desktop.png`: actual provisional entry/workbench probe.
- `workspace-desktop.png`: actual saved editor.
- `workspace-phone.png`: actual phone viewport of editor.
- `strip-comic.png`: actual exported PNG after a human edit and scripted non-frontend action. It is not model-generated.
- `http-boundary.json`: observed statuses, revisions and resulting scene for scripted action tests.
- `smoke-result.json`: browser smoke summary.

Editor selection/protection highlights are intentionally absent from exported creative artwork. Rendering uses the same structured scene, locally embedded assets/fonts and measured dialogue layout. Overflow blocks export; exact pixel equivalence across arbitrary browsers has not been claimed/tested.

## Bugs found and fixed during this pass

- Save/refetch race: the next mutation could send an older revision before the query caught up. Mutation receipts now update the observed query cache, cancel stale refetches and retain newer revisions.
- Delayed navigation: a create action's navigation command could clear a later human selection. UI creation now navigates directly from its receipt; only agent creation emits the framework navigation command.
- Character continuity: clothing initially changed with expression. Static character assets now keep hair/clothing stable and change only the face.
- Agent safety: initial tool visibility is not a security boundary. Product chat now has a hard action allowlist plus minimal framework tools, excluding generic SQL/code/unlock escape hatches. Needs a real model-turn check after provider authorization.

## Remaining gates/risks

- No authorized LLM provider connection or paid-call budget. No real generated draft/revision exists yet.
- Three ordinary fresh drafts, unfamiliar-reader comprehension and unprompted-smile checks are outstanding; the three prepared fixtures do not count.
- Visual direction and artwork quality are provisional. Phone human readability/touch usability need human acceptance, not only viewport checks.
- Toolkit selection is registered and URL context supplied, but actual model targeting of that selection is untested.
- No public deployment, Clips recording or submission. No remote configured; branch is still unborn/uncommitted. Original user-staged README/icon remain untouched.
- Existing scaffold peer-dependency/source-map warnings remain; successful checks above do not erase them.

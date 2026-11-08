# Current state — 2026-11-08 · review gate

## lane a — proof/strip

Approved: THREE-HOUR Strip proof only, started 09:53 UTC; original hard stop 12:53 UTC. **Paused early for the visual/provider decision gate**, not claiming the proof is complete. No approved final design, paid API budget, deployment or submission.

## Implemented and tested locally

- Official Agent-Native 0.226.0 scaffold, React Router/React/TypeScript. User-staged README/icon preserved.
- Four-panel structured scene model, fixed fictional cast, local Open Peeps SVG assets and bundled fonts. Source statements and illustrative/fictional provenance visible.
- Scoped SQL persistence and version compare-and-swap. UI and product agent share validated actions; no ordinary duplicate CRUD routes.
- Direct balloon/expression edits, selection registered with toolkit, protected panels/objects, human-only protection changes, three ending choices.
- Shared SVG renderer and actual PNG export, with measured balloon overflow checks. PNG downloaded and reopened in browser; 1200 × 1200.
- Bounded provisional entry/workspace probes only. Desktop and touch-enabled phone viewport inspected.
- 22 tests passing; typecheck, formatter, framework doctor and production build passing. Real browser/database smoke includes non-frontend protected-write/unlock/stale-write rejection and a concurrent-write compare-and-swap race. See docs/EVIDENCE.md for exact limits and artifacts.

## Critical honesty boundary

**No real LLM generation or model-driven revision has run.** Three fixture stories are explicitly hand-authored illustrative examples. Scripted HTTP action calls are NOT model turns. No unfamiliar-reader or humour test. No validated public product. Do not say the full proof passed.

## Awaiting human decisions

1. Review/approve or adjust the provisional artwork/editor direction before wider UI propagation. Art remains a small, fixed-pose cast; creative quality is not proven.
2. Choose/authorize an LLM provider connection and a bounded test-call budget. Use the secure secret flow if a key is needed; never ask for secrets in chat or print them.
3. Then run three ordinary fresh drafts, actual selection-aware revision around a protected human line, and human comprehension/smile checks. Reassess Strip from that evidence; no automatic pivot or full-build approval.

## Workspace/run notes

- Local dev server: 127.0.0.1:8080, ordinary local-dev sign-in, no auth-disable override. Not publicly deployed.
- `pnpm test:proof` needs that server; uses system Chromium and creates a new local prepared-example record on every run. Scripts and evidence are committed to files, not Git history yet.
- Branch has no commit or remote. Existing README/icon remain user-staged; do not silently include them in an agent commit. No pushes/merges/deployments have occurred.
- Latest artifacts: docs/evidence/proof/. Licensing/provenance: docs/ASSETS.md and public/licenses/.
- Known scaffold warnings: dependency peer ranges and missing vendor source maps. Separate lint script not configured. See EVIDENCE.

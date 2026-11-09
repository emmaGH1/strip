# Strip — app build

Read docs/BUILD_PLAN.md, docs/DESIGN.md, docs/JUDGING.md and docs/CURRENT_STATE.md before work. The 3-hour proof (branch proof/strip) was a feasibility test: its UI is NOT the design. The engine (data model, shared actions, protection, compare-and-swap revisions, export) is reused. Every surface people see is rebuilt to docs/DESIGN.md. Build branch: build/app. One implementation lane at a time. Preserve existing research and user-staged files.

Operating mode (human, 2026-11-08): the human is often away and T3 notifications don't reach them. Lanes run autonomously to the end of their task and report; Claude Opus reviews and dispatches the next task. Human approval is still required for spending, public production deploys, submission, concept changes and irreversible actions.

## Scope and safety

- Four-panel structured comics; 2–3 fictional characters, direct balloon/expression edits, protected elements, contextual agent revision, three ending choices, PNG export.
- No multiplayer, comments, memory, generated images, social integrations, spending or submissions. Public production deployment is not approved; on 2026-11-08 the user approved publishing the existing dev port 8080 solely for phone access/Builder.io connection.
- No simulated generation or hidden fixed responses. Prepared samples MUST say illustrative/seeded. Real generation needs an approved provider connection; missing credentials are a blocker, never an excuse to fake AI.
- Protect every write path and reject stale revisions atomically. Agent caller identity must come from trusted framework context, never an `actor` or `force` input. Agent cannot unlock. Human may edit/unlock their own work.
- No credentials in git, logs, screenshots or docs. Use the secure secret tool if a key is needed.
- Source-linked feature claims are not automatically true. Separate source facts from fictional dialogue.

## Framework

Official standalone Chat scaffold, pinned Agent-Native 0.226.0; React Router/React/TypeScript/Tailwind, existing real shadcn primitives. Do not replace with a Next.js wrapper or fake the action layer. Read docs/FRAMEWORK_AGENT_GUIDE.md and linked .agents/skills before changing a framework surface. Actions are the sole normal domain read/write contract. Structured data in SQL. No ordinary CRUD API wrappers. Use version-matched installed docs/source.

## Ownership/gates

Builder: GPT-6.1 Sol (medium). Reviews and design ownership: Claude Opus (the human delegated UI/design direction). Browser/computer verification: GPT-6.1 Terra, high (max for hard tasks). docs/DESIGN.md v1 is the binding direction; a lane must not invent another visual system. The design probe (landing + studio) is reviewed by Opus before the system spreads to other screens. Existing assets/icon.svg is user-staged and not an approved Strip mark. No extra threads or delegates without need.

## Computer/browser model preference

User instruction (2026-11-08): always use GPT-6.1 Terra with high reasoning for computer/browser work. Route these tasks to `pi` / `openai/gpt-6.1-terra` with `thinking: high`; if unavailable, report the blocker rather than silently substituting another model. This specifically authorizes a narrowly scoped computer/browser delegate, not additional implementation lanes.

## Verification

Run domain tests, typecheck, formatter/lint, framework doctor and production build. Inspect real rendered UI with local Playwright/Chromium (do not use preview tools unasked). Never call tests/build proof of humour or usability. Save evidence and failures in docs/CURRENT_STATE.md. Commit only task files; do not push, merge or deploy. Stop at the end of the assigned task and report.

## Strip workflow / shared actions

- `/home` is the signed-in Library; `/home?new=1` is compose; `/home?id=<id>` is Studio. `navigate` supports `view: library` and `view: compose`, or an explicit Studio path. Keep the shell mounted across these views.
- `list-strips` reads only the caller's owner + workspace scope. `get-strip` reads a saved scene; `create-strip` saves a complete composition and navigates to Studio. Preserve the chosen angle's story-specific names/traits/archetypes in optional `draft.cast` under stable slot ids `ari` / `sam` / `kit` (1–3 characters). Older records retain original Ari/Sam assets and default names until explicitly recast.
- `update-strip` is the shared focused edit/review path (`expectedRevision` required); `set-strip-protection` remains human-only. Source coverage is derived only from exact non-empty source excerpts, never from fictional balloons.
- Domain compose/selection notes hand off through `sendToAgentChat`, with `openSidebar: true`; the real framework readiness gate decides whether to submit or preserve a setup prefill. Pencil-working presentation requires a correlated genuinely working thread, not a click or timer.

## Shared action index (UI, in-app agent and external MCP)

| Action                     | Contract                                                                                                                                                                                                                                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `list-strips`              | Read only the authenticated owner's current workspace Library.                                                                                                                                                                                                                                                                       |
| `get-strip`                | Read one scoped scene, revision, protection and retained history.                                                                                                                                                                                                                                                                    |
| `propose-strip-angles`     | Save three authored premise/irony/cast proposals in an owner/workspace-scoped SQL angle plan; navigate to angle cards. No generation inside the action.                                                                                                                                                                              |
| `get-strip-plan`           | Read a scoped angle plan and its revision before choosing/drafting.                                                                                                                                                                                                                                                                  |
| `choose-strip-angle`       | CAS-select an angle; optional edited premise/cast. Stop for the person's choice unless explicitly delegated.                                                                                                                                                                                                                         |
| `create-strip`             | Persist the complete composition for `planId` + `expectedPlanRevision`, retaining the source, chosen cast and all angles. Agent creation for real updates requires a chosen plan; direct authored/illustrative imports remain supported. MCP returns a Studio open link.                                                             |
| `update-strip`             | Required `expectedRevision`; focused balloon/cast/angles/angle/screen/sfx/prop/pose/expression/ending/ending-art/review `edits` OR `restoreRevision`. Restore appends a revision and preserves current protection. Agent cast/angle changes cannot reinterpret MINE work. Recast adaptation targets only affected unprotected lines. |
| `set-strip-protection`     | Human editor only; never available to the agent tool surface.                                                                                                                                                                                                                                                                        |
| `view-screen` / `navigate` | Tab-scoped context and navigation for the in-app workflow.                                                                                                                                                                                                                                                                           |

Writing contract: find the joke before drafting; dialogue REACTS, never restates the source. Facts appear on screens/props or at most one short line. Panel 4 is a reaction/reversal, never a summary. Target 8 words per balloon (hard cap 12); measured fit can require fewer. Shorten on rejection; never truncate. Use the ten bundled story-specific archetypes, structured `screen` and one short `sfx` per panel. Art renders in ink; blue review marks stay until human Ink/Erase and never appear in PNGs.

MCP connection/demo: `docs/MCP_DEMO.md`. Revisions attribute trusted MCP/WebMCP/A2A calls as external agent; no client attribution override. History is retained in the SQL scene alongside each atomic revision save, not in browser state. Historical records start at their first retained save; never invent older events.

## Serving the app (since 2026-11-08 ~17:00 UTC)

The production app runs in the Docker container `strip-app` (node:22, host network, port 8080, restart unless-stopped, env from .env), next to the `strip-pg` Postgres container. Agent-session processes were being killed, so the old /tmp supervisor is obsolete. After `pnpm build`, run `docker restart strip-app`. Logs: `docker logs strip-app`. Never print .env values.

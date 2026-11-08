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

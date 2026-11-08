# Strip — build plan (proposed 2026-11-08 15:55 UTC; needs human approval)

Deadline: **Nov 9, 11:59 PM PT = Nov 10, 07:59 UTC** (~40 h from writing).
Internal submit target: **Nov 10, 03:00 UTC** (5 h buffer).

## Principle
The proof was a 3-hour feasibility test. Reuse its **engine** (data model, actions, protection, revisions, export). **Redesign and rebuild every surface people see** to docs/DESIGN.md v1. Work happens on branch `build/app`. One implementation lane at a time. Lanes run autonomously; Opus reviews and dispatches the next task.

## Step 0 (now): design probe
Landing/entry plus the Studio workspace, at desktop and phone, following DESIGN.md. Opus reviews it before anything else is built.

## Milestones

| # | Window (UTC) | Outcome | Lane |
|---|---|---|---|
| M1 | Nov 8 16:00–21:00 | **Demo loop works end to end with the real agent:** paste update → draft appears → edit + protect → "revise this panel" → protected line survives → pick 1 of 3 endings → export PNG. Fix any break found. | Build: GPT-6.1 Sol, medium · Verify: Terra 6.1, high |
| — | Nov 8 21:00 → Nov 9 ~07:00 | Human sleeps. Optional sleep-mode work only on locked M2 items. | — |
| M2 | Nov 9 07:00–14:00 | **Product, not a proof:** strip library home; cast setup (2–3 named characters with traits); "launch post" export (PNG + suggested post caption); polished ending picker; panel-by-panel reveal if real; design pass on the first screen. | Build: Sol, medium · UI polish: Sonnet |
| M3 | Nov 9 14:00–18:00 | **Agent-Native depth (Cleverness 20%):** "strip this update" callable from an external agent (Claude Code over MCP) so the strip appears in the app; edit history with human/agent attribution and restore. Each item is cut if not working by 18:00. | Build: Sol · Review: Opus |
| M4 | Nov 9 18:00 → Nov 10 00:00 | **Demo:** lock the judge story, rehearse, record the public Clips demo of the real app, write the README (pre-existing work disclosure, stack, licenses). | Opus (story) + human |
| M5 | Nov 10 00:00–03:00 | Judge audit, security pass, submit (human approval required). | Opus + human |

## Must-haves (judged)
- A complete, reliable demo loop (M1). This is 40% of the score.
- Real agent, no simulated output.
- Protection and stale-write safety enforced in code.
- A readable 1200×1200 PNG.
- Phone-usable.

## Cuts (unless ahead of schedule)
Multiplayer, comments, memory, AI images, Slack/X posting integrations, likeness tools, new art styles.

## Open decisions for the human
1. Approve this plan and the M1 start.
2. Testing AI from our side: Builder.io is connected to the human's account only. Option: invite a test account into the human's org (if the connection is org-scoped) so Terra can run AI checks without the human's credentials.
3. Hosting for judges: the current instabox link (simplest) vs a real deploy (needs hosted Postgres, e.g. a free Neon tier). Decide at M4.
4. Public GitHub repo for the submission (encouraged, not required). Decide at M4.

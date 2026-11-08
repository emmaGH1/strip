# Strip: approved proof, not full product

## Approval
User: “ok let's get to work”, following the agreed proof in IDEATION section 14. Start 2026-11-08 09:53 UTC. Three-hour cap: 12:53 UTC (earlier historical ~14:00 was approximate; do not extend the actual three hours). Collaborative mode; one lane. Human approves visual direction before propagation.

## Job
A product marketer turns ONE product change into an editable four-panel comic for a launch post. Promise clarity and charm, not guaranteed humour/engagement.

## Acceptance
1. Three genuinely fresh agent drafts from ordinary inputs: independent reader understands all three and smiles at two (requires HUMAN judgment).
2. Readable four-panel staging at phone size; at least one wordless beat.
3. A UI edit and real agent tool invocation use the same validated action. Selected panel/balloon visible to agent.
4. Protected human edits survive all agent writes; agent cannot unlock or bypass protection; stale writes rejected atomically.
5. Three proposed endings are selectable. Actual PNG reopened and compared with canvas.

## Small implementation plan
- Official scaffold + framework/runtime proof. Pin packages; preserve original repo.
- SQL-backed strip model and atomic edit operations, domain tests for locks/revisions/caller restrictions.
- Bounded design probe: workspace and entry surface only, real structured characters and data, text fitting. Ask for approval before extending UI.
- Real agent draft/revision path + export; external provider authorization remains a gate. Do not substitute seed responses.
- Run checks/browser proof, report evidence, stop. No deployment or full film.

## Architecture boundary (proof)
React -> Agent-Native action hooks -> defineAction -> scoped SQL record. Agent -> same action -> same version/lock checks. UI selection is stored in framework application state. All comic state is structured JSON in a domain SQL row, not a flattened image. Pure shared validation/reducer handles transitions; database compare-and-swap serializes writes. Creator identity scoped by framework caller context. Asset references use a fixed verified local allowlist; no arbitrary SVG/HTML from the model. Export renders the same scene model with the same assets and measured text layout. Server route only if needed for binary output.

## Non-goals
Multiplayer, comments, running-gag memory, likenesses, freeform drawing, generated images, Slack/X OAuth, elaborate history, external MCP workflow. No automatic pivot to Jam. PNG download is not a social post.

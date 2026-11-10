# Strip from Claude Code (M3)

Strip's **existing framework MCP server** exposes the same validated SQL-backed actions as the UI. Claude Code authors the structured comic itself: no Builder.io AI connection or app-side generation request is needed. Your external host's own model/billing is separate; this task did not authorize paid calls.

## Connect your own account

1. Open the running Strip app and sign in to **your** account/workspace. Keep `/home` (Library) open. Do not use somebody else's browser session.
2. Open **Settings → MCP server**, or `/mcp/connect`, and copy the server URL. Use the same app origin you use in the browser. The currently approved development instance is:
   `https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech/mcp`
3. In your terminal, add the remote OAuth MCP server (no static token or headers):
   ```sh
   claude mcp add --scope project --transport http strip https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech/mcp
   ```
4. Start Claude Code in that project, trust the project and approve the project MCP server. Run `/mcp`, choose **strip → Authenticate**, sign in as the same Strip user and approve the intended workspace and scopes. In the tested Claude Code 2.1.319 flow the client requests `mcp:read`, `mcp:write`, `mcp:apps`, and `offline_access`: read permits reads, write permits create/edit, apps enables inline app resources, and offline access permits refresh. Do not grant a different account/workspace to work around a permission denial. For a headless terminal, `claude mcp login --no-browser strip` still requires a TTY and gives an authorization URL; use the same signed-in browser session to approve it.
5. Confirm the Strip tools are enabled. Ask:
   > Strip this update: We added Undo. Deleted files can now be restored. Compose the actual four-panel draft yourself and save it in Strip; don't call ask-agent. Include a wordless visual beat and three endings. This update is illustrative.
6. V2's normal story flow is **propose three angles → human choice → complete draft**: use `propose-strip-angles`, follow its cards link, choose/edit through `choose-strip-angle`, then author and save with `create-strip` plus `planId` and `expectedPlanRevision`. Real agent-authored updates require a chosen plan. Clearly illustrative/authored direct imports remain supported. Do not send a generation request back to the app. Follow the runtime schema: four ordered beats, story-specific cast archetypes, unique object IDs, explicit poses, 0–2 balloons per panel (target 8 words, hard cap 12 and measured fit), a meaningful wordless beat, structured screen/SFX, three distinct endings with staging and exact source excerpts. Dialogue reacts to facts; panel 4 reverses/reacts rather than summarising. Fictional dialogue is not evidence of a shipped feature.
7. The strip is saved to the same account/workspace Library through the shared actions. The Vercel demo uses framework polling (1–5 seconds between polls while visible and healthy), not local SSE; hidden tabs pause and network failures can delay updates. Use the returned **Open strip in Studio** link to open the saved result directly. Art is finished ink with small blue review marks until accepted; History identifies **External agent**.
8. To edit, ask Claude Code to read the current strip first, then apply a focused update with the returned `expectedRevision`. Keep Studio open to watch it arrive. Stamp a line MINE in the UI and ask for an edit to that line: the action must reject it, not silently change it. A stale revision must also reject; re-read and reconsider rather than blindly retrying.
9. Open **History** in the agent desk. Restore an earlier revision; it becomes a **new** revision with “Restored revision N.” Existing protection stamps remain. External agents cannot restore content over MINE; a human can restore their own content. Old records retain history beginning at their first new save, not invented past revisions.

## Auth and safety

- OAuth is framework-owned, audience-bound to the exact MCP resource, per user/org and revocable. The framework enforces MCP read/write scopes before dispatch. Every domain read/write additionally filters owner email **and** workspace; knowledge of a strip ID grants no access.
- MCP identity comes from trusted dispatcher context and is always **agent**, never human. No `actor`, `force`, unlock or SQL tool is exposed by the product surface.
- Restore and normal edits use the same atomic SQL revision compare-and-swap; snapshots are appended in that same write. Failed conflicts cannot append history. Restore changes content, not current protection or previous snapshots.
- Do not copy tokens into chat, scripts, docs, screenshots or git. Prefer OAuth over deployment-wide `ACCESS_TOKEN` credentials. A 401 means reconnect through `/mcp`; a 404 can mean the wrong owner/workspace, not permission to bypass scoping.
- This is an approved development port, not a production deployment promise. The sandbox must be running. No push, public production deployment or submission is implied.

## Local evidence

See `docs/evidence/claude-code-mcp/verification.md` for the real Claude Code OAuth, model-authored draft, live Library, attribution and protected-edit test; `docs/evidence/m3/verification.md` records earlier scripted transport observations. These are bounded tests, not proof of humour or general usability. No Builder.io AI request is needed for this direct action path; Claude Code's own account and billing remain separate.

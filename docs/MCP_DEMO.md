# Strip from Claude Code (M3)

Strip's **existing framework MCP server** exposes the same validated SQL-backed actions as the UI. Claude Code authors the structured comic itself: no Builder.io AI connection or app-side generation request is needed. Your external host's own model/billing is separate; this task did not authorize paid calls.

## Connect your own account

1. Open the running Strip app and sign in to **your** account/workspace. Keep `/home` (Library) open. Do not use somebody else's browser session.
2. Open **Settings → MCP server**, or `/mcp/connect`, and copy the server URL. Use the same app origin you use in the browser. The currently approved development instance is:
   `https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech/mcp`
3. In your terminal, add the remote OAuth MCP server (no static token or headers):
   ```sh
   claude mcp add --transport http strip https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech/mcp
   ```
4. Start/restart Claude Code, run `/mcp`, choose **strip → Authenticate**, sign in as the same Strip user and approve the intended workspace and scopes. `mcp:read` permits reads; `mcp:write` is necessary to create/edit; `offline_access` permits refresh. `mcp:apps` is only needed for inline app resources. Do not grant a different account/workspace to work around a permission denial.
5. Confirm the Strip tools are enabled. Ask:
   > Strip this update: We added Undo. Deleted files can now be restored. Compose the actual four-panel draft yourself and save it in Strip; don't call ask-agent. Include a wordless visual beat and three endings. This update is illustrative.
6. Claude Code should call the direct creation tool with a **complete structured draft**, not send a chat request back to the app. Follow the action's runtime JSON schema: four ordered beats, unique object IDs, actors with explicit poses, at most two 12-word balloons per panel, three distinct endings and exact source excerpts only where depicting a literal claim. Fictional dialogue is not evidence of a shipped feature.
7. The new thumbnail should appear in the already-open Library through framework sync, without refreshing. Use the returned **Open strip in Studio** link. The initial objects are blue pencil; History identifies **External agent**.
8. To edit, ask Claude Code to read the current strip first, then apply a focused update with the returned `expectedRevision`. Keep Studio open to watch it arrive. Stamp a line MINE in the UI and ask for an edit to that line: the action must reject it, not silently change it. A stale revision must also reject; re-read and reconsider rather than blindly retrying.
9. Open **History** in the agent desk. Restore an earlier revision; it becomes a **new** revision with “Restored revision N.” Existing protection stamps remain. External agents cannot restore content over MINE; a human can restore their own content. Old records retain history beginning at their first new save, not invented past revisions.

## Auth and safety

- OAuth is framework-owned, audience-bound to the exact MCP resource, per user/org and revocable. The framework enforces MCP read/write scopes before dispatch. Every domain read/write additionally filters owner email **and** workspace; knowledge of a strip ID grants no access.
- MCP identity comes from trusted dispatcher context and is always **agent**, never human. No `actor`, `force`, unlock or SQL tool is exposed by the product surface.
- Restore and normal edits use the same atomic SQL revision compare-and-swap; snapshots are appended in that same write. Failed conflicts cannot append history. Restore changes content, not current protection or previous snapshots.
- Do not copy tokens into chat, scripts, docs, screenshots or git. Prefer OAuth over deployment-wide `ACCESS_TOKEN` credentials. A 401 means reconnect through `/mcp`; a 404 can mean the wrong owner/workspace, not permission to bypass scoping.
- This is an approved development port, not a production deployment promise. The sandbox must be running. No push, public production deployment or submission is implied.

## Local evidence

See `docs/evidence/m3/verification.md` for the actual scripted MCP/browser observations and limitations. A scripted illustrative transport test is **not** evidence of model creativity or a real Claude Code generation session. No Builder.io AI request is needed for this direct action path.

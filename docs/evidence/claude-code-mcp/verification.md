# Claude Code MCP verification — BLOCKED

The actual Claude Code model-to-MCP creation, live Library update, Studio attribution, and protected-edit rejection were **not tested**. Do not treat the prepared illustration in `library-before.png` as a generated or saved strip.

## Observations

- `claude --version`: `2.1.319 (Claude Code)`; `claude auth status` reported `loggedIn: true`, `authMethod: claude.ai`. No model prompt was submitted.
- Created `/tmp/claude-1000/strip-mcp-test` and used this exact project-scoped command there:
  ```sh
  claude mcp add --scope project --transport http strip https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech/mcp
  ```
  The CLI reported modifying that directory's `.mcp.json`. Initial `claude mcp get strip` reported pending project approval. `claude --help` and `claude mcp login --help` were checked. The CLI supports `claude mcp login --no-browser strip`, but it requires a terminal even with `--no-browser`.
- To avoid putting project trust or OAuth data into the user's global configuration, a private temporary `CLAUDE_CONFIG_DIR` was used with a temporary copy of the existing CLI credential file; interactive onboarding and trust were performed against the isolated directory. The isolated CLI reported an authenticated Claude plan. Its temporary files were removed at cleanup. No human Strip account was used.
- Headless Chromium on the public development origin registered disposable Strip accounts. One reached an empty Library, captured in `library-before.png` at 1440×900; passwords were random, held in process memory, and not retained. The illustration is the app's existing prepared example.
- In a pseudo-terminal, `claude mcp login --no-browser strip` produced an authorization URL and prompted for the redirect URL. The CLI's request included **`mcp:read mcp:write mcp:apps offline_access`**, whereas the task permitted only `mcp:read`, `mcp:write`, and optional `offline_access`; no consent was granted. A reduced-scope URL was constructed for investigation; a separate unauthenticated HTTP check returned 200, which is **not** evidence of authorization or granted scopes.
- The first browser attempt captured the streamed URL prematurely and received `invalid_request`; this was a harness error, not proof of an app defect. After fixing URL capture, the next browser attempt failed because Playwright disallows opening another page in a context owned by `browser.newPage()`. After correcting that harness error, a fresh signup displayed **“We couldn't create your account. Please try again.”** and remained on `/sign-in`. The cause is unknown. The prior disposable passwords had not been retained, so the headless OAuth consent could not be completed with those sessions. Stopped rather than trying further accounts or submitting a model prompt.

## Cleanup and limits

No OAuth grant was completed, so there was no disposable grant to revoke. Browser processes were closed and the isolated project directory, including the temporary CLI credential copy and project MCP config, was removed. Disposable accounts created during the attempts remain in the app; no account deletion was attempted. No Claude Code output, after screenshot, Studio screenshot, or protection result exists. Other pre-existing or concurrent files were not part of this evidence commit.

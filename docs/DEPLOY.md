# Strip → Vercel + Neon

**Production deployed with explicit human approval on November 9, 2026:** <https://strip-kappa.vercel.app> (Vercel project `strip`, Neon Postgres). `APP_URL` and `BETTER_AUTH_URL` are pinned to that stable alias. No push or submission was performed. Deadline: November 10, 2026, 07:59 UTC. No push or submission is part of this procedure.

## Build contract (installed Agent-Native 0.226.0)

Sources: `node_modules/@agent-native/core/docs/content/{deploy-an-app,deployment,deployment-environment-variables,vercel,neon}.mdx`, plus installed deployment and OAuth source.

- Use **Node 22.22+ within Node 22**, pinned by `.node-version`, checked by the isolated build helper, and selected for Vercel by `engines.node: 22.x`. Existing Docker uses Node 22; its normal `pnpm build` is unchanged.
- `corepack enable`; package manager is **pnpm 10.29.1**. Install with `pnpm install --frozen-lockfile`.
- Official preset: **`NITRO_PRESET=vercel pnpm build`**. Nitro emits Build Output API v3 into **`.vercel/output`**, including static files, server function and routing config. Do **not** treat that folder as an ordinary static output directory.
- Our command, **`pnpm build:vercel`**, copies non-ignored source into a temporary directory, excludes all `.env*`, symlinks installed dependencies, runs that exact preset build and copies back only `.vercel/output`. It never replaces `.output`, `build/` or the running Docker service. Temporary source is deleted even on failure. It requires a Git checkout, GNU tar, Node and pnpm.
- `vercel.json` explicitly disables framework autodetection (this is **not Next.js**) and provides install/build commands. No custom Nitro runtime config, rewrite or `outputDirectory` is required: Nitro's generated `.vercel/output/config.json` is authoritative. The release uses `vercel deploy --prebuilt --prod`, so no remote source build is needed.
- Build cadence is `AGENT_NATIVE_VERCEL_CRON_SCHEDULE='0 9 * * *'`: daily rather than the framework's once/minute default, which Vercel Hobby rejects. Strip does not promise scheduled automation. Use an approved paid plan or another host if minute-level recovery becomes required; do not silently upgrade.
- Local proof: Vercel preset build passed, function runtime `nodejs22.x`, about 69 MiB total output / framework-reported 34 MB server bundle; 420 Peeps SVGs, 38 WOFF/WOFF2 files and `og.png` are present in static output. `.output` file-content hash was identical before/after. A build is not a hosted smoke test.

## Production variables

| Variable                                                              | Requirement / release policy                                                                                                                                                                                                                                                             |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                        | **Required.** Fresh persistent Neon database, pooled URL with `sslmode=require` (hostname includes `-pooler.`). Supply through a private file. No PGlite in production.                                                                                                                  |
| `BETTER_AUTH_SECRET`                                                  | **Required**, stable 32+ characters; script generates 32 random bytes as 64 hex characters once. Rotation signs everyone out.                                                                                                                                                            |
| `APP_URL`, `BETTER_AUTH_URL`                                          | Framework-optional, **required for this release's reliable canonical origin**. Script discovers a production `vercel.app` alias after first upload, saves both and redeploys. Never use localhost, the instabox address, `/mcp`, or an immutable deployment URL as the canonical origin. |
| `OAUTH_STATE_SECRET`                                                  | Recommended dedicated OAuth state key; framework otherwise falls back to Better Auth secret. Generated and persisted.                                                                                                                                                                    |
| `A2A_SECRET`                                                          | Conditional: required for A2A/signed background handoffs or hosted multi-app workspaces, not basic standalone signup/MCP. Generated to avoid fail-closed background paths.                                                                                                               |
| `WORKSPACE_SECRETS_ENCRYPTION_KEY`                                    | Recommended stable shared-vault key (fallbacks exist). Generated for saved Builder/provider credentials. **Back it up; do not rotate casually.**                                                                                                                                         |
| `CRON_SECRET`                                                         | Required for the generated Vercel sweep cron to authenticate. Generated and persisted.                                                                                                                                                                                                   |
| `AGENT_NATIVE_VERCEL_CRON_SCHEDULE`                                   | Build-time only; helper sets daily schedule for Hobby compatibility.                                                                                                                                                                                                                     |
| `VERCEL_TOKEN`                                                        | CLI-only deployment credential, **not an application env var**. Supply through a private file.                                                                                                                                                                                           |
| `DATABASE_URL_UNPOOLED`                                               | Optional direct URL; not a third required input. Framework recognizes Neon and removes `-pooler` when selecting a direct migration connection.                                                                                                                                           |
| Email / Google / GitHub keys                                          | Optional. Without email delivery, ordinary email/password signup/login works; verification, magic links, mail-based resets and invitations do not.                                                                                                                                       |
| `ANTHROPIC_API_KEY` or other deployment LLM keys                      | **Not required; do not set.** They may fund all signed-in users across organizations. Use the person's scoped Builder.io connection and separately approved usage instead.                                                                                                               |
| `SECRETS_ENCRYPTION_KEY`, `WORKSPACE_SECRETS_ENCRYPTION_KEY_PREVIOUS` | Legacy/rotation only. Not needed for a fresh deployment.                                                                                                                                                                                                                                 |
| Builder relay env vars                                                | Conditional corporate/isolated-preview relay only; not configured for standalone Vercel.                                                                                                                                                                                                 |
| `PORT`, `APP_BASE_PATH`, keep-warm flags, unsafe auth/webhook flags   | Not needed. Leave unset; no relaxed security defaults.                                                                                                                                                                                                                                   |

The two inputs must be plain UTF-8 files containing only their respective value (a terminal newline is acceptable), mode 600, outside the checkout. Obtain them through the secure secret prompt, **never chat, command-line literals, git or screenshots**. The approved inputs and generated state are private under `/data/home/.strip-secrets/`; never display or commit them.

## One-shot release

Prerequisites: authenticated Neon/Vercel resources supplied by the human, installed dependencies, Node/pnpm above, `openssl`, GNU tar, `realpath`, and `flock` (util-linux). Choose the correct Vercel account/team before running. If needed, prefix the command with the **non-secret** `VERCEL_SCOPE=<team-slug>`; otherwise CLI token scope/default account is used. No paid plan creation/upgrade is authorized.

```bash
bash scripts/deploy-vercel.sh /secure/strip-database-url /secure/strip-vercel-token
```

What it does:

1. Validates the DB URL without displaying it; takes a local exclusive release lock.
2. Generates missing stable secrets under `deploy-state/` beside the supplied database file (for this release, `/data/home/.strip-secrets/deploy-state/`, outside the checkout) (directory 700, files 600). Reuses them on retries.
3. Uses pinned **`npx --yes vercel@65.14.0`**, token read from the file, to inspect/create project **`strip`**, then `link --project strip --yes`. A project creation/access error stops the run; it never falls back to another name.
4. Uploads production env values using stdin, `env add --environment production --force --yes --sensitive`. Existing same-name production variables are replaced intentionally; run against this app's project only.
5. Runs **`pnpm migrate:production` from this machine, before the upload**, inside the isolated source copy with a clean environment and the supplied Neon URL. This avoids `.env` or per-app DB variables accidentally targeting Docker's Postgres. The runner applies both framework and registered Strip release migrations (including angle plans); reruns are migration-tracked. It is schema setup, **not** a copy of local accounts or strips. Never use `drizzle-kit push` against Neon.
6. Builds the Vercel preset in isolation and uploads with `deploy --prebuilt --prod --yes`.
7. Inspects production aliases, chooses the shortest non-branch `vercel.app` alias, pins `APP_URL`/`BETTER_AUTH_URL`, then uploads the same build again with `--force` if the canonical origin changed. Env is attached at upload/runtime. The first bootstrap deployment may be reachable briefly: **do not connect OAuth or share it until the command finishes**.
8. Prints the canonical URL. On error, prints only the failed step and private diagnostic path. Nothing deploys merely by running tests or `pnpm build:vercel`.

**Retry:** run the same command with the same input directory, `.vercel` link and team. Keep a private backup of `/data/home/.strip-secrets/deploy-state` before moving machines: losing it and regenerating keys invalidates sessions and can strand encrypted connections. Do not delete it or rerun against an unrelated existing `strip` project. Do not copy the state into source control. The last-run log redacts supplied/generated credential values and the DB password, but the log and provider JSON are still private diagnostics that may contain account metadata; review before sharing and never commit them. The mandated CLI `--token` argument can be seen by local process inspection: use a trusted machine, never shell tracing. Input files are never sourced or echoed.

For local build-only rehearsal (no credentials/network deployment):

```bash
pnpm build:vercel
```

Do **not** restart `strip-app`. Nothing in this procedure changes its `.env` or database. Vercel/Neon start with a new user database: the human must sign up again and reconnect Builder.io; the instabox connection is not portable without its original database/keys.

## Builder.io origin and MCP issuer

Installed `dist/server/builder-browser.js` accepts configured app origins (`APP_URL`/`BETTER_AUTH_URL`) for the connect callback. Keep both equal to the final canonical HTTPS origin. Callback is **`https://<production-alias>/_agent-native/builder/callback`**; local connect entry is **`/_agent-native/builder/connect`**. No additional app-side allowlist or custom provider key is required for this normal standalone flow. Builder's CLI-auth host has separate callback restrictions/relay behavior; successful end-to-end authorization from the new Vercel origin is **unverified**, not guaranteed by reading source. If Builder rejects that callback, stop and obtain supported provider configuration rather than weakening origin checks or editing framework code. No external allowlist was changed by this lane.

MCP URL is **`https://<production-alias>/mcp`**. Installed `dist/mcp/oauth-route.js` derives the OAuth **issuer as the canonical public base URL**, **`https://<production-alias>`** (no `/mcp`). Inspect `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/mcp`; their public URLs must not refer to instabox/localhost or the first immutable deployment. Existing MCP credentials from another issuer do not transfer; reconnect the host.

## Post-deploy smoke checklist (must run on final origin)

- [ ] `curl -I https://<alias>/`: landing **200**, HTTPS, public without Vercel account login/protection. Inspect branding/OG metadata; `APP_URL` must be the final alias.
- [ ] Fresh disposable email/password **signup → Library (`/home`)**, then sign out/sign in. No email provider is needed. Existing local users are not expected here.
- [ ] Open the explicitly **prepared / illustrative** example into Studio. Reload and verify persistence; edit a balloon, mark MINE, reload, swap an ending. Do not call the example AI output.
- [ ] Export/download the actual **1200×1200 PNG**; inspect the whole result. Art and lettering appear; no MINE/review/selection chrome, missing glyphs, blank portraits or blue review overlays.
- [ ] GET actual `/peeps/*.svg`, emitted `/assets/*.woff2`, `/logo.svg` and `/og.png` URLs: **200** with correct types. Verify fonts/Peeps visually, not merely status codes.
- [ ] `/mcp` responds with **401 plus OAuth challenge** when unauthenticated (not a 404/500). OAuth metadata above returns the final issuer/resource. An authenticated MCP initialize/tool listing is a separate recommended check; never paste bearer values.
- [ ] Signed-in Agent → Connect AI → **Use Builder.io** opens the real connect page at Builder.io; callback target resolves to the final public origin, not localhost. Opening the page is not permission to accept spending or make model calls. Complete/rehearse only with human approval.
- [ ] Confirm final Vercel function logs show no missing schema/auth secret errors and the daily sweep authenticates. Review Neon connection limits/cold start and function duration (framework default 300 s). Public signup is open; no deployment-wide paid LLM fallback is installed.

## Live release results — November 9, 2026

Production: **<https://strip-kappa.vercel.app>**. Human-approved Vercel project `strip` and Neon migration completed. `APP_URL` = `BETTER_AUTH_URL` = final alias above. Release completed on attempt 2: attempt 1 uploaded but the parser rejected CLI JSON stdout; the script now accepts JSON and legacy plain URL output. Both attempts reused the same private generated keys. `.vercel/` is gitignored; keys live outside the checkout beside the database input under `/data/home/.strip-secrets/deploy-state/` (700 directory / 600 key files).

| Live check                             | Result                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signed-out landing, logo, favicon, OG  | PASS: HTTP 200; rendered branding and 1200×630 OG inspected                                                                                                                        |
| One disposable signup → Library        | PASS: rendered Library                                                                                                                                                             |
| Prepared illustrative example → Studio | PASS                                                                                                                                                                               |
| Balloon edit/save/reload persistence   | PASS                                                                                                                                                                               |
| Actual PNG export                      | PASS: 1200×1200, preview/download bytes match, visually inspected                                                                                                                  |
| GET `/mcp`                             | PASS: 401; OAuth discovery uses final public issuer/resource                                                                                                                       |
| Use Builder.io connection entry        | INCONCLUSIVE: visible control clicked, no Builder URL observed; test guard may have blocked an intermediate/subdomain. Not an established product failure; acceptance remains open |
| Function logs                          | PASS with warnings: no error/fatal entries in final five-minute / 113-record query; four engine-status slow lookups, 2.5–6.6 seconds                                               |

Evidence: [live browser report](evidence/deploy-live/verification.md). No HTTP/page errors observed during the bounded browser run. One disposable account/example remain server-side; browser/session closed and no credentials saved in the checkout. No model call or completed Builder authorization. A one-hour logs query exceeded Hobby retention; five-minute queries succeeded. Cron execution was not awaited. Local checks: 88 tests, typecheck, framework doctor and isolated Vercel production builds pass. Docker `strip-app` was untouched. No git push or submission.

## Limits / rollback

Preparation alone did not perform hosted checks. The approved November 9 release migrated Neon and deployed Vercel; see the live results below. Builder authorization completion remains untested. New-origin OAuth, provider account permissions, Vercel protection/limits/alias response and Neon network access remain release gates. Inspect the linked project/team and plan if upload fails; do not pay or change the hosting concept automatically. Mock CLI tests cover order/retries/error redaction, not Vercel's live API. Daily cron delays interrupted-run recovery versus a minute-level scheduler. A rollback to a previous Vercel deployment does not roll back SQL; preserve additive migrations and back up production data before later schema changes. The existing instabox Docker app remains available and unchanged.

# Production AI-readiness incident — November 10, 2026

## Confirmed evidence

Queried production with Vercel CLI **65.14.0**, using the existing private token file. Raw runtime/request/API responses remain outside git under `/data/home/.strip-secrets/incident/`; they contain account/request metadata and must not be published verbatim.

Before deployment: `dpl_FWaopXCdrC1gwvzGT1Aq5nUq7a8C`. Runtime query **2026-11-09 23:55:00 → 2026-11-10 00:06:00 UTC** returned **563 entries**, no pagination or excluded intervals.

- **15 error entries**, all `[agent-engine/status] lookup failed Error: Agent engine status lookup timed out`.
- 34 slow engine-status request metrics: 19 HTTP 200, **15 HTTP 503**, **1,077–26,856 ms**, median **7,733 ms**. This is a slow-request sample, not every status request.
- Example at **23:55:12.112 UTC**: status 503 after **11,191 ms**, `db_ms=10,940`, 35 DB operations. Another concurrent request returned 503 after 7,455 ms.
- DB sync-event write warning at **23:57:08.358 UTC**: `DB query timed out after 7999ms (connection terminated)`.
- Agent-chat requests also spent most of their measured duration in DB work: one 409 after **114,063 ms**, `db_ms=113,986`; others returned 200 after 34–36 seconds. HTTP 409 indicates run overlap/conflict, not a proven platform timeout.
- **Zero `FUNCTION_INVOCATION_TIMEOUT` entries.** The duration hypothesis was not established. One status request explicitly marked process-cold returned 200 in **3,634 ms** (`db_ms=1,810`).
- Deployment API and signed-in request `x-vercel-id` confirm **Virginia (`iad1`)** function execution. Neon hostname identifies **Frankfurt (`eu-central-1`)**. Runtime log `region=cpt1` is not used as function-location evidence: it disagrees with the deployment API and response execution-region suffix.
- Project API confirms existing **Fluid Compute enabled**, team plan **Hobby**. Original emitted function config omitted both `maxDuration` and `regions`. The observed 114-second response is additional evidence against assuming an old 10/60-second invocation limit.

**Diagnosis:** database-dominated readiness lookups crossing regions exhausted the framework's 10-second status-loader deadline. Heavy concurrent status/integration queries and retries amplified latency. Region mismatch is confirmed; no trace establishes a slow remote Builder OAuth endpoint, and Neon autosuspend itself was not isolated. Never label these responses an OAuth disconnect or rotate working connection keys to fix them.

## Change and release

One materially different fix: colocate execution with Neon and make platform limits explicit. No framework source patch, DB/client replacement, auth relaxation, migration, secret rotation, paid upgrade, push or submission.

- `nitro.config.ts`: `vercel.functions.regions=["fra1"]`, `maxDuration=300`.
- `vercel.json`: matching default `regions=["fra1"]`.
- Build guard verifies actual `__server.func/.vc-config.json`: Node 22, streaming, Frankfurt, 300 seconds. Eight regression cases cover accepted output and missing/short budget, wrong/multiple region, wrong runtime and disabled streaming.
- Initial local build correctly failed the guard: Vite `agentNative({ nitro })` config is development-only; the production framework separately calls `createNitro`. Moving this configuration into Nitro's supported `nitro.config.ts` emitted the required settings. No failed production rollout.
- Existing `DATABASE_URL` already uses the pooled Neon hostname with TLS (`sslmode=require`, channel binding required); retained unchanged. The installed Neon driver uses framework request-scoped pools (max 1); postgres-js's separate 10-second connect timeout is not the Neon driver's setting. No speculative connection-timeout change.
- Existing `A2A_SECRET`, `CRON_SECRET`, auth/vault keys and canonical origins retained. Daily cron remains Hobby-compatible. Durable ledger/journal and client auto-continuation are built in. Netlify's 15-minute background worker does **not** exist on Vercel; no force-background marker or unsupported 15-minute budget was enabled. Foreground chunks retain the framework's safe 40-second checkpoint budget, with up to three automatic resumptions in the same turn (then manual Continue). This is not a 40-second total-turn cap; the platform now explicitly allows 300 seconds per invocation. Self-chain stays default-off because no real connected continuation was available to verify its acceptance gate.
- Isolated production build passed. Pinned CLI `deploy --prebuilt --prod --yes` succeeded and assigned the existing stable alias **https://strip-kappa.vercel.app**. New deployment **`dpl_9rYRqJWpwb41pB3KTDW74dkvovPP`**, API `regions=["fra1"]`, plan Hobby, READY. Vercel accepted the 300-second emitted function configuration. No environment values were uploaded or changed.

## Live HTTP verification (no AI account)

One new disposable account was created and signed in over the real framework auth endpoints. Only that account's readiness was accessed; no human account, saved Builder credential, provider authorization or model call was used.

| Measurement                                                              | Before (`iad1`)                                   | After (`fra1`)                                                                                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Own unconnected account, five sequential status requests, client elapsed | 4,053 / 547 / 356 / 2,414 / 359 ms                | First eight: 814 / 407 / 232 / 465 / 467 / 259 / 230 / 322 ms                                                              |
| Status semantics                                                         | All 200, `configured:false`, `chatEligible:false` | All 200, same correct unconnected result                                                                                   |
| Initial request immediately following rollout                            | Not isolated                                      | 814 ms; **not proven process-cold**                                                                                        |
| Remaining seven warm/rollout samples                                     | —                                                 | 230–467 ms, median 322 ms                                                                                                  |
| Six-way normal settings/status fanout                                    | Not sampled                                       | All six 200, 486–592 ms; engine 489 ms, Builder 592 ms, connection-status/builder 571 ms                                   |
| Explicit process-cold status metric                                      | 3,634 ms server duration in human-window logs     | Not captured; cold landing metrics 1,005 / 1,073 ms, cold `/home.data` 837 ms, but these are **not** engine-status timings |

Client measurements include the VM-to-Vercel network round trip. After responses carry `pdx1::fra1` rather than `pdx1::iad1`. Eight fast immediate requests include the framework's one-second cache; the separate later six-way settings fanout also passed. Do not compare this unconnected account as if it were the human's connected Builder account, which does more scoped work.

Post-release query **00:12:00 → 00:14:41 UTC**, new deployment only: **12 runtime entries, all info; zero status-loader/DB/platform timeout messages**, **542 request records, all HTTP 200**, including nine engine-status requests. No pagination/excluded intervals. This is a bounded window, not a guarantee against future failures.

## Checks / remaining acceptance

- 96 tests pass, typecheck and framework doctor pass, task-file oxfmt and shell syntax pass, isolated Vercel production build passes. Existing source-map/barrel/chunk warnings remain; no standalone lint script. Docker output/service untouched.
- No rendered browser verification: this lane changed hosting config, not UI. Verification here is real authenticated HTTP plus provider logs/API, not screenshots.
- **Cold engine-status after fix remains unisolated**: production traffic/probes warmed instances before the first sampled status request. No forced scaling, synthetic long-running endpoint or extra deployment was introduced just to manufacture a cold sample. Neon-cold timing was also not established.
- **Real generation cannot be tested without the human's Builder account.** Human should refresh, Retry once in Settings/Agent, confirm connected readiness, generate angles, choose one and draft, then make a focused revision lasting beyond a checkpoint. Leave the tab open for supported client-driven resumption. Existing OAuth should remain connected; no reconnect should be necessary merely because the function moved. If it fails, capture UTC time and visible error so the next short-retention logs query can correlate it.

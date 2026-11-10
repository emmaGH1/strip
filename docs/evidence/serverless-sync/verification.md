# Live serverless sync — bounded browser verification

**2026-11-10, 05:28 UTC · target:** https://strip-kappa.vercel.app · headless local Chromium, 1440 × 900. One newly registered disposable account, no human account access. A separate Playwright HTTP request context, initialized from that account's in-memory browser session, issued the action; it did not use page UI mutation or in-page `callAction`. No model/provider connection or generation. The comic was the existing hand-authored illustrative Undo fixture, labelled illustrative/seeded.

## Deployment identity and landing

- The actual served `/assets/root-DzrRO24z.js` (SHA-256 `ee76648ba3a98b6f2fb38ae572af092f57921711953abe1bd911847e1478833d`) contains the `/home` sync configuration `interval:1e3,fallbackInterval:1e3` alongside the external MCP/other-tab realtime reason. This is direct evidence the intended values were served, not a guess based on deploy timing.
- Landing returned HTTP 200 and, in a separate anonymous browser context, the heading and illustrative four-panel art rendered after loading. Visually inspected [landing-settled.png](landing-settled.png). The first capture [landing.png](landing.png) was taken while the artwork still said loading, so it is not the settled-art proof.

## Library live update — PASS, one trial

- Library was visible at **05:28:05.954**; idle interval was **05:28:06.268–05:28:41.268**, 35 seconds without interaction. [library-before.png](library-before.png) shows the empty state.
- The independently authenticated `POST /_agent-native/actions/create-strip` began **05:28:41.269**, returned **HTTP 200** at **05:28:41.632** (363 ms), and returned a strip id and **revision 0**. The owned fixture was titled “Illustrative serverless sync verification.”
- The already-open Library displayed its title and rendered SVG thumbnail at **05:28:43.942**, **2,306 ms after the create response / 2,669 ms after request start**, with **zero document navigation requests** during that interval. [library-after.png](library-after.png) was visually inspected and shows the labelled illustrative/seeded Rev 0 item. This was not a reload or navigation to force a refresh.
- Browser `/_agent-native/poll` requests around the idle and write, all HTTP 200 (UTC, request start; event counts in parentheses): **05:28:09.940 (0), 12.160 (0), 18.139 (0), 26.332 (0), 31.539 (0), 36.746 (0), 42.606 (2), 44.138 (2)**. The 31.539 and 36.746 starts are approximately 5.2 seconds apart, consistent with idle backoff; the event-bearing 42.606 request followed the create. These are observed timings, not a universal latency guarantee. Full sanitized timestamps and response times are in [results.json](results.json).

## Studio and limits

After the Library pass, the script clicked the owned strip and the Studio comic SVG became visible. An automation wait for the exact first balloon text timed out after 15 seconds (the SVG lettering may be split into text runs; the cause was not established). The script exited and closed its ephemeral session before issuing an external Studio update, so **Studio live-update acceptance is untested**, not a product failure or a pass. No second account was created. The optional Studio screenshot was not reached.

The defensive browser route blocked **11 requests matching the agent-chat URL pattern**, including non-model endpoints potentially covered by that broad pattern; this count is not a count of model calls. No chat was submitted or provider connected. The browser and independent request context were closed and credentials existed only in process memory; the disposable account and its one illustrative strip remain server-side. No app edits, deploy, Docker restart, push or commit were performed. Results establish one visible, healthy, signed-in Library trial; hidden tabs, outages, broader concurrency, physical devices and real agent generation were not tested.

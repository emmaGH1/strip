# Capture status: blocked

No complete take is available. On the supplied account at `https://strip-kappa.vercel.app`, the Library showed the prepared illustrative example and no saved strips. Compose said: “No AI connected yet. Your request will open in the real agent composer.” Clicking **Find the joke** opened the agent sidebar with **Connect AI**, **Use Builder.io**, **Custom keys**, and the source request in the composer; it did not produce angle cards. After reload and a fresh browser session using the full login storage state, the same flow had the same result. Two Find the joke attempts, zero observed angle runs, drafts, or revisions. No account settings or existing strips were changed, and Builder.io was not disconnected. The cause of the connection-state discrepancy is unknown.

- `takeA-1-incomplete.mp4`: authentic partial Library → compose → source → setup-prefill capture, H.264/CRF 16, 30 fps, 1600×1000; includes waits. Not a completed walkthrough. It has a visible injected cursor.
- `shots/a1-01-library.png` through `a1-04-request.png`: actual 3200×2000 device-scale-2 stills for those steps.
- `timeline-a1-incomplete.json`: approximate event markers; the recording starts slightly before the marker clock, so verify timing against the video before editing.
- `STATUS.md`: handoff blocker.

No best take, generated punchline, final strip JSON, export, or Take B existed in that earlier attempt. Take B was not attempted then. The prepared example in the Library is explicitly illustrative, not AI-generated. Login occurred outside the recording. No credential, browser storage state, or temporary script was retained here.

## New capture — 2026-11-10

**TAKE A READY:** `takeA.mp4` is one uninterrupted real-app capture (1600×1000, H.264, CRF 16, 30 fps); `takeA.timeline.json` marks actions, real waits and holds. The app's connected agent actually generated three angles, drafted the selected first angle, and revised after Funnier. The person typed and protected a line, inked one revision, erased another, chose ending 03, opened History and downloaded `exported-strip.png` (1200×1200). `strip.json` is the final real `get-strip` result (revision 6); it was re-read after the MCP refusal. `shots/a-01-*` through `a-17-*` are 3200×2000 key-state captures. Screenshots are 2×; Playwright's full-size video recording is 1600×1000. The animated arrow is an injected cursor, not native video cursor.

**Final strip: The Reliable Bug** (fictional dialogue; source is the supplied /rename /crash release note):

- Panel 1, Jules: “That crash was my coffee break.” (human-written and MINE); Dev: “Finally, a rename that only renames.”
- Panel 2, Jules: “I booked breaks around the outage.”; Dev: “A renamed channel shouldn't explode.”
- Panel 3: wordless; screen says “Command /crash No response.”
- Panel 4, Jules: “The bug had better uptime than /crash.”; Dev: “At last, a promotion for the bug.”

**TAKE B is partial, with an important live-sync failure:** `takeB-library.mp4` records the already-open Library throughout one real Claude Code MCP creation of an explicitly illustrative Undo comic. `terminal.txt` / `terminal.json` capture timestamped model/tool output; times reset for the Studio part, as documented in `takeB.timeline.json`. The newly saved “Undo, Emboldened” **did not appear in that open Library without refresh** during the recording. A separate later fresh Library page did show it (`shots/b-05-library-fresh.png`) and direct Studio access worked. Do not portray the library footage as proof of live appearance. `takeB-studio.mp4` records the protected Take A strip during one real Claude Code MCP edit attempt; `refusal.txt` contains the actual `protected_element` error, and `shots/b-04-refusal.png` plus a subsequent action read show the MINE line and revision unchanged. The in-app live rejection notice was not observed. `shots/b-01-*` through `b-05-*` document before/after and the fresh page. `takeB.timeline.json` identifies which MP4 each timed segment belongs to.

**What went wrong / limits:** the real draft agent showed one failed internal action before successfully saving; a later Studio reload also displayed a time-limit warning for that run even though the saved draft and subsequent revision are real. The Funnier request changed other unprotected fields too, not just panel 2. The still-open Library did not update live, and the rejection notice was not seen live. Video includes long uncut waits/inspection holds; use the timeline for speed ramps rather than treating holds as generation time. Angle agent reported 11 seconds, draft reported about one minute, revision 25 seconds. This is a bounded capture, not proof of humour or general usability. No account or integration settings were changed, and no existing data was deleted. The earlier incomplete take remains as history.


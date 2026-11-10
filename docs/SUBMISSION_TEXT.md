# Strip — submission text (ready to paste; check each field against the form)

**Project name:** Strip

**One line:** Release notes nobody reads? Ship a strip. Turn one product update into a four-panel comic you make together with an agent.

**Live app:** https://strip-kappa.vercel.app
**Repository:** https://github.com/emmaGH1/strip
**Demo video (Clips, public):** <paste the public Clips link here>

**Description**
Strip is an Agent-Native comic studio for product updates. You paste what shipped; the agent pitches three comic angles, each with its own cast; you pick one and it drafts a four-panel strip. Agent work shows as a blue proposal until you ink it. Lines you write can be stamped MINE, and the app itself refuses any agent edit to them. You keep or erase each change, choose one of three endings and export a 1200×1200 PNG with a caption for your launch post.

**How it uses Agent-Native**
- One set of shared actions (create-strip, update-strip, propose-strip-angles, and so on) serves the UI, the in-app agent and external agents over MCP.
- The agent receives the current selection and revision as context, so "Funnier" applies to the panel you selected.
- Protection and stale-revision checks are enforced inside the actions, with the caller's identity taken from framework context.
- Live sync updates the Studio and Library when any surface changes a strip.
- History attributes every revision to you, the agent or an external agent, with restore.
- Verified with the real Claude Code CLI over OAuth-scoped MCP: it created a strip that appeared live in the Library, and was refused when it tried to change a MINE line.

**How to try it**
1. Open the live app and tap "Make a strip" to sign up (email and password, no confirmation email).
2. Open Agent → "Use Builder.io" to connect an AI engine.
3. New strip → paste an update → Find the joke → pick an angle → Draft.
The landing page's interactive pencil → MINE → revise demo works without an account.

**Pre-existing work and third-party assets**
See docs/SUBMISSION_DISCLOSURE.md in the repository. Everything, including the Agent-Native scaffold, was created during the event. Characters are Open Peeps (CC0); fonts are Bricolage Grotesque and Comic Neue (OFL).

**Team:** <your name, contact email, and any teammates>

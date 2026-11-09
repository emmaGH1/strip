<img src="public/logo.svg" width="253" height="95" alt="Strip">

# builderio hack

Created in [T3 Code](https://t3.codes).

## Strip

Strip is a studio for turning one product update into an editable four-panel comic for a launch post. You and an AI agent work on the same structured scene: rewrite a balloon, change an expression, and stamp a contribution MINE so the agent cannot overwrite it. Choose one of three endings and export a 1200×1200 PNG with a source-based post caption; prepared examples are explicitly illustrative, not generated results.

**Demo loop:** Paste what shipped → agent pencils a draft → edit and protect a line → ask for a focused revision → ink or erase changes → choose an ending → export PNG.

### Live demo

**[Open Strip →](https://strip-kappa.vercel.app)** — public Vercel deployment with persistent Neon Postgres. Sign up with your own account; prepared examples are illustrative. AI requires your own approved Builder.io/provider connection. See [`docs/DEPLOY.md`](docs/DEPLOY.md) for hosted verification and limits.

### Built on Agent-Native

The standalone Chat scaffold uses Agent-Native **0.226.0**, React Router, React, TypeScript and Tailwind, with the framework's real UI primitives and agent desk.

- **Shared actions:** the UI's action hooks, in-app agent and framework MCP use `list-strips`, `get-strip`, `create-strip` and `update-strip`. `set-strip-protection` is human-only, not an agent unlock tool. Structured scenes live in SQL; writes validate protection and atomically compare the expected revision.
- **Context awareness:** the screen and selected panel/balloon/character are registered with the framework; `view-screen` and `sendToAgentChat` provide bounded scene, selection, cast/source and revision context.
- **Live sync:** `/home` uses framework `useDbSync` and action-query invalidation so external MCP changes reach the open Library/Studio without a custom poller.
- **Attributed history:** SQL revision snapshots distinguish You, Agent and External agent from trusted caller context. Restoring appends a new revision and preserves current protection; older records have history only from their first retained save.
- **OAuth-scoped MCP:** the installed framework handles MCP OAuth, audience validation and `mcp:read`/`mcp:write` enforcement. Domain queries additionally scope every record to its owner and workspace.

Source: [`actions/`](actions), [`server/plugins/agent-chat.ts`](server/plugins/agent-chat.ts), [`server/lib/strip-store.ts`](server/lib/strip-store.ts), [`app/routes/home.tsx`](app/routes/home.tsx), [`app/root.tsx`](app/root.tsx) and [`shared/history.ts`](shared/history.ts). OAuth/scope enforcement is framework functionality, not a custom implementation.

**Verification boundary:** scripted MCP edits, protection/conflict checks, live sync and PNG export have been exercised. Real model-driven drafting/revision and the full AI demo remain blocked on an approved connected test account and bounded call authorization; no humour or physical-phone acceptance is claimed. See [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md).

### Run locally

Requires **Node ≥22.22.0** and **pnpm 10.29.1**.

```sh
pnpm install
pnpm dev
```

With no database override, development uses local PGlite in gitignored `data/`. If your private environment already sets `DATABASE_URL`, remove that override for a PGlite-only development run; never delete the database to switch modes. Create/sign in to your own local account.

For a production-mode local server, provision PostgreSQL and configure `DATABASE_URL` privately (not PGlite). Set a strong private `BETTER_AUTH_SECRET`, and set `APP_URL` and `BETTER_AUTH_URL` to the actual app origin for auth/provider callbacks. Keep these in an ignored `.env` or your secret manager; do not commit values.

```sh
pnpm install
pnpm migrate:production
pnpm build
pnpm start
```

Migration applies framework and app schemas to the configured database: use your own database and back up existing data first. Production mode requires PostgreSQL; it does not silently fall back to the development PGlite store. `/` is the public landing page; signed-in `/home` is the Library, `/home?new=1` is compose, and `/home?id=<id>` is Studio. The human-approved public deployment uses Vercel + Neon; see the Live demo above.

### Connect AI

Open the agent desk's **Connect AI → Use Builder.io** one-click connection, or visit **Settings → Agent → Model** (`/settings/model`) and add a provider key through the framework's secure settings. Select an available model and approve the intended account/workspace and any usage costs before sending. Without an engine the app preserves a setup prefill, not a fake response. No provider key is included in this repository; never paste keys into chat, docs or source.

### Connect Claude Code over MCP

Follow [`docs/MCP_DEMO.md`](docs/MCP_DEMO.md) for the OAuth connection and direct structured-comic workflow. Claude Code uses its own model connection; the external host's billing is separate from the app's AI setup.

### Licenses and credits

- **Agent-Native** by Builder.io: MIT, read from the installed `@agent-native/core/LICENSE` (copyright 2026 Builder.io, Inc.); the installed agentkit/toolkit/otel packages also declare MIT. The Chat scaffold predates Strip's domain work.
- **Open Peeps** by Pablo Stanley: [CC0 artwork](https://www.openpeeps.com/), used through **react-peeps** by Emre Çakır (MIT; [license](public/licenses/react-peeps-MIT.txt)). Local source-derived SVG variants, not AI-generated images.
- **Bricolage Grotesque** by the Bricolage Grotesque Project Authors: SIL OFL 1.1 ([license](public/licenses/Bricolage-Grotesque-OFL.txt)).
- **Comic Neue** by Craig Rozynski / the Comic Neue Project Authors: SIL OFL 1.1 ([license](public/licenses/Comic-Neue-OFL.txt)).
- **Inter** remains an installed scaffold font dependency, and the toolkit bundles **Geist** transitively: both OFL-1.1. **DM Sans** and **Bangers** were used in the proof and removed from current dependencies/imports; their [DM Sans](public/licenses/DM-Sans-OFL.txt) and [Bangers](public/licenses/Bangers-OFL.txt) OFL notices remain for provenance.
- Framework branding assets remain from the scaffold. The user-supplied header icon is preserved, not claimed as an original/approved Strip mark; its provenance/license has not been established.

See [`docs/ASSETS.md`](docs/ASSETS.md) and [`docs/SUBMISSION_DISCLOSURE.md`](docs/SUBMISSION_DISCLOSURE.md) for asset provenance, library licenses and the git-based event-work disclosure. Original Strip source is licensed under the [MIT License](LICENSE), copyright 2026 the Strip authors. Third-party assets and libraries retain their own licenses and notices.

### Submission preparation

Human checklist: [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md). Public recording, final claims and submission require human review and approval.

# Strip — submission disclosure

Prepared 2026-11-08 on `build/app`, from the repository through `f2acd1a`. This is a provenance statement, not a claim that the entry is submitted or that all acceptance tests passed. See [CURRENT_STATE.md](CURRENT_STATE.md) for evidence and [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) for remaining gates.

## Basis and timing

The submission window starts **October 27, 2026**. The available git history begins with **`0cddfb6`, November 8, 2026 at 11:19:09 +0000 (UTC)**, “Save existing Strip proof scaffold, actions, artwork and evidence.” All eleven implementation/review commits examined are dated November 8, 2026, within that window. The initial commit is a bulk save of an already-existing working tree, **not** the moment every included file was created.

Reviewed using:

```sh
git log --format='%h %ad %s' --date=iso
git log --reverse --format='%h' | xargs -n1 git show --stat --oneline
```

The timestamps below are git author dates, not independent proof of when work occurred. `docs/PROJECT.md` records a Strip proof start of 2026-11-08 09:53 UTC; git only establishes the first recorded save at 11:19:09 UTC. **Human statement (2026-11-08):** the Agent-Native scaffold instance and all Strip work were created on **2026-11-08, during the event, after brainstorming began that day**. `assets/icon.svg` was user-staged and is being replaced by a new mark made during the event; three path-only logo concepts are available for the human to choose from, not yet applied to the app. This is the human’s provenance statement, not a creation date independently established by the bulk-save commit. We do not claim that the upstream framework, its template or bundled libraries were authored for this event.

## Pre-existing material and reused foundation

- **Official Agent-Native standalone Chat scaffold**, pinned in `package.json` scaffold metadata to bundled `@agent-native/core@0.226.0`; agentkit and toolkit are also pinned to 0.226.0 (otel is 0.1.35). The initial save includes the scaffold shell, chat routes, auth/settings/provider setup, action infrastructure, framework UI re-exports, i18n, build/config files, documentation/skills and framework branding. These are a pre-existing template/framework foundation, not original Strip inventions. Installed Agent-Native packages declare MIT; the core license names Builder.io, Inc., copyright 2026.
- **User-staged `README.md` and `assets/icon.svg`** existed in the checkout before this documentation task and were deliberately excluded from prior task commits. The supplied logo image reference, `# builderio hack` heading and “Created in T3 Code” line are preserved above the new README content. The icon is not an approved Strip mark; its author, license and original creation date are unknown from available git history. Human confirmation is required before claiming redistribution rights.
- **Existing proof scaffold saved on November 8:** `0cddfb6` already contains Strip domain actions/model/store, examples, renderer, source-derived character art, tests, research and evidence, alongside the framework scaffold (209 files, 30,524 insertions). This proof predates the later `build/app` redesign, but its first recorded save is inside the event window. Its engine—structured data, shared actions, protection, atomic revision checks and export—was reused rather than represented as newly built in each later milestone.
- **Third-party art, fonts, icons and libraries** below predate the Strip work. Prepared stories are hand-authored illustrative fixtures, never evidence of real generation. Evidence images are app captures/exports, including those fixtures, not third-party stock photography or AI-generated images.

## What the event-dated commits changed

All times below are **2026-11-08 UTC**. Summaries are based on each commit's file statistics, not a reconstruction of unrecorded work.

| Commit    | Time     | Recorded work                                                                                                                                                                                                                            |
| --------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0cddfb6` | 11:19:09 | First bulk save: Chat scaffold plus Strip proof actions, structured scenes, SQL store, renderer/export, fixtures, art, tests, research and evidence. Framework vs original contributions are distinguished above.                        |
| `2afedd8` | 11:48:18 | Visible feature screen states, expression/pose staging and 50 local character combinations; Comic Neue dependency/license; real framework agent setup/handoff and updated proof tests/evidence.                                          |
| `5930118` | 14:31:37 | Editor readiness-copy correction, production save/protection/conflict/export evidence and limitations.                                                                                                                                   |
| `28acbeb` | 15:51:24 | Mobile inspector/layout/zoom changes, lucide dependency optimization, phone-access notes and evidence.                                                                                                                                   |
| `5f860da` | 16:30:33 | App build plan, binding paper/ink design direction and operating rules.                                                                                                                                                                  |
| `ca2bc0b` | 16:55:00 | Rebuilt landing poster and Studio, durable blue-pencil review, protection/revision integration, Bricolage font replacing DM Sans/Bangers, tests and documentation.                                                                       |
| `ebdbb8d` | 16:55:53 | Docker-hosted serving instructions.                                                                                                                                                                                                      |
| `2f14677` | 17:04:04 | Small mobile headline fix and design-probe browser/export evidence.                                                                                                                                                                      |
| `f658e00` | 17:24:21 | Library/list action, compose/cast handoff, Studio review desk, source coverage, endings and phone panel focus; tests and bounded browser evidence.                                                                                       |
| `8cb1a67` | 17:48:43 | Clean selection/compose context handoffs, framework live sync, direct MCP catalog/connection notes, trusted external-agent attribution, retained atomic revision history and protected restore; tests and scripted MCP/browser evidence. |
| `f2acd1a` | 18:14:29 | Conflict/rejection handling, real-thread correlation cleanup, export sheet/caption/filename, landing/empty-state/phone note polish; tests and evidence.                                                                                  |

This documentation task adds the README product/setup/credits, this disclosure, the submission checklist and a current-state verification note; it does not implement product features. T3 Code and AI coding assistants were used in the build and reviews, as recorded in project operating notes. No model-generated comic is claimed: existing evidence demonstrates illustrative fixtures and scripted transport tests, not genuine drafting/revision creativity. Real AI acceptance remains blocked on authorized provider access/calls.

## Asset inventory

| Material                                                     | Origin / use                                                                                                  | License and evidence                                                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open Peeps characters                                        | Pablo Stanley, [openpeeps.com](https://www.openpeeps.com/); source artwork used through react-peeps           | CC0 per published Open Peeps attribution/provenance in [ASSETS.md](ASSETS.md). No separate CC0 text is bundled here; react-peeps code has its own MIT license below. |
| react-peeps 0.1.10                                           | Emre Çakır; `scripts/build-peeps.tsx` derives local SVG variants, earlier variants retained for compatibility | MIT, [`public/licenses/react-peeps-MIT.txt`](../public/licenses/react-peeps-MIT.txt).                                                                                |
| Bricolage Grotesque                                          | Bricolage Grotesque Project Authors / atelier triay; current UI/display/illustrated UI font                   | SIL OFL 1.1, [`Bricolage-Grotesque-OFL.txt`](../public/licenses/Bricolage-Grotesque-OFL.txt).                                                                        |
| Comic Neue                                                   | Craig Rozynski / Comic Neue Project Authors; current balloon lettering                                        | SIL OFL 1.1, [`Comic-Neue-OFL.txt`](../public/licenses/Comic-Neue-OFL.txt).                                                                                          |
| Inter                                                        | Installed `@fontsource-variable/inter` scaffold font dependency; not the current Strip design font            | OFL-1.1 per installed package/license.                                                                                                                               |
| DM Sans                                                      | DM Sans Project Authors; historical proof UI font, removed from current dependencies/imports                  | SIL OFL 1.1, [`DM-Sans-OFL.txt`](../public/licenses/DM-Sans-OFL.txt), retained for provenance.                                                                       |
| Bangers                                                      | Bangers Project Authors; historical proof title font, removed from current dependencies/imports               | SIL OFL 1.1, [`Bangers-OFL.txt`](../public/licenses/Bangers-OFL.txt), retained for provenance.                                                                       |
| Lucide icons                                                 | Current Strip controls via lucide-react                                                                       | ISC per installed package metadata.                                                                                                                                  |
| Tabler icons                                                 | Installed scaffold dependency `@tabler/icons-react`                                                           | MIT per installed package metadata.                                                                                                                                  |
| Agent-Native icons/logos and scaffold favicon/manifest icons | Retained scaffold public assets; not newly designed Strip branding                                            | Framework core is MIT; no separate trademark grant or per-logo license was established. Do not imply endorsement.                                                    |
| User-supplied `assets/icon.svg`                              | Preserved staged asset referenced by original README header                                                   | Unknown provenance/license; human confirmation needed.                                                                                                               |

**Additional bundled scaffold font:** Geist by the Geist Project Authors is supplied transitively by `@agent-native/toolkit` through `@fontsource-variable/geist@5.3.0` and appears in the production build. Its installed `LICENSE` is SIL OFL 1.1 (copyright 2024 The Geist Project Authors); it is not an original Strip asset.

Simple scene props and prepared illustrative stories are Strip-authored SVG/data in `shared/render-strip.ts` and `shared/examples.ts`. No remote image service or generated-image model supplies comic artwork. Original Strip source is licensed under the [MIT License](../LICENSE), copyright 2026 the Strip authors; third-party assets and dependencies retain their own licenses. The new `assets/brand/concept-{a,b,c}/` logo proposals were made during the event from bundled Bricolage Grotesque 800 (OFL), with original stamp/pencil/gutter details and font outlines converted to SVG paths. They do not replace the user-staged icon until the human selects a mark.

## Direct library inventory

Every direct dependency/devDependency named in the current `package.json` is listed below. Licenses were read from the installed package metadata; Agent-Native core's full MIT text and the five bundled `public/licenses/` notices were also read. Exact resolved versions and transitive dependencies are recorded in `pnpm-lock.yaml`; package presence does not mean every runtime integration was exercised. This is not an exhaustive legal audit of all transitive packages or their embedded notices. Preserve upstream license files when distributing.

### Runtime dependencies

| Library                         | License    |
| ------------------------------- | ---------- |
| @agent-native/agentkit          | MIT        |
| @agent-native/core              | MIT        |
| @agent-native/otel              | MIT        |
| @agent-native/toolkit           | MIT        |
| @ai-sdk/anthropic               | Apache-2.0 |
| @ai-sdk/cohere                  | Apache-2.0 |
| @ai-sdk/google                  | Apache-2.0 |
| @ai-sdk/groq                    | Apache-2.0 |
| @ai-sdk/mistral                 | Apache-2.0 |
| @ai-sdk/openai                  | Apache-2.0 |
| @electric-sql/pglite            | Apache-2.0 |
| @fontsource-variable/inter      | OFL-1.1    |
| @fontsource/bricolage-grotesque | OFL-1.1    |
| @fontsource/comic-neue          | OFL-1.1    |
| @openrouter/ai-sdk-provider     | Apache-2.0 |
| @react-router/dev               | MIT        |
| @react-router/fs-routes         | MIT        |
| @tabler/icons-react             | MIT        |
| @tanstack/react-query           | MIT        |
| ai                              | Apache-2.0 |
| ai-sdk-ollama                   | MIT        |
| drizzle-orm                     | Apache-2.0 |
| h3                              | MIT        |
| isbot                           | Unlicense  |
| lucide-react                    | ISC        |
| node-pty                        | MIT        |
| postgres                        | Unlicense  |
| react                           | MIT        |
| react-dom                       | MIT        |
| react-router                    | MIT        |
| use-sync-external-store         | MIT        |
| vite                            | MIT        |
| zod                             | MIT        |
| zustand                         | MIT        |

### Development/build dependencies (including scaffold UI primitives)

| Library                                | License    |
| -------------------------------------- | ---------- |
| @playwright/test                       | Apache-2.0 |
| @radix-ui/react-accordion              | MIT        |
| @radix-ui/react-alert-dialog           | MIT        |
| @radix-ui/react-aspect-ratio           | MIT        |
| @radix-ui/react-avatar                 | MIT        |
| @radix-ui/react-checkbox               | MIT        |
| @radix-ui/react-collapsible            | MIT        |
| @radix-ui/react-context-menu           | MIT        |
| @radix-ui/react-dialog                 | MIT        |
| @radix-ui/react-dropdown-menu          | MIT        |
| @radix-ui/react-hover-card             | MIT        |
| @radix-ui/react-label                  | MIT        |
| @radix-ui/react-menubar                | MIT        |
| @radix-ui/react-navigation-menu        | MIT        |
| @radix-ui/react-popover                | MIT        |
| @radix-ui/react-progress               | MIT        |
| @radix-ui/react-radio-group            | MIT        |
| @radix-ui/react-scroll-area            | MIT        |
| @radix-ui/react-select                 | MIT        |
| @radix-ui/react-separator              | MIT        |
| @radix-ui/react-slider                 | MIT        |
| @radix-ui/react-slot                   | MIT        |
| @radix-ui/react-switch                 | MIT        |
| @radix-ui/react-tabs                   | MIT        |
| @radix-ui/react-toast                  | MIT        |
| @radix-ui/react-toggle                 | MIT        |
| @radix-ui/react-toggle-group           | MIT        |
| @radix-ui/react-tooltip                | MIT        |
| @tailwindcss/typography                | MIT        |
| @tailwindcss/vite                      | MIT        |
| @types/node                            | MIT        |
| @types/react                           | MIT        |
| @types/react-dom                       | MIT        |
| @xterm/addon-fit                       | MIT        |
| @xterm/addon-web-links                 | MIT        |
| @xterm/xterm                           | MIT        |
| class-variance-authority               | Apache-2.0 |
| clsx                                   | MIT        |
| cmdk                                   | MIT        |
| embla-carousel-react                   | MIT        |
| happy-dom                              | MIT        |
| input-otp                              | MIT        |
| next-themes                            | MIT        |
| oxfmt                                  | MIT        |
| react-day-picker                       | MIT        |
| react-hook-form                        | MIT        |
| react-peeps                            | MIT        |
| react-resizable-panels                 | MIT        |
| sonner                                 | MIT        |
| tailwind-merge                         | MIT        |
| tailwindcss                            | MIT        |
| tsx                                    | MIT        |
| typescript-7 (npm alias of typescript) | Apache-2.0 |
| vaul                                   | MIT        |
| vitest                                 | MIT        |

## Uncertainties requiring human review

- Git starts with a bulk save; it cannot independently date template instantiation, original research, the supplied icon/README, or every individual file. The human’s explicit November 8 event-day creation statement is recorded above; within-window commit dates corroborate saved work but do not independently date each file.
- The supplied icon's redistribution rights and any separate branding/trademark permissions are not established. The human requested its replacement by a new event-made mark. The MIT root license does not imply rights to third-party trademarks or alter third-party asset licenses.
- Official requirements are summarized in [JUDGING.md](JUDGING.md) and research in [IDEATION.md](IDEATION.md); section 14 is the agreed proof scope, not a verbatim official rules copy. Recheck the [official rules](https://www.builder.io/hackathon/rules) before submitting; no eligibility ruling is implied here.
- No genuine model-driven draft/revision or Claude Code model session has been verified. Do not turn scripted fixture evidence into generation claims or imply that technical tests prove humour/usability.

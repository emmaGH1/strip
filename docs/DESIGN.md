# Strip — design direction v1 (owner: Claude Opus, delegated by the human 2026-11-08)

The proof UI was a 3-hour feasibility test, not a design. This document replaces it. The engine stays (data model, shared actions, protection, compare-and-swap revisions, PNG export). Every surface people see is redesigned.

## 1. Profile

- **Product:** a web studio where a person and an agent co-make a 4-panel comic from one product update, for a launch post. Desktop first for the demo; must work well on a phone.
- **Feeling:** "a comics studio desk": playful but controlled, tactile, confident. Ink on paper, not glass and gradients.
- **Density:** medium. The comic is always the hero and the controls stay out of its way.
- **Must not feel like:** an AI chat app with a picture attached, a kids' comic maker, a dark neon dev tool, or a generic SaaS template.

## 2. Signature motif: pencils vs inks

This comes from real comics production: an artist **pencils** in non-photo blue, then the inker commits in black. Our mapping:

- **Agent = blue pencil.** Anything the agent proposed or changed renders with a blue-pencil treatment (blue `#3B6FD8` sketch outline, slight hand-drawn dash, a small ✎ mark).
- **Human = ink.** Anything the person wrote or confirmed is solid black ink.
- **Protected = a red "MINE" stamp.** A small rotated stamp on the protected element, the agent cannot touch it, and it's enforced in code.
- **Agent working = panel being pencilled.** While a request runs, the target panel(s) show blue sketch lines over a light halftone fill. This is real state, not decoration: it shows only while a real agent request is in flight.
- **Review = "ink it or erase it."** After an agent revision, each changed item keeps its blue-pencil look with two small actions, **Ink** (accept) and **Erase** (revert to before). Once inked, it turns black.

Attribution data already exists (`lastEditedBy`, actor from framework context). The motif simply shows it.

## 3. Visual system

- **Palette (tokens):**
  - paper `#F4EFE6`; paper-2 `#EAE3D6`;
  - ink `#1A1714`;
  - signal red `#D2432F` (primary action, MINE stamp);
  - pencil blue `#3B6FD8` (agent);
  - butter `#E7B85A` (feature moments, highlights);
  - muted `#6E665C`.
  - No gradients. Shadows are hard, offset print shadows only (`3px 3px 0 ink`) on primary interactive surfaces.
- **Type, two families plus lettering:**
  - UI and display: **Bricolage Grotesque** (OFL, @fontsource). Display uses tight tracking and heavy weight.
  - Comic lettering: **Comic Neue Bold**, inside balloons and artwork only.
  - Drop Bangers and DM Sans.
- **Scale:** 12/14/16/20/28/44/72. Spacing on a 4px base. Radius 4px on controls; panels and balloons follow comic geometry.
- **Lines:** 2px ink borders on panels and primary surfaces; 1px muted rules elsewhere. Not everything gets a card.
- **Icons:** lucide at 1.75 stroke, no rounded-square icon tiles.

## 4. Surfaces (build in this order)

### A. Landing / entry (the poster)

- Left: the headline ("Release notes nobody reads? **Ship a strip.**"), one line of support copy, and a primary CTA, **Make a strip**.
- Right: a **real rendered strip** in a mixed state: one panel still in blue pencil, one balloon with a MINE stamp. That is the product promise at a glance.
- Below, a single row explaining the loop: _Paste an update → the agent pencils it → you ink it._
- Nothing else. It must pass the X-screenshot test.

### B. Studio (the main workspace)

- **Center: the page.** The strip on an artboard, large. Selection happens directly on the canvas (balloon, character or panel).
- **Floating context bar** above the selection, with the most common actions:
  - **Edit** (inline text editing in the balloon);
  - **Face** (expression picker);
  - **Pose**;
  - **Protect / Unprotect** (MINE);
  - **Ask agent**: opens an inline prompt anchored to the selection, with quick chips (_Funnier · Shorter · More innocent · Show the feature_) plus free text. It sends through the real agent with the selection and revision context.
- **Left rail, "Script":** the source update (the facts), a claims list showing which panel covers which fact, and the cast (2–3 characters with a name and trait).
- **Right: the agent's desk.** The real Agent-Native sidebar, restyled to the palette. It shows the conversation, plus a compact log of what the agent changed (each entry links to the element).
- **Endings tray (after a draft):** three alternative panel-4 thumbnails side by side. Tap one to swap it in.
- **Top bar:** strip title (editable), Export (PNG + "post caption" copy), library link.
- **Phone:** the strip on top, a bottom sheet with tabs **Edit · Agent · Script**, and the context bar as a bottom action row.

### C. Library (later, M2)

A grid of saved strips as small comic thumbnails, with "New strip".

## 5. States to design for real

- empty (no strip yet);
- drafting (panels pencil in as the agent's draft lands; no fake streaming);
- agent revising (target panel pencilled);
- review (blue items with Ink / Erase);
- conflict (a stale write: a calm notice, "Someone changed this, reloaded", with the latest state shown);
- protected-rejection (the agent tried to change MINE: show the item untouched plus a small note in the agent log);
- no AI connected (honest setup prompt);
- export.

## 6. Anti-slop checks

No gradient, glow, glass, fake status dots, fake metrics, emoji icons or endless cards. Every color has a role: red = act / mine, blue = agent, butter = feature.

## 7. Gate

The design probe (A + B at desktop and phone) is reviewed by Claude Opus. The human is shown the screenshots but is not blocked on them. Assets stay licensed and bundled: Open Peeps CC0, OFL fonts.

## 8. Final logo — human-selected upright Balloon / cut

- **Decision:** round-3 V2 is the basis, redrawn upright with **no diamond**. The custom S **replaces the first letter** of `Strip.`; it is never a separate symbol beside a complete typeset name.
- **Construction:** hand-drawn closed, filled S path; broad rounded balloon upper sweep and a flat lower return with a sharp diagonal guillotine terminal. No rotation transform, outline, filter or generated image. In a 100-unit Bricolage em its cap overshoot is y=12.6, baseline=80, lower overshoot=81.4; optical ribbon thickness is approximately 13–16 units, matching the 800-weight stems. The t starts at x=64 for a deliberately tuned S–t gap. The S shares the word's baseline and cap zone rather than being fitted to its full i-tittle / p-descender box.
- **Typeface:** bundled **Bricolage Grotesque 800**, OFL, `@fontsource/bricolage-grotesque` 5.3.0. `trip` and the full stop are converted to paths, with −0.028 em tracking after the optical S–t pair. The wordmark SVG viewBox is `2 3 253 95`; separate `data-part` paths retain the custom S, each trailing glyph, and period for a future reveal.
- **Colors:** ink `#1A1714` on paper `#F4EFE6`; reversed lettering uses paper on ink. The trailing **signal-red `#D2432F` full stop is retained**: it reads as punctuation at header sizes, balances the cut terminal and gives one restrained accent without reviving the diamond. No additional logo colors.
- **Compact mark:** only the same upright custom S, centered in an 80×80 transparent canvas. Favicon uses a paper field and larger optical occupancy for native 16px readability. App tiles use paper and 12.5% padding; do not stretch or rotate. Reversed standalone mark is also provided. Keep clear space of at least one stem thickness around the lettering.
- **Exports:** `public/logo.svg`, `logo-reversed.svg`, `logo-mark.svg`, `logo-mark-reversed.svg`, `favicon.svg`, multi-size `favicon.ico` (16/32/48), `icon.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180), and `og.png` (1200×630). Legacy `icon-{180,192,512}.svg` URLs also resolve to the new app mark so framework-owned auth never inherits the old scaffold icon. `public/manifest.json` references the PNG icons. The OG uses a crop of the retained real shared-renderer illustrative Undo export (`docs/evidence/proof/strip-comic.png`), clearly labelled fictional/illustrative; it is not new AI output.
- **Reproduction / review:** `node scripts/build-brand-final.mjs` (temporary tooling instructions in script; no app dependency change). `docs/evidence/brand/logo-final.{svg,png}` shows native 24/32/64px wordmarks, large lettering, native 16/32/64px marks, paper/ink and the 512px tile. Reviewed at actual sizes; the S is integrated into the word, not pasted alongside it.
- **Rollout:** landing header/footer, compose, Library and Studio top bars share `/logo.svg` with `alt="Strip"`. Sign-in is a framework-owned document, not an app-owned logo surface; its favicon and legacy touch-icon URLs use the new assets without forking authentication. The user-staged `assets/icon.svg` is preserved, unused by the app or README header. App social metadata uses the absolute public `/og.png` URL resolved from `APP_URL` (request origin fallback).

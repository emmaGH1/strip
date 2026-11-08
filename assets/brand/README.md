# Strip — logo options, not a selected identity

Created during the event on 2026-11-08. The human chooses before any favicon, app branding or export set changes. `assets/icon.svg` is preserved unchanged.

All wordmarks use **Bricolage Grotesque 800** with **−0.028 em tracking**: heavy enough to hold the ink/pencil contrast, with close but unjoined letters. Letters are converted from the bundled OFL font to separate SVG paths; no installed font is required to display the SVGs. Palette is limited to DESIGN.md tokens, at most two colors per concept. No generated images or AI image service.

- **A — The MINE tittle:** a tilted signal-red square replaces the i’s dot, borrowing the MINE stamp’s claim of authorship. Compact mark: S plus the same square.
- **B — Mid-inking:** the S moves from solid ink into a dashed pencil-blue outline, making review part of the name. Compact mark: the same S, with optically strengthened pencil strokes.
- **C — The panel cut:** a narrow diagonal comic-panel gutter cuts through the S. Compact mark: the same S with a wider gutter for small-size clarity; one color only.

Each `concept-{a,b,c}/` has `logo.svg` and `logo-mark.svg`. Compact marks are optically enlarged within their viewBox; A’s stamp, B’s stroke/dash spacing and C’s gutter are strengthened for native 16px rendering rather than merely shrinking the wordmark letter. Individual glyph/detail groups remain separately addressable for future motion; no animation or final identity is applied.

## Review

`docs/evidence/brand/logo-review.png` is one review sheet on paper, on ink, in one-color black and in one-color white. Marks are at native 16/64/512 CSS pixels. Wordmarks are at 16/64px high and 512px wide. Dark/monochrome recoloring is done only in the sheet, not by adding colors to the source concepts.

**Small-size review limit:** after the optical pass, Terra’s native-16px inspection still finds A’s accent tiny, B’s dashed detail difficult to resolve, and C’s gutter subtle. The S silhouettes and the 64/512px concepts are shown for comparison; no claim that every motif detail survives favicon size is made. B is the weakest small-size option. These are proposals for a human choice, not an approved favicon set.

The source sheet is `docs/evidence/brand/logo-review.html`. Rebuild path-only sources and the HTML with:

```sh
npm install --prefix /tmp/strip-brand-tools opentype.js@1.3.4 --no-audit --no-fund
node scripts/build-brand.mjs
```

The temporary tooling install does not change project dependencies or the app bundle. SVG construction and motif edits are hand-authored in `scripts/build-brand.mjs`; opentype.js only converts the bundled font’s outlines into paths. The Bricolage font license remains at `public/licenses/Bricolage-Grotesque-OFL.txt`. Original project work is MIT; upstream font software remains OFL.

# Strip — round three / balloon, panel, MINE

**Review options only. Recommend V1; the human chooses before anything is used in the app.** No favicon, header, application source, previous brand round or user-staged icon was changed.

| Variant                 | Construction                                                                                                                                 | Judgment                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **V1 — Balloon / fold** | An open balloon return meets a square-ended, folded comic panel on a 45° axis. Its tail curls into the join below the detached MINE diamond. | **Recommended:** the clearest balance of soft ink and hard paper; the folded lower return preserves the second S counter. |
| **V2 — Balloon / cut**  | A wider upper sweep joins a guillotined lower panel. The cut becomes a sharp right-hand stance rather than V1’s square-ended return.         | Fastest and most directional; also the most arrow-like and the least letter-like.                                         |
| **V3 — Balloon / tuck** | A shorter upper lip and deeper, rounder balloon tuck into a shorter folded panel, with a wider lower gutter.                                 | More compact and soft-sided; less forward reach than V1.                                                                  |

Each variant contains `mark.svg` and `lockup.svg`. The marks are deliberately abstract before they resolve as a turned S. This is a construction/proportion family, not three unrelated visual systems.

## Geometry and typography

- Hand-authored filled contours; no generated image service, stock logo, traced reference contour, stroke, outline, filter, mask or live font.
- The source geometry starts on an orthogonal panel grid and is rotated **exactly −45°**, then baked into path coordinates. There is no simulated italic/shear. V1’s principal panel and return weight is 26 construction units, with a 10-unit lower gutter; V3’s lower gutter is 13 units. Curves receive optical compensation rather than a mechanically uniform stroke.
- Each mark has **two independently addressable paths**, `balloon-panel` and `mine-diamond`. The concave curled join is drawn into the body rather than added as a hairline or a separate decoration. The small accent is an exact square turned 45°, 22 units across, separated from the body.
- Palette: body **ink `#1A1714`**, diamond **signal red `#D2432F`**. The red is the human’s MINE claim, not a decorative third actor. Backgrounds are presentation only: **paper `#F4EFE6`**, **soft peach `#FAE5D8`**. The ink-ground review reverses the body to paper and retains the red; monochrome samples genuinely use only black or white.
- Lockups use the bundled **Bricolage Grotesque 800 Latin WOFF**, font kerning plus **−0.028 em tracking**, converted directly to separate letter paths. Seven paths total: two symbol parts and five letters. The cap S is optically aligned to the symbol body, not its detached stamp. Typeface license: `public/licenses/Bricolage-Grotesque-OFL.txt`.

## Reference: qualities, not contour

The human-supplied Pinterest JPEG was opened and studied for weight, movement, rounded/straight contrast, a crafted flick and a detached diamond. Its creator is unknown. The original JPEG is **not** copied into the asset set. A thresholded **raster** silhouette appears only in the requested review comparison; it is not converted to SVG or used to generate any body coordinates.

The material departures are visible:

1. **Two open, rising counters instead of a solid horizontal middle.** The balloon turns around a visible diagonal interior channel.
2. **The whole construction runs uphill at 45°.** The reference’s large middle run is horizontal; only its lower exit is diagonal.
3. **A hard folded/cut panel return, not the reference’s large convex right-hand turn.** V1/V3 retain a second negative-space gutter; V2 terminates in a guillotine cut.
4. **The curled tail moves to the join under the accent.** It is not the reference’s upper-left flick.
5. **A substantially smaller, right-offset red stamp**, rather than a large centrally placed black diamond.

The sheet includes the reference and all three black silhouettes side by side, plus one same-size overlay per variant (reference gray, original red). Each full mark is independently tight-trimmed, centered and contained in the **same 176px square**; no rotation or alignment optimization is applied. The overlapping silhouettes do not nearly match: the interior channels, lobe profile, panel corners, terminals and accent placement visibly diverge.

`comparison.json` also records descriptive alpha-mask intersection-over-union: full marks V1 **0.457**, V2 **0.364**, V3 **0.414**; bodies alone **0.485**, **0.425**, **0.466**. Body-only comparison flood-fills the reference’s connected body to exclude its detached diamond. These numbers depend on normalization and are **not an originality score, trademark search or legal clearance**. Human approval and any later rights review remain separate gates.

## Review sheet and refinement

`docs/evidence/brand/logo-review-round3.png` — **2240 × 3240 PNG**, directly rasterized from vectors. Every row has:

- literal **512 × 512 paper and peach app tiles**, each containing a 400px mark;
- **native 16 / 32 / 64px** marks on paper and ink, not enlarged favicon proxies;
- a larger reversed mark and lockup on ink;
- black-only and white-only treatments;
- header lockups at 64px and an actual 32px-high header scale;
- the shared reference/variant silhouette and overlay panel at the bottom.

The sheet, a native-pixel detail crop and the V1 lockup were opened and visually inspected. Early studies with a single continuous hook read as J/comet forms rather than S; these were rejected. The chosen family adds the second panel return. Another study had a competing internal cut and a triangular cap; it was rejected in favor of V1’s squared panel. The final optical pass widened the lower gutters, shortened V3’s upper lip, and drew a distinct concave tail below the stamp.

**Small-size limit:** the body, lower gutter and detached accent remain distinct in the inspected native renders. At 16px the red diamond is roughly two pixels across and the little concave tail is not reliably readable as a separate craft detail; that detail belongs to 32/64px and larger uses. V2 reads most like an arrow, and the S in all three is intentionally secondary. This is a visual assessment, not a user recognition test or favicon approval.

## Reproduce and verify

From the repository root, using the already available temporary tools (no application dependency changes):

```sh
node assets/brand/round3/build.mjs /path/to/human-reference.jpg /tmp/strip-brand-tools
```

The temporary tool directory needs `opentype.js@1.3.4` and `sharp@0.34.5`. The generator outlines both the lockups and sheet labels, writes the six SVGs, produces the review PNG, and calculates the bounded silhouette comparison. No browser, server, credentials, provider connection or paid call is needed for rendering.

Verification completed:

- All six SVGs parsed as XML; each mark has two paths, each lockup seven. No live text, image, script, filter, mask, clipping, use, stroke or out-of-palette fill appears in the delivered SVGs.
- **56 domain tests**, typecheck, changed-file formatter and framework doctor (**clean**) pass. Production build passes with inherited vendor/barrel/chunk, directive, code-splitting debug-name and route-preMerge warnings. No standalone lint script exists. These app checks do not establish logo quality.
- The existing `strip-app` container was restarted after the required build, per project serving instructions. No new deployment, public port, provider call, push or submission. No app identity was changed.
- Shared `docs/CURRENT_STATE.md`, other lanes’ work, staged `assets/icon.svg` and untracked `.env.example` were preserved and excluded. This lane’s evidence lives here to avoid changing the shared state file.

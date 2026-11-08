# Strip — round two / original S monograms

Review options only. **Human selection is required** before any favicon, header, app icon or other product identity changes. Previous concepts and the user-staged icon are untouched.

| Concept              | Product idea                                                                                    | Construction                                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — The strip ribbon | One folded paper ribbon becomes an S; the separate diamond claims the human’s ink.              | One continuous silhouette, six-unit ribbon runs, two 45° fold returns, squared terminal ends. All ink.                                                                             |
| 2 — The panel S      | Two offset comic-panel blocks form an S, with diagonal-cut terminals and a red MINE diamond.    | Square panel corners, six-unit beams, three-unit gutters, four-unit block offset, exact 45° terminal cuts. The overlapping panel construction is merged into one clean silhouette. |
| 3 — The balloon S    | A continuous ink S ends in a clipped speech tail; the diamond keeps the human’s claim separate. | Concentric 7.5 / 1.5-unit loop radii maintain six-unit ink width; a three-by-three, 45° terminal tail. All ink.                                                                    |

## Files and typography

- Each `concept-{1,2,3}/` contains `mark.svg` and `lockup.svg`.
- Marks use a 36 × 36 construction grid. The detached diamond is six units across and six units high, with exact 45° edges. The accent stays separate at 16px; no literal MINE lettering is attempted at that scale.
- Every SVG contains paths, not live text, font references, raster images, filters or masks. Mark parts are separately named `s` and `mine-diamond` for future motion use.
- Lockups use the installed **Bricolage Grotesque 800**, outlined directly from the bundled Latin WOFF, with −0.028 em tracking. The wordmark’s cap S aligns to the monogram body, not its floating stamp; letters remain separate named paths. Typeface license: `public/licenses/Bricolage-Grotesque-OFL.txt`.
- Colors: ink `#1A1714`, signal red `#D2432F` (concept 2 accent only); backgrounds in the review sheet use paper `#F4EFE6` and ink. Inverted ink-ground versions use paper for the body; black/white samples are genuinely single-color.

## Review sheet and critical pass

`docs/evidence/brand/logo-review-round2.png` is a **1936 × 2456 PNG**, rendered directly from vector construction. Each row includes native 16 / 32 / 64 / 256px marks on both paper and ink, black-only and white-only samples, 32px-high header lockups, and a literal 512 × 512px paper app-icon tile. Tile mockups contain a 320px mark; backgrounds and tile outlines are not part of the SVG marks.

The sheet and separate native-size crops were opened and inspected. Initial panel geometry used an internal diagonal gutter across the S’s middle bar: that competing countershape read as a Z. A second counter-directional split remained too ambiguous. The final panel option preserves the middle ink bridge and moves the diagonal cut to the terminals, making the silhouette read as an S before any detail is noticed. This is a deliberate refinement within the requested two-offset-panels / diagonal-cut direction.

The ribbon and balloon options retain recognizable S silhouettes at native 16px on both grounds. The panel option is deliberately squarer and more abstract; the single-color silhouette remains the identifier when the tiny red accent loses chroma. The speech tail is subordinate at favicon size. These are visual assessments, not a human recognition or usability test; no final selection or trademark clearance is claimed.

The supplied Pinterest image was studied for weight, flat construction, negative space and the detached accent only. Its contour, proportions, curved-loop/diagonal arrangement and actual artwork were not traced, embedded or redistributed. These symbols were hand-constructed as complete S silhouettes, independently of the reference’s contour. No generated images, stock logos, gradients, generic chat-bubble enclosure, AI motifs or additional colors were used.

## Reproduction and checks

From the repository root:

```sh
npm install --prefix /tmp/strip-brand-tools opentype.js@1.3.4 sharp@0.34.5
node scripts/build-brand-round2.mjs /tmp/strip-brand-tools
```

The temporary tools do not alter application dependencies. The script regenerates the six SVGs and the one review PNG; the review labels are also outlined. No browser, server, provider, credentials or image-generation service is needed.

Verification: six SVGs parsed successfully as XML; each mark has exactly two paths, each lockup seven; no live text / image / use / script elements or out-of-palette fills. The PNG was inspected after geometry refinement. Repository checks passed: 56 domain tests, typecheck, framework doctor (clean), production build and changed-file formatter. Existing bundler/barrel/chunk warnings remain. These checks do not establish design quality. No app route, header or favicon was changed. After the successful build, the existing `strip-app` container was restarted as required by the project instructions; no new deployment, push or submission was performed. Shared `docs/CURRENT_STATE.md` and other lanes’ files were deliberately left untouched; this file records this lane’s evidence and rejected geometry.

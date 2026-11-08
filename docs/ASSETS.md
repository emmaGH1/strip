# Proof asset provenance

No image generation or remote asset dependency is used in the proof canvas.

- Character artwork: Open Peeps by Pablo Stanley, through `react-peeps@0.1.10` by Emre Çakır. The package declares MIT. Its complete license is copied to `public/licenses/react-peeps-MIT.txt`. Open Peeps is credited in the UI; earlier research records its CC0 availability. Source: https://www.openpeeps.com/ and https://github.com/CeamKrier/react-peeps .
- `scripts/build-peeps.tsx` builds ten local SVG variants, two fictional characters × five expressions. Hair and clothing remain stable per character; only the face changes. Rebuild with `pnpm art:build`. These are source-derived static assets, not generated AI imagery.
- DM Sans and Bangers are bundled through Fontsource. Their SIL Open Font Licenses are copied to `public/licenses/`. DM Sans is used for controls/dialogue; Bangers is provisional comic lettering, not an approved logo.
- Props are original simple SVG shapes in `shared/render-strip.ts`.
- Prepared stories in `shared/examples.ts` are hand-authored illustrative fixtures. They are not actual releases or evidence of model generation.
- Existing user-staged `assets/icon.svg` is untouched and is not claimed as an approved Strip logo.

The renderer accepts structured scene data, not arbitrary model-supplied markup or asset URLs. Local SVG/font assets are embedded in the export SVG before PNG encoding. Selection/protection editor marks are intentionally excluded from exported artwork.

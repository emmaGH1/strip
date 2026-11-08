# Proof asset provenance

No image generation or remote asset dependency is used in the proof canvas.

- Character artwork: Open Peeps by Pablo Stanley, through `react-peeps@0.1.10` by Emre Çakır. The package declares MIT. Its complete license is copied to `public/licenses/react-peeps-MIT.txt`. Open Peeps is credited in the UI; earlier research records its CC0 availability. Source: https://www.openpeeps.com/ and https://github.com/CeamKrier/react-peeps .
- `scripts/build-peeps.tsx` builds 50 local SVG variants: two fictional characters × five expressions × five structured poses. Hair stays stable; bodies use the actual Open Peeps ShirtBW, PointingFingerBW, RoboDanceBW, EasingBW and CrossedArmsBW parts. Rebuild with `pnpm art:build`. These are source-derived static assets, not generated AI imagery. The ten earlier assets remain for compatibility/provenance.
- DM Sans remains the app UI and on-screen product UI font; Bangers remains the title font, not an approved logo. Their SIL Open Font Licenses are copied to `public/licenses/`.
- Balloon lettering only: **Comic Neue Bold**, designed by Craig Rozynski, locally installed as `@fontsource/comic-neue@5.3.0` (https://fontsource.org/fonts/comic-neue). SIL Open Font License 1.1 copied verbatim from the package to `public/licenses/Comic-Neue-OFL.txt`. The browser text measurement loads this same 700-weight font; the export embeds the same local WOFF2. No remote font requests.
- Props are original simple SVG shapes in `shared/render-strip.ts`.
- Prepared stories in `shared/examples.ts` are hand-authored illustrative fixtures. They are not actual releases or evidence of model generation.
- Existing user-staged `assets/icon.svg` is untouched and is not claimed as an approved Strip logo.

The renderer accepts structured scene data, not arbitrary model-supplied markup or asset URLs. Local SVG/font assets are embedded in the export SVG before PNG encoding. Selection/protection editor marks are intentionally excluded from exported artwork.

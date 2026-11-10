// Renders the hand-authored ILLUSTRATIVE fixture through the app's real shared renderer.
// Run from the repo root: node_modules/.bin/tsx demo/film/tools/render-strips.ts
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { renderStripSvg } from "../../../shared/render-strip.js";
import { archetypeFor } from "../../../shared/casting.js";
import { comicWidth } from "../../../shared/text-fit.js";
import type { Strip } from "../../../shared/strip.js";
import { illustrativeSlack } from "../../../shared/v2-fixture.js";

const data = (path: string, mime: string) =>
  `data:${mime};base64,${readFileSync(path).toString("base64")}`;
const fonts = "node_modules/@fontsource";
const draft = structuredClone(illustrativeSlack);
const peeps: Record<string, string> = {};
for (const panel of [...draft.panels, ...(draft.endingArt ?? []).map((e: any) => e)])
  for (const actor of (panel as any).actors ?? []) {
    const name = draft.cast?.[actor.character]?.archetype
      ? archetypeFor(draft, actor.character)
      : actor.character;
    const key = `${name}-${actor.expression}${actor.pose ? `-${actor.pose}` : ""}`;
    const file = `public/peeps/${key}.svg`;
    if (existsSync(file)) peeps[key] = data(file, "image/svg+xml");
  }
const assets = {
  peeps,
  textFont: data(`${fonts}/comic-neue/files/comic-neue-latin-700-normal.woff2`, "font/woff2"),
  titleFont: data(`${fonts}/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2`, "font/woff2"),
  uiFont: data(`${fonts}/bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff2`, "font/woff2"),
};
const base = (): Strip => ({
  id: "illustrative",
  revision: 0,
  draft: structuredClone(draft),
  protectedIds: [],
  origin: "prepared-example",
  lastEditedBy: "human",
  updatedAt: "now",
});
const out = "demo/film/assets/strips";
const clean = renderStripSvg(base(), assets, comicWidth, undefined, undefined, false);
writeFileSync(`${out}/illustrative-clean.svg`, clean.svg);
const review = base();
review.protectedIds = ["slack-line-1"];
review.pencils = {
  a: { targetId: "slack-line-2", before: null },
  b: { targetId: "slack-line-4", before: null },
} as any;
writeFileSync(`${out}/illustrative-review.svg`, renderStripSvg(review, assets, comicWidth).svg);
console.log("overflow", clean.overflow, Object.keys(peeps));

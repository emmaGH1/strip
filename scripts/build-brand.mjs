import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
// Reproducible path-only SVG concepts; no raster or generated-image service.
// Tooling: npm install --prefix /tmp/strip-brand-tools opentype.js@1.3.4
// Run: node scripts/build-brand.mjs
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const opentype = require(
  `${process.argv[2] ?? "/tmp/strip-brand-tools"}/node_modules/opentype.js`,
);
const font = opentype.loadSync(
  "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff",
);
const ink = "#1A1714",
  red = "#D2432F",
  blue = "#3B6FD8",
  paper = "#F4EFE6";
const glyphPath = (letter, x, baseline = 86, size = 100) =>
  font.charToGlyph(letter).getPath(x, baseline, size).toPathData(3);
const path = (d, attrs = "") => `<path d="${d}" ${attrs}/>`;
const glyphs = [];
let x = 0;
for (const letter of "Strip") {
  const glyph = font.charToGlyph(letter);
  glyphs.push({ letter, x, d: glyphPath(letter, x) });
  x += glyph.advanceWidth / 10 - 2.8; // Intentionally tight, -0.028 em tracking.
}
const width = Math.ceil(x + 5);
function detailS(d, concept, prefix) {
  const compact = prefix.startsWith("mark-");
  if (concept === "b")
    return `<defs><clipPath id="${prefix}-ink"><rect x="0" y="0" width="100" height="53"/></clipPath><clipPath id="${prefix}-pencil"><rect x="0" y="53" width="100" height="70"/></clipPath></defs><g fill="${ink}" clip-path="url(#${prefix}-ink)">${path(d)}</g><g fill="none" stroke="${blue}" stroke-width="${compact ? 6.5 : 3.8}" stroke-dasharray="${compact ? "12 7" : "7 3"}" stroke-linecap="butt" clip-path="url(#${prefix}-pencil)">${path(d)}</g>`;
  const gutter = compact
    ? "M0 0H110V51L0 46ZM0 58L110 63V120H0Z"
    : "M0 0H110V55L0 50ZM0 57L110 62V120H0Z";
  return `<defs><clipPath id="${prefix}-gutter"><path d="${gutter}"/></clipPath></defs><g fill="${ink}" clip-path="url(#${prefix}-gutter)">${path(d)}</g>`;
}
const names = { a: "The MINE tittle", b: "Mid-inking", c: "The panel cut" };
const rationales = {
  a: "A tilted red square replaces the i’s dot, borrowing the MINE stamp’s unmistakable claim of authorship.",
  b: "The S moves from solid ink into a dashed blue-pencil outline, making the act of reviewing a draft part of the name.",
  c: "A narrow diagonal panel gutter cuts through the S, turning a single letter into a tiny comic sequence.",
};
function svg(content, viewBox, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${ink}" role="img" aria-label="${title}"><title>${title}</title>${content}</svg>\n`;
}
for (const concept of ["a", "b", "c"]) {
  let content = "";
  for (const g of glyphs) {
    if (concept === "a" && g.letter === "i") {
      const i = font.charToGlyph("i").getPath(g.x, 86, 100);
      const nextContour = i.commands.findIndex(
        (c, index) => index > 0 && c.type === "M",
      );
      i.commands = i.commands.slice(0, nextContour);
      content += path(i.toPathData(3), `data-part="i-stem"`);
      content += `<path data-part="mine-tittle" d="M${g.x + 5.8} 11H${g.x + 22.8}V28H${g.x + 5.8}Z" fill="${red}" transform="rotate(-9 ${g.x + 14.3} 19.5)"/>`;
    } else if (g.letter === "S" && concept !== "a")
      content += `<g data-part="custom-s">${detailS(g.d, concept, `word-${concept}`)}</g>`;
    else content += path(g.d, `data-part="letter-${g.letter}"`);
  }
  // Compact glyphs are optically enlarged; details are strengthened for native 16px.
  const markD = glyphPath("S", 4, 92, 118);
  const mark =
    concept === "a"
      ? `${path(markD, 'data-part="s"')}<path data-part="mine-square" d="M70 2H92V24H70Z" fill="${red}" transform="rotate(-9 81 13)"/>`
      : `<g data-part="custom-s">${detailS(markD, concept, `mark-${concept}`)}</g>`;
  mkdirSync(`assets/brand/concept-${concept}`, { recursive: true });
  writeFileSync(
    `assets/brand/concept-${concept}/logo.svg`,
    svg(content, `0 0 ${width} 108`, `Strip — ${names[concept]}`),
  );
  writeFileSync(
    `assets/brand/concept-${concept}/logo-mark.svg`,
    svg(mark, "0 0 96 96", `Strip ${concept.toUpperCase()} compact mark`),
  );
}
// The sheet uses native CSS pixel sizes: compact marks at 16, 64 and 512;
// wordmarks at 16px and 64px high, and at 512px wide. No upscaled favicon proxy.
const variants = [
  { name: "ON PAPER", bg: paper, fg: ink, mode: "color" },
  { name: "ON INK", bg: ink, fg: paper, mode: "inverse" },
  { name: "ONE-COLOR BLACK", bg: "#ffffff", fg: "#000000", mode: "black" },
  { name: "ONE-COLOR WHITE", bg: "#000000", fg: "#ffffff", mode: "white" },
];
function image(concept, file, variant, style) {
  let source = readFileSync(
    `assets/brand/concept-${concept}/${file}.svg`,
    "utf8",
  );
  if (variant.mode === "inverse") source = source.replaceAll(ink, paper);
  if (["black", "white"].includes(variant.mode))
    source = source.replace(/#(?:1A1714|D2432F|3B6FD8)/gu, variant.fg);
  return `<img alt="Concept ${concept} ${file} ${variant.name}" style="${style}" src="data:image/svg+xml;base64,${Buffer.from(source).toString("base64")}">`;
}
const rows = ["a", "b", "c"]
  .map(
    (concept) =>
      `<section><header><b>${concept.toUpperCase()} / ${names[concept]}</b><p>${rationales[concept]}</p></header><div class="variants">${variants.map((v) => `<div class="variant" style="background:${v.bg};color:${v.fg}"><h3>${v.name}</h3><div class="small"><div><span>MARK / 16 PX</span>${image(concept, "logo-mark", v, "width:16px;height:16px")}</div><div><span>MARK / 64 PX</span>${image(concept, "logo-mark", v, "width:64px;height:64px")}</div></div><div class="word-small"><span>WORDMARK / 16 PX HIGH</span>${image(concept, "logo", v, "height:16px;width:auto")}</div><div class="word-medium"><span>WORDMARK / 64 PX HIGH</span>${image(concept, "logo", v, "height:64px;width:auto")}</div><div class="large"><span>MARK / 512 PX</span>${image(concept, "logo-mark", v, "width:512px;height:512px")}</div><div class="word-large"><span>WORDMARK / 512 PX WIDE</span>${image(concept, "logo", v, "width:512px;height:auto")}</div></div>`).join("")}</div></section>`,
  )
  .join("");
mkdirSync("docs/evidence/brand", { recursive: true });
writeFileSync(
  "docs/evidence/brand/logo-review.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Strip — three logo concepts</title><style>@font-face{font-family:Bricolage;src:url('../../../node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2');font-weight:800}*{box-sizing:border-box}body{margin:0;width:2400px;background:${paper};color:${ink};font-family:Bricolage,Arial,sans-serif}.title{padding:40px 32px 24px;display:flex;justify-content:space-between;align-items:end}.title h1{font-size:48px;margin:0;letter-spacing:-2px}.title p{margin:0;font:16px Arial,sans-serif;line-height:1.5}section>header{padding:24px 32px 20px;border-top:2px solid ${ink};display:flex;gap:40px;align-items:center}header b{font-size:28px;min-width:380px}header p{font:18px/1.5 Arial,sans-serif;margin:0}.variants{display:grid;grid-template-columns:repeat(4,1fr)}.variant{padding:28px 24px 36px;min-width:0}h3{font:700 13px Arial,sans-serif;letter-spacing:2px;margin:0 0 28px}span{display:block;font:11px Arial,sans-serif;letter-spacing:1px;margin-bottom:12px}img{display:block}.small{display:flex;gap:64px;align-items:start;height:100px}.word-small{height:64px}.word-medium{height:116px}.large{margin-bottom:24px}.word-large{padding-top:24px;border-top:1px solid currentColor}.foot{font:15px Arial,sans-serif;padding:24px 32px}</style><div class="title"><h1>Strip / Three marks. No final choice.</h1><p>Bricolage Grotesque 800 · tracking −0.028 em · all letters converted to paths<br>Compact marks are shown at native 16 / 64 / 512 px. Backgrounds are not part of the logos.</p></div>${rows}<div class="foot">Review concepts only · 2026-11-08 · A: ink + signal red · B: ink + pencil blue · C: ink · No favicon or app branding changed.</div></html>`,
);
console.log(
  "Wrote six path-only SVGs and docs/evidence/brand/logo-review.html",
);

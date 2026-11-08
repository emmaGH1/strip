import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
// Temporary tooling only; no application dependency changes.
// npm install --prefix /tmp/strip-brand-tools opentype.js@1.3.4 sharp@0.34.5
// node scripts/build-brand-round2.mjs [/tmp/strip-brand-tools]
const require = createRequire(import.meta.url);
const tools = process.argv[2] ?? "/tmp/strip-brand-tools";
const opentype = require(`${tools}/node_modules/opentype.js`);
const sharp = require(`${tools}/node_modules/sharp`);
const font = opentype.loadSync(
  "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff",
);
const INK = "#1A1714",
  PAPER = "#F4EFE6",
  RED = "#D2432F";
const concepts = [
  {
    id: 1,
    name: "The strip ribbon",
    idea: "One folded paper ribbon becomes an S; the separate diamond claims the human’s ink.",
    // 36-unit construction. Six-unit horizontal bands; two six-by-six 45° folds.
    body: "M33 8H9L3 14V17L9 23H27V26H3V32H27L33 26V23L27 17H9V14H33Z",
    accent: INK,
  },
  {
    id: 2,
    name: "The panel S",
    idea: "Two offset comic-panel blocks form an S, with diagonal-cut terminals and a red MINE diamond.",
    // Six-unit panel beams, three-unit horizontal gutters, four-unit block offset.
    // 45° cuts terminate the gutters; an internal split weakened the S at 16px.
    body: "M29 8H3V23H27V26H13L7 32H33V17H9V14H23Z",
    accent: RED,
    diamond: "M25 0L28 3L25 6L22 3Z",
  },
  {
    id: 3,
    name: "The balloon S",
    idea: "A continuous ink S ends in a clipped speech tail; the diamond keeps the human’s claim separate.",
    // Concentric 7.5 / 1.5 radii preserve the six-unit ribbon through both loops.
    body: "M33 8H10.5A7.5 7.5 0 0 0 10.5 23H25.5A1.5 1.5 0 0 1 25.5 26H3V35L6 32H25.5A7.5 7.5 0 0 0 25.5 17H10.5A1.5 1.5 0 0 1 10.5 14H33Z",
    accent: INK,
  },
];
const diamond = "M29 0L32 3L29 6L26 3Z";
const path = (d, fill, part = "") =>
  `<path${part ? ` data-part="${part}"` : ""} fill="${fill}" d="${d}"/>`;
const mark = (c, mode = "color") => {
  const fg =
    mode === "inverse"
      ? PAPER
      : mode === "white"
        ? "#FFFFFF"
        : mode === "black"
          ? "#000000"
          : INK;
  const accent = ["white", "black"].includes(mode)
    ? fg
    : c.accent === RED
      ? RED
      : fg;
  return (
    path(c.body, fg, "s") + path(c.diamond ?? diamond, accent, "mine-diamond")
  );
};
function outlined(text, size, tracking = 0) {
  let x = 0;
  const paths = [];
  for (const letter of text) {
    const glyph = font.charToGlyph(letter);
    const p = glyph.getPath(x, 0, size);
    paths.push({ letter, d: p.toPathData(4), box: p.getBoundingBox() });
    x += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
  }
  return {
    paths,
    x1: Math.min(...paths.map((p) => p.box.x1)),
    y1: Math.min(...paths.map((p) => p.box.y1)),
    x2: Math.max(...paths.map((p) => p.box.x2)),
    y2: Math.max(...paths.map((p) => p.box.y2)),
    advance: x - tracking,
  };
}
const word = outlined("Strip", 48, -48 * 0.028);
// Optical alignment: the cap S spans the ink body's top / bottom, not the floating stamp.
const cap = word.paths[0].box;
const wordScale = 24 / (cap.y2 - cap.y1);
const wordX = 43 - word.x1 * wordScale;
const wordY = 8 - cap.y1 * wordScale;
const lockupWidth = Math.ceil(wordX + word.x2 * wordScale + 2);
const lockupHeight = Math.max(36, Math.ceil(wordY + word.y2 * wordScale));
function lockup(c, mode = "color") {
  const fg =
    mode === "inverse"
      ? PAPER
      : mode === "white"
        ? "#FFFFFF"
        : mode === "black"
          ? "#000000"
          : INK;
  return `${mark(c, mode)}<g transform="translate(${wordX} ${wordY}) scale(${wordScale})">${word.paths.map((p) => path(p.d, fg, `letter-${p.letter}`)).join("")}</g>`;
}
function svg(content, width, height, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title>${content}</svg>\n`;
}
for (const c of concepts) {
  const dir = `assets/brand/round2/concept-${c.id}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/mark.svg`, svg(mark(c), 36, 36, `Strip — ${c.name}`));
  writeFileSync(
    `${dir}/lockup.svg`,
    svg(lockup(c), lockupWidth, lockupHeight, `Strip — ${c.name} lockup`),
  );
}
function label(text, x, y, size = 14, fill = INK, tracking = 0) {
  const t = outlined(text, size, tracking);
  return `<g fill="${fill}" transform="translate(${x} ${y})">${t.paths.map((p) => `<path d="${p.d}"/>`).join("")}</g>`;
}
const rect = (x, y, w, h, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const placeMark = (c, x, y, size, mode) =>
  `<g transform="translate(${x} ${y}) scale(${size / 36})">${mark(c, mode)}</g>`;
const placeLock = (c, x, y, height, mode) =>
  `<g transform="translate(${x} ${y}) scale(${height / lockupHeight})">${lockup(c, mode)}</g>`;
const sheet = [
  rect(0, 0, 1936, 2456, PAPER),
  label("Strip / Symbols, not signatures.", 32, 64, 44),
  label(
    "ROUND 02     /     THREE ORIGINAL S MONOGRAMS     /     HUMAN SELECTION REQUIRED",
    34,
    106,
    14,
  ),
  label(
    "Native pixel sizes. Path-only Bricolage Grotesque 800 lockups. No app branding changed.",
    34,
    137,
    16,
    "#6E665C",
  ),
];
for (const c of concepts) {
  const top = 176 + (c.id - 1) * 740;
  sheet.push(rect(32, top, 1872, 2, INK));
  sheet.push(label(`0${c.id} / ${c.name}`, 32, top + 45, 30));
  sheet.push(label(c.idea, 32, top + 77, 17));
  for (const [x, mode, bg, fg, title] of [
    [32, "color", PAPER, INK, "ON PAPER"],
    [528, "inverse", INK, PAPER, "ON INK / REVERSED"],
  ]) {
    const y = top + 104;
    sheet.push(rect(x, y, 480, 584, bg));
    sheet.push(label(title, x + 24, y + 31, 13, fg));
    for (const [size, dx] of [
      [16, 24],
      [32, 114],
      [64, 228],
    ]) {
      sheet.push(label(`${size} PX`, x + dx, y + 66, 11, fg));
      sheet.push(placeMark(c, x + dx, y + 82, size, mode));
    }
    sheet.push(label("256 PX", x + 24, y + 187, 11, fg));
    sheet.push(placeMark(c, x + 112, y + 202, 256, mode));
    sheet.push(label("HEADER LOCKUP / 32 PX HIGH", x + 24, y + 510, 11, fg));
    sheet.push(placeLock(c, x + 24, y + 528, 32, mode));
  }
  const mx = 1024,
    my = top + 104;
  for (const [dy, mode, bg, fg, title] of [
    [0, "black", "#FFFFFF", "#000000", "ONE-COLOR BLACK"],
    [300, "white", "#000000", "#FFFFFF", "ONE-COLOR WHITE"],
  ]) {
    sheet.push(rect(mx, my + dy, 352, 284, bg));
    sheet.push(label(title, mx + 24, my + dy + 31, 13, fg));
    sheet.push(placeMark(c, mx + 112, my + dy + 64, 128, mode));
    sheet.push(placeLock(c, mx + 24, my + dy + 224, 32, mode));
  }
  sheet.push(label("APP-ICON TILE / 512 × 512 PX", 1392, top + 135, 13));
  sheet.push(rect(1392, top + 160, 512, 512, PAPER));
  // Hairline outside the tile, not an icon enclosure or part of the identity.
  sheet.push(
    `<rect x="1391.5" y="${top + 159.5}" width="513" height="513" fill="none" stroke="#D8D0C4"/>`,
  );
  sheet.push(placeMark(c, 1488, top + 256, 320, "color"));
  sheet.push(
    label("Paper #F4EFE6 / Ink #1A1714", 1392, top + 701, 13, "#6E665C"),
  );
}
sheet.push(
  label(
    "REVIEW ONLY / Fold, panel, voice. One small diamond belongs to the human.",
    32,
    2433,
    15,
  ),
);
const source = svg(sheet.join(""), 1936, 2456, "Strip — round two logo review");
mkdirSync("docs/evidence/brand", { recursive: true });
await sharp(Buffer.from(source))
  .png()
  .toFile("docs/evidence/brand/logo-review-round2.png");
// Keep editable construction of the review sheet reproducible via this script, not duplicated SVG.
console.log(
  "Wrote six SVG assets and docs/evidence/brand/logo-review-round2.png",
);

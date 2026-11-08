import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

// Offline, path-only brand exports. Temporary tooling, not app dependencies:
// npm install --prefix /tmp/strip-brand-tools opentype.js@1.3.4 sharp@0.34.5
// node scripts/build-brand-final.mjs [/tmp/strip-brand-tools]
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
// Newly drawn upright S, not a rotated copy of the round-3 path. Coordinates
// share Bricolage 800's 100-unit em, baseline 80, cap overshoot 12.6 / 81.4.
// Broad balloon shoulder; 13–16 unit ribbon; flat, guillotined lower terminal.
const customS =
  "M57 16C50 13.5 42 12.6 32 12.6C14 12.6 4 20 4 32C4 44 13 49 29 52L38 54C44 55.5 47 57 47 60C47 65 42 68 34 68H4L16 81.4H34C54 81.4 63 74 63 60C63 47 54 42 39 39L29 37C22 35.5 19 34 19 31C19 26 24 25 32 25C40 25 47 27 52 29Z";
const path = (d, fill = INK, part = "") =>
  `<path${part ? ` data-part="${part}"` : ""} fill="${fill}" d="${d}"/>`;
const svg = (body, box, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;
const glyph = (c, x, y = 80, size = 100) =>
  font.charToGlyph(c).getPath(x, y, size).toPathData(3);
function wordmark(fg = INK) {
  let x = 64; // Optical S/t gap, not the S's old font advance.
  let body = path(customS, fg, "custom-s");
  for (const c of "trip.") {
    body += path(
      glyph(c, x),
      c === "." ? RED : fg,
      c === "." ? "signal-period" : `letter-${c}`,
    );
    x += font.charToGlyph(c).advanceWidth / 10 - 2.8;
  }
  return body;
}
const wordBox = "2 3 253 95";
const markBox = "0 0 80 80";
const mark = (fg = INK) =>
  `<g transform="translate(6.5 -7)">${path(customS, fg, "custom-s")}</g>`;
const tile = (size) =>
  svg(
    `<rect width="${size}" height="${size}" fill="${PAPER}"/><g transform="translate(${size * 0.125} ${size * 0.125}) scale(${(size * 0.75) / 80})">${mark()}</g>`,
    `0 0 ${size} ${size}`,
    "Strip",
  );
mkdirSync("public", { recursive: true });
mkdirSync("docs/evidence/brand", { recursive: true });
writeFileSync("public/logo.svg", svg(wordmark(), wordBox, "Strip"));
writeFileSync(
  "public/logo-reversed.svg",
  svg(wordmark(PAPER), wordBox, "Strip"),
);
writeFileSync("public/logo-mark.svg", svg(mark(), markBox, "Strip"));
writeFileSync(
  "public/logo-mark-reversed.svg",
  svg(mark(PAPER), markBox, "Strip"),
);
// Favicon needs almost the whole canvas at 16px, unlike generously padded app tiles.
const favicon = svg(
  `<rect width="80" height="80" rx="4" fill="${PAPER}"/>${mark()}`,
  markBox,
  "Strip",
);
writeFileSync("public/favicon.svg", favicon);
for (const [name, size] of [
  ["icon-192", 192],
  ["icon-512", 512],
  ["apple-touch-icon", 180],
  ["icon", 512],
]) {
  await sharp(Buffer.from(tile(size)))
    .resize(size, size)
    .png()
    .toFile(`public/${name}.png`);
}
// The framework-owned sign-in document still uses these legacy static URLs.
for (const size of [180, 192, 512])
  writeFileSync(`public/icon-${size}.svg`, tile(size));
const icoImages = [];
for (const size of [16, 32, 48])
  icoImages.push(
    await sharp(Buffer.from(favicon)).resize(size, size).png().toBuffer(),
  );
const ico = Buffer.alloc(
  6 + 16 * icoImages.length + icoImages.reduce((n, b) => n + b.length, 0),
);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(icoImages.length, 4);
let offset = 6 + 16 * icoImages.length;
icoImages.forEach((image, i) => {
  const p = 6 + i * 16,
    size = [16, 32, 48][i];
  ico[p] = size;
  ico[p + 1] = size;
  ico.writeUInt16LE(1, p + 4);
  ico.writeUInt16LE(32, p + 6);
  ico.writeUInt32LE(image.length, p + 8);
  ico.writeUInt32LE(offset, p + 12);
  image.copy(ico, offset);
  offset += image.length;
});
writeFileSync("public/favicon.ico", ico);
function label(text, x, y, size = 16, fill = INK, tracking = 0) {
  let dx = x;
  return [...text]
    .map((c) => {
      const d = glyph(c, dx, y, size);
      dx += (font.charToGlyph(c).advanceWidth / 1000) * size + tracking;
      return path(d, fill);
    })
    .join("");
}
const rect = (x, y, w, h, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const placeWord = (x, y, h, fg = INK) =>
  `<g transform="translate(${x} ${y}) scale(${h / 95}) translate(-2 -3)">${wordmark(fg)}</g>`;
const placeMark = (x, y, s, fg = INK) =>
  `<g transform="translate(${x} ${y}) scale(${s / 80})">${mark(fg)}</g>`;
const sheet = [
  rect(0, 0, 1600, 1660, PAPER),
  label("Strip / The S is the signature.", 48, 78, 46),
  label(
    "FINAL / UPRIGHT BALLOON–CUT / NO DIAMOND / ONE WORD, NOT A SYMBOL + TYPE",
    50,
    116,
    14,
  ),
  label(
    "Bricolage Grotesque 800 outlines + a redrawn first letter. Signal-red full stop retained.",
    50,
    148,
    18,
  ),
];
for (const [i, fg, bg] of [
  [0, INK, PAPER],
  [1, PAPER, INK],
]) {
  const x = i * 800;
  sheet.push(rect(x, 190, 800, 870, bg));
  sheet.push(
    label(i ? "ON INK / #1A1714" : "ON PAPER / #F4EFE6", x + 48, 232, 14, fg),
  );
  let y = 270;
  for (const h of [24, 32, 64]) {
    sheet.push(label(`${h}px HIGH / NATIVE SIZE`, x + 48, y + 14, 12, fg));
    sheet.push(placeWord(x + 260, y, h, fg));
    y += h + 50;
  }
  sheet.push(label("VERY LARGE / 253px HIGH", x + 48, 593, 12, fg));
  sheet.push(placeWord(x + 48, 638, 253, fg));
  sheet.push(
    label(
      "S: 13–16 unit weight / shared baseline / optical S–t spacing",
      x + 48,
      982,
      15,
      fg,
    ),
  );
}
sheet.push(label("COMPACT S / NATIVE PIXELS", 48, 1112, 16));
for (const [x, s] of [
  [48, 16],
  [160, 32],
  [290, 64],
]) {
  sheet.push(label(`${s}px`, x, 1152, 14));
  sheet.push(placeMark(x, 1176, s));
}
sheet.push(rect(48, 1290, 650, 310, INK));
for (const [x, s] of [
  [76, 16],
  [188, 32],
  [318, 64],
])
  sheet.push(placeMark(x, 1324, s, PAPER));
sheet.push(label("ONE LETTER. SAME FORM AT EVERY SIZE.", 76, 1558, 15, PAPER));
sheet.push(rect(1004, 1108, 512, 512, PAPER));
sheet.push(
  `<rect x="1004" y="1108" width="512" height="512" fill="none" stroke="${INK}"/>`,
);
sheet.push(placeMark(1068, 1172, 384));
sheet.push(label("512px APP TILE / 12.5% SAFE MARGIN", 1004, 1648, 12));
const sheetSvg = svg(
  sheet.join(""),
  "0 0 1600 1660",
  "Strip final wordmark size and contrast review",
);
writeFileSync("docs/evidence/brand/logo-final.svg", sheetSvg);
await sharp(Buffer.from(sheetSvg))
  .png()
  .toFile("docs/evidence/brand/logo-final.png");
// A retained, real shared-renderer PNG export of the explicitly illustrative Undo
// fixture, not generated art or a fabricated product screenshot. Keep its label.
const comic = await sharp("docs/evidence/proof/strip-comic.png")
  .extract({ left: 35, top: 125, width: 545, height: 495 })
  .png()
  .toBuffer();
const og = svg(
  [
    rect(0, 0, 1200, 630, PAPER),
    rect(56, 48, 1088, 2, INK),
    placeWord(56, 82, 150),
    label("Release notes nobody reads?", 56, 316, 40, INK, -1),
    label("Ship a strip.", 56, 371, 48, INK, -1.4),
    label("YOU + YOUR AGENT. FOUR PANELS. YOUR INK.", 58, 454, 14),
    label("ILLUSTRATIVE UPDATE / FICTIONAL DIALOGUE", 744, 540, 11),
    rect(744, 158, 400, 364, INK),
    `<image x="738" y="152" width="400" height="364" href="data:image/png;base64,${comic.toString("base64")}"/>`,
    `<rect x="738" y="152" width="400" height="364" fill="none" stroke="${INK}" stroke-width="2"/>`,
    rect(56, 580, 1088, 2, INK),
    label("A COMICS STUDIO FOR WHAT SHIPPED.", 56, 610, 12),
  ].join(""),
  "0 0 1200 630",
  "Strip. Release notes nobody reads? Ship a strip.",
);
await sharp(Buffer.from(og)).png().toFile("public/og.png");
console.log(
  "Exported final path-only wordmark, compact mark, icon set, review sheet and 1200×630 OG.",
);

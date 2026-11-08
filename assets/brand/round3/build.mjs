import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

// Review-only, hand-constructed geometry. No app dependencies or browser needed.
// node assets/brand/round3/build.mjs <reference.jpg> [/tmp/strip-brand-tools]
// Temporary tooling: opentype.js@1.3.4, sharp@0.34.5.
const require = createRequire(import.meta.url);
const referenceFile = process.argv[2];
if (!referenceFile) throw new Error("Pass the human-supplied reference JPEG.");
const tools = process.argv[3] ?? "/tmp/strip-brand-tools";
const opentype = require(`${tools}/node_modules/opentype.js`);
const sharp = require(`${tools}/node_modules/sharp`);
const font = opentype.loadSync(
  "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff",
);
const INK = "#1A1714";
const RED = "#D2432F";
const PAPER = "#F4EFE6";
const PEACH = "#FAE5D8";
const MUTED = "#6E665C";
const concepts = [
  {
    id: 1,
    name: "Balloon / fold",
    idea: "A balloon curls into a folded comic panel; the red diamond claims the ink.",
    note: "Balanced return, square-ended panel, open diagonal gutter. Recommended.",
    // Local panel grid, turned -45 degrees as a whole (not sheared).
    // 26-unit panel and return weight; 10-unit lower gutter.
    // The concave tail at the join is explicitly drawn, not a circular cutout.
    body: "M90 20H46C24 20 12 34 12 51C12 70 27 80 46 80H70V90H24V116H100V56C91 56 85 51 85 42L71 56H46C41 56 38 52 38 48C38 44 41 41 46 41H68C82 41 90 33 90 20Z",
  },
  {
    id: 2,
    name: "Balloon / cut",
    idea: "A wide balloon meets a diagonally guillotined paper panel: the fastest silhouette.",
    note: "Longer upper sweep, clipped panel return, sharper right-hand stance.",
    body: "M96 20H42C22 20 10 34 10 51C10 69 24 80 42 80H76L44 112H91L123 80L99 56C89 56 84 52 84 44L72 56H44C39 56 36 52 36 47C36 42 39 39 44 39H74C88 39 96 31 96 20Z",
  },
  {
    id: 3,
    name: "Balloon / tuck",
    idea: "A deeper balloon tucks into a shorter panel; the human stamp floats above the join.",
    note: "Compact upper lip, rounder bowl, wider lower gutter, quieter panel.",
    body: "M78 20H48C22 20 8 33 8 52C8 74 24 86 47 86H73V99H26V125H99V60C88 60 82 54 82 45L67 60H48C42 60 38 55 38 50C38 45 42 41 48 41H52C67 41 78 34 78 20Z",
  },
];

// Authoring in a local orthogonal panel grid makes exact 45-degree edges
// auditable. Bake this rotation/translation into the final path coordinates.
function bodyPath(source) {
  const tokens = source.match(/[A-Za-z]|-?\d+(?:\.\d+)?/gu);
  const output = [];
  let command;
  let x = 0;
  let y = 0;
  const point = (px, py) => {
    const s = Math.SQRT1_2;
    return `${((px + py - 124) * s + 80).toFixed(4)} ${((py - px - 14) * s + 84).toFixed(4)}`;
  };
  let i = 0;
  while (i < tokens.length) {
    if (/[A-Za-z]/u.test(tokens[i])) command = tokens[i++];
    if (command === "Z") {
      output.push("Z");
      continue;
    }
    if (command === "H") {
      x = Number(tokens[i++]);
      output.push(`L${point(x, y)}`);
    } else if (command === "V") {
      y = Number(tokens[i++]);
      output.push(`L${point(x, y)}`);
    } else if (command === "M" || command === "L") {
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
      output.push(`${command}${point(x, y)}`);
    } else if (command === "C") {
      const a = Number(tokens[i++]);
      const b = Number(tokens[i++]);
      const c = Number(tokens[i++]);
      const d = Number(tokens[i++]);
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
      output.push(`C${point(a, b)} ${point(c, d)} ${point(x, y)}`);
    } else throw new Error(`Unsupported hand-authored command ${command}`);
  }
  return output.join("");
}
for (const c of concepts) c.d = bodyPath(c.body);
const diamond = "M109 2L120 13L109 24L98 13Z";
const path = (d, fill, part = "") =>
  `<path${part ? ` data-part="${part}"` : ""} fill="${fill}" d="${d}"/>`;
const foreground = (mode) =>
  mode === "inverse"
    ? PAPER
    : mode === "black"
      ? "#000000"
      : mode === "white"
        ? "#FFFFFF"
        : INK;
function mark(c, mode = "color", bodyOnly = false) {
  return (
    path(c.d, foreground(mode), "balloon-panel") +
    (bodyOnly
      ? ""
      : path(
          diamond,
          ["black", "white"].includes(mode) ? foreground(mode) : RED,
          "mine-diamond",
        ))
  );
}
function outlined(text, size, tracking = 0) {
  let x = 0;
  const paths = [];
  let previous;
  for (const letter of text) {
    const glyph = font.charToGlyph(letter);
    if (previous)
      x += (font.getKerningValue(previous, glyph) / font.unitsPerEm) * size;
    const p = glyph.getPath(x, 0, size);
    paths.push({ letter, d: p.toPathData(4), box: p.getBoundingBox() });
    x += (glyph.advanceWidth / font.unitsPerEm) * size + tracking;
    previous = glyph;
  }
  return {
    paths,
    x1: Math.min(...paths.map((p) => p.box.x1)),
    y1: Math.min(...paths.map((p) => p.box.y1)),
    x2: Math.max(...paths.map((p) => p.box.x2)),
    y2: Math.max(...paths.map((p) => p.box.y2)),
  };
}
const word = outlined("Strip", 100, -2.8);
const cap = word.paths[0].box;
// A compact header lockup has less internal padding than the app-tile mark.
// The word's S aligns with the body, not the detached stamp or the p descender.
const wordScale = 93 / (cap.y2 - cap.y1);
const wordX = 162 - word.x1 * wordScale;
const wordY = 39 - cap.y1 * wordScale;
const lockWidth = Math.ceil(wordX + word.x2 * wordScale + 6);
const lockHeight = 160;
function lockup(c, mode = "color") {
  return `${mark(c, mode)}<g transform="translate(${wordX.toFixed(4)} ${wordY.toFixed(4)}) scale(${wordScale.toFixed(6)})">${word.paths.map((p) => path(p.d, foreground(mode), `letter-${p.letter}`)).join("")}</g>`;
}
const svg = (content, width, height, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}"><title>${title}</title>${content}</svg>\n`;
const root = "assets/brand/round3";
for (const c of concepts) {
  const dir = `${root}/v${c.id}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/mark.svg`, svg(mark(c), 160, 160, `Strip — ${c.name}`));
  writeFileSync(
    `${dir}/lockup.svg`,
    svg(lockup(c), lockWidth, lockHeight, `Strip — ${c.name} lockup`),
  );
}

const label = (text, x, y, size = 16, fill = INK, tracking = 0) => {
  const t = outlined(text, size, tracking);
  return `<g fill="${fill}" transform="translate(${x} ${y})">${t.paths.map((p) => `<path d="${p.d}"/>`).join("")}</g>`;
};
const rect = (x, y, w, h, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const placeMark = (c, x, y, size, mode = "color") =>
  `<g transform="translate(${x} ${y}) scale(${size / 160})">${mark(c, mode)}</g>`;
const placeLock = (c, x, y, height, mode = "color") =>
  `<g transform="translate(${x} ${y}) scale(${height / lockHeight})">${lockup(c, mode)}</g>`;

// The reference is used ONLY as a raster silhouette in the comparison panel.
// Thresholding is not contour tracing: no reference coordinates enter a mark.
const ref = await sharp(referenceFile)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
async function referenceMask(bodyOnly = false) {
  const { width, height, channels } = ref.info;
  const data = Buffer.alloc(width * height * 4);
  const ink = new Uint8Array(width * height);
  let seed = 0;
  for (let i = 0; i < width * height; i++) {
    const offset = i * channels;
    ink[i] = Number(
      ref.data[offset] < 70 &&
        ref.data[offset + 1] < 70 &&
        ref.data[offset + 2] < 70,
    );
    if (ink[i]) seed = i;
  }
  // Flood-fill the connected body from its bottommost ink pixel. This keeps
  // the detached diamond out of the additional body-only comparison.
  const body = new Uint8Array(width * height);
  if (bodyOnly) {
    const queue = [seed];
    body[seed] = 1;
    for (let head = 0; head < queue.length; head++) {
      const p = queue[head];
      for (const n of [p - width, p + width, p - 1, p + 1]) {
        if (n >= 0 && n < ink.length && ink[n] && !body[n]) {
          body[n] = 1;
          queue.push(n);
        }
      }
    }
  }
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = 26;
    data[i * 4 + 1] = 23;
    data[i * 4 + 2] = 20;
    data[i * 4 + 3] = ink[i] && (!bodyOnly || body[i]) ? 255 : 0;
  }
  return sharp(data, { raw: { width, height, channels: 4 } })
    .trim()
    .png()
    .toBuffer();
}
const refMask = await referenceMask();
const refBody = await referenceMask(true);
// Normalize each tight bounding box to the SAME 176px square, fit=contain.
const normalized = async (image, size = 176) =>
  sharp(image)
    .trim()
    .resize(size, size, { fit: "contain", background: "#00000000" })
    .png()
    .toBuffer();
const refNormalized = await normalized(refMask);
const refBodyNormalized = await normalized(refBody);
const ownNormalized = [];
const overlays = [];
const metrics = [];
const alpha = async (image) => {
  const raw = await sharp(image).ensureAlpha().raw().toBuffer();
  return Array.from({ length: raw.length / 4 }, (_, i) => raw[i * 4 + 3] > 127);
};
const tint = async (image, rgb, opacity) => {
  const { data, info } = await sharp(image)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = Math.round(data[i + 3] * opacity);
  }
  return sharp(data, { raw: info }).png().toBuffer();
};
for (const c of concepts) {
  const own = await normalized(
    Buffer.from(svg(mark(c, "black"), 160, 160, "")),
  );
  const ownBody = await normalized(
    Buffer.from(svg(mark(c, "black", true), 160, 160, "")),
  );
  ownNormalized.push(own);
  const overlay = await sharp({
    create: { width: 176, height: 176, channels: 4, background: PAPER },
  })
    .composite([
      { input: await tint(refNormalized, [26, 23, 20], 0.32) },
      { input: await tint(own, [210, 67, 47], 0.72) },
    ])
    .png()
    .toBuffer();
  overlays.push(overlay);
  const iou = async (a, b) => {
    const aa = await alpha(a);
    const bb = await alpha(b);
    let intersection = 0;
    let union = 0;
    for (let i = 0; i < aa.length; i++) {
      if (aa[i] && bb[i]) intersection++;
      if (aa[i] || bb[i]) union++;
    }
    return Number((intersection / union).toFixed(3));
  };
  metrics.push({
    variant: c.id,
    fullMarkIoU: await iou(refNormalized, own),
    bodyOnlyIoU: await iou(refBodyNormalized, ownBody),
  });
}
const image = (buffer, x, y, size = 176) =>
  `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${buffer.toString("base64")}"/>`;
const WIDTH = 2240;
const HEIGHT = 3240;
const sheet = [
  rect(0, 0, WIDTH, HEIGHT, PAPER),
  label("Strip / A little voice. A sharp turn.", 40, 78, 48, INK, -1),
  label(
    "ROUND 03    /    BALLOON + PANEL + MINE    /    HUMAN SELECTION REQUIRED",
    42,
    124,
    17,
  ),
  label(
    "Three original 45-degree constructions. Bricolage Grotesque 800, outlined. No app identity changed.",
    42,
    160,
    20,
    MUTED,
  ),
];
for (const c of concepts) {
  const top = 200 + (c.id - 1) * 820;
  sheet.push(rect(40, top, 2160, 2, INK));
  sheet.push(label(`0${c.id} / ${c.name}`, 40, top + 49, 34));
  if (c.id === 1) sheet.push(label("RECOMMENDED", 790, top + 45, 17, RED));
  sheet.push(label(c.idea, 40, top + 85, 20));
  for (const [x, bg, title] of [
    [40, PAPER, "PAPER / #F4EFE6"],
    [576, PEACH, "SOFT PEACH / #FAE5D8"],
  ]) {
    // An explicit 512x512 tile; the artwork has 56px of app-icon breathing room.
    const y = top + 128;
    sheet.push(rect(x - 1, y - 1, 514, 514, "#D9D0C2"));
    sheet.push(rect(x, y, 512, 512, bg));
    sheet.push(placeMark(c, x + 56, y + 56, 400));
    sheet.push(label(title, x, y + 548, 17, MUTED));
    sheet.push(label("512 x 512 APP TILE / 400px MARK", x, y + 577, 14, MUTED));
  }
  const y = top + 128;
  // Light-ground native pixel sizes, not enlarged favicon proxies.
  sheet.push(label("NATIVE SIZE / PAPER", 1120, y + 19, 16));
  for (const [x, size] of [
    [1120, 16],
    [1216, 32],
    [1320, 64],
  ]) {
    sheet.push(label(`${size}px`, x, y + 58, 14, MUTED));
    sheet.push(placeMark(c, x, y + 83, size));
  }
  sheet.push(label("HEADER LOCKUP", 1120, y + 235, 16));
  sheet.push(placeLock(c, 1120, y + 264, 64));
  sheet.push(
    label("32px HIGH / ACTUAL HEADER SCALE", 1120, y + 395, 13, MUTED),
  );
  sheet.push(placeLock(c, 1120, y + 415, 32));
  // On ink: large mark, same native sizes, and inverse header lockup.
  sheet.push(rect(1500, y, 340, 512, INK));
  sheet.push(label("ON INK", 1524, y + 35, 16, PAPER));
  sheet.push(placeMark(c, 1580, y + 66, 176, "inverse"));
  for (const [x, size] of [
    [1524, 16],
    [1612, 32],
    [1712, 64],
  ]) {
    sheet.push(label(`${size}px`, x, y + 299, 14, PAPER));
    sheet.push(placeMark(c, x, y + 322, size, "inverse"));
  }
  sheet.push(placeLock(c, 1524, y + 439, 40, "inverse"));
  // Genuine single-color black and white. Background is not part of the mark.
  sheet.push(rect(1860, y, 340, 248, "#FFFFFF"));
  sheet.push(label("ONE COLOR / BLACK", 1884, y + 35, 16, "#000000"));
  sheet.push(placeMark(c, 1962, y + 66, 136, "black"));
  sheet.push(rect(1860, y + 264, 340, 248, "#000000"));
  sheet.push(label("ONE COLOR / WHITE", 1884, y + 299, 16, "#FFFFFF"));
  sheet.push(placeMark(c, 1962, y + 330, 136, "white"));
  sheet.push(label(c.note, 1120, top + 680, 16, MUTED));
  sheet.push(
    label(
      "Ink #1A1714 + MINE red #D2432F. Flat fills only; no outlines, filters or strokes.",
      40,
      top + 764,
      17,
      MUTED,
    ),
  );
}
const comparisonTop = 2680;
sheet.push(rect(40, comparisonTop, 2160, 2, INK));
sheet.push(
  label("DISTINCT CONSTRUCTION / silhouette check", 40, comparisonTop + 47, 28),
);
sheet.push(
  label(
    "Same bounding-box scale; no rotation to improve alignment. Reference is a raster silhouette, not a traced path.",
    40,
    comparisonTop + 82,
    18,
    MUTED,
  ),
);
for (const [index, name, buffer] of [
  [0, "REFERENCE", refNormalized],
  [1, "V1 / FOLD", ownNormalized[0]],
  [2, "V2 / CUT", ownNormalized[1]],
  [3, "V3 / TUCK", ownNormalized[2]],
]) {
  const x = 48 + index * 256;
  sheet.push(label(name, x, comparisonTop + 133, 15));
  sheet.push(image(buffer, x, comparisonTop + 158));
}
for (const c of concepts) {
  const x = 1120 + (c.id - 1) * 360;
  sheet.push(label(`REF + V${c.id} / OVERLAY`, x, comparisonTop + 133, 15));
  sheet.push(image(overlays[c.id - 1], x + 36, comparisonTop + 158));
}
sheet.push(
  label(
    "The open counters, curled join, rising axis and folded/cut lower panels differ from the reference's solid horizontal body.",
    40,
    comparisonTop + 387,
    19,
  ),
);
sheet.push(
  label(
    "Overlay: reference = gray; original = red. Visual comparison is not legal clearance. Reference creator unknown; review use only.",
    40,
    comparisonTop + 425,
    17,
    MUTED,
  ),
);
sheet.push(
  label(
    "REVIEW ONLY / Choose one before any favicon, header or app branding is replaced.",
    40,
    3196,
    19,
  ),
);
mkdirSync("docs/evidence/brand", { recursive: true });
await sharp(
  Buffer.from(
    svg(sheet.join(""), WIDTH, HEIGHT, "Strip — round three logo review"),
  ),
)
  .png()
  .toFile("docs/evidence/brand/logo-review-round3.png");
writeFileSync(
  `${root}/comparison.json`,
  `${JSON.stringify(
    {
      method:
        "176px alpha masks; independently tight-trimmed bounding boxes; contain, centered; no rotation or optimized alignment. IoU is descriptive, not an originality or legal test.",
      metrics,
    },
    null,
    2,
  )}\n`,
);
console.log(
  "Wrote six path-only SVGs, review PNG and descriptive comparison metrics.",
);
console.log(JSON.stringify(metrics));

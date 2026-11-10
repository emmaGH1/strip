import { archetypeFor, personFor } from "./casting.js";
import { type Strip } from "./strip.js";
import { fitBalloon, wrapText } from "./text-fit.js";
export { wrapText } from "./text-fit.js";

export interface SceneAssets {
  peeps: Record<string, string>;
  textFont: string;
  titleFont: string;
  uiFont?: string;
}
export interface RenderResult {
  svg: string;
  overflow: string[];
}
const escape = (value: string) =>
  value.replace(
    /[&<>"']/gu,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );

/** Shared canvas/export renderer. Fixed safe UI states are scene props, not AI output. */
const WORDMARK = `<g role="img" aria-label="Strip" transform="translate(1160,36) scale(0.474) translate(-255,-3)"><path fill="#1A1714" d="M57 16C50 13.5 42 12.6 32 12.6C14 12.6 4 20 4 32C4 44 13 49 29 52L38 54C44 55.5 47 57 47 60C47 65 42 68 34 68H4L16 81.4H34C54 81.4 63 74 63 60C63 47 54 42 39 39L29 37C22 35.5 19 34 19 31C19 26 24 25 32 25C40 25 47 27 52 29Z"/><path fill="#1A1714" d="M90.800 81.300L90.800 81.300Q81.500 81.300 77.100 76.350Q72.700 71.400 72.700 60.500L72.700 60.500L72.700 39.800L65.200 39.800L65.500 27.300L70.900 27.300Q74.100 27.200 75.750 26.300Q77.400 25.400 77.800 22.900L77.800 22.900L79.100 15.500L88.200 15.500L88.200 27.200L100.900 27.200L100.900 40.300L88.200 40.300L88.200 59.800Q88.200 63.200 89.850 64.800Q91.500 66.400 94.900 66.400L94.900 66.400Q96.800 66.400 98.500 66Q100.200 65.600 101.300 64.900L101.300 64.900L101.300 79.800Q98.100 80.800 95.450 81.050Q92.800 81.300 90.800 81.300Z"/><path fill="#1A1714" d="M124.200 80L108.000 80L108.000 27.200L121.200 27.200L121.500 45.100L123.500 45.100Q124.200 38.100 126.150 33.950Q128.100 29.800 131.750 27.900Q135.400 26 140.800 26L140.800 26Q141.600 26 142.600 26.050Q143.600 26.100 144.900 26.300L144.900 26.300L144.300 43.500Q142.700 42.700 140.850 42.450Q139 42.200 137.600 42.200L137.600 42.200Q133.700 42.200 130.850 43.700Q128 45.200 126.350 48.300Q124.700 51.400 124.200 56.100L124.200 56.100L124.200 80Z"/><path fill="#1A1714" d="M165.900 80L149.800 80L149.800 27.200L165.900 27.200L165.900 80ZM157.900 19.800L157.900 19.800Q153.300 19.800 150.850 17.850Q148.400 15.900 148.400 12.300L148.400 12.300Q148.400 8.500 150.850 6.550Q153.300 4.600 157.900 4.600L157.900 4.600Q162.600 4.600 165.050 6.550Q167.500 8.500 167.500 12.200L167.500 12.200Q167.500 15.900 165.050 17.850Q162.600 19.800 157.900 19.800Z"/><path fill="#1A1714" d="M191.700 96.900L175.600 96.900L175.600 27.200L188.800 27.200L189.000 42.200L190.800 42.400Q191.700 36.800 194.000 33.100Q196.300 29.400 199.950 27.600Q203.600 25.800 208.300 25.800L208.300 25.800Q215.300 25.800 220.350 29.200Q225.400 32.600 228.100 38.900Q230.800 45.200 230.800 54L230.800 54Q230.800 61.800 228.450 68Q226.100 74.200 221.350 77.800Q216.600 81.400 209.300 81.400L209.300 81.400Q204.400 81.400 201.000 79.650Q197.600 77.900 195.250 74.500Q192.900 71.100 191.300 66L191.300 66L189.400 66Q190.000 68.700 190.500 71.500Q191.000 74.300 191.350 76.900Q191.700 79.500 191.700 81.900L191.700 81.900L191.700 96.900ZM203.400 68.700L203.400 68.700Q206.700 68.700 209.050 66.900Q211.400 65.100 212.700 61.800Q214.000 58.500 214.000 54.100L214.000 54.100Q214.000 49.400 212.650 46.050Q211.300 42.700 208.800 40.850Q206.300 39 203.000 39L203.000 39Q199.900 39 197.750 40.350Q195.600 41.700 194.250 43.850Q192.900 46 192.300 48.400Q191.700 50.800 191.700 52.900L191.700 52.900L191.700 55.100Q191.700 57 192.200 58.900Q192.700 60.800 193.700 62.550Q194.700 64.300 196.100 65.700Q197.500 67.100 199.350 67.900Q201.200 68.700 203.400 68.700Z"/><path fill="#D2432F" d="M243.900 81.300L243.900 81.300Q238.700 81.300 236.150 79.100Q233.600 76.900 233.600 72.300L233.600 72.300Q233.600 67.600 236.150 65.400Q238.700 63.200 243.900 63.200L243.900 63.200Q249.200 63.200 251.800 65.400Q254.400 67.600 254.400 72.300L254.400 72.300Q254.400 81.300 243.900 81.300Z"/></g>`;
export function renderStripSvg(
  strip: Strip,
  assets: SceneAssets,
  measure: (s: string, size: number, comic?: boolean) => number,
  selectedId?: string,
  workingPanelId?: string,
  reviewMarks = true,
): RenderResult {
  const overflow: string[] = [];
  const pencilled = (id: string) =>
    reviewMarks &&
    Object.values(strip.pencils ?? {}).some(
      (p) =>
        p.targetId === id ||
        (p.targetId === "$cast" &&
          strip.draft.panels.some((panel) =>
            panel.actors.some((actor) => actor.id === id),
          )),
    );
  const pencil = (id: string) => (pencilled(id) ? ' data-pencil="true"' : "");
  const pencilTag = (id: string, x: number, y: number) =>
    pencilled(id)
      ? `<g transform="translate(${x},${y})" pointer-events="none"><rect width="28" height="25" rx="3" fill="#F4EFE6" stroke="#3B6FD8"/><text x="14" y="19" text-anchor="middle" font-family="StripUI" font-size="20" fill="#3B6FD8">✎</text></g>`
      : "";
  const stamp = (id: string, x: number, y: number) =>
    reviewMarks && strip.protectedIds.includes(id)
      ? `<g transform="translate(${x},${y}) rotate(-9)" pointer-events="none"><rect width="88" height="30" rx="1" fill="#F4EFE6" stroke="#D2432F" stroke-width="3"/><text x="44" y="22" text-anchor="middle" font-family="StripUI" font-weight="800" font-size="23" fill="#D2432F">MINE</text></g>`
      : "";
  const panels = strip.draft.panels
    .map((panel, i) => {
      const x = i % 2 === 0 ? 40 : 610;
      const y = i < 2 ? 130 : 650;
      const border =
        workingPanelId === panel.id
          ? "#3B6FD8"
          : selectedId === panel.id
            ? "#D34B35"
            : "#24211F";
      if (panel.caption && measure(panel.caption, 14) > 480)
        overflow.push(`${panel.id}:caption`);
      const actors = panel.actors
        .map((actor) => {
          const three = panel.actors.length === 3;
          const ax =
            actor.side === "left"
              ? 12
              : actor.side === "center"
                ? 170
                : three
                  ? 340
                  : 298;
          const name = strip.draft.cast?.[actor.character]?.archetype
            ? archetypeFor(strip.draft, actor.character)
            : actor.character;
          const assetKey = `${name}-${actor.expression}${actor.pose ? `-${actor.pose}` : ""}`;
          const img = assets.peeps[assetKey] ?? `/peeps/${assetKey}.svg`;
          const selected = selectedId === actor.id;
          // The body itself comes from Open Peeps, not just a changed face or a rotated portrait.
          return `<g${pencil(actor.id)} data-object="${escape(actor.id)}" role="button" tabindex="0" aria-label="${escape(personFor(strip.draft, actor.character).name)}: ${actor.expression}, ${actor.pose ?? "original pose"}"><rect x="${ax}" y="161" width="218" height="308" fill="transparent" stroke="${selected ? "#D34B35" : "none"}" stroke-dasharray="6 5"/><image href="${img ?? ""}" x="${ax}" y="161" width="${three ? 190 : 240}" height="308"/>${pencilTag(actor.id, ax + 22, 392)}</g>${stamp(actor.id, ax + 20, 430)}`;
        })
        .join("");
      const twoActors = panel.actors.length === 2;
      const propX = twoActors
        ? 190
        : panel.actors[0]?.side === "left"
          ? 278
          : 35;
      const propY = twoActors ? 300 : 273;
      const state = panel.screenState ?? "none";
      const screenLabel = {
        none: "",
        files: "Launch plan",
        deleted: "File deleted",
        undo: "Undo",
        restored: "Restored ✓",
        "search-results": "Found: report",
        scheduled: "Mon 9:00 · Set",
      }[state];
      let prop = "";
      if (panel.prop === "laptop") {
        const restored = state === "restored";
        prop = `<g transform="translate(${propX},${propY})"><path d="M0 0H236V139H0Z" fill="#FFFDF8" stroke="#24211F" stroke-width="3"/><rect x="8" y="8" width="220" height="18" fill="#E6DFD2"/><circle cx="19" cy="17" r="3" fill="#D34B35"/><path d="M-12 140H248L260 155H-24Z" fill="#D8D9D0" stroke="#24211F" stroke-width="3"/><text x="118" y="56" text-anchor="middle" font-family="StripUI, sans-serif" font-size="${restored ? 27 : 23}" font-weight="700" fill="${restored ? "#35583E" : "#24211F"}">${escape(screenLabel)}</text>${state === "deleted" || state === "undo" || restored ? `<rect x="55" y="80" width="126" height="41" rx="7" fill="${restored ? "#E1EBDC" : "#F1DA91"}" stroke="#24211F" stroke-width="2"/><text x="118" y="109" text-anchor="middle" font-family="StripUI, sans-serif" font-size="26" font-weight="700">↶ Undo</text>${restored ? '<path d="M173 105L181 131L187 121L198 118Z" fill="#24211F" stroke="#FFFDF8" stroke-width="2"/>' : ""}` : '<path d="M28 82H205M28 97H181M28 112H195" stroke="#B7B1A5" stroke-width="4"/>'}</g>`;
      }
      if (panel.screen && (panel.prop === "laptop" || panel.prop === "phone")) {
        const screen = panel.screen;
        const tone =
          screen.tone === "error"
            ? "#D2432F"
            : screen.tone === "success"
              ? "#35583E"
              : "#24211F";
        // One fixed layout with bounded strings; textLength caps even unusually wide UI glyphs.
        const label = (text: string, cy: number, size: number, width = 202) =>
          `<text x="118" y="${cy}" text-anchor="middle" font-family="StripUI, sans-serif" font-size="${size}" font-weight="700" fill="${tone}"${measure(text, size) > width ? ` textLength="${width}" lengthAdjust="spacingAndGlyphs"` : ""}>${escape(text)}</text>`;
        const content =
          screen.kind === "none"
            ? ""
            : `<rect x="8" y="8" width="220" height="20" fill="${screen.tone === "error" ? "#F5DAD3" : screen.tone === "success" ? "#E1EBDC" : "#EAE3D6"}"/>${label(screen.title, 51, 19)}${screen.lines.map((line, n) => label(line, 74 + n * 21, 17)).join("")}${screen.button ? `<rect x="64" y="108" width="108" height="23" rx="3" fill="#E7B85A" stroke="#24211F"/>${label(screen.button, 125, 15, 96)}` : ""}${screen.kind === "chat" ? '<path d="M19 101h18" stroke="#24211F" stroke-width="2"/>' : ""}`;
        const frame = `<rect width="236" height="139" rx="3" fill="#FFFDF8" stroke="#24211F" stroke-width="3"/>${content}`;
        if (panel.prop === "phone") {
          const phoneLabel = (text: string, cy: number, size: number) =>
            `<text x="80" y="${cy}" text-anchor="middle" font-family="StripUI, sans-serif" font-size="${size}" font-weight="700" fill="${tone}"${measure(text, size) > 126 ? ' textLength="126" lengthAdjust="spacingAndGlyphs"' : ""}>${escape(text)}</text>`;
          const phoneContent =
            screen.kind === "none"
              ? ""
              : `<rect x="9" y="21" width="142" height="15" fill="${screen.tone === "error" ? "#F5DAD3" : screen.tone === "success" ? "#E1EBDC" : "#EAE3D6"}"/>${phoneLabel(screen.title, 61, 16)}${screen.lines.map((line, n) => phoneLabel(line, 88 + n * 23, 14)).join("")}${screen.button ? `<rect x="29" y="153" width="102" height="25" rx="3" fill="#E7B85A" stroke="#24211F"/>${phoneLabel(screen.button, 170, 14)}` : ""}`;
          prop = `<g transform="translate(${propX + 35},${Math.min(propY - 10, 254)})"><rect width="160" height="226" rx="16" fill="#24211F"/><rect x="8" y="20" width="144" height="180" fill="#FFFDF8"/>${phoneContent}<circle cx="80" cy="213" r="5" fill="#F4EFE6"/></g>`;
        } else
          prop = `<g transform="translate(${propX},${propY})">${frame}<path d="M-12 140H248L260 155H-24Z" fill="#D8D9D0" stroke="#24211F" stroke-width="3"/></g>`;
      } else if (panel.prop === "phone") {
        prop = `<g transform="translate(${propX + 45},${propY})"><rect width="120" height="190" rx="14" fill="#24211F"/><rect x="9" y="15" width="102" height="152" fill="#FFFDF8"/></g>`;
      }
      const sfx = panel.sfx
        ? `<text x="${panel.actors.length === 1 ? 285 : 275}" y="${panel.balloons.length ? 246 : 115}" text-anchor="middle" font-family="StripTitle, sans-serif" font-weight="800" font-size="${panel.sfx.length > 9 ? 32 : 44}" fill="${panel.screen?.tone === "error" ? "#D2432F" : "#24211F"}" transform="rotate(-6 275 246)">${escape(panel.sfx)}</text>`
        : "";
      if (panel.prop === "files")
        prop = `<g transform="translate(${propX},310)"><rect width="180" height="126" fill="#F1DA91" stroke="#24211F" stroke-width="3"/><path d="M24 32H150M24 52H120M24 72H143" stroke="#756E63" stroke-width="4"/></g>`;
      if (panel.prop === "coffee")
        prop = `<g transform="translate(${propX + 30},340)"><path d="M94 16C143 5 140 73 95 66" fill="none" stroke="#24211F" stroke-width="5"/><path d="M9 5H101L90 82Q55 100 20 82Z" fill="#E6BA67" stroke="#24211F" stroke-width="3"/><ellipse cx="55" cy="5" rx="46" ry="9" fill="#FFFDF8" stroke="#24211F" stroke-width="3"/></g>`;
      const balloons = panel.balloons
        .map((balloon, j) => {
          const two = panel.balloons.length === 2;
          const speaker = panel.actors.find(
            (a) => a.character === balloon.speaker,
          );
          const bx = two ? 14 + j * 270 : speaker?.side === "right" ? 182 : 18;
          const bw = two ? 252 : 350;
          const fitted = fitBalloon(balloon.text, two, (s, size) =>
            measure(s, size, true),
          );
          if (!fitted) {
            overflow.push(balloon.id);
            // Never render truncated/overflowing lettering, including old invalid records.
            return `<g data-object="${escape(balloon.id)}"><rect x="${bx}" y="30" width="${bw}" height="90" fill="#FFFDF8" stroke="#D2432F"/><title>Lettering does not fit. Shorten this line before export.</title></g>`;
          }
          const { lines, size, height } = fitted;
          const by = 30;
          const headX =
            speaker?.side === "right"
              ? 405
              : speaker?.side === "center"
                ? 275
                : 95;
          const balloonInk =
            selectedId === balloon.id
              ? "#D34B35"
              : pencilled(balloon.id)
                ? "#3B6FD8"
                : "#24211F";
          const tailBase = Math.max(
            bx + 35,
            Math.min(bx + bw - 40, headX + 30),
          );
          const selected = selectedId === balloon.id;
          return `<g${pencil(balloon.id)} data-object="${escape(balloon.id)}" role="button" tabindex="0" aria-label="${escape(balloon.text)}"><path d="M${tailBase} ${by + height - 8}L${headX} 194L${tailBase + 23} ${by + height - 8}" fill="#FFFDF8" stroke="${balloonInk}" stroke-width="2.5"/><rect x="${bx}" y="${by}" width="${bw}" height="${height}" rx="${Math.min(40, height / 2)}" fill="#FFFDF8" stroke="${balloonInk}" stroke-width="${selected ? 4 : 2.5}"/><text font-family="StripDialogue, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle" fill="#24211F">${lines
            .map(
              (line, n) =>
                `<tspan x="${bx + bw / 2}" y="${by + 23 + size * 0.65 + n * size * 1.12}">${escape(line)}</tspan>`,
            )
            .join(
              "",
            )}</text>${pencilTag(balloon.id, bx + bw - 22, by + height - 15)}${reviewMarks && strip.protectedIds.includes(balloon.id) && selectedId ? `<circle cx="${bx + bw - 12}" cy="${by + 8}" r="8" fill="#D34B35"/>` : ""}</g>${stamp(balloon.id, bx + bw - 75, by - 12)}`;
        })
        .join("");
      return `<g data-object="${escape(panel.id)}" role="button" tabindex="0" aria-label="Panel ${i + 1}" transform="translate(${x},${y})"><rect${pencil(panel.id)} x="0" y="0" width="550" height="490" rx="2" fill="${workingPanelId === panel.id ? "url(#pencil-halftone)" : i === 2 ? "#EFF0E8" : "#FCF9F2"}" stroke="${border}" stroke-width="3" stroke-dasharray="${workingPanelId === panel.id ? "10 7" : "none"}"/>${panel.caption ? `<text x="18" y="20" font-family="StripUI, sans-serif" font-size="14" fill="#756E63">${escape(panel.caption)}</text>` : ""}<path d="M20 457H530" stroke="#DAD3C6" stroke-width="2"/>${actors}<g${pencil(panel.id)}>${prop}${sfx}${pencilTag(panel.id, 500, 445)}</g>${balloons}${[panel.id, ...panel.actors.map((a) => a.id), ...panel.balloons.map((b) => b.id)].some(pencilled) ? '<path d="M520 7h23v23" fill="none" stroke="#3B6FD8" stroke-width="4" pointer-events="none"/>' : ""}${stamp(panel.id, 440, 450)}${workingPanelId === panel.id ? '<g pointer-events="none" stroke="#3B6FD8" fill="none" stroke-width="3" stroke-dasharray="12 6"><rect x="8" y="8" width="534" height="474"/><path d="M30 120h300m-300 12h240M40 430q100-70 180-40m120-250q75 50 100 240"/></g>' : ""}</g>`;
    })
    .join("");
  if (wrapText(strip.draft.title, 990, 44, measure).length > 1)
    overflow.push("title");
  return {
    overflow,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" aria-label="${escape(strip.draft.title)}" role="img"><defs><pattern id="pencil-halftone" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#edf2fc"/><circle cx="3" cy="3" r="1.2" fill="#3B6FD8" opacity=".3"/></pattern><style>@font-face{font-family:StripDialogue;font-weight:700;src:url('${assets.textFont}')}@font-face{font-family:StripTitle;src:url('${assets.titleFont}')}@font-face{font-family:StripUI;font-weight:100 900;src:url('${assets.uiFont ?? ""}')}[data-object]{cursor:pointer}[data-object]:focus{outline:3px solid #D34B35;outline-offset:3px}</style></defs><rect width="1200" height="1200" fill="#F5F1E9"/><text x="40" y="80" font-family="StripTitle, sans-serif" font-weight="800" font-size="44" fill="#24211F">${escape(strip.draft.title)}</text>${WORDMARK}${panels}<text x="40" y="1180" font-family="StripUI, sans-serif" font-size="15" fill="#756E63">${strip.draft.inputKind === "illustrative" ? "ILLUSTRATIVE PRODUCT UPDATE · FICTIONAL DIALOGUE" : "PRODUCT UPDATE · FICTIONAL DIALOGUE"}</text><text x="1160" y="1180" text-anchor="end" font-family="StripUI, sans-serif" font-size="15" fill="#756E63">MADE TOGETHER.</text></svg>`,
  };
}

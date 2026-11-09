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
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" aria-label="${escape(strip.draft.title)}" role="img"><defs><pattern id="pencil-halftone" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#edf2fc"/><circle cx="3" cy="3" r="1.2" fill="#3B6FD8" opacity=".3"/></pattern><style>@font-face{font-family:StripDialogue;font-weight:700;src:url('${assets.textFont}')}@font-face{font-family:StripTitle;src:url('${assets.titleFont}')}@font-face{font-family:StripUI;font-weight:100 900;src:url('${assets.uiFont ?? ""}')}[data-object]{cursor:pointer}[data-object]:focus{outline:3px solid #D34B35;outline-offset:3px}</style></defs><rect width="1200" height="1200" fill="#F5F1E9"/><text x="40" y="80" font-family="StripTitle, sans-serif" font-weight="800" font-size="44" fill="#24211F">${escape(strip.draft.title)}</text><text x="1158" y="74" text-anchor="end" font-family="StripUI, sans-serif" font-size="18" font-weight="600" letter-spacing="3" fill="#D34B35">STRIP</text>${panels}<text x="40" y="1180" font-family="StripUI, sans-serif" font-size="15" fill="#756E63">${strip.draft.inputKind === "illustrative" ? "ILLUSTRATIVE PRODUCT UPDATE · FICTIONAL DIALOGUE" : "PRODUCT UPDATE · FICTIONAL DIALOGUE"}</text><text x="1160" y="1180" text-anchor="end" font-family="StripUI, sans-serif" font-size="15" fill="#756E63">MADE TOGETHER.</text></svg>`,
  };
}

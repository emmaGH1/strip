import { cast, type Strip } from "./strip.js";

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
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  measure: (s: string, size: number) => number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/u).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate, fontSize) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

/** Shared canvas/export renderer. Fixed safe UI states are scene props, not AI output. */
export function renderStripSvg(
  strip: Strip,
  assets: SceneAssets,
  measure: (s: string, size: number, comic?: boolean) => number,
  selectedId?: string,
): RenderResult {
  const overflow: string[] = [];
  const panels = strip.draft.panels
    .map((panel, i) => {
      const x = i % 2 === 0 ? 40 : 610;
      const y = i < 2 ? 130 : 650;
      const border = selectedId === panel.id ? "#D34B35" : "#24211F";
      if (panel.caption && measure(panel.caption, 14) > 480)
        overflow.push(`${panel.id}:caption`);
      const actors = panel.actors
        .map((actor) => {
          const ax = actor.side === "left" ? 12 : 298;
          const img =
            assets.peeps[
              `${actor.character}-${actor.expression}-${actor.pose}`
            ] ?? assets.peeps[`${actor.character}-${actor.expression}`];
          const selected = selectedId === actor.id;
          // The body itself comes from Open Peeps, not just a changed face or a rotated portrait.
          return `<g data-object="${escape(actor.id)}" role="button" tabindex="0" aria-label="${escape(cast[actor.character].name)}: ${actor.expression}, ${actor.pose ?? "original pose"}"><rect x="${ax}" y="161" width="218" height="308" fill="transparent" stroke="${selected ? "#D34B35" : "none"}" stroke-dasharray="6 5"/><image href="${img ?? ""}" x="${ax}" y="161" width="240" height="308"/>${strip.protectedIds.includes(actor.id) && selectedId ? `<text x="${ax + 8}" y="465" font-size="14" font-family="StripUI" fill="#8A3527">PROTECTED</text>` : ""}</g>`;
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
          const size = two ? 25 : 30;
          const comicMeasure = (s: string, fontSize: number) =>
            measure(s, fontSize, true);
          const lines = wrapText(balloon.text, bw - 44, size, comicMeasure);
          const maxLines = 3;
          if (
            lines.length > maxLines ||
            lines.some((line) => comicMeasure(line, size) > bw - 44)
          )
            overflow.push(balloon.id);
          const height = Math.max(
            68,
            Math.min(lines.length, maxLines) * size * 1.12 + 30,
          );
          const by = 30;
          const headX = speaker?.side === "right" ? 405 : 95;
          const tailBase = Math.max(
            bx + 35,
            Math.min(bx + bw - 40, headX + 30),
          );
          const selected = selectedId === balloon.id;
          return `<g data-object="${escape(balloon.id)}" role="button" tabindex="0" aria-label="${escape(balloon.text)}"><path d="M${tailBase} ${by + height - 8}L${headX} 194L${tailBase + 23} ${by + height - 8}" fill="#FFFDF8" stroke="${selected ? "#D34B35" : "#24211F"}" stroke-width="2.5"/><rect x="${bx}" y="${by}" width="${bw}" height="${height}" rx="${Math.min(40, height / 2)}" fill="#FFFDF8" stroke="${selected ? "#D34B35" : "#24211F"}" stroke-width="${selected ? 4 : 2.5}"/><text font-family="StripDialogue, sans-serif" font-size="${size}" font-weight="700" text-anchor="middle" fill="#24211F">${lines
            .slice(0, maxLines)
            .map(
              (line, n) =>
                `<tspan x="${bx + bw / 2}" y="${by + 23 + size * 0.65 + n * size * 1.12}">${escape(line)}</tspan>`,
            )
            .join(
              "",
            )}</text>${strip.protectedIds.includes(balloon.id) && selectedId ? `<circle cx="${bx + bw - 12}" cy="${by + 8}" r="8" fill="#D34B35"/>` : ""}</g>`;
        })
        .join("");
      return `<g transform="translate(${x},${y})"><rect data-object="${escape(panel.id)}" x="0" y="0" width="550" height="490" rx="2" fill="${i === 2 ? "#EFF0E8" : "#FCF9F2"}" stroke="${border}" stroke-width="3"/>${panel.caption ? `<text x="18" y="20" font-family="StripUI, sans-serif" font-size="14" fill="#756E63">${escape(panel.caption)}</text>` : ""}<path d="M20 457H530" stroke="#DAD3C6" stroke-width="2"/>${actors}${prop}${balloons}</g>`;
    })
    .join("");
  if (wrapText(strip.draft.title, 990, 44, measure).length > 1)
    overflow.push("title");
  return {
    overflow,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" aria-label="${escape(strip.draft.title)}" role="img"><defs><style>@font-face{font-family:StripDialogue;font-weight:700;src:url('${assets.textFont}')}@font-face{font-family:StripTitle;src:url('${assets.titleFont}')}@font-face{font-family:StripUI;font-weight:100 900;src:url('${assets.uiFont ?? ""}')}[data-object]{cursor:pointer}[data-object]:focus{outline:3px solid #D34B35;outline-offset:3px}</style></defs><rect width="1200" height="1200" fill="#F5F1E9"/><text x="40" y="80" font-family="StripTitle, Impact, sans-serif" font-size="50" fill="#24211F">${escape(strip.draft.title)}</text><text x="1158" y="74" text-anchor="end" font-family="StripUI, sans-serif" font-size="18" font-weight="600" letter-spacing="3" fill="#D34B35">STRIP</text>${panels}<text x="40" y="1180" font-family="StripUI, sans-serif" font-size="15" fill="#756E63">${strip.draft.inputKind === "illustrative" ? "ILLUSTRATIVE PRODUCT UPDATE · FICTIONAL DIALOGUE" : "PRODUCT UPDATE · FICTIONAL DIALOGUE"}</text><text x="1160" y="1180" text-anchor="end" font-family="StripUI, sans-serif" font-size="15" fill="#756E63">MADE TOGETHER.</text></svg>`,
  };
}

import { cast, type Strip } from "./strip.js";

export interface SceneAssets {
  peeps: Record<string, string>;
  textFont: string;
  titleFont: string;
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

export function renderStripSvg(
  strip: Strip,
  assets: SceneAssets,
  measure: (s: string, size: number) => number,
  selectedId?: string,
): RenderResult {
  const overflow: string[] = [];
  const panels = strip.draft.panels
    .map((panel, i) => {
      const x = i % 2 === 0 ? 40 : 610;
      const y = i < 2 ? 130 : 650;
      const border = selectedId === panel.id ? "#D34B35" : "#24211F";
      if (measure(`${i + 1} / ${panel.caption}`, 16) > 514)
        overflow.push(`${panel.id}:caption`);
      const actors = panel.actors
        .map((actor) => {
          const ax = actor.side === "left" ? 30 : 305;
          const img = assets.peeps[`${actor.character}-${actor.expression}`];
          const selected = selectedId === actor.id;
          return `<g data-object="${escape(actor.id)}" role="button" tabindex="0" aria-label="${escape(cast[actor.character].name)}: ${actor.expression}"><rect x="${ax}" y="230" width="190" height="239" fill="transparent" stroke="${selected ? "#D34B35" : "none"}" stroke-dasharray="6 5"/><image href="${img ?? ""}" x="${ax}" y="230" width="190" height="239"/>${strip.protectedIds.includes(actor.id) && selectedId ? `<text x="${ax + 8}" y="456" font-size="14" fill="#8A3527">PROTECTED</text>` : ""}</g>`;
        })
        .join("");
      const propX = panel.actors[0]?.side === "left" ? 282 : 38;
      let prop = "";
      if (panel.prop === "laptop")
        prop = `<g transform="translate(${propX},316) rotate(-3)"><path d="M0 0 H180 V107 H0Z" fill="#E5E9DE" stroke="#24211F" stroke-width="3"/><path d="M-13 108 H191 L203 120 H-24Z" fill="#FFFDF8" stroke="#24211F" stroke-width="3"/><path d="M24 29H150M24 44H124M24 59H140" stroke="#899283" stroke-width="4"/><rect x="48" y="76" width="84" height="19" rx="3" fill="#E6BA67"/></g>`;
      if (panel.prop === "files")
        prop = `<g transform="translate(${propX},324) rotate(8)"><rect x="16" y="-13" width="139" height="111" fill="#E6BA67" stroke="#24211F" stroke-width="3"/><rect x="0" y="0" width="139" height="111" fill="#FFFDF8" stroke="#24211F" stroke-width="3"/><path d="M20 27H112M20 43H96M20 59H113" stroke="#B7B1A5" stroke-width="4"/><path d="M55 75L84 102M84 75L55 102" stroke="#D34B35" stroke-width="5"/></g>`;
      if (panel.prop === "coffee")
        prop = `<g transform="translate(${propX + 28},343)"><ellipse cx="55" cy="91" rx="66" ry="8" fill="#E6DFD2"/><path d="M94 16 C143 5 140 73 95 66" fill="none" stroke="#24211F" stroke-width="5"/><path d="M9 5H101L90 82Q55 100 20 82Z" fill="#E6BA67" stroke="#24211F" stroke-width="3"/><ellipse cx="55" cy="5" rx="46" ry="9" fill="#FFFDF8" stroke="#24211F" stroke-width="3"/><path d="M35-15Q20-31 35-45M70-15Q55-31 70-45" fill="none" stroke="#B7B1A5" stroke-width="3"/></g>`;
      const balloons = panel.balloons
        .map((balloon, j) => {
          const two = panel.balloons.length === 2;
          const bx = two ? 20 + j * 253 : 25;
          const bw = two ? 236 : 490;
          const size = two ? 27 : 40;
          const lines = wrapText(balloon.text, bw - 40, size, measure);
          const maxLines = two ? 5 : 3;
          if (
            lines.length > maxLines ||
            lines.some((line) => measure(line, size) > bw - 40)
          )
            overflow.push(balloon.id);
          const height = Math.max(
            86,
            Math.min(lines.length, maxLines) * (size * 1.19) + 32,
          );
          const speaker = panel.actors.find(
            (a) => a.character === balloon.speaker,
          );
          const tail = speaker?.side === "left" ? bx + 65 : bx + bw - 65;
          const selected = selectedId === balloon.id;
          return `<g data-object="${escape(balloon.id)}" role="button" tabindex="0" aria-label="${escape(balloon.text)}"><path d="M${bx + 21} 55 H${bx + bw - 21} Q${bx + bw} 55 ${bx + bw} 76 V${55 + height - 21} Q${bx + bw} ${55 + height} ${bx + bw - 21} ${55 + height} H${tail + 20} L${tail - 6} ${55 + height + 27} L${tail} ${55 + height} H${bx + 21} Q${bx} ${55 + height} ${bx} ${55 + height - 21} V76 Q${bx} 55 ${bx + 21} 55Z" fill="#FFFDF8" stroke="${selected ? "#D34B35" : "#24211F"}" stroke-width="${selected ? 4 : 2.5}"/><text font-family="StripText, Arial, sans-serif" font-size="${size}" font-weight="500" fill="#24211F">${lines
            .slice(0, maxLines)
            .map(
              (line, n) =>
                `<tspan x="${bx + 20}" y="${75 + size * 0.8 + n * size * 1.19}">${escape(line)}</tspan>`,
            )
            .join(
              "",
            )}</text>${strip.protectedIds.includes(balloon.id) && selectedId ? `<circle cx="${bx + bw - 12}" cy="60" r="9" fill="#D34B35"/>` : ""}</g>`;
        })
        .join("");
      const wordless = !panel.balloons.length
        ? `<g transform="translate(330,110) rotate(-8)"><path d="M0 0L-18 20M15 4L14 30M31 13L47 37" stroke="#D34B35" stroke-width="6" stroke-linecap="round"/><text x="-62" y="89" font-family="StripTitle, Impact, sans-serif" font-size="58" fill="#24211F">PHEW.</text></g>`
        : "";
      return `<g transform="translate(${x},${y})"><rect data-object="${escape(panel.id)}" x="0" y="0" width="550" height="490" rx="2" fill="${i === 2 ? "#EFF0E8" : "#FCF9F2"}" stroke="${border}" stroke-width="3"/><text x="18" y="30" font-family="StripText, Arial, sans-serif" font-size="16" font-weight="600" letter-spacing="2" fill="#756E63">${i + 1} / ${escape(panel.caption)}</text><path d="M20 457H530" stroke="#DAD3C6" stroke-width="2"/>${prop}${actors}${balloons}${wordless}</g>`;
    })
    .join("");
  const titleLines = wrapText(strip.draft.title, 990, 44, measure);
  if (titleLines.length > 1) overflow.push("title");
  return {
    overflow,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" aria-label="${escape(strip.draft.title)}" role="img"><defs><style>@font-face{font-family:StripText;font-weight:100 900;src:url('${assets.textFont}')}@font-face{font-family:StripTitle;src:url('${assets.titleFont}')} [data-object]{cursor:pointer} [data-object]:focus{outline:3px solid #D34B35;outline-offset:3px}</style></defs><rect width="1200" height="1200" fill="#F5F1E9"/><text x="40" y="80" font-family="StripTitle, Impact, sans-serif" font-size="50" fill="#24211F">${escape(strip.draft.title)}</text><text x="1158" y="74" text-anchor="end" font-family="StripText, Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="3" fill="#D34B35">STRIP</text>${panels}<text x="40" y="1180" font-family="StripText, Arial, sans-serif" font-size="15" fill="#756E63">${strip.draft.inputKind === "illustrative" ? "ILLUSTRATIVE PRODUCT UPDATE · FICTIONAL DIALOGUE" : "PRODUCT UPDATE · FICTIONAL DIALOGUE"}</text><text x="1160" y="1180" text-anchor="end" font-family="StripText, Arial, sans-serif" font-size="15" fill="#756E63">MADE TOGETHER.</text></svg>`,
  };
}

import { comicAdvances } from "./comic-metrics.js";

export const MIN_BALLOON_SIZE = 22;
export function comicWidth(text: string, size: number): number {
  // Advance widths plus a safety margin. Unknown/fallback glyphs use a conservative two ems, never zero.
  return (
    Array.from(text).reduce((n, c) => n + (comicAdvances[c] ?? 2), 0) *
    size *
    1.025
  );
}
export function wrapText(
  text: string,
  width: number,
  size: number,
  measure: (s: string, size: number) => number,
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/u).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate, size) > width) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}
export function fitBalloon(text: string, two: boolean, measure = comicWidth) {
  const width = (two ? 252 : 350) - 44;
  for (let size = two ? 25 : 30; size >= MIN_BALLOON_SIZE; size--) {
    const lines = wrapText(text, width, size, measure);
    if (
      lines.length <= 3 &&
      lines.every((line) => measure(line, size) <= width)
    )
      return {
        lines,
        size,
        height: Math.max(68, lines.length * size * 1.12 + 30),
      };
  }
  return null;
}
export function balloonFitError(id: string) {
  return `Balloon ${id} cannot fit at the minimum ${MIN_BALLOON_SIZE}px lettering size. Shorten it (target 8 words; hard cap 12). Nothing saved.`;
}

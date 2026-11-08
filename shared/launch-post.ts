import type { Draft } from "./strip.js";

/** Facts only: never promote the title or fictional balloons into a claim. */
export function launchCaption(
  draft: Pick<Draft, "source" | "sourceUrl" | "inputKind">,
): string {
  return `${draft.inputKind === "illustrative" ? "Illustrative update: " : ""}${draft.source.trim()} — in four panels.${draft.sourceUrl ? `\n${draft.sourceUrl}` : ""}\nFictional dialogue. Made with Strip.`;
}

export function exportFilename(title: string): string {
  const name = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
    .replace(/-$/g, "");
  return `${name || "strip-comic"}.png`;
}

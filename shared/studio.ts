import { cast, type Draft } from "./strip.js";

/** Human labels for context chips; machine ids belong only in hidden context. */
export function objectLabel(draft: Draft, objectId: string) {
  const panel = draft.panels.find(
    (p) =>
      p.id === objectId ||
      p.actors.some((a) => a.id === objectId) ||
      p.balloons.some((b) => b.id === objectId),
  );
  if (!panel) return "Comic selection";
  const prefix = `Panel ${draft.panels.indexOf(panel) + 1}`;
  const balloon = panel.balloons.find((b) => b.id === objectId);
  const actor = panel.actors.find((a) => a.id === objectId);
  const people = draft.cast ?? cast;
  return balloon
    ? `${prefix} · ${people[balloon.speaker].name}'s line`
    : actor
      ? `${prefix} · ${people[actor.character].name}`
      : prefix;
}

/** Only literal excerpts are fact rows; never promote fictional dialogue to a source claim. */
export function sourceCoverage(draft: Draft) {
  const facts = new Map<string, { quote: string; panels: number[] }>();
  const fictional: number[] = [];
  draft.panels.forEach((panel, index) => {
    if (!panel.sourceQuote || !draft.source.includes(panel.sourceQuote)) {
      fictional.push(index + 1);
      return;
    }
    const fact = facts.get(panel.sourceQuote) ?? {
      quote: panel.sourceQuote,
      panels: [],
    };
    fact.panels.push(index + 1);
    facts.set(panel.sourceQuote, fact);
  });
  return { facts: [...facts.values()], fictional };
}

export function panelBounds(index: number) {
  return {
    x: index % 2 === 0 ? 40 : 610,
    y: index < 2 ? 130 : 650,
    width: 550,
    height: 490,
  };
}

/** Clip as well as changing the viewport: SVG meet/letterboxing may otherwise reveal neighbours. */
export function cropPanel(svg: string, index: number) {
  const { x, y, width, height } = panelBounds(index);
  return svg
    .replace(
      /(<svg\b[^>]*>)/u,
      `$1<defs><clipPath id="panel-crop-${index}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath></defs><g clip-path="url(#panel-crop-${index})">`,
    )
    .replace("</svg>", "</g></svg>")
    .replace(
      'viewBox="0 0 1200 1200"',
      `viewBox="${x} ${y} ${width} ${height}"`,
    )
    .replace(
      'width="1200" height="1200"',
      `width="${width}" height="${height}"`,
    );
}

export function draftRequest(source: string) {
  return `Pencil a strip from: ${source.trim()}`;
}

export function selectionAnchor(
  bounds: { x: number; y: number; width: number; height: number },
  canvasWidth: number,
) {
  const flip = bounds.y < 60;
  return {
    left: Math.max(
      190,
      Math.min(canvasWidth - 190, bounds.x + bounds.width / 2),
    ),
    top: flip ? bounds.y + bounds.height + 8 : bounds.y - 8,
    flip,
  };
}

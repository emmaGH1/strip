import type { Draft } from "./strip.js";

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

export function draftRequest(
  source: string,
  illustrative: boolean,
  cast: NonNullable<Draft["cast"]>,
) {
  return `Make a four-panel comic from this ${illustrative ? "illustrative" : "user-provided"} product update. Use create-strip with inputKind ${illustrative ? "illustrative" : "user-provided"}, then show it in Studio. Keep literal claims within this source, distinguish fictional dialogue, include a wordless visual beat and three endings. Preserve these names and traits in draft.cast, using stable character ids ari/sam.\nCAST:\n${JSON.stringify(cast)}\nSOURCE:\n${source}`;
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

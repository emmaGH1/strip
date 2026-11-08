import { describe, expect, it } from "vitest";

import { preparedExamples } from "./examples.js";
import { composedDraftSchema } from "./strip.js";
import {
  cropPanel,
  draftRequest,
  panelBounds,
  objectLabel,
  selectionAnchor,
  sourceCoverage,
} from "./studio.js";

describe("M1 studio presentation and handoff", () => {
  it("uses only human-readable context chip labels", () => {
    const draft = preparedExamples[0]!;
    const panel = draft.panels[0]!;
    expect(objectLabel(draft, panel.id)).toBe("Panel 1");
    expect(objectLabel(draft, panel.balloons[0]!.id)).toBe(
      "Panel 1 · Ari's line",
    );
    expect(objectLabel(draft, panel.actors[0]!.id)).toBe("Panel 1 · Ari");
    expect(objectLabel(draft, "missing-id")).toBe("Comic selection");
  });
  it("deduplicates literal facts and associates every depicting panel", () => {
    const draft = structuredClone(preparedExamples[0]!);
    draft.panels[0]!.sourceQuote = draft.panels[2]!.sourceQuote;
    const coverage = sourceCoverage(draft);
    expect(coverage.facts).toEqual([
      { quote: draft.panels[2]!.sourceQuote, panels: [1, 3] },
    ]);
    expect(coverage.fictional).toEqual([2, 4]);
    expect(JSON.stringify(coverage)).not.toContain(
      "Fictional dialogue / visual beat",
    );
  });
  it("does not render an invalid non-source quote as a fact", () => {
    const draft = structuredClone(preparedExamples[0]!);
    draft.panels[0]!.sourceQuote = "Imaginary feature";
    expect(
      sourceCoverage(draft).facts.some((f) => f.quote === "Imaginary feature"),
    ).toBe(false);
  });
  it("uses an exact panel-4 viewport and matching intrinsic aspect ratio", () => {
    expect(panelBounds(3)).toEqual({ x: 610, y: 650, width: 550, height: 490 });
    const crop = cropPanel(
      '<svg width="1200" height="1200" viewBox="0 0 1200 1200"></svg>',
      3,
    );
    expect(crop).toContain(
      '<svg width="550" height="490" viewBox="610 650 550 490">',
    );
    expect(crop).toContain(
      '<clipPath id="panel-crop-3"><rect x="610" y="650" width="550" height="490"/></clipPath>',
    );
    expect(crop).toContain('<g clip-path="url(#panel-crop-3)"></g></svg>');
  });
  it("flips the context bar below a selection near the top and clamps horizontally", () => {
    expect(
      selectionAnchor({ x: 0, y: 20, width: 80, height: 40 }, 720),
    ).toEqual({ left: 190, top: 68, flip: true });
    expect(
      selectionAnchor({ x: 640, y: 350, width: 80, height: 40 }, 720),
    ).toEqual({ left: 530, top: 342, flip: false });
  });
  it("preserves editable cast in the real draft request and schema, without breaking older strips", () => {
    const people = {
      ari: { name: "Jo", role: "hopeful tester" },
      sam: { name: "Lee", role: "skeptical designer" },
    };
    const draft = composedDraftSchema.parse({
      ...preparedExamples[0],
      cast: people,
    });
    expect(draft.cast).toEqual(people);
    expect(composedDraftSchema.parse(preparedExamples[0]).cast).toBeUndefined();
    expect(draftRequest("  Undo restores deleted files.  ")).toBe(
      "Pencil a strip from: Undo restores deleted files.",
    );
  });
});

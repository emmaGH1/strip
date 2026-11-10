import { describe, expect, it } from "vitest";

import { preparedExamples } from "./examples.js";
import { renderStripSvg, wrapText, type SceneAssets } from "./render-strip.js";
import type { Strip } from "./strip.js";
const measure = (text: string, size: number) => text.length * size * 0.5;
const assets: SceneAssets = {
  peeps: {},
  textFont: "data:font/woff2;base64,",
  titleFont: "data:font/woff2;base64,",
};
const scene = (): Strip => ({
  id: "sample",
  draft: structuredClone(preparedExamples[0]!),
  revision: 0,
  protectedIds: [],
  origin: "prepared-example",
  lastEditedBy: "human",
  updatedAt: "now",
});
describe("shared canvas/export renderer", () => {
  it("wraps by measured width rather than character-count guesses", () => {
    expect(wrapText("One two three four", 70, 20, measure)).toEqual([
      "One two",
      "three",
      "four",
    ]);
  });
  it("renders all three samples without overflow using a conservative metric", () => {
    for (const draft of preparedExamples)
      expect(
        renderStripSvg({ ...scene(), draft }, assets, measure).overflow,
      ).toEqual([]);
  });
  it("renders the feature on the laptop and uses comic lettering only in balloons", () => {
    const svg = renderStripSvg(scene(), assets, measure).svg;
    expect(svg).toContain("Restored ✓");
    expect(svg).toContain("↶ Undo");
    expect(svg).toContain('font-family="StripDialogue, sans-serif"');
    expect(svg).not.toContain("PHEW.");
    expect(svg).not.toContain("UNDO. EXHALE.");
  });
  it("escapes model/user text instead of accepting arbitrary SVG/HTML", () => {
    const strip = scene();
    strip.draft.panels[0]!.balloons[0]!.text = '<script>alert("x")</script>';
    const output = renderStripSvg(strip, assets, measure).svg;
    expect(output).not.toContain("<script>");
    expect(output).toContain("&lt;script&gt;");
  });
  it("detects text that cannot fit instead of silently exporting it", () => {
    const strip = scene();
    strip.draft.panels[0]!.balloons[0]!.text =
      "ThisWordIsDeliberatelyTooWideToFitInTheSpeechBalloon";
    expect(renderStripSvg(strip, assets, measure).overflow).toContain(
      "balloon-1",
    );
  });
  it("keeps selection/protection editor chrome out of export", () => {
    const strip = scene();
    strip.protectedIds = ["balloon-1"];
    const screen = renderStripSvg(strip, assets, measure, "balloon-1").svg;
    const exported = renderStripSvg(strip, assets, measure).svg;
    expect(screen).toContain('<circle cx="356"');
    expect(exported).not.toContain('<circle cx="356"');
  });
});

describe("wordmark and blank device screens", () => {
  it("renders the inlined Strip wordmark and no STRIP text tag", async () => {
    const svg = renderStripSvg(scene(), assets, measure).svg;
    expect(svg).toContain('aria-label="Strip"');
    expect(svg).toContain('fill="#D2432F"');
    expect(svg).not.toContain(">STRIP</text>");
    expect(svg).toContain("MADE TOGETHER.");
  });
  it("rejects a laptop or phone with a blank screen on write", async () => {
    const { blankScreenErrors } = await import("./strip.js");
    const draft = structuredClone(preparedExamples[0]!);
    expect(blankScreenErrors(draft)).toEqual([]);
    draft.panels[3]!.prop = "phone";
    draft.panels[3]!.screen = {
      kind: "chat",
      title: "",
      lines: [],
      tone: "normal",
    };
    expect(blankScreenErrors(draft)[0]).toMatch(/Panel 4.*blank screen/);
    draft.panels[3]!.screen = {
      kind: "none",
      title: "x",
      lines: [],
      tone: "normal",
    };
    expect(blankScreenErrors(draft)).toHaveLength(1);
    draft.panels[3]!.screen = {
      kind: "chat",
      title: "",
      lines: ["Sent"],
      tone: "normal",
    };
    expect(blankScreenErrors(draft)).toEqual([]);
    draft.panels[3]!.prop = "none";
    expect(blankScreenErrors(draft)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import { landingDemoStates } from "./landing-demo";
import { isPublicEntry } from "./public-entry";
import { applyEdits } from "./strip";

describe("labelled local landing demonstration", () => {
  it("uses genuinely attributed blue pencil metadata", () => {
    const states = landingDemoStates();
    expect(states.pencil.origin).toBe("prepared-example");
    expect(states.pencil.draft.inputKind).toBe("illustrative");
    expect(
      Object.values(states.pencil.pencils!).map((p) => p.targetId),
    ).toEqual(["balloon-1"]);
  });
  it("inks and protects a line, then changes only the surrounding actor", () => {
    const { mine, revised } = landingDemoStates();
    expect(mine.protectedIds).toContain("balloon-1");
    expect(revised.draft.panels[0]!.balloons).toEqual(
      mine.draft.panels[0]!.balloons,
    );
    expect(revised.draft.panels[0]!.actors[0]!.pose).toBe("arms-crossed");
    expect(() =>
      applyEdits(
        revised,
        revised.revision,
        [{ kind: "balloon", id: "balloon-1", text: "Replaced." }],
        "agent",
      ),
    ).toThrow();
  });
  it("Ink accepts while Erase restores the real prior actor values", () => {
    const states = landingDemoStates();
    expect(states.ink.draft).toEqual(states.revised.draft);
    expect(states.erase.draft).toEqual(states.mine.draft);
    expect(Object.keys(states.ink.pencils ?? {})).toHaveLength(0);
    expect(Object.keys(states.erase.pencils ?? {})).toHaveLength(0);
    expect(states.ink.protectedIds).toEqual(states.mine.protectedIds);
    expect(states.erase.protectedIds).toEqual(states.mine.protectedIds);
  });
  it("starts fresh each time without changing prepared source fixtures", () => {
    const first = landingDemoStates();
    first.mine.draft.title = "Changed only locally";
    expect(landingDemoStates().mine.draft.title).toBe(
      "A small undo. A large relief.",
    );
  });
});
describe("public review route boundary", () => {
  it("allows only the three exact options and existing public root", () => {
    for (const path of [
      "/",
      "/landing-a",
      "/landing-b",
      "/landing-c",
      "/landing-c/",
    ])
      expect(isPublicEntry(path)).toBe(true);
    for (const path of [
      "/home",
      "/landing-d",
      "/landing-a/private",
      "/settings",
      "/mcp/connect",
    ])
      expect(isPublicEntry(path)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { preparedExamples } from "./examples.js";
import {
  applyEdits,
  draftSchema,
  composedDraftSchema,
  stripSchema,
  setProtection,
  type Draft,
  type Strip,
} from "./strip.js";

const draft = (): Draft => structuredClone(preparedExamples[0]!);
const balloon = (s: Strip, i = 0) => s.draft.panels[i]!.balloons[0]!;
function fixture(): Strip {
  return {
    id: "test",
    revision: 0,
    draft: draft(),
    protectedIds: [],
    origin: "prepared-example",
    lastEditedBy: "human",
    updatedAt: "2026-11-08T10:00:00.000Z",
  };
}

describe("structured scene validation", () => {
  it("validates all three labelled illustrative samples", () => {
    for (const sample of preparedExamples)
      expect(draftSchema.safeParse(sample).success).toBe(true);
  });
  it("rejects too many panels, long balloons and invented citations", () => {
    const sample = draft();
    expect(
      draftSchema.safeParse({ ...sample, panels: sample.panels.slice(1) })
        .success,
    ).toBe(false);
    sample.panels[0]!.balloons[0]!.text = Array(13).fill("word").join(" ");
    expect(draftSchema.safeParse(sample).success).toBe(false);
    sample.panels[0]!.balloons[0]!.text = "Short.";
    sample.panels[0]!.sourceQuote = "We added time travel.";
    expect(draftSchema.safeParse(sample).success).toBe(false);
  });
  it("rejects duplicate ids and offstage speakers", () => {
    const sample = draft();
    sample.panels[0]!.id = sample.panels[1]!.id;
    expect(draftSchema.safeParse(sample).success).toBe(false);
    sample.panels[0]!.id = "unique";
    sample.panels[1]!.balloons[0]!.speaker = "sam";
    expect(draftSchema.safeParse(sample).success).toBe(false);
  });
});
describe("approved scene direction", () => {
  it("preserves historical saved scenes without silently adding poses or cast", () => {
    const legacy = fixture();
    legacy.draft.panels[0]!.actors = legacy.draft.panels[0]!.actors.filter(
      (a) => a.character !== "sam",
    );
    for (const panel of legacy.draft.panels)
      for (const actor of panel.actors) delete actor.pose;
    const read = stripSchema.parse(legacy);
    expect(read.draft.panels[0]!.actors).toEqual(
      legacy.draft.panels[0]!.actors,
    );
    expect(read.draft.panels[0]!.actors[0]!.pose).toBeUndefined();
    expect(
      applyEdits(
        read,
        0,
        [{ kind: "balloon", id: "balloon-1", text: "My existing work." }],
        "human",
      ).revision,
    ).toBe(1);
    expect(composedDraftSchema.safeParse(legacy.draft).success).toBe(false);
  });
  it("shows Undo happening without an explanatory caption and introduces Sam", () => {
    const sample = draft();
    expect(sample.panels[2]!.screenState).toBe("restored");
    expect(sample.panels[2]!.prop).toBe("laptop");
    expect(sample.panels.every((p) => !p.caption)).toBe(true);
    expect(sample.panels[0]!.actors.some((a) => a.character === "sam")).toBe(
      true,
    );
    expect(
      new Set(sample.panels.slice(0, 3).map((p) => p.actors[0]!.pose)).size,
    ).toBe(3);
    sample.panels[0]!.actors = sample.panels[0]!.actors.filter(
      (a) => a.character !== "sam",
    );
    expect(draftSchema.safeParse(sample).success).toBe(false);
  });
  it("rejects three identical consecutive bodies", () => {
    const sample = draft();
    for (const panel of sample.panels.slice(0, 3))
      panel.actors[0]!.pose = "standing";
    expect(draftSchema.safeParse(sample).success).toBe(false);
  });
  it("enforces protection and stale revisions on pose and screen writes", () => {
    const locked = setProtection(fixture(), 0, "panel-3", true, "human");
    for (const edit of [
      { kind: "pose", id: "actor-3", pose: "standing" },
      { kind: "screen-state", id: "panel-3", screenState: "deleted" },
    ] as const) {
      expect(() => applyEdits(locked, 1, [edit], "agent")).toThrow("protected");
      expect(() => applyEdits(locked, 0, [edit], "human")).toThrow("changed");
      expect(applyEdits(locked, 1, [edit], "human").revision).toBe(2);
    }
    const characterLocked = setProtection(
      fixture(),
      0,
      "actor-3",
      true,
      "human",
    );
    expect(() =>
      applyEdits(
        characterLocked,
        1,
        [{ kind: "pose", id: "actor-3", pose: "standing" }],
        "agent",
      ),
    ).toThrow("protected");
  });
});
describe("shared edit and protection reducer", () => {
  it("applies the exact same edit contract for UI and agent", () => {
    for (const actor of ["human", "agent"] as const) {
      const next = applyEdits(
        fixture(),
        0,
        [
          {
            kind: "balloon",
            id: "balloon-1",
            text: "A deliberate human choice.",
          },
        ],
        actor,
      );
      expect(balloon(next).text).toBe("A deliberate human choice.");
      expect(next.revision).toBe(1);
      expect(next.lastEditedBy).toBe(actor);
    }
  });
  it("blocks an agent on a protected balloon, but lets the human refine it", () => {
    const locked = setProtection(fixture(), 0, "balloon-1", true, "human");
    expect(() =>
      applyEdits(
        locked,
        1,
        [{ kind: "balloon", id: "balloon-1", text: "Overwrite." }],
        "agent",
      ),
    ).toThrow("protected");
    expect(
      applyEdits(
        locked,
        1,
        [{ kind: "balloon", id: "balloon-1", text: "My better wording." }],
        "human",
      ).revision,
    ).toBe(2);
  });
  it("blocks panel-level indirect edits and expression writes", () => {
    const locked = setProtection(fixture(), 0, "panel-1", true, "human");
    expect(() =>
      applyEdits(
        locked,
        1,
        [{ kind: "expression", id: "actor-1", expression: "panic" }],
        "agent",
      ),
    ).toThrow("protected");
    expect(() =>
      applyEdits(
        locked,
        1,
        [{ kind: "prop", id: "panel-1", prop: "none" }],
        "agent",
      ),
    ).toThrow("protected");
  });
  it("forbids agent unlock and lock operations", () => {
    expect(() =>
      setProtection(fixture(), 0, "panel-1", false, "agent"),
    ).toThrow("Only a person");
    expect(() => setProtection(fixture(), 0, "panel-1", true, "agent")).toThrow(
      "Only a person",
    );
  });
  it("rejects stale agent writes after a human change", () => {
    const edited = applyEdits(
      fixture(),
      0,
      [{ kind: "expression", id: "actor-1", expression: "panic" }],
      "human",
    );
    expect(() =>
      applyEdits(
        edited,
        0,
        [{ kind: "balloon", id: "balloon-1", text: "Stale." }],
        "agent",
      ),
    ).toThrow("changed");
  });
  it("keeps batches atomic when a later edit is protected", () => {
    const locked = setProtection(fixture(), 0, "balloon-4", true, "human");
    expect(() =>
      applyEdits(
        locked,
        1,
        [
          { kind: "balloon", id: "balloon-1", text: "First." },
          { kind: "choose-ending", index: 1 },
        ],
        "agent",
      ),
    ).toThrow("protected");
    expect(balloon(locked).text).toBe(balloon(fixture()).text);
    expect(locked.revision).toBe(1);
  });
  it("updates an unprotected object without touching protected human work", () => {
    const edited = applyEdits(
      fixture(),
      0,
      [{ kind: "balloon", id: "balloon-1", text: "My own line." }],
      "human",
    );
    const locked = setProtection(edited, 1, "balloon-1", true, "human");
    const revised = applyEdits(
      locked,
      2,
      [{ kind: "balloon", id: "balloon-4", text: "A different ending." }],
      "agent",
    );
    expect(balloon(revised).text).toBe("My own line.");
    expect(balloon(revised, 3).text).toBe("A different ending.");
  });
  it("preserves immutable source, ids, cast and origin", () => {
    const current = fixture();
    const revised = applyEdits(
      current,
      0,
      [
        { kind: "expression", id: "actor-1", expression: "thinking" },
        { kind: "endings", choices: ["One.", "Two.", "Three."] },
      ],
      "agent",
    );
    expect(revised.draft.source).toBe(current.draft.source);
    expect(revised.origin).toBe(current.origin);
    expect(revised.draft.panels.map((p) => p.id)).toEqual(
      current.draft.panels.map((p) => p.id),
    );
    expect(current.revision).toBe(0);
  });
});

import { describe, expect, it } from "vitest";

import { preparedExamples } from "./examples";
import { applyEdits, setProtection, stripSchema, type Strip } from "./strip";
const fixture = (): Strip => ({
  id: "review",
  revision: 0,
  draft: structuredClone(preparedExamples[0]!),
  protectedIds: [],
  origin: "prepared-example",
  lastEditedBy: "human",
  updatedAt: "",
});
describe("real pencils and inks", () => {
  it("inks a new draft item but does not fabricate a previous value for Erase", () => {
    const draft = fixture();
    draft.pencils = { "draft:panel-1": { targetId: "panel-1", before: null } };
    expect(() =>
      applyEdits(
        draft,
        0,
        [{ kind: "review", key: "draft:panel-1", decision: "erase" }],
        "human",
      ),
    ).toThrow("no previous value");
    const inked = applyEdits(
      draft,
      0,
      [{ kind: "review", key: "draft:panel-1", decision: "ink" }],
      "human",
    );
    expect(inked.pencils).toEqual({});
    expect(inked.draft).toEqual(draft.draft);
  });
  it("does not mark an unchanged value as an agent proposal", () => {
    const base = fixture();
    const next = applyEdits(
      base,
      0,
      [{ kind: "title", text: base.draft.title }],
      "agent",
    );
    expect(next.pencils).toBeUndefined();
  });
  it("erases a pose change on a legacy record without inventing a prior pose", () => {
    const base = fixture();
    delete base.draft.panels[0]!.actors[0]!.pose;
    const next = applyEdits(
      base,
      0,
      [{ kind: "pose", id: "actor-1", pose: "standing" }],
      "agent",
    );
    const erased = applyEdits(
      next,
      1,
      [{ kind: "review", key: "pose:actor-1", decision: "erase" }],
      "human",
    );
    expect(erased.draft).toEqual(base.draft);
    expect(erased.draft.panels[0]!.actors[0]!.pose).toBeUndefined();
  });
  it("persists the true prior value, inks without reverting, and erases through focused edits", () => {
    const base = fixture();
    const changed = applyEdits(
      base,
      0,
      [{ kind: "balloon", id: "balloon-1", text: "An agent proposal." }],
      "agent",
    );
    const read = stripSchema.parse(JSON.parse(JSON.stringify(changed)));
    expect(read.pencils?.["balloon:balloon-1"]?.before).toEqual({
      kind: "balloon",
      id: "balloon-1",
      text: base.draft.panels[0]!.balloons[0]!.text,
    });
    const inked = applyEdits(
      read,
      1,
      [{ kind: "review", key: "balloon:balloon-1", decision: "ink" }],
      "human",
    );
    expect(inked.pencils).toEqual({});
    expect(inked.draft.panels[0]!.balloons[0]!.text).toBe("An agent proposal.");
    const erased = applyEdits(
      read,
      1,
      [{ kind: "review", key: "balloon:balloon-1", decision: "erase" }],
      "human",
    );
    expect(erased.draft).toEqual(base.draft);
    expect(erased.revision).toBe(2);
    expect(erased.lastEditedBy).toBe("human");
    expect(changed.draft.panels[0]!.balloons[0]!.text).toBe(
      "An agent proposal.",
    );
  });
  it("keeps the original before value across repeated agent turns and accepts only the human-edited field", () => {
    let scene = applyEdits(
      fixture(),
      0,
      [
        { kind: "balloon", id: "balloon-1", text: "First." },
        { kind: "expression", id: "actor-1", expression: "thinking" },
      ],
      "agent",
    );
    scene = applyEdits(
      scene,
      1,
      [{ kind: "balloon", id: "balloon-1", text: "Second." }],
      "agent",
    );
    scene = applyEdits(
      scene,
      2,
      [{ kind: "balloon", id: "balloon-1", text: "My own line." }],
      "human",
    );
    expect(Object.keys(scene.pencils!)).toEqual(["expression:actor-1"]);
    scene = applyEdits(
      scene,
      3,
      [{ kind: "review", key: "expression:actor-1", decision: "erase" }],
      "human",
    );
    expect(scene.draft.panels[0]!.balloons[0]!.text).toBe("My own line.");
    expect(scene.draft.panels[0]!.actors[0]!.expression).toBe("happy");
  });
  it("rejects agent review, stale review and protected proposals atomically", () => {
    const scene = applyEdits(
      fixture(),
      0,
      [{ kind: "balloon", id: "balloon-1", text: "Pencil." }],
      "agent",
    );
    expect(() =>
      applyEdits(
        scene,
        1,
        [{ kind: "review", key: "balloon:balloon-1", decision: "erase" }],
        "agent",
      ),
    ).toThrow("Only a person");
    expect(() =>
      applyEdits(
        scene,
        0,
        [{ kind: "review", key: "balloon:balloon-1", decision: "ink" }],
        "human",
      ),
    ).toThrow("latest revision");
    const locked = setProtection(scene, 1, "panel-1", true, "human");
    expect(() =>
      applyEdits(
        locked,
        2,
        [{ kind: "balloon", id: "balloon-1", text: "Overwrite." }],
        "agent",
      ),
    ).toThrow("protected");
    expect(scene.pencils?.["balloon:balloon-1"]).toBeDefined();
  });
  it("normalizes an ending swap to the balloon field, and reverts the title", () => {
    let scene = applyEdits(
      fixture(),
      0,
      [
        { kind: "choose-ending", index: 1 },
        { kind: "title", text: "A new title" },
      ],
      "agent",
    );
    expect(Object.keys(scene.pencils!)).toEqual([
      "balloon:balloon-4",
      "title:$title",
    ]);
    scene = applyEdits(
      scene,
      1,
      [
        { kind: "review", key: "balloon:balloon-4", decision: "erase" },
        { kind: "review", key: "title:$title", decision: "erase" },
      ],
      "human",
    );
    expect(scene.draft).toEqual(fixture().draft);
  });
});

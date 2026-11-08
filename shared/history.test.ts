import { describe, expect, it } from "vitest";

import { preparedExamples } from "./examples.js";
import { restoreRevision, changedSummary } from "./history.js";
import { applyEdits, setProtection, type Strip } from "./strip.js";

function fixture(): Strip {
  const draft = structuredClone(preparedExamples[0]!);
  return {
    id: "history-test",
    revision: 0,
    draft,
    origin: "human-authored",
    protectedIds: [],
    lastEditedBy: "human",
    updatedAt: "2026-11-08T00:00:00Z",
    history: [
      {
        revision: 0,
        draft: structuredClone(draft),
        who: "human",
        summary: "Created strip",
        at: "2026-11-08T00:00:00Z",
      },
    ],
  };
}
describe("revision restore safety", () => {
  it("restores as a new revision without rewriting snapshots or protection", () => {
    const initial = fixture();
    const changed = applyEdits(
      initial,
      0,
      [{ kind: "title", text: "New title" }],
      "human",
    );
    const restored = restoreRevision(changed, 1, 0, "human");
    expect(restored.revision).toBe(2);
    expect(restored.draft).toEqual(initial.draft);
    expect(restored.history).toEqual(initial.history);
    expect(changed.draft.title).toBe("New title");
  });
  it("rejects stale and missing history before changing anything", () => {
    expect(() => restoreRevision(fixture(), 1, 0, "agent")).toThrow(
      "latest revision",
    );
    expect(() => restoreRevision(fixture(), 0, 99, "human")).toThrow(
      "not available",
    );
  });
  it("prevents agent restore over a protected line, but permits its human", () => {
    const initial = fixture();
    const id = initial.draft.panels[0]!.balloons[0]!.id;
    const changed = applyEdits(
      initial,
      0,
      [{ kind: "balloon", id, text: "Mine, not yours." }],
      "human",
    );
    const locked = setProtection(changed, 1, id, true, "human");
    expect(() => restoreRevision(locked, 2, 0, "agent")).toThrow("MINE");
    expect(restoreRevision(locked, 2, 0, "human").protectedIds).toEqual([id]);
    expect(locked.draft.panels[0]!.balloons[0]!.text).toBe("Mine, not yours.");
  });
  it("checks entire protected panels and indirect cast changes", () => {
    const initial = fixture();
    const changed = applyEdits(
      initial,
      0,
      [
        {
          kind: "screen-state",
          id: initial.draft.panels[0]!.id,
          screenState: "restored",
        },
      ],
      "human",
    );
    const locked = setProtection(
      changed,
      1,
      initial.draft.panels[0]!.id,
      true,
      "human",
    );
    expect(() => restoreRevision(locked, 2, 0, "agent")).toThrow("MINE");
    const castChanged = fixture();
    castChanged.draft.cast = {
      ari: { name: "New", role: "New trait" },
      sam: { name: "Sam", role: "Dry" },
    };
    castChanged.protectedIds = [castChanged.draft.panels[0]!.balloons[0]!.id];
    expect(() => restoreRevision(castChanged, 0, 0, "agent")).toThrow("MINE");
  });
  it("allows an agent restore that leaves MINE unchanged, retaining stamps", () => {
    const initial = fixture();
    const id = initial.draft.panels[0]!.balloons[0]!.id;
    const changed = applyEdits(
      initial,
      0,
      [{ kind: "title", text: "Temporary" }],
      "agent",
    );
    changed.protectedIds = [id];
    const restored = restoreRevision(changed, 1, 0, "agent");
    expect(restored.lastEditedBy).toBe("agent");
    expect(restored.protectedIds).toEqual([id]);
    expect(changedSummary(changed, restored)).toBe("Title");
  });
});

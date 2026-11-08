import {
  assertRevision,
  draftSchema,
  panelForObject,
  StripError,
  type Actor,
  type Strip,
} from "./strip.js";

/** Restore content, never locks or provenance/history. The store appends a new snapshot atomically. */
export function restoreRevision(
  current: Strip,
  expected: number,
  revision: number,
  actor: Actor,
): Strip {
  assertRevision(current, expected);
  const snapshot = current.history?.find(
    (entry) => entry.revision === revision,
  );
  if (!snapshot)
    throw new StripError(
      "not_found",
      "That revision is not available in this strip's history.",
    );
  const draft = draftSchema.parse(structuredClone(snapshot.draft));
  if (actor === "agent") {
    for (const id of current.protectedIds) {
      const beforePanel = panelForObject(current, id);
      const afterPanel = draft.panels.find((p) => p.id === beforePanel?.id);
      const before =
        beforePanel?.id === id
          ? beforePanel
          : (beforePanel?.actors.find((a) => a.id === id) ??
            beforePanel?.balloons.find((b) => b.id === id));
      const after =
        beforePanel?.id === id
          ? afterPanel
          : (afterPanel?.actors.find((a) => a.id === id) ??
            afterPanel?.balloons.find((b) => b.id === id));
      // Cast/source changes can indirectly reinterpret protected work.
      if (
        JSON.stringify(before) !== JSON.stringify(after) ||
        JSON.stringify(current.draft.cast) !== JSON.stringify(draft.cast) ||
        current.draft.source !== draft.source ||
        current.draft.sourceUrl !== draft.sourceUrl ||
        current.draft.inputKind !== draft.inputKind
      )
        throw new StripError(
          "protected_element",
          "Restore would change a MINE contribution. Leave it unchanged.",
        );
    }
  }
  // A human restore must not orphan a protection stamp either.
  if (
    current.protectedIds.some(
      (id) => !panelForObject({ ...current, draft }, id),
    )
  )
    throw new StripError(
      "protected_element",
      "This revision would remove a protected object. Unprotect it first.",
    );
  const pencils =
    actor === "agent" ? structuredClone(current.pencils ?? {}) : {};
  if (actor === "agent") {
    if (current.draft.title !== draft.title)
      pencils["title:$title"] ??= {
        targetId: "$title",
        before: { kind: "title", text: current.draft.title },
      };
    if (JSON.stringify(current.draft.endings) !== JSON.stringify(draft.endings))
      pencils["endings:$endings"] ??= {
        targetId: "$endings",
        before: { kind: "endings", choices: current.draft.endings },
      };
    for (const panel of draft.panels) {
      const old = current.draft.panels.find((p) => p.id === panel.id);
      for (const object of [panel, ...panel.actors, ...panel.balloons]) {
        const prior =
          object.id === panel.id
            ? old
            : (old?.actors.find((a) => a.id === object.id) ??
              old?.balloons.find((b) => b.id === object.id));
        if (JSON.stringify(object) !== JSON.stringify(prior))
          pencils[`draft:${object.id}`] ??= {
            targetId: object.id,
            before: null,
          };
      }
    }
  }
  return {
    ...current,
    draft,
    pencils,
    revision: current.revision + 1,
    lastEditedBy: actor,
    updatedAt: new Date().toISOString(),
  };
}

export function changedSummary(previous: Strip, next: Strip): string {
  const changes: string[] = [];
  if (previous.draft.title !== next.draft.title) changes.push("Title");
  next.draft.panels.forEach((panel, index) => {
    if (JSON.stringify(panel) !== JSON.stringify(previous.draft.panels[index]))
      changes.push(`Panel ${index + 1}`);
  });
  if (
    JSON.stringify(previous.draft.endings) !==
    JSON.stringify(next.draft.endings)
  )
    changes.push("Ending choices");
  if (
    JSON.stringify(previous.protectedIds) !== JSON.stringify(next.protectedIds)
  )
    changes.push("Protection");
  return changes.join(" · ") || "Reviewed pencil changes";
}

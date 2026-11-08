import { preparedExamples } from "../../../shared/examples";
import { applyEdits, type Strip } from "../../../shared/strip";

// A labelled illustrative specimen, using the same attribution and rendering as Studio.
export function posterSpecimen(): Strip {
  const base: Strip = {
    id: "illustrative-poster",
    revision: 0,
    draft: structuredClone(preparedExamples[0]!),
    protectedIds: [preparedExamples[0]!.panels[0]!.balloons[0]!.id],
    origin: "prepared-example",
    lastEditedBy: "human",
    updatedAt: "",
  };
  const panel = base.draft.panels[2]!;
  panel.screenState = "undo";
  return applyEdits(
    base,
    0,
    [{ kind: "screen-state", id: panel.id, screenState: "restored" }],
    "agent",
  );
}

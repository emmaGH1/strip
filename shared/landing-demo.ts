import { preparedExamples } from "./examples";
import { applyEdits, setProtection, type Strip } from "./strip";

/** Local, prepared teaching states. Never a generation result or a saved domain write. */
export function landingDemoStates() {
  const base: Strip = {
    id: "illustrative-inking-demo",
    revision: 0,
    draft: structuredClone(preparedExamples[0]!),
    protectedIds: [],
    origin: "prepared-example",
    lastEditedBy: "human",
    updatedAt: "",
  };
  const line = base.draft.panels[0]!.balloons[0]!;
  const actor = base.draft.panels[0]!.actors[0]!;
  line.text = "Time to tidy up.";
  const pencil = applyEdits(
    base,
    0,
    [{ kind: "balloon", id: line.id, text: "Just clearing the old drafts." }],
    "agent",
  );
  const lineKey = Object.keys(pencil.pencils!)[0]!;
  const inked = applyEdits(
    pencil,
    pencil.revision,
    [{ kind: "review", key: lineKey, decision: "ink" }],
    "human",
  );
  const mine = setProtection(inked, inked.revision, line.id, true, "human");
  const revised = applyEdits(
    mine,
    mine.revision,
    [
      { kind: "expression", id: actor.id, expression: "skeptical" },
      { kind: "pose", id: actor.id, pose: "arms-crossed" },
    ],
    "agent",
  );
  const review = (decision: "ink" | "erase") =>
    applyEdits(
      revised,
      revised.revision,
      Object.keys(revised.pencils!).map((key) => ({
        kind: "review" as const,
        key,
        decision,
      })),
      "human",
    );
  return { pencil, mine, revised, ink: review("ink"), erase: review("erase") };
}
export type LandingDemoStage = keyof ReturnType<typeof landingDemoStates>;

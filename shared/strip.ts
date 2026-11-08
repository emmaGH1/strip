import { z } from "zod";

export const expressionSchema = z.enum([
  "neutral",
  "happy",
  "panic",
  "skeptical",
  "thinking",
]);
export const poseSchema = z.enum([
  "standing",
  "leaning",
  "panic",
  "relieved",
  "arms-crossed",
]);
export const screenStateSchema = z.enum([
  "none",
  "files",
  "deleted",
  "undo",
  "restored",
  "search-results",
  "scheduled",
]);
export const cast = {
  ari: {
    name: "Ari",
    role: "the optimistic maker",
    hair: "ShortVolumed",
    color: "#E6BA67",
  },
  sam: { name: "Sam", role: "the dry realist", hair: "Bun", color: "#A9B9A5" },
} as const;
export const dialogueSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .refine(
    (text) => text.split(/\s+/u).filter(Boolean).length <= 12,
    "Keep each balloon to 12 words or fewer.",
  );
export const balloonSchema = z.object({
  id: z.string().min(1).max(60),
  speaker: z.enum(["ari", "sam"]),
  text: dialogueSchema,
});
export const panelSchema = z.object({
  id: z.string().min(1).max(60),
  beat: z.enum(["setup", "trouble", "turn", "payoff"]),
  caption: z.string().trim().max(65).default(""),
  screenState: screenStateSchema.default("none"),
  prop: z.enum(["laptop", "files", "coffee", "none"]),
  actors: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        character: z.enum(["ari", "sam"]),
        expression: expressionSchema,
        // Missing only on records saved before editable poses existed.
        pose: poseSchema.optional(),
        side: z.enum(["left", "right"]),
      }),
    )
    .min(1)
    .max(2),
  balloons: z.array(balloonSchema).max(2),
  sourceQuote: z
    .string()
    .max(500)
    .describe(
      "Exact source excerpt for a literal feature claim, or empty for fictional dialogue.",
    ),
});
export const draftSchema = z
  .object({
    title: z.string().trim().min(1).max(70),
    source: z.string().trim().min(5).max(5000),
    sourceUrl: z
      .union([z.url().refine((v) => /^https?:\/\//u.test(v)), z.literal("")])
      .default(""),
    inputKind: z.enum(["illustrative", "user-provided"]),
    cast: z
      .object({
        ari: z.object({
          name: z.string().trim().min(1).max(30),
          role: z.string().trim().min(1).max(120),
        }),
        sam: z.object({
          name: z.string().trim().min(1).max(30),
          role: z.string().trim().min(1).max(120),
        }),
      })
      .optional()
      .describe(
        "Optional names and fictional traits for the two stable character ids; preserve the user's supplied cast.",
      ),
    panels: z.array(panelSchema).length(4),
    endings: z.array(dialogueSchema).length(3),
  })
  .superRefine((draft, ctx) => {
    const ids = draft.panels.flatMap((p) => [
      p.id,
      ...p.actors.map((a) => a.id),
      ...p.balloons.map((b) => b.id),
    ]);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: "custom",
        message: "Every scene object needs a unique id.",
      });
    for (const [i, panel] of draft.panels.entries()) {
      if (panel.beat !== ["setup", "trouble", "turn", "payoff"][i])
        ctx.addIssue({
          code: "custom",
          message: "Panels must follow setup, trouble, turn, payoff.",
        });
      if (panel.sourceQuote && !draft.source.includes(panel.sourceQuote))
        ctx.addIssue({
          code: "custom",
          message:
            "Source quotes must be exact excerpts of the supplied update.",
        });
      if (new Set(panel.actors.map((a) => a.side)).size !== panel.actors.length)
        ctx.addIssue({
          code: "custom",
          message: "Actors must occupy distinct sides.",
        });
      if (
        panel.balloons.some(
          (b) => !panel.actors.some((a) => a.character === b.speaker),
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "A balloon's speaker must be in the panel.",
        });
    }
    // Do not silently restage historical/protected records on read.
    // New compositions require every pose via composedDraftSchema below.
    const fullyStaged = draft.panels.every((p) =>
      p.actors.every((a) => a.pose !== undefined),
    );
    const introduced = new Set(
      draft.panels.slice(0, 2).flatMap((p) => p.actors.map((a) => a.character)),
    );
    if (
      fullyStaged &&
      draft.panels[3]?.balloons.some((b) => !introduced.has(b.speaker))
    )
      ctx.addIssue({
        code: "custom",
        message: "Introduce every payoff speaker in panel 1 or 2.",
      });
    for (const character of Object.keys(cast)) {
      for (let i = 0; i < 2; i++) {
        const poses = draft.panels
          .slice(i, i + 3)
          .map((p) => p.actors.find((a) => a.character === character)?.pose);
        if (fullyStaged && poses[0] && poses.every((pose) => pose === poses[0]))
          ctx.addIssue({
            code: "custom",
            message:
              "Vary character poses; no identical body three panels in a row.",
          });
      }
    }
    if (!draft.panels.some((panel) => panel.balloons.length === 0))
      ctx.addIssue({
        code: "custom",
        message: "Include at least one wordless visual beat.",
      });
    if (new Set(draft.endings).size !== 3)
      ctx.addIssue({
        code: "custom",
        message: "Provide three distinct ending choices.",
      });
    if (!draft.panels[3]?.balloons.length)
      ctx.addIssue({
        code: "custom",
        message: "The payoff needs a balloon to accept an ending.",
      });
  });
export const composedDraftSchema = draftSchema.safeExtend({
  panels: z
    .array(
      panelSchema.extend({
        actors: z
          .array(panelSchema.shape.actors.element.extend({ pose: poseSchema }))
          .min(1)
          .max(2),
      }),
    )
    .length(4),
});
export type Draft = z.infer<typeof draftSchema>;
export type ComposedDraft = z.infer<typeof composedDraftSchema>;
export type Strip = z.infer<typeof stripSchema>;
export type Panel = z.infer<typeof panelSchema>;
export type Expression = z.infer<typeof expressionSchema>;
export type Actor = "human" | "agent";

export const valueEditSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("title"),
    text: z.string().trim().min(1).max(70),
  }),
  z.object({
    kind: z.literal("balloon"),
    id: z.string(),
    text: dialogueSchema,
  }),
  z.object({
    kind: z.literal("expression"),
    id: z.string(),
    expression: expressionSchema,
  }),
  z.object({ kind: z.literal("pose"), id: z.string(), pose: poseSchema }),
  z.object({
    kind: z.literal("screen-state"),
    id: z.string(),
    screenState: screenStateSchema,
  }),
  z.object({
    kind: z.literal("prop"),
    id: z.string(),
    prop: panelSchema.shape.prop,
  }),
  z.object({
    kind: z.literal("endings"),
    choices: z.array(dialogueSchema).length(3),
  }),
  z.object({
    kind: z.literal("choose-ending"),
    index: z.number().int().min(0).max(2),
  }),
]);
export const editSchema = z.union([
  valueEditSchema,
  z.object({
    kind: z.literal("review"),
    key: z.string(),
    decision: z.enum(["ink", "erase"]),
  }),
]);
export const revisionSnapshotSchema = z.object({
  revision: z.number().int().nonnegative(),
  draft: draftSchema,
  who: z.enum(["human", "agent", "external-agent"]),
  summary: z.string(),
  at: z.string(),
});
export const stripSchema = z.object({
  id: z.string(),
  revision: z.number().int().nonnegative(),
  draft: draftSchema,
  protectedIds: z.array(z.string()),
  origin: z.enum(["prepared-example", "human-authored", "agent-draft"]),
  lastEditedBy: z.enum(["human", "agent"]),
  updatedAt: z.string(),
  history: z.array(revisionSnapshotSchema).optional(),
  // Latest rejected agent attempt, not a scene revision or a proposed edit.
  agentRejection: z.object({ at: z.string() }).optional(),
  // Optional for historical records. Inverses are server-derived, never supplied by the agent.
  pencils: z
    .record(
      z.string(),
      z.object({
        targetId: z.string(),
        before: valueEditSchema.nullable(),
        missingPose: z.boolean().optional(),
      }),
    )
    .optional(),
});
export type Edit = z.infer<typeof editSchema>;
type ValueEdit = z.infer<typeof valueEditSchema>;
function inverse(
  strip: Strip,
  edit: ValueEdit,
): { targetId: string; before: ValueEdit; missingPose?: boolean } {
  if (edit.kind === "title")
    return {
      targetId: "$title",
      before: { kind: "title", text: strip.draft.title },
    };
  if (edit.kind === "endings")
    return {
      targetId: "$endings",
      before: { kind: "endings", choices: strip.draft.endings },
    };
  if (edit.kind === "choose-ending") {
    const balloon = strip.draft.panels[3]!.balloons.slice(-1)[0]!;
    return {
      targetId: balloon.id,
      before: { kind: "balloon", id: balloon.id, text: balloon.text },
    };
  }
  const panel = panelForObject(strip, edit.id);
  if (!panel)
    throw new StripError("not_found", "That scene object no longer exists.");
  if (edit.kind === "balloon" && !panel.balloons.some((b) => b.id === edit.id))
    throw new StripError("not_found", "Choose a balloon to edit its text.");
  if (
    (edit.kind === "expression" || edit.kind === "pose") &&
    !panel.actors.some((a) => a.id === edit.id)
  )
    throw new StripError(
      "not_found",
      "Choose a character to change its expression or pose.",
    );
  let before: ValueEdit;
  if (edit.kind === "balloon")
    before = {
      ...edit,
      text: panel.balloons.find((b) => b.id === edit.id)!.text,
    };
  else if (edit.kind === "expression")
    before = {
      ...edit,
      expression: panel.actors.find((a) => a.id === edit.id)!.expression,
    };
  else if (edit.kind === "pose")
    before = {
      ...edit,
      pose: panel.actors.find((a) => a.id === edit.id)!.pose ?? "standing",
    };
  else if (edit.kind === "screen-state")
    before = { ...edit, screenState: panel.screenState };
  else before = { ...edit, prop: panel.prop };
  return {
    targetId: edit.id,
    before,
    ...(edit.kind === "pose" &&
    panel.actors.find((a) => a.id === edit.id)?.pose === undefined
      ? { missingPose: true }
      : {}),
  };
}
export class StripError extends Error {
  constructor(
    public code:
      | "stale_revision"
      | "protected_element"
      | "not_found"
      | "human_only"
      | "invalid_scene",
    message: string,
  ) {
    super(message);
  }
}

export function panelForObject(strip: Strip, id: string): Panel | undefined {
  return strip.draft.panels.find(
    (p) =>
      p.id === id ||
      p.actors.some((a) => a.id === id) ||
      p.balloons.some((b) => b.id === id),
  );
}
export function assertRevision(strip: Strip, expected: number) {
  if (strip.revision !== expected)
    throw new StripError(
      "stale_revision",
      "This strip changed. Read the latest revision before applying your edit.",
    );
}
function assertWritable(strip: Strip, id: string, actor: Actor) {
  const panel = panelForObject(strip, id);
  if (!panel)
    throw new StripError("not_found", "That scene object no longer exists.");
  if (
    actor === "agent" &&
    (strip.protectedIds.includes(id) || strip.protectedIds.includes(panel.id))
  ) {
    throw new StripError(
      "protected_element",
      "This contribution is protected by the human. Leave it unchanged and revise other objects.",
    );
  }
  return panel;
}
export function applyEdits(
  current: Strip,
  expected: number,
  edits: Edit[],
  actor: Actor,
): Strip {
  assertRevision(current, expected);
  if (!edits.length || edits.length > 16)
    throw new StripError(
      "invalid_scene",
      "Submit between 1 and 16 focused edits.",
    );
  const next = structuredClone(current);
  for (const raw of edits) {
    let edit = editSchema.parse(raw);
    let eraseMissingPose = false;
    if (edit.kind === "review") {
      if (actor !== "human")
        throw new StripError(
          "human_only",
          "Only a person can ink or erase agent changes.",
        );
      const pencil = next.pencils?.[edit.key];
      if (!pencil)
        throw new StripError(
          "not_found",
          "This proposal has already been reviewed.",
        );
      delete next.pencils![edit.key];
      if (edit.decision === "ink") continue;
      if (!pencil.before)
        throw new StripError(
          "invalid_scene",
          "This is a new draft item, with no previous value to restore. Edit it directly or ink it.",
        );
      edit = pencil.before;
      eraseMissingPose = pencil.missingPose === true;
    }
    // Capture the actual prior value before applying any change. Repeated agent edits
    // keep the original human value; human edits accept/replace that field only.
    const previous = inverse(next, edit);
    const key = `${previous.before.kind}:${previous.targetId}`;
    const proposed =
      edit.kind === "choose-ending"
        ? {
            kind: "balloon",
            id: previous.targetId,
            text: next.draft.endings[edit.index],
          }
        : edit;
    const valueChanged =
      previous.missingPose ||
      JSON.stringify(previous.before) !== JSON.stringify(proposed);
    if (actor === "agent") {
      if (valueChanged) {
        next.pencils ??= {};
        next.pencils[key] ??= previous;
      }
    } else if (next.pencils) {
      delete next.pencils[key];
      delete next.pencils[`draft:${previous.targetId}`];
    }
    if (edit.kind === "title") {
      next.draft.title = edit.text;
      continue;
    }
    if (edit.kind === "endings") {
      next.draft.endings = edit.choices;
      continue;
    }
    if (edit.kind === "choose-ending") {
      const panel = next.draft.panels[3]!;
      const balloon = panel.balloons[panel.balloons.length - 1];
      if (!balloon)
        throw new StripError("not_found", "The payoff has no balloon.");
      assertWritable(current, balloon.id, actor);
      balloon.text = next.draft.endings[edit.index]!;
      continue;
    }
    const panel = assertWritable(current, edit.id, actor);
    const targetPanel = next.draft.panels.find((p) => p.id === panel.id)!;
    if (edit.kind === "balloon") {
      const balloon = targetPanel.balloons.find((b) => b.id === edit.id);
      if (!balloon)
        throw new StripError("not_found", "Choose a balloon to edit its text.");
      balloon.text = edit.text;
    } else if (edit.kind === "expression") {
      const character = targetPanel.actors.find((a) => a.id === edit.id);
      if (!character)
        throw new StripError(
          "not_found",
          "Choose a character to edit its expression.",
        );
      character.expression = edit.expression;
    } else if (edit.kind === "pose") {
      const character = targetPanel.actors.find((a) => a.id === edit.id);
      if (!character)
        throw new StripError(
          "not_found",
          "Choose a character to change its pose.",
        );
      if (eraseMissingPose) delete character.pose;
      else character.pose = edit.pose;
    } else {
      if (edit.id !== targetPanel.id)
        throw new StripError("not_found", "Choose a panel to change its prop.");
      // A prop edit cannot modify any protected character or balloon.
      if (edit.kind === "screen-state")
        targetPanel.screenState = edit.screenState;
      else targetPanel.prop = edit.prop;
    }
  }
  draftSchema.parse(next.draft);
  next.revision += 1;
  next.lastEditedBy = actor;
  next.updatedAt = new Date().toISOString();
  return next;
}
export function setProtection(
  current: Strip,
  expected: number,
  id: string,
  value: boolean,
  actor: Actor,
): Strip {
  if (actor !== "human")
    throw new StripError(
      "human_only",
      "Only a person in the editor can change protection.",
    );
  assertRevision(current, expected);
  if (!panelForObject(current, id))
    throw new StripError("not_found", "That scene object no longer exists.");
  return {
    ...current,
    protectedIds: value
      ? [...new Set([...current.protectedIds, id])]
      : current.protectedIds.filter((key) => key !== id),
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
    lastEditedBy: "human",
  };
}

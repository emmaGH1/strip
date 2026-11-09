import { z } from "zod";

import { anglesSchema } from "./angles.js";
import { castSchema, characterIdSchema, legacyCast } from "./casting.js";
import { fitBalloon, balloonFitError } from "./text-fit.js";

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
  "sitting",
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
export const cast = legacyCast;
export const screenSchema = z.object({
  kind: z.enum(["chat", "dialog", "toast", "doc", "none"]),
  title: z.string().trim().max(24).default(""),
  lines: z.array(z.string().trim().max(28)).max(2).default([]),
  button: z.string().trim().max(14).optional(),
  tone: z.enum(["normal", "error", "success"]).default("normal"),
});
export const sfxSchema = z
  .string()
  .trim()
  .max(14)
  .refine(
    (v) => v.split(/\s+/u).filter(Boolean).length <= 3,
    "SFX: at most three short words.",
  );
export const endingArtSchema = z.object({
  expression: expressionSchema.optional(),
  pose: poseSchema.optional(),
  screen: screenSchema.optional(),
  sfx: sfxSchema.optional(),
  prop: z.enum(["laptop", "phone", "files", "coffee", "none"]).optional(),
});
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
  speaker: characterIdSchema,
  text: dialogueSchema,
});
export const panelSchema = z.object({
  id: z.string().min(1).max(60),
  beat: z.enum(["setup", "trouble", "turn", "payoff"]),
  caption: z.string().trim().max(65).default(""),
  screenState: screenStateSchema
    .default("none")
    .describe("Legacy only. New strips use screen."),
  screen: screenSchema.optional(),
  sfx: sfxSchema.optional(),
  prop: z.enum(["laptop", "phone", "files", "coffee", "none"]),
  actors: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        character: characterIdSchema,
        expression: expressionSchema,
        // Missing only on records saved before editable poses existed.
        pose: poseSchema.optional(),
        side: z.enum(["left", "center", "right"]),
      }),
    )
    .min(1)
    .max(3),
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
    cast: castSchema
      .optional()
      .describe(
        "1–3 story-specific characters, chosen for the joke. Preserve the chosen angle's cast.",
      ),
    angles: anglesSchema.optional(),
    selectedAngleId: z.string().optional(),
    endingArt: z.array(endingArtSchema).length(3).optional(),
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
    if (
      draft.selectedAngleId &&
      !draft.angles?.some((a) => a.id === draft.selectedAngleId)
    )
      ctx.addIssue({ code: "custom", message: "Choose an existing angle." });
    for (const [i, panel] of draft.panels.entries()) {
      if (draft.cast && panel.actors.some((a) => !draft.cast?.[a.character]))
        ctx.addIssue({
          code: "custom",
          message: "Every staged character needs a cast card.",
        });
      if (
        new Set(panel.actors.map((a) => a.character)).size !==
        panel.actors.length
      )
        ctx.addIssue({
          code: "custom",
          message: "Stage each character only once per panel.",
        });
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
    for (const character of characterIdSchema.options) {
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
export const composedDraftSchema = draftSchema
  .safeExtend({
    panels: z
      .array(
        panelSchema.extend({
          actors: z
            .array(
              panelSchema.shape.actors.element.extend({ pose: poseSchema }),
            )
            .min(1)
            .max(3),
        }),
      )
      .length(4),
  })
  .superRefine((draft, ctx) => {
    for (const message of textFitErrors(draft))
      ctx.addIssue({ code: "custom", message });
  });
export type Draft = z.infer<typeof draftSchema>;
export type ComposedDraft = z.infer<typeof composedDraftSchema>;
export type Strip = z.infer<typeof stripSchema>;
export type Panel = z.infer<typeof panelSchema>;
export type Expression = z.infer<typeof expressionSchema>;
export type Actor = "human" | "agent";

/** Read old invalid lettering without rewriting it; every scene write still validates fit. */
export function textFitErrors(draft: Draft): string[] {
  const errors = draft.panels.flatMap((panel) =>
    panel.balloons
      .filter(
        (balloon) => !fitBalloon(balloon.text, panel.balloons.length === 2),
      )
      .map((balloon) => balloonFitError(balloon.id)),
  );
  for (const ending of draft.endings)
    if (!fitBalloon(ending, draft.panels[3]?.balloons.length === 2))
      errors.push(balloonFitError("ending"));
  return errors;
}
export function assertTextFits(draft: Draft) {
  const errors = textFitErrors(draft);
  if (errors.length) throw new StripError("invalid_scene", errors.join(" "));
}

export const valueEditSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("cast"), cast: castSchema.nullable() }),
  z.object({ kind: z.literal("angles"), choices: anglesSchema.nullable() }),
  z.object({ kind: z.literal("angle"), angleId: z.string().nullable() }),
  z.object({
    kind: z.literal("screen"),
    id: z.string(),
    screen: screenSchema.nullable(),
  }),
  z.object({
    kind: z.literal("sfx"),
    id: z.string(),
    sfx: sfxSchema.nullable(),
  }),
  z.object({
    kind: z.literal("ending-art"),
    choices: z.array(endingArtSchema).length(3).nullable(),
  }),
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
  // Server-derived reference staging for alternative endings, never an action input.
  endingBase: panelSchema.optional(),
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
  if (edit.kind === "angles")
    return {
      targetId: "$angles",
      before: { kind: "angles", choices: strip.draft.angles ?? null },
    };
  if (edit.kind === "cast")
    return {
      targetId: "$cast",
      before: { kind: "cast", cast: strip.draft.cast ?? null },
    };
  if (edit.kind === "angle")
    return {
      targetId: "$angle",
      before: { kind: "angle", angleId: strip.draft.selectedAngleId ?? null },
    };
  if (edit.kind === "ending-art")
    return {
      targetId: "$ending-art",
      before: { kind: "ending-art", choices: strip.draft.endingArt ?? null },
    };
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
  else if (edit.kind === "screen")
    before = { ...edit, screen: panel.screen ?? null };
  else if (edit.kind === "sfx") before = { ...edit, sfx: panel.sfx ?? null };
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
  // Expand alternative staging into ordinary focused edits, so every affected
  // field uses exactly the same protection, inverse and review logic.
  if (
    edits.some((edit) => edit.kind === "choose-ending") &&
    current.draft.endingArt &&
    !next.endingBase
  )
    next.endingBase = structuredClone(
      current.history?.find((entry) => entry.draft.endingArt)?.draft
        .panels[3] ?? current.draft.panels[3]!,
    );
  const focused = edits.flatMap((edit): Edit[] =>
    edit.kind === "choose-ending" ? endingEdits(next, edit.index) : [edit],
  );
  for (const raw of focused) {
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
    if (edit.kind === "angles") {
      if (actor === "agent" && current.protectedIds.length)
        throw new StripError(
          "protected_element",
          "Angle proposals could reinterpret MINE work. Ask the human before changing story direction.",
        );
      if (edit.choices) next.draft.angles = edit.choices;
      else {
        delete next.draft.angles;
        delete next.draft.selectedAngleId;
      }
      continue;
    }
    if (edit.kind === "cast" || edit.kind === "angle") {
      if (actor === "agent" && current.protectedIds.length)
        throw new StripError(
          "protected_element",
          "Casting or angle changes could reinterpret MINE work. Leave them unchanged; adapt only unprotected lines.",
        );
      if (edit.kind === "cast") {
        if (edit.cast) next.draft.cast = edit.cast;
        else delete next.draft.cast;
      } else {
        if (edit.angleId === null) delete next.draft.selectedAngleId;
        else {
          const angle = next.draft.angles?.find((a) => a.id === edit.angleId);
          if (!angle)
            throw new StripError("not_found", "Choose an existing angle.");
          next.draft.selectedAngleId = angle.id;
        }
      }
      continue;
    }
    if (edit.kind === "ending-art") {
      if (edit.choices) next.draft.endingArt = edit.choices;
      else delete next.draft.endingArt;
      continue;
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
      if (edit.kind === "screen") {
        if (edit.screen) targetPanel.screen = edit.screen;
        else delete targetPanel.screen;
      } else if (edit.kind === "sfx") {
        if (edit.sfx !== null) targetPanel.sfx = edit.sfx;
        else delete targetPanel.sfx;
      } else if (edit.kind === "screen-state")
        targetPanel.screenState = edit.screenState;
      else targetPanel.prop = edit.prop;
    }
  }
  const validated = draftSchema.safeParse(next.draft);
  if (!validated.success)
    throw new StripError(
      "invalid_scene",
      validated.error.issues.map((issue) => issue.message).join(" "),
    );
  assertTextFits(next.draft);
  next.revision += 1;
  next.lastEditedBy = actor;
  next.updatedAt = new Date().toISOString();
  return next;
}
export function endingEdits(strip: Strip, index: number): Edit[] {
  const panel = strip.draft.panels[3]!;
  const balloon = panel.balloons[panel.balloons.length - 1]!;
  const actor = panel.actors.find((a) => a.character === balloon.speaker)!;
  const art = strip.draft.endingArt?.[index];
  const text: Edit = {
    kind: "balloon",
    id: balloon.id,
    text: strip.draft.endings[index]!,
  };
  if (!art) return [text];
  // Alternatives are patches over REFERENCE staging, not over the previous
  // selected choice. Otherwise phone/SFX/poses leak between choices.
  const base = strip.endingBase ?? panel;
  const baseActor =
    base.actors.find((a) => a.character === balloon.speaker) ?? actor;
  const pose = art.pose ?? baseActor.pose;
  return [
    text,
    {
      kind: "expression",
      id: actor.id,
      expression: art.expression ?? baseActor.expression,
    },
    ...(pose ? [{ kind: "pose" as const, id: actor.id, pose }] : []),
    { kind: "screen", id: panel.id, screen: art.screen ?? base.screen ?? null },
    { kind: "screen-state", id: panel.id, screenState: base.screenState },
    { kind: "sfx", id: panel.id, sfx: art.sfx ?? base.sfx ?? null },
    { kind: "prop", id: panel.id, prop: art.prop ?? base.prop },
  ];
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

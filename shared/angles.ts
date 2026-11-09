import { z } from "zod";

import { storyCastSchema } from "./casting.js";

export const angleSchema = z.object({
  id: z.string().trim().min(1).max(60),
  premise: z
    .string()
    .trim()
    .min(5)
    .max(180)
    .describe(
      "One-line comic premise: characters react to the update, never recite it.",
    ),
  irony: z
    .string()
    .trim()
    .min(5)
    .max(240)
    .describe(
      "The specific irony, conflict or reversal that makes this a joke.",
    ),
  cast: storyCastSchema.describe(
    "Cast 1–3 characters for THIS joke, usually two. Stable ids ari/sam/kit are slots, not fixed people.",
  ),
});
export const anglesSchema = z
  .array(angleSchema)
  .length(3)
  .refine(
    (items) =>
      new Set(items.map((a) => a.id)).size === 3 &&
      new Set(items.map((a) => a.premise)).size === 3,
    "Propose three distinct angles with unique ids.",
  );
export const anglePlanSchema = z
  .object({
    id: z.string(),
    revision: z.number().int().nonnegative(),
    source: z.string().trim().min(5).max(5000),
    inputKind: z.enum(["illustrative", "user-provided"]),
    angles: anglesSchema,
    selectedAngleId: z.string().optional(),
  })
  .superRefine((plan, ctx) => {
    if (
      plan.selectedAngleId &&
      !plan.angles.some((a) => a.id === plan.selectedAngleId)
    )
      ctx.addIssue({ code: "custom", message: "Select an existing angle." });
  });
export type AnglePlan = z.infer<typeof anglePlanSchema>;
export const planEditSchema = z.object({
  angleId: z.string(),
  premise: angleSchema.shape.premise.optional(),
  cast: storyCastSchema.optional(),
});
export function selectPlanAngle(
  current: AnglePlan,
  expected: number,
  edit: z.infer<typeof planEditSchema>,
): AnglePlan {
  if (current.revision !== expected) throw new Error("stale_revision");
  const next = structuredClone(current);
  const angle = next.angles.find((a) => a.id === edit.angleId);
  if (!angle) throw new Error("not_found");
  if (edit.premise !== undefined) angle.premise = edit.premise;
  if (edit.cast !== undefined) angle.cast = edit.cast;
  next.selectedAngleId = angle.id;
  next.revision++;
  return anglePlanSchema.parse(next);
}

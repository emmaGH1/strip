import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { chooseAngle } from "../server/lib/angle-store.js";
import { anglePlanSchema, planEditSchema } from "../shared/angles.js";
export default defineAction({
  description:
    "Persist a chosen comic angle, optionally editing its premise or cast, with compare-and-swap. Use only when the human has chosen or explicitly delegated the choice. Does not generate a draft. Next compose the selected premise with create-strip, preserving planId and expectedPlanRevision.",
  schema: planEditSchema.extend({
    id: z.string().describe("Angle plan id."),
    expectedRevision: z
      .number()
      .int()
      .nonnegative()
      .describe("Exact plan revision from get-strip-plan."),
  }),
  outputSchema: anglePlanSchema,
  run: ({ id, expectedRevision, ...edit }, ctx) =>
    chooseAngle(id, expectedRevision, edit, ctx),
});

import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getPlan } from "../server/lib/angle-store.js";
import { anglePlanSchema } from "../shared/angles.js";
export default defineAction({
  description:
    "Read the scoped source, three proposed comic angles, chosen premise/cast and revision before drafting or changing a choice.",
  schema: z.object({
    id: z.string().describe("Angle plan id from propose-strip-angles."),
  }),
  outputSchema: anglePlanSchema,
  http: { method: "GET" },
  run: ({ id }, ctx) => getPlan(id, ctx),
});

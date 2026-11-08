import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { getStrip } from "../server/lib/strip-store.js";
import { stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "Read a saved comic's current revision, source, panels, expressions, balloons, protection and three endings before editing it. Never edit from an old revision.",
  schema: z.object({
    id: z
      .string()
      .describe("Saved strip id, from the current screen or create-strip."),
  }),
  outputSchema: stripSchema,
  http: { method: "GET" },
  run: async ({ id }, ctx) => getStrip(id, ctx),
});

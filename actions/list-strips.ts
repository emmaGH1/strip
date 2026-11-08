import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { listStrips } from "../server/lib/strip-store.js";
import { stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "List the signed-in user's saved strips in the current workspace, newest edited first. Open one at /home?id=<id>; start a new composition at /home?new=1.",
  schema: z.object({}),
  outputSchema: z.array(stripSchema),
  http: { method: "GET" },
  readOnly: true,
  run: async (_args, ctx) => listStrips(ctx),
});

import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import {
  callerActor,
  domainError,
  getStrip,
  saveStrip,
} from "../server/lib/strip-store.js";
import { setProtection, stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "Human editor only: protect or unprotect one panel, balloon or character from agent edits. Not available to the agent; caller identity is determined server-side.",
  agentTool: false,
  schema: z.object({
    id: z.string(),
    expectedRevision: z.number().int().nonnegative(),
    targetId: z.string(),
    protected: z.boolean(),
  }),
  outputSchema: stripSchema,
  run: async (args, ctx) => {
    if (callerActor(ctx) !== "human")
      fail("Only a person in the editor may change protection.", {
        errorCode: "human_only",
        statusCode: 403,
      });
    const current = await getStrip(args.id, ctx);
    try {
      return await saveStrip(
        current,
        setProtection(
          current,
          args.expectedRevision,
          args.targetId,
          args.protected,
          "human",
        ),
        ctx,
      );
    } catch (error) {
      return domainError(error);
    }
  },
});

import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  callerActor,
  domainError,
  getStrip,
  saveStrip,
} from "../server/lib/strip-store.js";
import { applyEdits, editSchema, stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "Apply 1–16 focused balloon, expression, prop or ending edits atomically to the current comic revision. UI and agent share this action. Protected human contributions cannot be changed by the agent. On stale_revision re-read; on protected_element leave it unchanged. No full-scene replacement or unlock bypass exists.",
  schema: z.object({
    id: z.string().describe("Strip id to edit."),
    expectedRevision: z
      .number()
      .int()
      .nonnegative()
      .describe(
        "Exact current revision returned by get-strip; required for compare-and-swap.",
      ),
    edits: z
      .array(editSchema)
      .min(1)
      .max(16)
      .describe(
        "Focused edits to existing object ids. Ending proposals change choices only; choose-ending applies a choice to the final balloon.",
      ),
  }),
  outputSchema: stripSchema,
  run: async ({ id, expectedRevision, edits }, ctx) => {
    const current = await getStrip(id, ctx);
    try {
      return await saveStrip(
        current,
        applyEdits(current, expectedRevision, edits, callerActor(ctx)),
        ctx,
      );
    } catch (error) {
      return domainError(error);
    }
  },
});

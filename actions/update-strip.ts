import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import {
  callerActor,
  domainError,
  getStrip,
  saveStrip,
  recordProtectedRejection,
} from "../server/lib/strip-store.js";
import { restoreRevision } from "../shared/history.js";
import {
  applyEdits,
  editSchema,
  stripSchema,
  StripError,
} from "../shared/strip.js";

export default defineAction({
  description:
    "Apply 1–16 focused title, balloon, cast, angles/angle, expression, pose, screen, sfx, prop or ending/ending-art edits atomically. Dialogue REACTS to facts, never recites them; put facts on props or at most one short spoken line. Panel 4 is a reaction/reversal, not a summary. Target 8 words (hard cap 12); measured-fit rejection means shorten the line. Recast adaptation changes ONLY the affected character's unprotected balloon lines. If a panel shows a laptop or phone, its screen must show something meaningful (title or a line), or use no prop at all; blank device screens are rejected. New art uses structured screen, not legacy screen-state. UI and agent share this action. Real agent changes retain server-derived prior values in pencils until a HUMAN inks or erases them with a review edit; agents cannot review their own work. New draft items have no prior value and can only be inked or edited directly. Protected human contributions cannot be changed by the agent. On stale_revision re-read; on protected_element leave it unchanged. restoreRevision re-applies a retained draft as a NEW revision, preserving current protection; agents cannot restore over MINE contributions. Supply either edits or restoreRevision, never both.",
  schema: z
    .object({
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
        .optional()
        .describe(
          "Focused edits to existing object ids. Ending proposals change choices only; choose-ending applies text and optional ending-art staging through ordinary protected edits. Cast replaces the cast cards (null restores legacy defaults); angle chooses a stored angle id. Screen/sfx target panel ids.",
        ),
      restoreRevision: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe(
          "Retained revision number to restore as a new revision; mutually exclusive with edits.",
        ),
    })
    .refine(
      (input) => Boolean(input.edits) !== (input.restoreRevision !== undefined),
      "Provide edits OR restoreRevision.",
    ),
  outputSchema: stripSchema,
  run: async (
    { id, expectedRevision, edits, restoreRevision: restore },
    ctx,
  ) => {
    const current = await getStrip(id, ctx);
    try {
      return await saveStrip(
        current,
        restore !== undefined
          ? restoreRevision(
              current,
              expectedRevision,
              restore,
              callerActor(ctx),
            )
          : applyEdits(current, expectedRevision, edits!, callerActor(ctx)),
        ctx,
        restore !== undefined ? `Restored revision ${restore}` : undefined,
      );
    } catch (error) {
      if (error instanceof StripError && error.code === "protected_element")
        await recordProtectedRejection(id, ctx);
      return domainError(error);
    }
  },
});

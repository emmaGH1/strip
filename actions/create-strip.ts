import { defineAction, fail } from "@agent-native/core/action";
import { writeAppStateForCurrentTab } from "@agent-native/core/application-state";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { getPlan } from "../server/lib/angle-store.js";
import { callerActor, createStrip } from "../server/lib/strip-store.js";
import { composedDraftSchema, stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "Save the comic YOU authored for the human's chosen angle (planId + expectedPlanRevision). First propose-strip-angles and wait for a choice. REACT to facts, never recite the note. Put facts on a structured screen/prop or at most one short line. Setup → turn → payoff: panel 4 is a reaction/reversal, not a summary. Target 8 words per balloon, hard cap 12; shorten on text-fit rejection. Include a meaningful wordless beat, varied poses, and three endings with different endingArt. Choose 1–3 story-specific cast archetypes. No simulated generation. Complete direct authored/illustrative imports without a plan remain supported.",
  schema: composedDraftSchema
    .safeExtend({
      planId: z
        .string()
        .optional()
        .describe("Chosen plan id, required for angle-first drafts."),
      expectedPlanRevision: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Exact chosen plan revision; paired with planId."),
    })
    .refine(
      (a) => Boolean(a.planId) === (a.expectedPlanRevision !== undefined),
      "Provide both planId and expectedPlanRevision.",
    ),
  outputSchema: stripSchema,
  link: ({ result }) => ({
    url: buildDeepLink({
      app: "strip",
      view: "home",
      to: `/home?id=${result.id}`,
      params: { id: result.id },
    }),
    label: "Open strip in Studio",
    view: "home",
  }),
  run: async (args, ctx) => {
    const { planId, expectedPlanRevision, ...input } = args;
    const draft = composedDraftSchema.parse(input);
    if (
      !planId &&
      callerActor(ctx) === "agent" &&
      draft.inputKind !== "illustrative"
    )
      fail(
        "First propose three comic angles, then wait for the human's choice. Supply planId and expectedPlanRevision when drafting.",
        { errorCode: "angle_required" },
      );
    const strip = planId
      ? await getDb().transaction(async (tx) => {
          // Hold a scoped shared row lock through scene insertion: a concurrent
          // angle choice cannot sneak between checking its revision and creation.
          const plan = await getPlan(planId, ctx, tx, true);
          if (plan.revision !== expectedPlanRevision)
            fail(
              "The chosen angle changed. Read get-strip-plan before drafting again.",
              { statusCode: 409, errorCode: "stale_revision" },
            );
          const chosen = plan.angles.find((a) => a.id === plan.selectedAngleId);
          if (!chosen)
            fail("Ask the human to choose an angle before drafting.", {
              errorCode: "angle_required",
            });
          if (
            draft.source !== plan.source ||
            draft.inputKind !== plan.inputKind
          )
            fail("Preserve the angle plan's source and illustrative status.", {
              errorCode: "invalid_scene",
            });
          const composition = composedDraftSchema.parse({
            ...draft,
            cast: chosen.cast,
            angles: plan.angles,
            selectedAngleId: chosen.id,
          });
          return createStrip(composition, ctx, tx);
        })
      : await createStrip(draft, ctx);
    if (
      callerActor(ctx) === "agent" &&
      ctx?.caller !== "mcp" &&
      ctx?.caller !== "a2a" &&
      !ctx?.networkProtocol
    ) {
      await writeAppStateForCurrentTab("navigate", {
        path: `/home?id=${strip.id}`,
        view: "home",
        stripId: strip.id,
      });
    }
    return strip;
  },
});

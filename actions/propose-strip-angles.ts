import { defineAction } from "@agent-native/core/action";
import { writeAppStateForCurrentTab } from "@agent-native/core/application-state";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import { proposeAngles } from "../server/lib/angle-store.js";
import { callerActor } from "../server/lib/strip-store.js";
import { anglePlanSchema } from "../shared/angles.js";

export default defineAction({
  description:
    "Save THREE comic angles you authored from the update, BEFORE drafting panels. Each needs a one-line premise, specific irony/reversal and 1–3 story-specific cast cards (usually two). Dialogue must REACT, not recite facts. This deterministic action does not generate ideas. Show the cards and stop for the human to choose; do not draft until chosen.",
  schema: z.object({
    source: anglePlanSchema.shape.source,
    inputKind: anglePlanSchema.shape.inputKind,
    angles: anglePlanSchema.shape.angles,
  }),
  outputSchema: anglePlanSchema,
  link: ({ result }) => ({
    url: buildDeepLink({
      app: "strip",
      view: "home",
      to: `/home?new=1&plan=${result.id}`,
      params: { plan: result.id },
    }),
    label: "Pick a comic angle",
    view: "home",
  }),
  run: async (args, ctx) => {
    const plan = await proposeAngles(args, ctx);
    if (
      callerActor(ctx) === "agent" &&
      ctx?.caller !== "mcp" &&
      ctx?.caller !== "a2a" &&
      !ctx?.networkProtocol
    )
      await writeAppStateForCurrentTab("navigate", {
        path: `/home?new=1&plan=${plan.id}`,
        view: "compose",
      });
    return plan;
  },
});

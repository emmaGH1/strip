import { defineAction } from "@agent-native/core/action";
import { writeAppStateForCurrentTab } from "@agent-native/core/application-state";

import { callerActor, createStrip } from "../server/lib/strip-store.js";
import { draftSchema, stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "Save a complete four-panel comic you have composed from one product update. Provide real scene objects, exact source excerpts, short dialogue, a wordless visual beat and three ending choices. This action does not generate the story for you. Opens the saved strip in the editor.",
  schema: draftSchema,
  outputSchema: stripSchema,
  run: async (args, ctx) => {
    const strip = await createStrip(args, ctx);
    if (callerActor(ctx) === "agent") {
      await writeAppStateForCurrentTab("navigate", {
        path: `/home?id=${strip.id}`,
        view: "home",
        stripId: strip.id,
      });
    }
    return strip;
  },
});

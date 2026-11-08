import { defineAction } from "@agent-native/core/action";
import { writeAppStateForCurrentTab } from "@agent-native/core/application-state";
import { buildDeepLink } from "@agent-native/core/server";

import { callerActor, createStrip } from "../server/lib/strip-store.js";
import { composedDraftSchema, stripSchema } from "../shared/strip.js";

export default defineAction({
  description:
    "Save a complete four-panel comic you have composed from one product update. Provide real scene objects, exact source excerpts, short dialogue (12 words maximum), a wordless visual beat and three ending choices. Show the product change on a laptop using screenState (for Undo use restored); vary the structured actor.pose between panels, introduce payoff speakers in panel 1 or 2, and leave captions empty unless requested. This action does not generate the story for you. Opens the saved strip in the editor.",
  schema: composedDraftSchema,
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
    const strip = await createStrip(args, ctx);
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

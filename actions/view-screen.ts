import { defineAction } from "@agent-native/core/action";
import {
  readAppState,
  readAppStateForCurrentTab,
} from "@agent-native/core/application-state";
import { AGENT_SELECTION_STATE_KEY } from "@agent-native/core/shared";
import { z } from "zod";

import { getPlan } from "../server/lib/angle-store.js";
import { getStrip } from "../server/lib/strip-store.js";
import { archetypes } from "../shared/casting.js";

export default defineAction({
  description:
    "Read the current Strip editor, selected panel/object, comic revision and protected contributions before a contextual revision.",
  schema: z.object({}),
  outputSchema: z.object({
    navigation: z.unknown(),
    selection: z.unknown(),
    comic: z.unknown(),
    anglePlan: z.unknown(),
    castingLibrary: z.unknown(),
  }),
  http: false,
  readOnly: true,
  run: async (_args, ctx) => {
    const navigation = (await readAppState("navigation")) as {
      stripId?: string;
      planId?: string;
      selectedPanelId?: string;
    } | null;
    const selection = await readAppStateForCurrentTab(
      AGENT_SELECTION_STATE_KEY,
    );
    const current = navigation?.stripId
      ? await getStrip(navigation.stripId, ctx)
      : null;
    // Current-screen is injected every turn; never multiply it by full historical drafts.
    const comic = current
      ? {
          id: current.id,
          revision: current.revision,
          title: current.draft.title,
          protectedIds: current.protectedIds,
          angles: current.draft.angles ?? null,
          selectedAngleId: current.draft.selectedAngleId ?? null,
          cast: current.draft.cast ?? null,
          panels: current.draft.panels.map((panel) => ({
            id: panel.id,
            beat: panel.beat,
            actors: panel.actors.map((actor) => actor.id),
            balloons: panel.balloons.map((balloon) => ({
              id: balloon.id,
              text: balloon.text,
            })),
          })),
          nextAction:
            "get-strip for the current complete scene before update-strip",
        }
      : null;
    return {
      navigation: navigation ?? null,
      selection: selection ?? null,
      comic,
      anglePlan: navigation?.planId
        ? await getPlan(navigation.planId, ctx)
        : null,
      castingLibrary: Object.fromEntries(
        Object.entries(archetypes).map(([id, member]) => [
          id,
          { name: member.name, role: member.role },
        ]),
      ),
    };
  },
});

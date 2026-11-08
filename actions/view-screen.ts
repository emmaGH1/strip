import { defineAction } from "@agent-native/core/action";
import {
  readAppState,
  readAppStateForCurrentTab,
} from "@agent-native/core/application-state";
import { AGENT_SELECTION_STATE_KEY } from "@agent-native/core/shared";
import { z } from "zod";

import { getStrip } from "../server/lib/strip-store.js";

export default defineAction({
  description:
    "Read the current Strip editor, selected panel/object, comic revision and protected contributions before a contextual revision.",
  schema: z.object({}),
  outputSchema: z.object({
    navigation: z.unknown(),
    selection: z.unknown(),
    comic: z.unknown(),
  }),
  http: false,
  readOnly: true,
  run: async (_args, ctx) => {
    const navigation = (await readAppState("navigation")) as {
      stripId?: string;
      selectedPanelId?: string;
    } | null;
    const selection = await readAppStateForCurrentTab(
      AGENT_SELECTION_STATE_KEY,
    );
    const comic = navigation?.stripId
      ? await getStrip(navigation.stripId, ctx)
      : null;
    return {
      navigation: navigation ?? null,
      selection: selection ?? null,
      comic,
    };
  },
});

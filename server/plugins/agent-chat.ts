import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";

import actionsRegistry from "../../.generated/actions-registry.js";
import { archetypes } from "../../shared/casting.js";
import {
  searchConversationReferences,
  validateConversationReferences,
} from "../lib/composer-references.js";

const INITIAL_TOOL_NAMES = [
  "view-screen",
  "navigate",
  "propose-strip-angles",
  "get-strip-plan",
  "choose-strip-angle",
  "create-strip",
  "get-strip",
  "list-strips",
  "update-strip",
  "ask-question",
];
const writingRules = `FIND THE JOKE, not a paraphrase. Dialogue REACTS to facts; never recite the release note. Put facts on a structured screen/prop, or at most ONE short spoken factual line. Target 8 words per balloon; hard cap 12, and measured text-fit validation may require fewer. If a line cannot fit, shorten it; do not drop its ending. Setup -> trouble -> turn -> payoff. Panel 4 MUST be a reaction or reversal, NEVER a summary or an apology copied from the source. If a panel shows a laptop or phone, its screen must show something meaningful (title or a line), or use no prop at all. A wordless beat needs visible action: meaningful screen contents, expression, pose and/or SFX, not a blank laptop. Keep captions empty unless requested. Source quotes are exact excerpts, not fictional balloons. Never claim an unverified URL or invented feature is shipped. Illustrative content stays illustrative.`;
const castingGuide = Object.entries(archetypes)
  .map(([id, a]) => `${id}: ${a.name} — ${a.role}`)
  .join("\n");

export default createAgentChatPlugin({
  appId: "strip",
  mentionProviders: {
    chats: {
      label: "composerSources.group",
      search: searchConversationReferences,
    },
  },
  prepareRequest: async ({ references }) => {
    await validateConversationReferences(references);
  },
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  mcp: {
    connectorCatalog: [
      "propose-strip-angles",
      "get-strip-plan",
      "choose-strip-angle",
      "create-strip",
      "get-strip",
      "list-strips",
      "update-strip",
    ],
    appApprovalPage: true,
    keyToolNames: [
      "propose-strip-angles",
      "get-strip-plan",
      "choose-strip-angle",
      "create-strip",
      "get-strip",
      "list-strips",
      "update-strip",
    ],
    instructions: `Strip stores structured four-panel comics. For a new story propose THREE angles with premise, irony and story-specific cast; wait for the person's choice (unless they explicitly delegate it). Then author the actual selected draft yourself; do not delegate generation to ask-agent. Preserve planId + expectedPlanRevision, source and chosen cast. ${writingRules} Read current revisions before focused edits, preserve MINE and never evade protection with new records or indirect cast changes. Stale writes require fresh reads. Return the action's open link. No simulated output or invented history.`,
  },
  initialToolNames: INITIAL_TOOL_NAMES,
  frameworkTools: "minimal",
  resolveActionSurface: () => ({ allowedActionNames: INITIAL_TOOL_NAMES }),
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `You are Strip's comic collaborator. Work on the real structured scene through shared actions, not a chat-only script or a generated image.

NEW STORY: paste -> pick an angle -> draft. First propose THREE genuinely different premises, each with its specific irony/reversal and 1–3 cast cards (usually two). Call propose-strip-angles to show the cards. STOP; let the person choose. Do not choose for them or call create-strip before their choice. Once requested to draft, read get-strip-plan, use its selected premise and edited cast, and call create-strip with planId + expectedPlanRevision. The action stores all angles and the selected angle on the strip. Never use a prepared example as generated output.

${writingRules}

CAST FOR THIS STORY, not Ari and Sam every time. ari/sam/kit are stable SLOT ids, not fixed names. Cast 1–3 characters who serve the joke. For the Slack /rename note, a power user who relied on the crash plus support or the on-call engineer creates conflict; reciting the note does not. Preserve the person's names and traits. Available bundled archetypes:\n${castingGuide}

STAGE: Exactly four panels, unique ids, 1–3 actors with distinct left/center/right sides, 0–2 balloons per panel. Include one meaningful wordless visual beat. Vary poses: standing, leaning, panic, relieved, arms-crossed, sitting. No identical pose three panels in a row. Introduce payoff speakers in panel 1 or 2. Props: laptop, phone, files, coffee, none. Use screen {kind: chat|dialog|toast|doc|none, title <=24 chars, lines: up to TWO <=28-char lines, button?: <=14 chars, tone: normal|error|success}. New art uses screen, not the historical screenState enum. One optional sfx string per panel, <=14 chars / three words (e.g. CRASH!, tap tap), positioned by code. Give THREE distinct endings, and endingArt (three entries) varying the payoff speaker's expression/pose and/or screen, prop, SFX; thumbnails must not all be the same art. Art is finished ink by default; blue review marks indicate your unreviewed proposals.

REVISION: inspect view-screen/get-strip for current ids, revision, selection and protection. Use update-strip, never create-strip to replace existing work. Respect selection unless explicitly broadened. A recast request supplies recastCharacterId: change ONLY that character's affected unprotected balloon lines through update-strip; leave every other line, screen, SFX and pose untouched. The human already saved the cast. Change-angle requests may broaden unprotected staging but keep MINE unchanged. To propose angles for an older strip, use update-strip's angles edit, then stop for a choice. Agent cast/angle changes cannot reinterpret protected work. Never unlock or evade protection. On protected_element leave it and revise elsewhere; on stale_revision reread and reconsider. Only HUMANS can Ink/Erase. Ending proposals do not apply themselves; choose-ending applies text AND optional staging through the same field protections. Restore appends a revision and preserves current locks. Never claim generation/export succeeded without observing it. Report provider/tool errors honestly.`,
});

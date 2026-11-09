import { anglePlanSchema } from "./angles.js";
import { suggestedCast } from "./casting.js";
import { composedDraftSchema } from "./strip.js";

/** Hand-authored, explicitly ILLUSTRATIVE. Never used as a generation fallback. */
export const slackSource =
  "Fixed: Sending the /rename command to rename a channel without any other text no longer causes a crash. The /crash command, meanwhile, is still not working at all, so if you were using /rename to get that effect, apologies for the inconvenience to your workflow.";
export const illustrativeAngles = anglePlanSchema.parse({
  id: "illustrative-slack-angles",
  revision: 0,
  source: slackSource,
  inputKind: "illustrative",
  angles: [
    {
      id: "focus-mode",
      premise: "A power user's perfect meeting escape gets patched.",
      irony:
        "Support celebrates reliability; the customer mourns their most reliable excuse.",
      cast: suggestedCast("power-user", "support-agent"),
    },
    {
      id: "bug-customer",
      premise: "An engineer discovers the crash has a loyal customer.",
      irony: "The bug's biggest fan wants a refund for a free fix.",
      cast: suggestedCast("on-call-engineer", "customer"),
    },
    {
      id: "qa-promotion",
      premise: "QA's crash test has become the team's productivity tool.",
      irony:
        "The tester who closed the bug is asked to reopen everyone's calendar.",
      cast: suggestedCast("qa-tester", "product-manager"),
    },
  ],
});
const people = illustrativeAngles.angles[0]!.cast;
export const illustrativeSlack = composedDraftSchema.parse({
  title: "An inconvenient fix",
  source: slackSource,
  sourceUrl: "",
  inputKind: "illustrative",
  cast: people,
  angles: illustrativeAngles.angles,
  selectedAngleId: "focus-mode",
  panels: [
    {
      id: "slack-1",
      beat: "setup",
      caption: "",
      prop: "laptop",
      screen: {
        kind: "dialog",
        title: "Slack has crashed",
        lines: ["/rename"],
        tone: "error",
        button: "Close",
      },
      sfx: "CRASH!",
      actors: [
        {
          id: "jules-1",
          character: "ari",
          expression: "happy",
          pose: "leaning",
          side: "left",
        },
      ],
      balloons: [
        {
          id: "slack-line-1",
          speaker: "ari",
          text: "Right on time for standup.",
        },
      ],
      sourceQuote:
        "Sending the /rename command to rename a channel without any other text no longer causes a crash.",
    },
    {
      id: "slack-2",
      beat: "trouble",
      caption: "",
      prop: "laptop",
      screen: {
        kind: "toast",
        title: "/rename fixed",
        lines: ["No more crashes"],
        tone: "success",
      },
      actors: [
        {
          id: "robin-2",
          character: "sam",
          expression: "happy",
          pose: "standing",
          side: "right",
        },
      ],
      balloons: [
        {
          id: "slack-line-2",
          speaker: "sam",
          text: "Glad we could keep you connected.",
        },
      ],
      sourceQuote: "no longer causes a crash.",
    },
    {
      id: "slack-3",
      beat: "turn",
      caption: "",
      prop: "laptop",
      screen: {
        kind: "chat",
        title: "Try another command",
        lines: ["/crash", "Unknown command"],
        tone: "error",
      },
      sfx: "tap tap",
      actors: [
        {
          id: "jules-3",
          character: "ari",
          expression: "panic",
          pose: "sitting",
          side: "left",
        },
      ],
      balloons: [],
      sourceQuote: "The /crash command, meanwhile, is still not working at all",
    },
    {
      id: "slack-4",
      beat: "payoff",
      caption: "",
      prop: "laptop",
      screen: {
        kind: "dialog",
        title: "Team standup",
        lines: ["You are connected"],
        button: "Join",
        tone: "normal",
      },
      sfx: "ding",
      actors: [
        {
          id: "jules-4",
          character: "ari",
          expression: "skeptical",
          pose: "arms-crossed",
          side: "left",
        },
      ],
      balloons: [
        {
          id: "slack-line-4",
          speaker: "ari",
          text: "I'll need a different emergency.",
        },
      ],
      sourceQuote: "",
    },
  ],
  endings: [
    "I'll need a different emergency.",
    "Fine. I'll actually attend.",
    "Can you break my microphone?",
  ],
  endingArt: [
    {
      expression: "skeptical",
      pose: "arms-crossed",
      sfx: "ding",
      screen: {
        kind: "dialog",
        title: "Team standup",
        lines: ["You are connected"],
        button: "Join",
        tone: "normal",
      },
    },
    {
      expression: "thinking",
      pose: "sitting",
      sfx: "sigh",
      screen: {
        kind: "chat",
        title: "Team standup",
        lines: ["Joining…"],
        tone: "success",
      },
    },
    {
      expression: "happy",
      pose: "leaning",
      sfx: "idea!",
      prop: "phone",
      screen: {
        kind: "chat",
        title: "Support",
        lines: ["One more question…"],
        tone: "normal",
      },
    },
  ],
});

import {
  composedDraftSchema,
  type ComposedDraft,
  type Expression,
} from "./strip.js";

function prepared(
  title: string,
  source: string,
  dialogue: string[],
  expressions: Expression[],
  endings: string[],
): ComposedDraft {
  return composedDraftSchema.parse({
    title,
    source,
    sourceUrl: "",
    inputKind: "illustrative",
    endings,
    panels: ["setup", "trouble", "turn", "payoff"].map((beat, i) => ({
      id: `panel-${i + 1}`,
      beat,
      caption: "",
      prop: "laptop",
      screenState: title.startsWith("A small undo")
        ? ["files", "deleted", "restored", "restored"][i]
        : title.startsWith("Search")
          ? ["files", "files", "search-results", "search-results"][i]
          : ["files", "files", "scheduled", "scheduled"][i],
      actors: [
        {
          id: `actor-${i + 1}`,
          character: i === 3 ? "sam" : "ari",
          expression: expressions[i],
          pose: ["leaning", "panic", "relieved", "arms-crossed"][i],
          side: "left",
        },
        ...(i === 0
          ? [
              {
                id: "sam-intro",
                character: "sam",
                expression: "neutral",
                pose: "standing",
                side: "right",
              },
            ]
          : []),
      ],
      balloons: dialogue[i]
        ? [
            {
              id: `balloon-${i + 1}`,
              speaker: i === 3 ? "sam" : "ari",
              text: dialogue[i],
            },
          ]
        : [],
      sourceQuote: i === 2 ? source : "",
    })),
  });
}

// Hand-authored fixtures for art/interaction testing. NEVER call these generated.
export const preparedExamples: ComposedDraft[] = [
  prepared(
    "A small undo. A large relief.",
    "Deleted files can now be restored with Undo.",
    [
      "Just clearing the old drafts.",
      "That was the launch plan.",
      "",
      "Now add Undo to ‘Sure, Friday works.’",
    ],
    ["happy", "panic", "happy", "skeptical"],
    [
      "Now add Undo to ‘Sure, Friday works.’",
      "Great. Can it restore my weekend?",
      "Finally, a feature for my decision-making process.",
    ],
  ),
  prepared(
    "Search gets the hint.",
    "Search now understands common spelling mistakes and returns matching files.",
    [
      "I know exactly what it's called.",
      "My fingers have a different opinion.",
      "",
      "My spelling didn't improve. Our relationship did.",
    ],
    ["happy", "thinking", "happy", "skeptical"],
    [
      "My spelling didn't improve. Our relationship did.",
      "Finally. Search speaks fluent Monday.",
      "Correct result. Incorrect spelling. Everybody wins.",
    ],
  ),
  prepared(
    "Tomorrow, handled.",
    "You can now schedule a message to send at a time you choose.",
    [
      "I'll send it Monday morning.",
      "Future me will definitely remember.",
      "",
      "My messages finally have better boundaries than me.",
    ],
    ["thinking", "skeptical", "happy", "happy"],
    [
      "My messages finally have better boundaries than me.",
      "Productivity is delegating to a clock.",
      "Sent on time. Me? Still asleep.",
    ],
  ),
];

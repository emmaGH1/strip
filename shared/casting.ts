import { z } from "zod";

/** Bundled Open Peeps parts. Roles are comic functions, never identity stereotypes. */
export const archetypes = {
  "power-user": {
    label: "Power user",
    name: "Jules",
    role: "Has a shortcut for absolutely everything.",
    hair: "Mohawk",
    accessory: "GlassRound",
    facialHair: undefined,
  },
  "on-call-engineer": {
    label: "On-call engineer",
    name: "Dev",
    role: "Treats a quiet pager as a personal victory.",
    hair: "ShortMessy",
    accessory: undefined,
    facialHair: "Full",
  },
  "product-manager": {
    label: "Product manager",
    name: "Morgan",
    role: "Can turn any disaster into a roadmap item.",
    hair: "Bun",
    accessory: "GlassClubmaster",
    facialHair: undefined,
  },
  "support-agent": {
    label: "Support agent",
    name: "Robin",
    role: "Unflappable, even when the ticket is on fire.",
    hair: "Hijab",
    accessory: undefined,
    facialHair: undefined,
  },
  designer: {
    label: "Designer",
    name: "Remy",
    role: "Notices the kerning during an emergency.",
    hair: "LongCurly",
    accessory: "GlassButterfly",
    facialHair: undefined,
  },
  "new-hire": {
    label: "New hire",
    name: "Alex",
    role: "Asks the obvious question nobody else will.",
    hair: "Afro",
    accessory: undefined,
    facialHair: undefined,
  },
  ceo: {
    label: "CEO",
    name: "Casey",
    role: "Wants the five-year vision before lunch.",
    hair: "BaldTop",
    accessory: "GlassAviator",
    facialHair: "Handlebars",
  },
  customer: {
    label: "Customer",
    name: "Lee",
    role: "Uses the product exactly wrong, very successfully.",
    hair: "Turban",
    accessory: undefined,
    facialHair: "Chin",
  },
  "qa-tester": {
    label: "QA tester",
    name: "Quinn",
    role: "Hears 'impossible' as a test case.",
    hair: "Bangs",
    accessory: "GlassRound",
    facialHair: undefined,
  },
  intern: {
    label: "Intern",
    name: "Kit",
    role: "Accidentally solves the problem everyone overthought.",
    hair: "Beanie",
    accessory: undefined,
    facialHair: undefined,
  },
} as const;
export const archetypeSchema = z.enum(
  Object.keys(archetypes) as [
    keyof typeof archetypes,
    ...(keyof typeof archetypes)[],
  ],
);
export const characterIdSchema = z.enum(["ari", "sam", "kit"]);
export const castMemberSchema = z.object({
  name: z.string().trim().min(1).max(30),
  role: z.string().trim().min(1).max(120),
  archetype: archetypeSchema
    .optional()
    .describe(
      "Visual archetype; historical ari/sam map to power-user/product-manager.",
    ),
});
export const castSchema = z.object({
  ari: castMemberSchema,
  sam: castMemberSchema.optional(),
  kit: castMemberSchema.optional(),
});
export const storyCastSchema = castSchema.refine(
  (people) =>
    Object.values(people).every((person) => !person || person.archetype),
  "Choose an explicit visual archetype for every character in a new angle.",
);
export type Cast = z.infer<typeof castSchema>;
export type CharacterId = z.infer<typeof characterIdSchema>;
export const legacyCast: Cast = {
  ari: { name: "Ari", role: "the optimistic maker", archetype: "power-user" },
  sam: { name: "Sam", role: "the dry realist", archetype: "product-manager" },
};
export function personFor(draft: { cast?: Cast | undefined }, id: CharacterId) {
  return (
    draft.cast?.[id] ??
    legacyCast[id] ?? { ...archetypes.intern, archetype: "intern" as const }
  );
}
export function archetypeFor(
  draft: { cast?: Cast | undefined },
  id: CharacterId,
) {
  return (
    personFor(draft, id).archetype ??
    (id === "ari" ? "power-user" : id === "sam" ? "product-manager" : "intern")
  );
}
export function suggestedCast(
  first: keyof typeof archetypes,
  second?: keyof typeof archetypes,
): Cast {
  return {
    ari: {
      name: archetypes[first].name,
      role: archetypes[first].role,
      archetype: first,
    },
    ...(second
      ? {
          sam: {
            name: archetypes[second].name,
            role: archetypes[second].role,
            archetype: second,
          },
        }
      : {}),
  };
}

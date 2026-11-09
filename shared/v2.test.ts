import { readFileSync, existsSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { anglePlanSchema, selectPlanAngle } from "./angles.js";
import { archetypes, suggestedCast } from "./casting.js";
import { renderStripSvg } from "./render-strip.js";
import {
  applyEdits,
  composedDraftSchema,
  draftSchema,
  screenSchema,
  sfxSchema,
  type Strip,
  stripSchema,
} from "./strip.js";
import { comicWidth, fitBalloon, MIN_BALLOON_SIZE } from "./text-fit.js";
import { illustrativeAngles, illustrativeSlack } from "./v2-fixture.js";
const fixture = (): Strip => ({
  id: "slack",
  revision: 0,
  draft: structuredClone(illustrativeSlack),
  protectedIds: [],
  origin: "prepared-example",
  lastEditedBy: "human",
  updatedAt: "now",
});
const assets = { peeps: {}, textFont: "", titleFont: "" };

describe("angles first", () => {
  it("requires three distinct, casted angles and validates selection", () => {
    expect(anglePlanSchema.safeParse(illustrativeAngles).success).toBe(true);
    const uncast = structuredClone(illustrativeAngles);
    delete uncast.angles[0]!.cast.ari.archetype;
    expect(anglePlanSchema.safeParse(uncast).success).toBe(false);
    expect(
      anglePlanSchema.safeParse({
        ...illustrativeAngles,
        angles: illustrativeAngles.angles.slice(1),
      }).success,
    ).toBe(false);
    expect(
      anglePlanSchema.safeParse({
        ...illustrativeAngles,
        selectedAngleId: "missing",
      }).success,
    ).toBe(false);
    expect(
      anglePlanSchema.safeParse({
        ...illustrativeAngles,
        angles: [
          illustrativeAngles.angles[0],
          illustrativeAngles.angles[0],
          illustrativeAngles.angles[2],
        ],
      }).success,
    ).toBe(false);
  });
  it("persists the edited premise and cast, without overwriting another revision", () => {
    const plan = selectPlanAngle(illustrativeAngles, 0, {
      angleId: "focus-mode",
      premise: "The power user's escape hatch gets fixed.",
      cast: suggestedCast("power-user", "on-call-engineer"),
    });
    expect(plan.revision).toBe(1);
    expect(plan.selectedAngleId).toBe("focus-mode");
    expect(plan.angles[0]!.cast.sam!.archetype).toBe("on-call-engineer");
    expect(illustrativeAngles.selectedAngleId).toBeUndefined();
    expect(() => selectPlanAngle(plan, 0, { angleId: "focus-mode" })).toThrow(
      "stale_revision",
    );
  });
  it("stores chosen angles on the strip and supports Change angle with review", () => {
    const scene = fixture();
    const next = applyEdits(
      scene,
      0,
      [{ kind: "angle", angleId: "bug-customer" }],
      "agent",
    );
    expect(next.draft.selectedAngleId).toBe("bug-customer");
    expect(next.draft.angles).toHaveLength(3);
    expect(
      applyEdits(
        next,
        1,
        [{ kind: "review", key: "angle:$angle", decision: "erase" }],
        "human",
      ).draft.selectedAngleId,
    ).toBe("focus-mode");
    scene.protectedIds = ["slack-line-1"];
    expect(() =>
      applyEdits(
        scene,
        0,
        [{ kind: "angle", angleId: "bug-customer" }],
        "agent",
      ),
    ).toThrow("MINE");
  });
});
describe("story-specific casting", () => {
  it("bundles ten distinct silhouettes in every expression and pose", () => {
    expect(Object.keys(archetypes)).toHaveLength(10);
    expect(
      new Set(
        Object.values(archetypes).map((a) =>
          [a.hair, a.accessory, a.facialHair].join(":"),
        ),
      ).size,
    ).toBe(10);
    for (const key of Object.keys(archetypes))
      for (const face of ["neutral", "happy", "panic", "skeptical", "thinking"])
        for (const pose of [
          "standing",
          "leaning",
          "panic",
          "relieved",
          "arms-crossed",
          "sitting",
        ]) {
          const path = `public/peeps/${key}-${face}-${pose}.svg`;
          expect(existsSync(path)).toBe(true);
        }
    expect(
      readFileSync("public/peeps/power-user-happy-standing.svg", "utf8"),
    ).not.toBe(
      readFileSync("public/peeps/support-agent-happy-standing.svg", "utf8"),
    );
  });
  it("recasts through the focused shared edit, without changing any protected dialogue", () => {
    const scene = fixture();
    scene.protectedIds = ["slack-line-1"];
    const cast = suggestedCast("qa-tester", "support-agent");
    const next = applyEdits(scene, 0, [{ kind: "cast", cast }], "human");
    expect(next.draft.cast).toEqual(cast);
    expect(next.draft.panels).toEqual(scene.draft.panels);
    expect(() =>
      applyEdits(scene, 0, [{ kind: "cast", cast }], "agent"),
    ).toThrow("MINE");
    expect(() =>
      applyEdits(
        next,
        1,
        [{ kind: "balloon", id: "slack-line-1", text: "Nope." }],
        "agent",
      ),
    ).toThrow("protected");
    expect(() =>
      applyEdits(next, 0, [{ kind: "cast", cast }], "human"),
    ).toThrow("changed");
  });
  it("supports one or three cast members and legacy missing archetypes", () => {
    const one = fixture().draft;
    one.cast = suggestedCast("power-user");
    one.panels[1]!.actors[0]!.character = "ari";
    one.panels[1]!.balloons[0]!.speaker = "ari";
    expect(composedDraftSchema.safeParse(one).success).toBe(true);
    const three = fixture().draft;
    three.cast!.kit = { name: "Kit", role: "Asks why.", archetype: "intern" };
    three.panels[0]!.actors.push({
      id: "kit-1",
      character: "kit",
      expression: "thinking",
      side: "center",
      pose: "sitting",
    });
    expect(composedDraftSchema.safeParse(three).success).toBe(true);
    delete three.cast;
    expect(draftSchema.safeParse(three).success).toBe(true);
  });
});
describe("visible story props", () => {
  it("validates screen, SFX and phone bounds", () => {
    expect(
      screenSchema.safeParse({
        kind: "chat",
        title: "/rename",
        lines: ["one", "two", "three"],
        tone: "error",
      }).success,
    ).toBe(false);
    expect(
      screenSchema.safeParse({ kind: "arbitrary-html", title: "<svg>" })
        .success,
    ).toBe(false);
    expect(
      screenSchema.safeParse({ kind: "doc", lines: ["x".repeat(29)] }).success,
    ).toBe(false);
    expect(sfxSchema.safeParse("one two three four").success).toBe(false);
    const next = applyEdits(
      fixture(),
      0,
      [
        { kind: "prop", id: "slack-1", prop: "phone" },
        { kind: "sfx", id: "slack-1", sfx: "tap tap" },
      ],
      "agent",
    );
    expect(next.draft.panels[0]!.prop).toBe("phone");
    const svg = renderStripSvg(next, assets, comicWidth).svg;
    expect(svg).toContain("Slack has crashed");
    expect(svg).toContain("/crash");
    expect(svg).toContain("tap tap");
    expect(svg).not.toContain('filter="url(#blue-pencil)"');
  });
  it("protects staging and restores exact optional values on erase", () => {
    const scene = fixture();
    scene.protectedIds = ["slack-3"];
    expect(() =>
      applyEdits(
        scene,
        0,
        [{ kind: "sfx", id: "slack-3", sfx: "BOOM" }],
        "agent",
      ),
    ).toThrow("protected");
    scene.protectedIds = [];
    const before = scene.draft.panels[0]!.screen;
    const next = applyEdits(
      scene,
      0,
      [
        {
          kind: "screen",
          id: "slack-1",
          screen: { kind: "none", title: "", lines: [], tone: "normal" },
        },
      ],
      "agent",
    );
    expect(
      applyEdits(
        next,
        1,
        [{ kind: "review", key: "screen:slack-1", decision: "erase" }],
        "human",
      ).draft.panels[0]!.screen,
    ).toEqual(before);
  });
  it("applies visually different endings atomically and checks every protected field", () => {
    const scene = fixture();
    const next = applyEdits(
      scene,
      0,
      [{ kind: "choose-ending", index: 2 }],
      "agent",
    );
    expect(next.draft.panels[3]!.prop).toBe("phone");
    expect(next.draft.panels[3]!.actors[0]!.expression).toBe("happy");
    expect(next.draft.panels[3]!.sfx).toBe("idea!");
    scene.protectedIds = ["jules-4"];
    expect(() =>
      applyEdits(scene, 0, [{ kind: "choose-ending", index: 2 }], "agent"),
    ).toThrow("protected");
    expect(scene.draft.panels[3]!.balloons[0]!.text).toBe(
      "I'll need a different emergency.",
    );
  });
  it("does not leak phone, SFX or pose staging between alternative choices", () => {
    const initial = fixture();
    const third = applyEdits(
      initial,
      0,
      [{ kind: "choose-ending", index: 2 }],
      "human",
    );
    const first = applyEdits(
      third,
      1,
      [{ kind: "choose-ending", index: 0 }],
      "human",
    );
    expect(third.draft.panels[3]!.prop).toBe("phone");
    expect(first.draft.panels[3]!.prop).toBe("laptop");
    expect(first.draft.panels[3]!.screen).toEqual(
      initial.draft.panels[3]!.screen,
    );
    expect(first.draft.panels[3]!.actors[0]!.pose).toBe("arms-crossed");
    const second = applyEdits(
      first,
      2,
      [{ kind: "choose-ending", index: 1 }],
      "human",
    );
    expect(second.draft.panels[3]!.prop).toBe("laptop");
    expect(second.draft.panels[3]!.sfx).toBe("sigh");
  });
  it("uses ink art with small blue review marks; exports have none", () => {
    const scene = applyEdits(
      fixture(),
      0,
      [
        {
          kind: "balloon",
          id: "slack-line-4",
          text: "Fine. I'll actually attend.",
        },
      ],
      "agent",
    );
    scene.protectedIds = ["slack-line-1"];
    const ui = renderStripSvg(scene, assets, comicWidth).svg;
    expect(ui).toContain('data-pencil="true"');
    expect(ui).toContain('stroke="#3B6FD8"');
    const exported = renderStripSvg(
      scene,
      assets,
      comicWidth,
      undefined,
      undefined,
      false,
    ).svg;
    expect(exported).not.toContain('data-pencil="true"');
    expect(exported).not.toContain('stroke="#3B6FD8"');
    expect(exported).not.toContain(">MINE<");
  });
});
describe("measured lettering", () => {
  const regression =
    "Sadly, /crash still doesn't work. Apologies to your workflow.";
  it("fits ALL words, shrinking when needed, never slicing the last lines", () => {
    const fit = fitBalloon(regression, false)!;
    expect(fit).not.toBeNull();
    expect(fit.size).toBeGreaterThanOrEqual(MIN_BALLOON_SIZE);
    expect(fit.lines.join(" ")).toBe(regression);
    const scene = fixture();
    scene.draft.panels[3]!.balloons[0]!.text = regression;
    const rendered = renderStripSvg(scene, assets, comicWidth);
    expect(rendered.overflow).toEqual([]);
    expect(rendered.svg).toContain("workflow.");
  });
  it("shrinks within the minimum and rejects the regression in a narrower two-balloon layout", () => {
    const short = fitBalloon(
      "I had a perfectly reliable emergency until this morning.",
      true,
    )!;
    expect(short.size).toBe(24);
    expect(short.lines.join(" ")).toBe(
      "I had a perfectly reliable emergency until this morning.",
    );
    const scene = fixture();
    scene.draft.panels[3]!.balloons.push({
      id: "second-payoff",
      speaker: "ari",
      text: "Oh.",
    });
    expect(() =>
      applyEdits(
        scene,
        0,
        [{ kind: "balloon", id: "slack-line-4", text: regression }],
        "agent",
      ),
    ).toThrow("Shorten");
    expect(scene.revision).toBe(0);
  });
  it("keeps an old overflowing record readable and correctable without rendering its bad line", () => {
    const old = fixture();
    old.draft.panels[0]!.balloons[0]!.text = "W".repeat(80);
    const read = stripSchema.parse(old);
    expect(renderStripSvg(read, assets, comicWidth).overflow).toContain(
      "slack-line-1",
    );
    const fixed = applyEdits(
      read,
      0,
      [{ kind: "balloon", id: "slack-line-1", text: "Right on time." }],
      "human",
    );
    expect(renderStripSvg(fixed, assets, comicWidth).overflow).toEqual([]);
  });
  it("rejects impossible lettering before saving, including two-balloon geometry", () => {
    const scene = fixture();
    expect(() =>
      applyEdits(
        scene,
        0,
        [{ kind: "balloon", id: "slack-line-1", text: "W".repeat(80) }],
        "agent",
      ),
    ).toThrow("cannot fit");
    expect(scene.revision).toBe(0);
    const impossible = structuredClone(scene.draft);
    impossible.panels[0]!.balloons[0]!.text = "W".repeat(80);
    expect(composedDraftSchema.safeParse(impossible).success).toBe(false);
    const result = renderStripSvg(
      { ...scene, draft: impossible },
      assets,
      comicWidth,
    );
    expect(result.overflow).toContain("slack-line-1");
    expect(result.svg).not.toContain("W".repeat(80));
  });
});

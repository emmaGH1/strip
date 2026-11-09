import { describe, expect, it, vi } from "vitest";

import {
  illustrativeAngles,
  illustrativeSlack,
} from "../../shared/v2-fixture.js";
const mocks = vi.hoisted(() => ({
  getPlan: vi.fn(),
  createStrip: vi.fn(),
  transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
    callback({ transactionMarker: true }),
  ),
}));
vi.mock("../db/index.js", () => ({
  getDb: () => ({ transaction: mocks.transaction }),
}));
vi.mock("./angle-store.js", () => ({ getPlan: mocks.getPlan }));
vi.mock("./strip-store.js", async (original) => ({
  ...(await original<typeof import("./strip-store.js")>()),
  createStrip: mocks.createStrip,
}));
import action from "../../actions/create-strip.js";
const ctx = {
  caller: "mcp" as const,
  userEmail: "test@example.test",
  orgId: "org",
};
describe("chosen-angle creation contract", () => {
  it("will not let an agent skip angles for a real update", async () => {
    const before = mocks.createStrip.mock.calls.length;
    await expect(
      action.run({ ...illustrativeSlack, inputKind: "user-provided" }, ctx),
    ).rejects.toThrow("First propose");
    expect(mocks.createStrip.mock.calls.length).toBe(before);
  });
  it("rejects unchosen, stale and source-swapped plans before writes", async () => {
    const before = mocks.createStrip.mock.calls.length;
    mocks.getPlan.mockResolvedValue(illustrativeAngles);
    await expect(
      action.run(
        { ...illustrativeSlack, planId: "plan", expectedPlanRevision: 0 },
        ctx,
      ),
    ).rejects.toThrow("choose");
    mocks.getPlan.mockResolvedValue({
      ...illustrativeAngles,
      revision: 2,
      selectedAngleId: "focus-mode",
    });
    await expect(
      action.run(
        { ...illustrativeSlack, planId: "plan", expectedPlanRevision: 0 },
        ctx,
      ),
    ).rejects.toThrow("changed");
    await expect(
      action.run(
        {
          ...illustrativeSlack,
          source: `Another fact. ${illustrativeSlack.source}`,
          planId: "plan",
          expectedPlanRevision: 2,
        },
        ctx,
      ),
    ).rejects.toThrow("Preserve");
    expect(mocks.createStrip.mock.calls.length).toBe(before);
  });
  it("copies stored angles and the human's edited cast, never caller overrides", async () => {
    const plan = structuredClone(illustrativeAngles);
    plan.selectedAngleId = "focus-mode";
    plan.angles[0]!.cast.ari.name = "Taylor";
    mocks.getPlan.mockResolvedValue(plan);
    mocks.createStrip.mockImplementation(async (draft) => ({
      id: "created",
      revision: 0,
      draft,
      protectedIds: [],
      origin: "agent-draft",
      lastEditedBy: "agent",
      updatedAt: "now",
    }));
    await action.run(
      { ...illustrativeSlack, planId: "plan", expectedPlanRevision: 0 },
      ctx,
    );
    const saved = mocks.createStrip.mock.lastCall![0];
    expect(saved.angles).toEqual(plan.angles);
    expect(saved.cast.ari.name).toBe("Taylor");
    expect(saved.selectedAngleId).toBe("focus-mode");
    expect(saved.planId).toBeUndefined();
    expect(mocks.getPlan.mock.lastCall?.[3]).toBe(true);
    expect(mocks.createStrip.mock.lastCall?.[2]).toEqual({
      transactionMarker: true,
    });
  });
});

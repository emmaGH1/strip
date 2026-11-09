import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";

import { illustrativeAngles } from "../../shared/v2-fixture.js";
import { getPlan, chooseAngle, proposeAngles } from "./angle-store.js";
const mocks = vi.hoisted(() => ({
  where: vi.fn(),
  set: vi.fn(),
  insert: vi.fn(),
  lock: vi.fn(),
  rows: [] as unknown[],
  changed: [] as unknown[],
}));
vi.mock("../db/index.js", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: (sql: unknown) => {
          mocks.where(sql);
          return {
            limit: () =>
              Object.assign(Promise.resolve(mocks.rows), {
                for: async (mode: string) => {
                  mocks.lock(mode);
                  return mocks.rows;
                },
              }),
          };
        },
      }),
    }),
    update: () => ({
      set: (value: unknown) => {
        mocks.set(value);
        return {
          where: (sql: unknown) => {
            mocks.where(sql);
            return { returning: async () => mocks.changed };
          },
        };
      },
    }),
    insert: () => ({
      values: async (value: unknown) => {
        mocks.insert(value);
      },
    }),
  }),
}));
const ctx = {
  caller: "mcp" as const,
  userEmail: "angles@example.test",
  orgId: "one",
};
describe("scoped angle plans", () => {
  it("requires owner + workspace on reads and CAS writes", async () => {
    mocks.rows = [{ plan: illustrativeAngles }];
    await getPlan(illustrativeAngles.id, ctx);
    const read = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(read.params).toEqual([
      illustrativeAngles.id,
      "angles@example.test",
      "one",
    ]);
    await expect(
      chooseAngle(illustrativeAngles.id, 0, { angleId: "focus-mode" }, ctx),
    ).rejects.toThrow("newer angle choice");
    const write = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(write.sql).toContain('"revision"');
    expect(write.params).toEqual([
      illustrativeAngles.id,
      "angles@example.test",
      "one",
      0,
    ]);
    expect(mocks.set.mock.lastCall![0].plan.selectedAngleId).toBe("focus-mode");
    expect(mocks.set.mock.lastCall![0].revision).toBe(1);
  });
  it("holds a scoped shared plan lock when creating from a chosen revision", async () => {
    mocks.rows = [{ plan: illustrativeAngles }];
    await getPlan(illustrativeAngles.id, ctx, undefined, true);
    expect(mocks.lock.mock.lastCall).toEqual(["share"]);
    expect(
      new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]).params,
    ).toEqual([illustrativeAngles.id, "angles@example.test", "one"]);
  });
  it("rejects stale input before any write and uses null-org isolation", async () => {
    mocks.rows = [{ plan: { ...illustrativeAngles, revision: 2 } }];
    const count = mocks.set.mock.calls.length;
    await expect(
      chooseAngle(
        illustrativeAngles.id,
        0,
        { angleId: "focus-mode" },
        { caller: "frontend", userEmail: "angles@example.test" },
      ),
    ).rejects.toThrow("changed");
    expect(mocks.set.mock.calls.length).toBe(count);
    expect(
      new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]).sql,
    ).toContain('"org_id" is null');
    await expect(getPlan(illustrativeAngles.id)).rejects.toThrow("Sign in");
  });
  it("validates proposals before persistence and never generates or preselects", async () => {
    const input = {
      source: illustrativeAngles.source,
      inputKind: illustrativeAngles.inputKind,
      angles: illustrativeAngles.angles,
    };
    const count = mocks.insert.mock.calls.length;
    await expect(
      proposeAngles({ ...input, angles: [] }, ctx),
    ).rejects.toThrow();
    expect(mocks.insert.mock.calls.length).toBe(count);
    mocks.rows = [{ plan: illustrativeAngles }];
    await proposeAngles(input, ctx);
    const saved = mocks.insert.mock.lastCall![0];
    expect(saved.ownerEmail).toBe("angles@example.test");
    expect(saved.orgId).toBe("one");
    expect(saved.plan.angles).toEqual(input.angles);
    expect(saved.plan.selectedAngleId).toBeUndefined();
  });
});

import type { ActionCaller, ActionRunContext } from "@agent-native/core/action";
import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it, vi } from "vitest";

import { preparedExamples } from "../../shared/examples.js";
import type { Strip } from "../../shared/strip.js";
import {
  callerActor,
  getStrip,
  listStrips,
  owner,
  saveStrip,
} from "./strip-store.js";

const mocks = vi.hoisted(() => ({ where: vi.fn(), rows: [] as unknown[] }));
vi.mock("../db/index.js", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: (sql: unknown) => {
          mocks.where(sql);
          return {
            limit: async () => mocks.rows,
            orderBy: async () => mocks.rows,
          };
        },
      }),
    }),
    update: () => ({
      set: () => ({
        where: (sql: unknown) => {
          mocks.where(sql);
          return { returning: async () => [] };
        },
      }),
    }),
  }),
}));
const context: ActionRunContext = {
  caller: "tool",
  userEmail: "one@example.test",
  orgId: "org-one",
};
const scene: Strip = {
  id: "one",
  revision: 2,
  draft: preparedExamples[0]!,
  protectedIds: [],
  origin: "prepared-example",
  lastEditedBy: "human",
  updatedAt: "now",
};

describe("trusted caller and scoped store boundary", () => {
  it("recognizes only the ordinary frontend editor as human", () => {
    expect(callerActor({ caller: "frontend" })).toBe("human");
    const agentCallers: ActionCaller[] = [
      "tool",
      "http",
      "cli",
      "mcp",
      "webmcp",
      "a2a",
      "automation",
      "mcp-widget",
      "mcp-widget-write",
    ];
    for (const caller of agentCallers)
      expect(callerActor({ caller })).toBe("agent");
    expect(callerActor()).toBe("agent");
  });
  it("does not classify automation, protocol or scoped widget frontend calls as human", () => {
    expect(
      callerActor({
        caller: "frontend",
        automation: { triggerId: "one", triggerName: "timer" },
      }),
    ).toBe("agent");
    expect(callerActor({ caller: "frontend", networkProtocol: "mcp" })).toBe(
      "agent",
    );
    expect(
      callerActor({ caller: "frontend", mcpDirectoryWidgetReadOnly: true }),
    ).toBe("agent");
    expect(
      callerActor({
        caller: "frontend",
        mcpDirectoryWidgetWrite: {
          appId: "one",
          actionNames: [],
          resourceIds: {},
        },
      }),
    ).toBe("agent");
  });
  it("requires authenticated ownership", () => {
    expect(() => owner()).toThrow("Sign in");
    expect(owner(context)).toBe("one@example.test");
  });
  it("includes both owner and org predicates on reads", async () => {
    mocks.rows = [{ scene }];
    await getStrip("one", context);
    const sql = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(sql.sql).toContain("owner_email");
    expect(sql.sql).toContain("org_id");
    expect(sql.params).toEqual(["one", "one@example.test", "org-one"]);
  });
  it("uses explicit null org scope rather than leaking another workspace", async () => {
    await getStrip("one", { caller: "tool", userEmail: "one@example.test" });
    const sql = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(sql.sql).toContain('"org_id" is null');
  });
  it("scopes the library to the authenticated owner and current workspace", async () => {
    mocks.rows = [{ scene }];
    expect(await listStrips(context)).toEqual([scene]);
    let sql = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(sql.params).toEqual(["one@example.test", "org-one"]);
    await listStrips({ caller: "frontend", userEmail: "one@example.test" });
    sql = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(sql.sql).toContain('"org_id" is null');
    await expect(listStrips()).rejects.toThrow("Sign in");
  });
  it("rejects a lost compare-and-swap and includes the revision predicate", async () => {
    await expect(
      saveStrip(scene, { ...scene, revision: 3 }, context),
    ).rejects.toThrow("newer edit");
    const sql = new PgDialect().sqlToQuery(mocks.where.mock.lastCall![0]);
    expect(sql.sql).toContain("revision");
    expect(sql.params).toEqual(["one", "one@example.test", "org-one", 2]);
  });
});

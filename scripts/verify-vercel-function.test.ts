import { describe, expect, it } from "vitest";

// @ts-expect-error The deployment guard is a dependency-free Node CLI module.
import { verifyVercelFunction } from "./verify-vercel-function.mjs";

const emitted = {
  runtime: "nodejs22.x",
  supportsResponseStreaming: true,
  maxDuration: 300,
  regions: ["fra1"],
};

describe("Vercel emitted function release guard", () => {
  it("accepts the streaming 300s function colocated with Neon", () => {
    expect(() => verifyVercelFunction(emitted)).not.toThrow();
  });
  it.each([
    { maxDuration: undefined },
    { maxDuration: 60 },
    { regions: undefined },
    { regions: ["iad1"] },
    { regions: ["fra1", "iad1"] },
    { runtime: "nodejs20.x" },
    { supportsResponseStreaming: false },
  ])("rejects deployment regression %j", (override) => {
    expect(() => verifyVercelFunction({ ...emitted, ...override })).toThrow(
      "Vercel server must use",
    );
  });
});

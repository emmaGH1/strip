import { describe, expect, it } from "vitest";

import choose from "../../actions/choose-strip-angle.js";
import read from "../../actions/get-strip-plan.js";
import propose from "../../actions/propose-strip-angles.js";

describe("angle action startup", () => {
  it("imports all registered angle actions without deriving from a refined object", () => {
    // Production eagerly imports the static registry; build alone does not execute it.
    expect(propose.run).toBeTypeOf("function");
    expect(choose.run).toBeTypeOf("function");
    expect(read.run).toBeTypeOf("function");
  });
});

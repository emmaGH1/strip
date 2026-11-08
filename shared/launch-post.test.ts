import { describe, expect, it } from "vitest";

import { exportFilename, launchCaption } from "./launch-post";

describe("launch post", () => {
  it("uses the exact source facts, labels illustrative material and retains the source link", () => {
    expect(
      launchCaption({
        source: "  Undo restores deleted files.  ",
        sourceUrl: "https://example.com/update",
        inputKind: "illustrative",
      }),
    ).toBe(
      "Illustrative update: Undo restores deleted files. — in four panels.\nhttps://example.com/update\nFictional dialogue. Made with Strip.",
    );
  });
  it("does not label user-provided facts as illustrative", () => {
    expect(
      launchCaption({
        source: "Shipping today.",
        sourceUrl: "",
        inputKind: "user-provided",
      }),
    ).toBe(
      "Shipping today. — in four panels.\nFictional dialogue. Made with Strip.",
    );
  });
  it("makes bounded portable filenames", () => {
    expect(exportFilename("Déjà / Undo! 👀")).toBe("deja-undo.png");
    expect(exportFilename("🎉")).toBe("strip-comic.png");
    expect(exportFilename("a".repeat(100))).toHaveLength(76);
  });
});

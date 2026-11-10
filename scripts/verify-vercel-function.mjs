import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// --prebuilt uses this emitted config; source-level function globs are not proof.
export function verifyVercelFunction(config) {
  if (
    config.runtime !== "nodejs22.x" ||
    config.maxDuration !== 300 ||
    config.regions?.length !== 1 ||
    config.regions[0] !== "fra1" ||
    config.supportsResponseStreaming !== true
  ) {
    throw new Error(
      "Vercel server must use Node 22, streaming, 300s and Frankfurt (fra1).",
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const file = process.argv[2];
  if (!file)
    throw new Error("Usage: node verify-vercel-function.mjs CONFIG_FILE");
  verifyVercelFunction(JSON.parse(fs.readFileSync(file, "utf8")));
}

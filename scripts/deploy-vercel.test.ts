import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const dirs: string[] = [];
afterEach(() =>
  dirs
    .splice(0)
    .forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })),
);

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "strip-deploy-test-"));
  dirs.push(dir);
  const root = path.join(dir, "app");
  fs.mkdirSync(root);
  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, "bin"));
  fs.copyFileSync(
    "scripts/redact-deploy-log.mjs",
    path.join(root, "scripts/redact-deploy-log.mjs"),
  );
  fs.copyFileSync(
    "scripts/deploy-vercel.sh",
    path.join(root, "scripts/deploy-vercel.sh"),
  );
  fs.writeFileSync(
    path.join(root, "scripts/build-vercel.sh"),
    '#!/bin/bash\nprintf "build-migrate\\n" >> "$MOCK_CALLS"\n',
  );
  const db = path.join(dir, "db");
  const token = path.join(dir, "token");
  fs.writeFileSync(
    db,
    "postgresql://test:fixture-password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  );
  fs.writeFileSync(token, "fixture-token-not-a-real-secret");
  fs.writeFileSync(
    path.join(root, "bin/npx"),
    `#!/usr/bin/env bash
set -eu
[[ "$1" == --yes && "$2" == vercel@65.14.0 ]] || exit 30
shift 2
printf '%s %s\\n' "$1" "\${2:-}" >> "$MOCK_CALLS"
case "$1 \${2:-}" in
  'project inspect') [[ -f .vercel/project.json ]] || exit 1; printf '{}';;
  'project create') :;;
  'link --project') mkdir -p .vercel; printf '{"projectName":"strip","projectId":"fixture"}' > .vercel/project.json;;
  'env add') value=$(< /dev/stdin); [[ -n "$value" ]] || exit 31;;
  'deploy --prebuilt') if [[ -f fail-upload ]]; then printf 'fixture-password fixture-token-not-a-real-secret\\n' >&2; exit 32; fi; printf 'https://strip-deployment-fixture.vercel.app\\n';;
  'inspect https://strip-deployment-fixture.vercel.app') printf '{"alias":["strip-fixture.vercel.app"]}';;
  *) exit 33;;
esac
`,
  );
  fs.chmodSync(path.join(root, "bin/npx"), 0o700);
  const run = () =>
    spawnSync(
      "bash",
      [path.join(root, "scripts/deploy-vercel.sh"), db, token],
      {
        cwd: root,
        env: {
          ...process.env,
          PATH: `${root}/bin:${path.dirname(process.execPath)}:/usr/local/bin:/usr/bin:/bin`,
          MOCK_CALLS: path.join(root, "calls"),
        },
        encoding: "utf8",
      },
    );
  return { root, db, run };
}

describe("Vercel deploy preparation (mock CLI, no network)", () => {
  it("passes shell syntax validation", () => {
    for (const script of [
      "scripts/build-vercel.sh",
      "scripts/deploy-vercel.sh",
    ]) {
      expect(() => execFileSync("bash", ["-n", script])).not.toThrow();
    }
  });
  it("creates/links, migrates before upload, pins the alias and reuses secrets on retry", () => {
    const { root, run } = fixture();
    const first = run();
    expect(first.status, first.stderr).toBe(0);
    expect(first.stdout).toContain("https://strip-fixture.vercel.app");
    expect(first.stdout + first.stderr).not.toMatch(
      /fixture-password|fixture-token/,
    );
    const calls = fs.readFileSync(path.join(root, "calls"), "utf8");
    expect(calls).toContain("project create");
    expect(calls.indexOf("build-migrate")).toBeLessThan(
      calls.indexOf("deploy --prebuilt"),
    );
    expect(calls.match(/deploy --prebuilt/g)).toHaveLength(2);
    const secretFile = path.join(
      root,
      ".vercel/deploy-state/BETTER_AUTH_SECRET",
    );
    const secret = fs.readFileSync(secretFile, "utf8");
    expect(secret.trim()).toHaveLength(64);
    expect(fs.statSync(secretFile).mode & 0o777).toBe(0o600);
    fs.writeFileSync(path.join(root, "calls"), "");
    expect(run().status).toBe(0);
    expect(fs.readFileSync(secretFile, "utf8")).toBe(secret);
    expect(
      fs
        .readFileSync(path.join(root, "calls"), "utf8")
        .match(/deploy --prebuilt/g),
    ).toHaveLength(1);
  });
  it("fails clearly without exposing diagnostics or secrets", () => {
    const { root, run } = fixture();
    fs.writeFileSync(path.join(root, "fail-upload"), "");
    const result = run();
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("first production upload");
    const log = fs.readFileSync(
      path.join(root, ".vercel/deploy-state/last-run.log"),
      "utf8",
    );
    expect(log).toContain("[REDACTED]");
    expect(log).not.toMatch(/fixture-password|fixture-token/);
    expect(result.stdout + result.stderr).not.toMatch(
      /fixture-password|fixture-token/,
    );
  });
  it("rejects a non-Neon URL before any external call", () => {
    const { root, db, run } = fixture();
    fs.writeFileSync(db, "postgresql://localhost/local");
    expect(run().status).toBe(2);
    expect(fs.existsSync(path.join(root, "calls"))).toBe(false);
  });
});

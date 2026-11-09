// Private release logger: never copy known credential values into diagnostics.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const [databaseFile, tokenFile, state] = process.argv.slice(2);
const names = [
  "BETTER_AUTH_SECRET",
  "OAUTH_STATE_SECRET",
  "A2A_SECRET",
  "WORKSPACE_SECRETS_ENCRYPTION_KEY",
  "CRON_SECRET",
];
const database = fs.readFileSync(databaseFile, "utf8").trim();
const password = new URL(database).password;
const values = [
  database,
  password,
  decodeURIComponent(password),
  fs.readFileSync(tokenFile, "utf8").trim(),
  ...names.map((name) =>
    fs.readFileSync(path.join(state, name), "utf8").trim(),
  ),
]
  .filter(Boolean)
  .sort((a, b) => b.length - a.length);
for await (const line of readline.createInterface({ input: process.stdin })) {
  let safe = line;
  for (const value of values) safe = safe.split(value).join("[REDACTED]");
  process.stdout.write(`${safe}\n`);
}

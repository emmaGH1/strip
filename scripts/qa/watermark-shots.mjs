import { randomBytes } from "node:crypto";

import { chromium } from "@playwright/test";
const URL = "https://strip-kappa.vercel.app";
const out = "docs/evidence/watermark";
const pw = randomBytes(9).toString("hex") + "Aa1!";
const b = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
});
const ctx = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const p = await ctx.newPage();
await p.goto(URL + "/home");
const f = p.locator("#signup-form");
if (!(await f.isVisible()))
  await p.getByRole("button", { name: "Create account", exact: true }).click();
await f.getByLabel("Email").fill(`qa+${Date.now()}@example.com`);
await f.getByLabel("Password", { exact: true }).fill(pw);
await f.getByLabel("Confirm password").fill(pw);
await f.getByRole("button", { name: "Create account", exact: true }).click();
await p
  .getByRole("heading", { name: "Your strips" })
  .waitFor({ timeout: 30000 })
  .catch(async (e) => {
    await p.screenshot({ path: "/tmp/dbg.png" });
    throw e;
  });
await p.goto(URL + "/home?new=1");
await p.getByRole("button", { name: "Open illustrative Undo strip" }).click();
await p.waitForURL(/id=/);
await p.getByLabel("Strip title").waitFor();
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/studio.png` });
await p.getByRole("button", { name: "Export", exact: true }).click();
const dialog = p.getByRole("dialog");
await dialog.getByText("Your launch post").waitFor();
const [dl] = await Promise.all([
  p.waitForEvent("download"),
  dialog.getByRole("link", { name: "Download PNG" }).click(),
]);
await dl.saveAs(`${out}/export.png`);
await b.close();

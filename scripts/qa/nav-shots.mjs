import { randomBytes } from "node:crypto";

import { chromium } from "@playwright/test";
const URL = "https://strip-kappa.vercel.app";
const out = "docs/evidence/nav";
const pw = randomBytes(9).toString("hex") + "Aa1!";
const b = await chromium.launch({
  env: { ...process.env, INSTABOX_HEADLESS: "1" },
  headless: true,
  executablePath: "/usr/bin/chromium",
});
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(URL + "/home");
const f = p.locator("#signup-form");
if (!(await f.isVisible()))
  await p.getByRole("button", { name: "Create account", exact: true }).click();
await f.getByLabel("Email").fill(`qa+${Date.now()}@example.com`);
await f.getByLabel("Password", { exact: true }).fill(pw);
await f.getByLabel("Confirm password").fill(pw);
await f.getByRole("button", { name: "Create account", exact: true }).click();
await p.getByRole("heading", { name: "Your strips" }).waitFor();
await p.goto(URL + "/home?new=1");
await p.getByRole("button", { name: "Open illustrative Undo strip" }).click();
await p.waitForURL(/id=/);
const t = p.getByLabel("Strip title");
await t.waitFor();
await t.fill("Mic Check, Shortcut Check");
await t.press("Enter");
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/debug.png` });
const studioUrl = p.url();
await p.screenshot({ path: `${out}/studio-1440.png` });
await p.locator(".history-button").click();
await p.getByRole("button", { name: "Restore" }).first().waitFor();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/history-desktop-1440.png` });
for (const w of [360, 390, 430]) {
  const pg = await ctx.newPage();
  await pg.setViewportSize({ width: w, height: 844 });
  await pg.goto(studioUrl);
  await pg.getByLabel("Strip title").waitFor();
  await pg.waitForTimeout(800);
  const over = await pg.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  console.log(w, "h-overflow", over);
  await pg.screenshot({
    path: `${out}/studio-${w}.png`,
    clip: { x: 0, y: 0, width: w, height: 300 },
  });
  if (w === 390) {
    await pg.locator(".history-button").click();
    await pg.getByRole("button", { name: "Restore" }).first().waitFor();
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: `${out}/history-phone-390.png` });
    await pg.keyboard.press("Escape");
    await pg.getByRole("link", { name: "Library" }).first().click();
    await pg.getByRole("heading", { name: "Your strips" }).waitFor();
    await pg.waitForTimeout(800);
    await pg.screenshot({ path: `${out}/library-phone-390.png` });
  }
  await pg.close();
}
await b.close();

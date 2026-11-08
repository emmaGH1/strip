import { mkdir, writeFile } from "node:fs/promises";

import { chromium } from "@playwright/test";

const base = "http://127.0.0.1:8080";
const out = "/tmp/strip-proof";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("response", (response) => {
  if (response.status() >= 400 && response.url().includes(base))
    console.log("HTTP", response.status(), response.url());
});
try {
  await page.goto(`${base}/home`, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  const canvas = page.getByTestId("comic-canvas");
  const localSignIn = page.getByRole("button", {
    name: "Continue as local dev",
    exact: true,
  });
  await localSignIn.or(canvas.locator("svg")).waitFor({ timeout: 60_000 });
  if (await localSignIn.isVisible()) await localSignIn.click();
  await canvas.locator("svg").waitFor({ timeout: 30_000 });
  console.log("URL", page.url());
  console.log("BODY", (await page.locator("body").innerText()).slice(0, 4500));
  await page.screenshot({ path: `${out}/entry-desktop.png`, fullPage: true });
  await writeFile(
    `${out}/initial-errors.json`,
    JSON.stringify(errors, null, 2),
  );
  await page.getByRole("button", { name: /Try editing this example/ }).click();
  await page.waitForURL(/id=/, { timeout: 30_000 });
  await page.getByRole("button", { name: "Export PNG", exact: true }).waitFor();
  console.log("SAVED", page.url());
  await page.screenshot({
    path: `${out}/workspace-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /Ari.*Just clearing/ }).click();
  await page
    .getByLabel("Your line")
    .fill("I meant to delete literally anything else.");
  await page.getByRole("button", { name: "Save line" }).click();
  await page.getByRole("status").filter({ hasText: "Change saved" }).waitFor();
  await page.getByRole("button", { name: /Protect this line/ }).click();
  await page
    .getByRole("button", { name: /Protected from the agent/ })
    .waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: /Protected from the agent/ })
    .waitFor();
  if (
    (await page.getByLabel("Your line").inputValue()) !==
    "I meant to delete literally anything else."
  )
    throw new Error("Persisted human text was lost after reload.");
  // Exercise the real shared HTTP transport without the frontend claim.
  // These are scripted non-frontend action calls, NOT a model-generated turn.
  const boundary = await page.evaluate(async () => {
    const id = new URL(location.href).searchParams.get("id");
    const root = "/_agent-native/actions";
    const read = async () => {
      const response = await fetch(`${root}/get-strip?id=${id}`);
      if (!response.ok) throw new Error(`HTTP read failed: ${response.status}`);
      return response.json();
    };
    const send = async (action, args) => {
      const response = await fetch(`${root}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
      });
      return { status: response.status, body: await response.text() };
    };
    const before = await read();
    const protectedWrite = await send("update-strip", {
      id,
      expectedRevision: before.revision,
      edits: [
        { kind: "balloon", id: "balloon-1", text: "An unwanted overwrite." },
      ],
    });
    const unlock = await send("set-strip-protection", {
      id,
      expectedRevision: before.revision,
      targetId: "balloon-1",
      protected: false,
    });
    const stale = await send("update-strip", {
      id,
      expectedRevision: before.revision - 1,
      edits: [{ kind: "balloon", id: "balloon-4", text: "A stale ending." }],
    });
    const contenders = await Promise.all([
      send("update-strip", {
        id,
        expectedRevision: before.revision,
        edits: [
          {
            kind: "balloon",
            id: "balloon-4",
            text: "Finally, a feature for my decision-making process.",
          },
        ],
      }),
      send("update-strip", {
        id,
        expectedRevision: before.revision,
        edits: [{ kind: "expression", id: "actor-4", expression: "thinking" }],
      }),
    ]);
    const after = await read();
    return {
      protectedWrite,
      unlock,
      stale,
      contenders,
      beforeRevision: before.revision,
      afterRevision: after.revision,
      protectedText: after.draft.panels[0].balloons[0].text,
      lastEditedBy: after.lastEditedBy,
    };
  });
  if (
    boundary.protectedWrite.status !== 400 ||
    !boundary.protectedWrite.body.includes("protected_element")
  )
    throw new Error(
      `Protected HTTP write was not rejected: ${JSON.stringify(boundary)}`,
    );
  if (boundary.unlock.status !== 403 || boundary.stale.status !== 409)
    throw new Error(`HTTP boundary failed: ${JSON.stringify(boundary)}`);
  if (
    boundary.contenders
      .map((r) => r.status)
      .sort()
      .join(",") !== "200,409"
  )
    throw new Error(
      `Compare-and-swap did not serialize concurrent writes: ${JSON.stringify(boundary)}`,
    );
  if (
    boundary.afterRevision !== boundary.beforeRevision + 1 ||
    boundary.protectedText !== "I meant to delete literally anything else." ||
    boundary.lastEditedBy !== "agent"
  )
    throw new Error(
      `Protected contribution was not preserved: ${JSON.stringify(boundary)}`,
    );
  await writeFile(
    `${out}/http-boundary.json`,
    JSON.stringify(boundary, null, 2),
  );
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: /Protected from the agent/ })
    .waitFor();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG", exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs(`${out}/strip-comic.png`);
  console.log("EXPORT", `${out}/strip-comic.png`);
  const dimensions = await page.evaluate(async () => {
    const image = new Image();
    image.src = document.querySelector('a[href^="blob:"]').href;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  if (dimensions.width !== 1200 || dimensions.height !== 1200)
    throw new Error("Reopened PNG has incorrect dimensions.");
  await page.screenshot({
    path: `${out}/protected-workspace.png`,
    fullPage: true,
  });
  const phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    storageState: await page.context().storageState(),
  });
  const phone = await phoneContext.newPage();
  phone.on("pageerror", (error) => errors.push(error.message));
  await phone.goto(page.url(), { waitUntil: "networkidle" });
  await phone.getByTestId("comic-canvas").locator("svg").waitFor();
  await phone.screenshot({
    path: `${out}/workspace-phone.png`,
    fullPage: true,
  });
  const width = await phone.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  if (width.page > width.viewport + 1)
    throw new Error(
      `Phone page overflows horizontally: ${JSON.stringify(width)}`,
    );
  await writeFile(
    `${out}/smoke-result.json`,
    JSON.stringify(
      {
        url: page.url(),
        pageErrors: errors,
        width,
        exported: true,
        reopenedPng: dimensions,
        httpBoundaryPassed: true,
        persistedEdit: true,
        persistedProtection: true,
      },
      null,
      2,
    ),
  );
  console.log("SMOKE PASS", JSON.stringify(errors));
} catch (error) {
  console.log("FAILED URL", page.url());
  console.log(
    "FAILED BODY",
    (await page.locator("body").innerText()).slice(0, 5000),
  );
  console.log("PAGE ERRORS", JSON.stringify(errors));
  await page.screenshot({ path: `${out}/failure.png`, fullPage: true });
  throw error;
} finally {
  await browser.close();
}

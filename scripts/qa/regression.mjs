import { createHash, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Public judge-path QA. No provider setup or chat submission. Uses only a disposable account.
// Run: node scripts/qa/regression.mjs
// Recovery after an interrupted run: add --keep-state, then --resume --start=NN.
// --keep-state is for an intermediate run only; the final run deletes the private state.
import { chromium, expect } from "@playwright/test";

const BASE = "https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech";
const OUT = "docs/evidence/regression-final";
const TEMP = "/tmp/claude-1000";
const STATE = `${TEMP}/qa-state.json`;
const META = `${TEMP}/qa-regression-meta.json`;
const PREFIX =
  process.argv.find((arg) => arg.startsWith("--prefix="))?.slice(9) || "final";
const resume = process.argv.includes("--resume");
const keepState = process.argv.includes("--keep-state");
const start = Number(
  process.argv.find((s) => s.startsWith("--start="))?.split("=")[1] || 0,
);
const results = [];
const httpErrors = [];
const consoleErrors = [];
const pageErrors = [];
const modelRequests = [];
const diagnostics = [];
let meta = {};
let activePage;
let desktop;
let desktopContext;
let phone;
let phoneContext;
let signedOutPhoneContext;
let signedOutPhonePage;
let imagePage;
let browser;
let signedIn = false;

const safeUrl = (value) => {
  try {
    const u = new URL(value);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "[non-URL]";
  }
};
function observe(page, label, signedOut = () => false) {
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      request.method() === "POST" &&
      /\/_agent-native\/agent-chat\/?$/.test(url.pathname)
    )
      modelRequests.push({ page: label, url: safeUrl(request.url()) });
  });
  page.on("response", (r) => {
    if (r.status() >= 400) {
      httpErrors.push({
        page: label,
        signedOut: signedOut(),
        status: r.status(),
        method: r.request().method(),
        url: safeUrl(r.url()),
      });
    }
  });
  page.on("console", (m) => {
    if (m.type() === "error") {
      const loc = m.location();
      consoleErrors.push({
        page: label,
        signedOut: signedOut(),
        text: m.text().slice(0, 300),
        url: loc.url ? safeUrl(loc.url) : "[no URL]",
        line: loc.lineNumber,
      });
    }
  });
  page.on("pageerror", (e) =>
    pageErrors.push({ page: label, message: e.message.slice(0, 300) }),
  );
}
async function saveMeta() {
  await writeFile(META, JSON.stringify(meta, null, 2), { mode: 0o600 });
}
async function saveState() {
  await desktopContext.storageState({ path: STATE });
  await chmod(STATE, 0o600);
}
async function screenshot(page, name) {
  if (!page || page.isClosed())
    throw new Error("No open page available for screenshot");
  await page.screenshot({
    path: `${OUT}/${PREFIX}-${name}.png`,
    animations: "disabled",
    timeout: 12000,
    mask: [page.locator('input[type="password"], input[type="email"]')],
  });
}
async function step(number, name, action) {
  if (number < start) return;
  const slug = `${String(number).padStart(2, "0")}-${name}`;
  let failure;
  try {
    await screenshot(activePage, `${slug}-before`);
  } catch (e) {
    failure = `before screenshot: ${e.message.split("\n")[0]}`;
  }
  try {
    await action();
  } catch (e) {
    failure = [failure, e.message.split("\n")[0]].filter(Boolean).join("; ");
  }
  try {
    await screenshot(activePage, `${slug}-after`);
  } catch (e) {
    failure = [failure, `after screenshot: ${e.message.split("\n")[0]}`]
      .filter(Boolean)
      .join("; ");
  }
  const result = {
    step: slug,
    status: failure ? "FAIL" : "PASS",
    ...(failure ? { error: failure } : {}),
  };
  results.push(result);
  console.log(`${result.status} ${slug}${failure ? ` — ${failure}` : ""}`);
}
async function discover(page, name) {
  // Kept privately for selector discovery: do not commit HTML/session-bearing dumps.
  const content = await page.content();
  const aria = await page.locator("body").ariaSnapshot({ timeout: 10000 });
  await writeFile(`${TEMP}/qa-${name}-dom.html`, content, { mode: 0o600 });
  await writeFile(`${TEMP}/qa-${name}-aria.txt`, aria, { mode: 0o600 });
  console.log(
    `DISCOVERY ${name}: ${content.length} DOM chars; ${aria.length} accessible-tree chars`,
  );
}
async function diag(page, label) {
  const d = await page.evaluate(() => {
    const visible = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.display !== "none" &&
        s.visibility !== "hidden"
      );
    };
    return {
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      brokenImages: [...document.images]
        .filter((e) => visible(e) && (!e.complete || !e.naturalWidth))
        .map((e) => e.currentSrc || e.getAttribute("src")),
      visibleImages: [...document.images].filter(visible).length,
    };
  });
  diagnostics.push({ label, ...d });
  if (d.document > d.viewport || d.body > d.viewport)
    throw new Error(
      `${label}: horizontal document overflow ${d.document}/${d.body} > ${d.viewport}`,
    );
  if (d.brokenImages.length)
    throw new Error(`${label}: ${d.brokenImages.length} broken visible images`);
}
async function studio(page = desktop) {
  if (!meta.studioPath)
    throw new Error(
      "Studio URL unavailable: prepared-example step did not complete",
    );
  if (!page.url().includes("id="))
    await page.goto(`${BASE}${meta.studioPath}`, {
      waitUntil: "domcontentloaded",
    });
  await expect(page.getByTestId("comic-canvas").locator("svg")).toBeVisible({
    timeout: 30000,
  });
}
async function focusEvidence(page, locator, name) {
  // Tab from the page, rather than forcing :focus-visible with script.
  for (let i = 0; i < 100; i++) {
    await page.keyboard.press("Tab");
    if (await locator.evaluate((el) => el === document.activeElement)) {
      const details = await locator.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          outline: s.outline,
          boxShadow: s.boxShadow,
          focusVisible: el.matches(":focus-visible"),
        };
      });
      console.log(`FOCUS ${name}: ${JSON.stringify(details)}`);
      if (
        !details.focusVisible ||
        (details.outline.includes(" 0px") && details.boxShadow === "none")
      )
        throw new Error(`${name} lacks a visible keyboard focus indicator`);
      return;
    }
  }
  throw new Error(`${name} not reached by keyboard Tab`);
}

await mkdir(OUT, { recursive: true });
await mkdir(TEMP, { recursive: true });
if (resume && existsSync(META)) meta = JSON.parse(await readFile(META, "utf8"));
if (resume && !existsSync(STATE))
  throw new Error(
    "--resume requires the retained private storageState; refusing to create another account",
  );
browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  permissions: ["clipboard-read", "clipboard-write"],
  ...(resume ? { storageState: STATE } : {}),
});
desktop = await desktopContext.newPage();
signedIn = resume;
observe(desktop, "desktop", () => !signedIn);
desktop.setDefaultTimeout(12000);
// Resume preserves the signed-in desktop; landing itself needs an anonymous page.
const landingContext = resume
  ? await browser.newContext({ viewport: { width: 1440, height: 900 } })
  : desktopContext;
const landing = resume ? await landingContext.newPage() : desktop;
if (resume) observe(landing, "landing-signed-out", () => true);
activePage = landing;

await step(1, "landing-brand-meta", async () => {
  await landing.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });
  await expect(
    landing.getByRole("heading", { name: /Release notes nobody reads/ }),
  ).toBeVisible();
  await expect(
    landing
      .getByRole("link", { name: "Strip home" })
      .first()
      .getByRole("img", { name: "Strip" }),
  ).toBeVisible();
  await landing
    .getByRole("img", {
      name: "Prepared interactive panel showing pencil, protection and review",
    })
    .locator("svg")
    .waitFor({ timeout: 30000 });
  await discover(landing, "landing");
  const metadata = await landing.evaluate(() => ({
    icon: document.querySelector('link[rel="icon"]')?.getAttribute("href"),
    og: document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content"),
  }));
  if (!metadata.icon || !metadata.og)
    throw new Error("Missing favicon or og:image metadata");
  const [ico, og] = await Promise.all([
    landingContext.request.get(new URL(metadata.icon, BASE).href),
    landingContext.request.get(metadata.og),
  ]);
  if (!ico.ok() || !og.ok())
    throw new Error(
      `Asset HTTP status: favicon ${ico.status()}, OG ${og.status()}`,
    );
  const iconBytes = await ico.body();
  if (iconBytes.readUInt32LE(0) !== 0x00010000)
    throw new Error("Favicon is not an ICO");
  const iconSizes = Array.from(
    { length: iconBytes.readUInt16LE(4) },
    (_, i) => iconBytes[6 + i * 16] || 256,
  );
  const dimensions = await landing.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  }, metadata.og);
  if (
    dimensions.join("x") !== "1200x630" ||
    ![16, 32, 48].every((size) => iconSizes.includes(size))
  )
    throw new Error(
      `Unexpected OG dimensions ${dimensions} or favicon sizes ${iconSizes}`,
    );
  console.log(
    `META ${JSON.stringify({ ...metadata, iconSizes, ogDimensions: dimensions, iconStatus: ico.status(), ogStatus: og.status() })}`,
  );
  await diag(landing, "desktop landing");
});
for (const [number, name, text, status] of [
  [
    2,
    "landing-pencil-click",
    "1. Pencil",
    "A prepared agent proposal is blue.",
  ],
  [
    3,
    "landing-mine-click",
    "2. Stamp MINE",
    "You inked this line and stamped it MINE.",
  ],
  [
    4,
    "landing-revise-click",
    "3. Revise around it",
    "The expression and pose change in blue.",
  ],
]) {
  await step(number, name, async () => {
    activePage = landing;
    const button = landing.getByRole("button", { name: text, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(landing.locator(".demo-status")).toContainText(status);
    await expect(
      landing.getByText("PREPARED INTERACTIVE EXAMPLE · NO AI REQUEST"),
    ).toBeVisible();
  });
}
await step(5, "signup-library", async () => {
  activePage = desktop;
  if (!resume) {
    await desktop.getByRole("link", { name: "Open the studio" }).click();
    await desktop.waitForURL(/\/sign-in/, { timeout: 35000 });
    await discover(desktop, "signin");
    const tabs = desktop.locator("#auth-tabs");
    const signupForm = desktop.locator("#signup-form");
    if (!(await signupForm.isVisible()))
      await tabs
        .getByRole("button", { name: "Create account", exact: true })
        .click();
    await expect(signupForm).toBeVisible();
    const password = randomBytes(24).toString("base64url") + "aA9!";
    await signupForm
      .getByLabel("Email")
      .fill(`qa+${Date.now()}-${randomBytes(3).toString("hex")}@example.com`);
    await signupForm.getByLabel("Password", { exact: true }).fill(password);
    await signupForm.getByLabel("Confirm password").fill(password);
    await signupForm
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    try {
      await expect(
        desktop.getByRole("heading", { name: "Your strips" }),
      ).toBeVisible({ timeout: 45000 });
    } finally {
      await saveState();
    }
    signedIn = true;
  } else {
    await desktop.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
    await expect(
      desktop.getByRole("heading", { name: "Your strips" }),
    ).toBeVisible({ timeout: 35000 });
  }
  await saveState();
  await discover(desktop, "library");
  if (resume)
    await expect(
      desktop.getByText(/Illustrative \/ seeded/).first(),
    ).toBeVisible();
  else
    await expect(
      desktop.getByText("ONE PREPARED EXAMPLE · ILLUSTRATIVE, NOT GENERATED"),
    ).toBeVisible();
  await diag(desktop, "desktop library");
});
await step(6, "prepared-example-studio", async () => {
  activePage = desktop;
  if (resume && meta.studioPath) {
    await desktop.goto(`${BASE}${meta.studioPath}`, {
      waitUntil: "domcontentloaded",
    });
  } else {
    await desktop
      .getByRole("link", { name: "New strip", exact: true })
      .first()
      .click();
    await expect(
      desktop.getByRole("heading", { name: "What shipped?" }),
    ).toBeVisible();
    await desktop
      .getByRole("button", { name: "Open illustrative Undo strip" })
      .click();
    await desktop.waitForURL(/\/home\?id=/, { timeout: 30000 });
    meta.studioPath =
      new URL(desktop.url()).pathname + new URL(desktop.url()).search;
    await saveMeta();
  }
  await studio();
  await discover(desktop, "studio");
  await expect(
    desktop.getByText(/ILLUSTRATIVE \/ SEEDED/).first(),
  ).toBeVisible();
  await diag(desktop, "desktop studio");
});
await step(7, "balloon-inline-save-reload", async () => {
  activePage = desktop;
  await studio();
  const canvas = desktop.getByTestId("comic-canvas");
  const old = "Just clearing the old drafts.";
  const revised = "I just cleared the launch plan.";
  const balloon = canvas.getByRole("button", { name: old, exact: true });
  if (await balloon.count()) await balloon.locator("rect").first().click();
  else
    await canvas
      .getByRole("button", { name: revised, exact: true })
      .locator("rect")
      .first()
      .click();
  await desktop
    .locator(".desktop-context")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await desktop.getByLabel("Edit balloon inline").fill(revised);
  await desktop.getByRole("button", { name: "Ink line" }).click();
  await expect(
    canvas.getByRole("button", { name: revised, exact: true }),
  ).toBeVisible();
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await studio();
  await expect(
    desktop
      .getByTestId("comic-canvas")
      .getByRole("button", { name: revised, exact: true }),
  ).toBeVisible();
  meta.editedLine = revised;
  await saveMeta();
});
await step(8, "protect-mine", async () => {
  activePage = desktop;
  await studio();
  const canvas = desktop.getByTestId("comic-canvas");
  await canvas
    .getByRole("button", {
      name: meta.editedLine || "I just cleared the launch plan.",
      exact: true,
    })
    .locator("rect")
    .first()
    .click();
  const bar = desktop.locator(".desktop-context");
  if (await bar.getByRole("button", { name: "Protect", exact: true }).count())
    await bar.getByRole("button", { name: "Protect", exact: true }).click();
  await expect(
    bar.getByRole("button", { name: "Unprotect", exact: true }),
  ).toBeVisible();
  await expect(
    canvas.locator("text").filter({ hasText: "MINE" }).first(),
  ).toBeVisible();
});
await step(9, "swap-ending", async () => {
  activePage = desktop;
  await studio();
  const dry = desktop.getByRole("button", { name: /The dry one/ });
  if ((await dry.getAttribute("aria-pressed")) === "true")
    await desktop.getByRole("button", { name: /The callback/ }).click();
  await dry.click();
  await expect(dry).toHaveAttribute("aria-pressed", "true");
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await studio();
  await expect(
    desktop.getByRole("button", { name: /The dry one/ }),
  ).toHaveAttribute("aria-pressed", "true");
});
await step(10, "export-sheet", async () => {
  activePage = desktop;
  await studio();
  await desktop.getByRole("button", { name: "Export", exact: true }).click();
  const dialog = desktop.getByRole("dialog");
  await expect(dialog.getByText("Your launch post")).toBeVisible();
  await expect(
    dialog.getByRole("img", { name: "PNG preview of your four-panel strip" }),
  ).toBeVisible();
  await diag(desktop, "desktop export sheet");
});
await step(10.1, "download-compare-png", async () => {
  activePage = desktop;
  const dialog = desktop.getByRole("dialog");
  const preview = dialog.getByRole("img", {
    name: "PNG preview of your four-panel strip",
  });
  const [download] = await Promise.all([
    desktop.waitForEvent("download"),
    dialog.getByRole("link", { name: "Download PNG" }).click(),
  ]);
  meta.downloadPath = `${OUT}/${PREFIX}-download.png`;
  await download.saveAs(meta.downloadPath);
  await saveMeta();
  const data = await readFile(meta.downloadPath);
  if (data.readUInt32BE(16) !== 1200 || data.readUInt32BE(20) !== 1200)
    throw new Error("Downloaded PNG is not 1200 × 1200");
  const previewBytes = Buffer.from(
    await preview.evaluate(async (img) =>
      Array.from(new Uint8Array(await (await fetch(img.src)).arrayBuffer())),
    ),
  );
  if (
    createHash("sha256").update(data).digest("hex") !==
    createHash("sha256").update(previewBytes).digest("hex")
  )
    throw new Error("Downloaded PNG differs from the sheet preview");
  const comparison = await desktop.evaluate(async () => {
    const svg = document.querySelector('[data-testid="comic-canvas"] svg');
    const preview = document.querySelector(
      'img[alt="PNG preview of your four-panel strip"]',
    );
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svg)], {
        type: "image/svg+xml",
      }),
    );
    try {
      const rendered = new Image();
      rendered.src = url;
      await rendered.decode();
      const pixels = (image) => {
        const c = document.createElement("canvas");
        c.width = c.height = 1200;
        const ctx = c.getContext("2d");
        ctx.drawImage(image, 0, 0, 1200, 1200);
        return ctx.getImageData(0, 0, 1200, 1200).data;
      };
      const a = pixels(rendered),
        b = pixels(preview);
      let different = 0,
        delta = 0;
      for (let i = 0; i < a.length; i += 4) {
        const diff =
          Math.abs(a[i] - b[i]) +
          Math.abs(a[i + 1] - b[i + 1]) +
          Math.abs(a[i + 2] - b[i + 2]);
        if (diff > 30) different++;
        delta += diff;
      }
      return {
        differentPixelsPercent: +((100 * different) / (1200 * 1200)).toFixed(3),
        meanRgbDifference: +(delta / (1200 * 1200 * 3)).toFixed(3),
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  });
  console.log(
    `PNG COMPARISON ${JSON.stringify(comparison)} (canvas includes selection highlight)`,
  );
  if (comparison.differentPixelsPercent > 5)
    throw new Error(
      "Export visually diverges from selected canvas by over 5% of pixels",
    );
});
await step(10.2, "copy-caption", async () => {
  activePage = desktop;
  const dialog = desktop.getByRole("dialog");
  const caption = await dialog
    .getByLabel("Post caption · editable")
    .inputValue();
  await dialog.getByRole("button", { name: "Copy caption" }).click();
  await expect(dialog.getByText("Post caption copied.")).toBeVisible();
  if (
    (await desktop.evaluate(() => navigator.clipboard.readText())) !== caption
  )
    throw new Error("Clipboard did not contain the displayed caption");
  if (!/illustrative/i.test(caption))
    throw new Error("Caption does not disclose illustrative content");
});
await step(11, "open-downloaded-png", async () => {
  if (!meta.downloadPath) throw new Error("No downloaded PNG from export step");
  imagePage = await desktopContext.newPage();
  activePage = imagePage;
  observe(imagePage, "download");
  await imagePage.goto(pathToFileURL(resolve(meta.downloadPath)).href, {
    waitUntil: "load",
  });
  const image = imagePage.locator("img");
  await expect(image).toBeVisible();
  const dims = await image.evaluate((e) => [e.naturalWidth, e.naturalHeight]);
  if (dims.join("x") !== "1200x1200")
    throw new Error(`Opened image dimensions ${dims}`);
});
await step(12, "history-restore-reload", async () => {
  activePage = desktop;
  const dialog = desktop.getByRole("dialog");
  if (await dialog.isVisible().catch(() => false))
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await studio();
  const history = desktop.getByRole("button", { name: "History", exact: true });
  await history.click();
  const list = desktop.locator('[aria-label="Revision history"]');
  await expect(list).toBeVisible();
  const current = await list
    .locator(".history-entry")
    .first()
    .locator("b")
    .innerText();
  const restore = list
    .getByRole("button", { name: "Restore", exact: true })
    .first();
  await restore.click();
  await expect(
    list.locator(".history-entry").first().locator("b"),
  ).not.toHaveText(current, { timeout: 15000 });
  const restored = await list
    .locator(".history-entry")
    .first()
    .locator("b")
    .innerText();
  console.log(`HISTORY ${current} -> ${restored}`);
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await studio();
  await expect(
    desktop
      .getByTestId("comic-canvas")
      .getByRole("button", { name: meta.editedLine, exact: true }),
  ).toBeVisible();
  await expect(
    desktop
      .getByTestId("comic-canvas")
      .locator("text")
      .filter({ hasText: "MINE" })
      .first(),
  ).toBeVisible();
  await expect(
    desktop.getByRole("button", { name: /The callback/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await desktop.getByRole("button", { name: "History", exact: true }).click();
  await expect(
    desktop
      .locator('[aria-label="Revision history"]')
      .locator(".history-entry")
      .first()
      .locator("b"),
  ).toHaveText(restored);
});
await step(13, "compose-fill", async () => {
  activePage = desktop;
  await desktop.goto(`${BASE}/home?new=1`, { waitUntil: "domcontentloaded" });
  await expect(
    desktop.getByRole("heading", { name: "What shipped?" }),
  ).toBeVisible({ timeout: 30000 });
  await expect(desktop.getByText(/No AI connected yet/)).toBeVisible();
  await desktop
    .getByLabel("What shipped? · The source update")
    .fill("Deleted files can now be restored with Undo.");
  await desktop.locator("#ari-name").fill("Ari");
  await desktop.locator("#ari-trait").fill("Optimistic launch manager");
  await desktop.locator("#sam-name").fill("Sam");
  await desktop.locator("#sam-trait").fill("Dry-witted teammate");
  await diag(desktop, "desktop compose");
});
await step(13.1, "pencil-prefill", async () => {
  activePage = desktop;
  await desktop.getByRole("button", { name: "Pencil it" }).click();
  // The framework setup editor is a disabled role=textbox (contenteditable=false).
  const editor = desktop.getByRole("textbox", { name: "Message agent..." });
  await expect(editor).toBeVisible({ timeout: 20000 });
  await expect(editor).toContainText("Pencil a strip from:");
  await expect(
    desktop.getByRole("heading", { name: "Connect AI" }),
  ).toBeVisible();
  await expect(
    desktop.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  if (modelRequests.length)
    throw new Error("Unexpected agent-chat POST while opening compose prefill");
  await discover(desktop, "compose-handoff");
  const message = await editor.innerText();
  if (
    !message.includes("Deleted files can now be restored with Undo.") ||
    /expectedRevision|selectedId|\{\s*"cast"/.test(message)
  )
    throw new Error(
      "Composer prefill is missing the source or exposes machine context",
    );
  console.log(`COMPOSE PREFILL ${JSON.stringify(message)}`);
});
await step(14, "phone-landing", async () => {
  signedOutPhoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  signedOutPhonePage = await signedOutPhoneContext.newPage();
  activePage = signedOutPhonePage;
  observe(signedOutPhonePage, "phone-signed-out", () => true);
  await signedOutPhonePage.goto(BASE, { waitUntil: "domcontentloaded" });
  await expect(
    signedOutPhonePage.getByRole("heading", {
      name: /Release notes nobody reads/,
    }),
  ).toBeVisible();
  await discover(signedOutPhonePage, "phone-landing");
  await diag(signedOutPhonePage, "phone landing");
});
for (const [number, label, status] of [
  [14.1, "1. Pencil", "A prepared agent proposal is blue."],
  [14.2, "2. Stamp MINE", "You inked this line and stamped it MINE."],
  [14.3, "3. Revise around it", "The expression and pose change in blue."],
]) {
  await step(
    number,
    `phone-tap-${label.split(" ")[1].toLowerCase()}`,
    async () => {
      activePage = signedOutPhonePage;
      const button = signedOutPhonePage.getByRole("button", {
        name: label,
        exact: true,
      });
      await button.tap();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(signedOutPhonePage.locator(".demo-status")).toContainText(
        status,
      );
    },
  );
}
await step(15, "phone-focused-panel", async () => {
  await saveState();
  phoneContext = await browser.newContext({
    storageState: STATE,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  phone = await phoneContext.newPage();
  activePage = phone;
  observe(phone, "phone-authenticated");
  phone.setDefaultTimeout(12000);
  await phone.goto(`${BASE}${meta.studioPath}`, {
    waitUntil: "domcontentloaded",
  });
  await studio(phone);
  await discover(phone, "phone-studio");
  await phone
    .getByTestId("comic-canvas")
    .getByRole("button", { name: meta.editedLine, exact: true })
    .locator("rect")
    .first()
    .tap();
  await expect(phone.getByText("Panel 1 of 4", { exact: true })).toBeVisible();
  await expect(phone.getByRole("button", { name: "Full page" })).toBeVisible();
  await diag(phone, "phone focused studio");
});
await step(16, "phone-edit-script-tabs", async () => {
  activePage = phone;
  await expect(
    phone.getByRole("tab", { name: "Edit", exact: true }),
  ).toHaveAttribute("data-state", "active");
  await phone.getByRole("tab", { name: "Script", exact: true }).tap();
  await expect(
    phone.getByRole("tab", { name: "Script", exact: true }),
  ).toHaveAttribute("data-state", "active");
  await expect(
    phone
      .locator(".phone-sheet")
      .getByText("Deleted files can now be restored with Undo.")
      .first(),
  ).toBeVisible();
  await phone.getByRole("tab", { name: "Edit", exact: true }).tap();
});
await step(17, "phone-inline-ask", async () => {
  activePage = phone;
  await phone
    .locator(".phone-sheet")
    .getByRole("button", { name: "Ask agent" })
    .tap();
  await expect(phone.getByText("A NOTE FOR THE AGENT")).toBeVisible();
  await phone.getByRole("button", { name: "Funnier", exact: true }).tap();
  await expect(phone.locator("#phone-selection-ask")).toHaveValue("Funnier");
  await expect(
    phone.getByText(/No AI connected\. Opens your note/),
  ).toBeVisible();
  // Do not send an AI request or submit the composer.
});
await step(18, "phone-agent-tab", async () => {
  activePage = phone;
  await phone.getByRole("tab", { name: "Agent", exact: true }).tap();
  await discover(phone, "phone-agent");
  await expect(
    phone.getByText(/Connect AI|Connect an AI engine/i).first(),
  ).toBeVisible({ timeout: 20000 });
});
await step(18.1, "phone-inline-ask-handoff", async () => {
  activePage = phone;
  const collapse = phone.getByRole("button", { name: "Collapse sidebar" });
  if (await collapse.isVisible()) await collapse.tap();
  await phone.getByRole("tab", { name: "Edit", exact: true }).tap();
  if (!(await phone.locator("#phone-selection-ask").isVisible()))
    await phone
      .locator(".phone-sheet")
      .getByRole("button", { name: "Ask agent" })
      .tap();
  await phone.getByRole("button", { name: "Funnier", exact: true }).tap();
  // This control opens the setup prefill because engine.canChat is false; never press Send message.
  await phone.getByRole("button", { name: "Send to agent" }).tap();
  const editor = phone.getByRole("textbox", { name: "Message agent..." });
  await expect(editor).toBeVisible();
  await expect(editor).toContainText("Funnier");
  await expect(
    phone.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await expect(phone.getByText(/Panel 1 · Ari's line/).first()).toBeVisible();
  if (modelRequests.length)
    throw new Error("Unexpected agent-chat POST while opening phone prefill");
});
await step(19, "phone-endings-scroller", async () => {
  activePage = phone;
  // The discovered framework control, rather than Escape, dismisses its overlay.
  const collapse = phone.getByRole("button", { name: "Collapse sidebar" });
  if (await collapse.isVisible()) await collapse.tap();
  const fullPage = phone.getByRole("button", { name: "Full page" });
  if (await fullPage.isVisible()) await fullPage.tap({ timeout: 8000 });
  const tray = phone.locator(".ending-options");
  await tray.scrollIntoViewIfNeeded();
  const before = await tray.evaluate((e) => ({
    left: e.scrollLeft,
    width: e.clientWidth,
    scrollWidth: e.scrollWidth,
  }));
  if (before.scrollWidth <= before.width)
    throw new Error(`Endings are not scrollable: ${JSON.stringify(before)}`);
  const box = await tray.boundingBox();
  if (!box) throw new Error("Endings tray has no visible box");
  const cdp = await phoneContext.newCDPSession(phone);
  const y = box.y + Math.min(box.height / 2, 50),
    x = box.x + box.width - 30;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - i * 30, y }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(() => tray.evaluate((e) => e.scrollLeft), { timeout: 5000 })
    .toBeGreaterThan(before.left);
  const after = await tray.evaluate((e) => e.scrollLeft);
  console.log(`SCROLLER ${JSON.stringify(before)} -> ${after}`);
  await diag(phone, "phone endings");
});
await step(20, "keyboard-focus-landing", async () => {
  // An authenticated visit to / redirects to Library; use a fresh signed-out desktop.
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  activePage = page;
  observe(page, "keyboard-signed-out", () => true);
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await focusEvidence(
    page,
    page.getByRole("link", { name: "Make a strip" }).first(),
    "landing CTA",
  );
});
await step(21, "keyboard-focus-studio", async () => {
  activePage = desktop;
  await desktop.goto(`${BASE}${meta.studioPath}`, {
    waitUntil: "domcontentloaded",
  });
  await studio();
  await focusEvidence(
    desktop,
    desktop.getByLabel("Strip title"),
    "studio title",
  );
});
await step(22, "keyboard-focus-export", async () => {
  activePage = desktop;
  // Continue from the previous keyboard focus; no pointer is used.
  await focusEvidence(
    desktop,
    desktop.getByRole("button", { name: "Export", exact: true }),
    "studio Export",
  );
});

// Only after every step has had a chance to run do we write diagnostics and close browsers.
const report = {
  base: BASE,
  results,
  diagnostics,
  httpErrors,
  consoleErrors,
  pageErrors,
  modelRequests,
};
await writeFile(
  `${OUT}/${PREFIX}-results.json`,
  JSON.stringify(report, null, 2),
);
console.log(
  `DIAGNOSTICS ${JSON.stringify({ diagnostics, httpErrors, consoleErrors, pageErrors, modelRequests })}`,
);
if (!keepState) {
  await rm(STATE, { force: true });
  await rm(META, { force: true });
  for (const name of [
    "landing",
    "signin",
    "library",
    "studio",
    "compose-handoff",
    "phone-landing",
    "phone-studio",
    "phone-agent",
  ]) {
    await rm(`${TEMP}/qa-${name}-dom.html`, { force: true });
    await rm(`${TEMP}/qa-${name}-aria.txt`, { force: true });
  }
}
await browser.close();
if (results.some((r) => r.status === "FAIL")) process.exitCode = 1;

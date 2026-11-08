import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

import { chromium } from "@playwright/test";

const base = "https://8080-agq3ndu665es5t4nn6gjyv7wca.instabox.tech";
const output = "docs/evidence/regression-final/fixes";
await mkdir(output, { recursive: true });
const publicEndpoints = new Set([
  "/_agent-native/speculation-rules.json",
  "/_agent-native/auth/session",
  "/_agent-native/auth/attribution",
  "/_agent-native/auth/consent-region",
  "/_agent-native/ping",
]);
const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
});
const results = [];
try {
  for (const [name, settings] of [
    ["desktop", { viewport: { width: 1440, height: 900 } }],
    [
      "phone",
      {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
      },
    ],
  ]) {
    const context = await browser.newContext(settings);
    const page = await context.newPage();
    const requests = [];
    const errors = [];
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (
        request.method() !== "GET" &&
        request.method() !== "HEAD" &&
        /chat|model|completions|generate/i.test(url.pathname)
      ) {
        errors.push(
          `Blocked model/chat request: ${request.method()} ${url.pathname}`,
        );
        await route.abort();
      } else await route.continue();
    });
    page.on("request", (request) => {
      const url = new URL(request.url());
      requests.push({
        method: request.method(),
        origin: url.origin,
        path: url.pathname,
        resourceType: request.resourceType(),
        status: null,
      });
    });
    page.on("response", (response) => {
      const request = response.request();
      const url = new URL(request.url());
      const item = requests.findLast(
        (entry) =>
          entry.method === request.method() &&
          entry.origin === url.origin &&
          entry.path === url.pathname &&
          entry.status === null,
      );
      if (item) item.status = response.status();
    });
    page.on("requestfailed", (request) =>
      errors.push(
        `Request failed: ${request.method()} ${new URL(request.url()).pathname}: ${request.failure()?.errorText}`,
      ),
    );
    page.on("pageerror", (error) =>
      errors.push(`Page error: ${error.message}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error")
        errors.push(`Console error: ${message.text()}`);
    });
    try {
      const response = await page.goto(base + "/", {
        waitUntil: "load",
        timeout: 60000,
      });
      await page.waitForTimeout(10000);
      await page.screenshot({
        path: `${output}/recheck-${name}.png`,
        fullPage: true,
      });
      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
      }));
      results.push({
        name,
        documentStatus: response?.status(),
        finalPath: new URL(page.url()).pathname,
        dimensions,
        requests,
        errors,
      });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(
    `${output}/recheck-results.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
}
for (const result of results) {
  assert.equal(result.documentStatus, 200);
  assert.equal(result.finalPath, "/");
  assert.deepEqual(result.errors, []);
  for (const request of result.requests) {
    assert.notEqual(request.path, "/_agent-native/agent-engine/status");
    assert.ok(
      request.status !== null && request.status < 400,
      `${request.method} ${request.path}: ${request.status}`,
    );
    if (request.path.startsWith("/_agent-native/"))
      assert.ok(publicEndpoints.has(request.path), request.path);
  }
}

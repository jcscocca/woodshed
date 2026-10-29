// Run in CI against the actual Pages URL. Every check uses a new, temporary
// browser context; it never opens a persistent profile or a user's saved data.
import assert from "node:assert/strict";
import { mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, expect as baseExpect } from "@playwright/test";

const expect = baseExpect.configure({ timeout: 15000 });
const output = resolve("test-results/deployed");
const evidence = { schemaVersion: 1, status: "running", startedAt: new Date().toISOString(), attempts: [], checks: {}, isolatedBrowserContext: true };
let browser, context, page, lastPollScreenshot = false;
await mkdir(output, { recursive: true });

try {
  const deployedUrl = new URL(process.env.DEPLOYMENT_URL || "");
  assert.equal(deployedUrl.protocol, "https:", "DEPLOYMENT_URL must be an HTTPS deployment URL");
  const expectedRelease = (process.env.EXPECTED_RELEASE || "").trim();
  assert.ok(expectedRelease, "EXPECTED_RELEASE must identify the deployed build");
  evidence.url = deployedUrl.href; evidence.expectedRelease = expectedRelease;
  evidence.fixture = { minutes: 1, note: `Deployment smoke fixture · ${expectedRelease} · ${process.env.GITHUB_RUN_ID || Date.now()}: UI save/reload check; no piano performance measured.` };
  browser = await chromium.launch({ headless: true });
  evidence.browser = { name: "chromium", version: browser.version() };

  // Pages and its CDN may briefly serve the previous release after deploy-pages
  // completes. Each bounded retry gets fresh storage, HTTP cache and workers.
  const deadline = Date.now() + 90000;
  const timeout = limit => Math.max(1, Math.min(limit, deadline - Date.now()));
  let pageErrors = [];
  while (Date.now() < deadline && !context) {
    const candidate = await browser.newContext({ viewport: { width: 1360, height: 960 } });
    page = await candidate.newPage();
    const errors = []; page.on("pageerror", error => errors.push(error.message));
    const visit = new URL(deployedUrl);
    visit.searchParams.set("woodshed_verify", expectedRelease);
    visit.searchParams.set("attempt", String(evidence.attempts.length + 1));
    visit.searchParams.set("t", String(Date.now()));
    const attempt = { at: new Date().toISOString(), url: visit.href };
    evidence.attempts.push(attempt);
    try {
      const response = await page.goto(visit.href, { waitUntil: "domcontentloaded", timeout: timeout(12000) });
      attempt.httpStatus = response?.status();
      assert.ok(response?.ok(), `Deployment returned HTTP ${attempt.httpStatus}`);
      attempt.release = await page.locator('meta[name="woodshed-release"]').getAttribute("content", { timeout: timeout(3000) });
      assert.equal(attempt.release, expectedRelease, "Pages has not served the expected release yet");
      await page.getByRole("button", { name: "Settings", exact: true }).waitFor({ state: "visible", timeout: timeout(10000) });
      context = candidate; pageErrors = errors; attempt.matched = true;
    } catch (error) {
      attempt.error = error.message;
      try { await page.screenshot({ path: resolve(output, "last-version-poll.png"), fullPage: false, timeout: timeout(3000) }); lastPollScreenshot = true; }
      catch { /* JSON still records a failed navigation or unavailable browser. */ }
      await candidate.close();
      if (Date.now() < deadline) await delay(Math.min(3000, deadline - Date.now()));
    }
  }
  assert.ok(context, `Expected release ${expectedRelease} was not available within 90 seconds`);
  evidence.checks.releaseMeta = true;
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByText(`App version ${expectedRelease}`, { exact: true })).toBeVisible();
  evidence.checks.settingsVersion = true;
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Start 20-minute session", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Minutes practised", exact: true }).fill("1");
  await page.getByRole("textbox", { name: "One thing to try next time", exact: true }).fill(evidence.fixture.note);
  await page.getByRole("button", { name: "Save practice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Three Cs, two clefs, one keyboard", exact: true })).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator('meta[name="woodshed-release"]')).toHaveAttribute("content", expectedRelease);
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByText(evidence.fixture.note, { exact: true })).toBeVisible();
  await page.getByText(evidence.fixture.note, { exact: true }).scrollIntoViewIfNeeded();
  const saved = await page.evaluate(marker => {
    const state = JSON.parse(localStorage.getItem("woodshed-state-v1"));
    const entry = state?.programProgress?.attempts.find(attempt => attempt.note === marker);
    return entry && { exerciseId: entry.exerciseId, section: entry.section, date: entry.date, minutes: entry.minutes, note: entry.note };
  }, evidence.fixture.note);
  assert.equal(saved?.minutes, 1, "The one-minute deployment fixture must survive reload");
  evidence.savedFixture = saved; evidence.checks.saveReloadProgress = true;
  assert.deepEqual(pageErrors, [], "The deployed application must not raise uncaught page errors");
  evidence.checks.noPageErrors = true;
  evidence.status = "passed"; evidence.screenshot = "success.png";
  await page.screenshot({ path: resolve(output, evidence.screenshot), fullPage: false });
  await rm(resolve(output, "last-version-poll.png"), { force: true });
  console.log(`Deployment verified: ${deployedUrl.href} · ${expectedRelease}`);
} catch (error) {
  evidence.status = "failed"; evidence.error = { message: error.message, stack: error.stack };
  try {
    if (page && !page.isClosed()) await page.screenshot({ path: resolve(output, "failure.png"), fullPage: false, timeout: 10000 });
    else if (lastPollScreenshot) await copyFile(resolve(output, "last-version-poll.png"), resolve(output, "failure.png"));
    else throw new Error("The browser did not produce a page screenshot");
    evidence.screenshot = "failure.png";
  } catch (screenshotError) { evidence.screenshotError = screenshotError.message; }
  console.error(error.stack || error.message); process.exitCode = 1;
} finally {
  try { await browser?.close(); }
  catch (error) { evidence.browserCloseError = error.message; process.exitCode = 1; evidence.status = "failed"; }
  evidence.completedAt = new Date().toISOString();
  await writeFile(resolve(output, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}

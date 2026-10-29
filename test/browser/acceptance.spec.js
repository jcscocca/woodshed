import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { freshData } from "../../src/engine.js";
import { recordAttempt } from "../../src/program/progress.js";

const stateKey = "woodshed-state-v1";
const ago = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const start = page => page.getByRole("button", { name: /^(Start 20-minute session|Resume session)$/ }).click();
const note = page => page.getByRole("textbox", { name: "One thing to try next time", exact: true });
const minutes = page => page.getByRole("spinbutton", { name: "Minutes practised", exact: true });
const save = async (page, message) => {
  await minutes(page).fill("1"); await note(page).fill(message);
  await page.getByRole("button", { name: "Save practice", exact: true }).click();
  await expect(page.getByRole("button", { name: "Saving…", exact: true })).toHaveCount(0);
};
const backup = value => ({ name: "acceptance-backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)) });
async function visibleCompletion(page, text) {
  const notice = page.locator(".pg-notice").filter({ hasText: text });
  await expect(notice).toBeFocused();
  const bounds = await notice.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.y + bounds.height).toBeLessThan(viewport.height - 70);
  // Visibility includes sticky-header occlusion, which toBeVisible alone misses.
  expect(await notice.evaluate(el => {
    const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + 12, r.top + 12);
    return hit === el || el.contains(hit);
  })).toBe(true);
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.__acceptanceErrors = errors;
});
test.afterEach(async ({ page }) => expect(page.__acceptanceErrors).toEqual([]));

test("placement, drafts, shared controls, all core blocks and completion", async ({ page }, info) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Start placement · 5–10 min", exact: true }).click();
  for (const title of ["Placement: can the beat keep going?", "Placement: find the C, then read the shape", "Placement: a melody above a held bass"]) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await save(page, "Acceptance fixture: placement report, not measured piano skill.");
  }
  await visibleCompletion(page, "Placement saved");
  await page.getByRole("button", { name: "Continue to Day 1 · Session A", exact: true }).click();
  const lessonTempo = page.getByRole("slider", { name: /^Practice tempo/ });
  if (info.project.name !== "chromium-narrow") {
    await page.getByRole("button", { name: "Faster", exact: true }).click();
    await expect(lessonTempo).toHaveValue("57");
    await expect(page.getByRole("slider", { name: "Tempo", exact: true })).toHaveValue("57");
  }
  await page.getByLabel("Through bar", { exact: true }).selectOption("2");
  await page.getByLabel("Repeat the excerpt", { exact: true }).check();
  await note(page).fill("Keep my unfinished passage and note.");
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByRole("button", { name: "Guided Practice", exact: true }).click();
  await expect(page.getByRole("button", { name: "Resume session", exact: true })).toBeVisible();
  await start(page);
  await expect(note(page)).toHaveValue("Keep my unfinished passage and note.");
  await expect(page.getByLabel("Through bar", { exact: true })).toHaveValue("2");
  await expect(page.getByLabel("Repeat the excerpt", { exact: true })).toBeChecked();
  await page.reload();
  await expect(page.getByRole("button", { name: "Resume session", exact: true })).toBeVisible();
  await start(page);
  await expect(note(page)).toHaveValue("Keep my unfinished passage and note.");
  await save(page, "Acceptance fixture: first block.");
  await expect(page.getByRole("heading", { name: "Three Cs, two clefs, one keyboard", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "C4 (middle C)", exact: true }).check();
  await page.getByRole("button", { name: "Check selected answers", exact: true }).click();
  await save(page, "Acceptance fixture: reading block.");
  await expect(page.getByRole("heading", { name: "Let one hand stay while the other moves", exact: true })).toBeVisible();
  await save(page, "Acceptance fixture: coordination block.");
  await expect(page.getByRole("heading", { name: "C five-finger pattern: right hand", exact: true })).toBeVisible();
  await save(page, "Acceptance fixture: scale block.");
  await visibleCompletion(page, "Session A saved");
  await expect(page.getByRole("button", { name: "Continue to Day 1 · Session B", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByText("1/80", { exact: true })).toBeVisible();
});

test("due review retains first-attempt evidence and seventeen-minute core allocation", async ({ page }) => {
  const state = freshData();
  state.programProgress = recordAttempt(state.programProgress, { exerciseId: "rhythm-long-short", section: "rhythm", date: ago(4), assessment: "ready", minutes: 3, bpm: 56, hands: "R", fromBar: 1, toBar: 2, note: "Keep the held notes long." });
  await page.addInitScript(({ key, state }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(state)); }, { key: stateKey, state });
  await page.goto("./"); await start(page);
  await expect(page.getByRole("heading", { name: "Try one return before playback", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Needs more work", exact: true }).click();
  await page.getByRole("button", { name: /^Hear reference ·/ }).click();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByRole("button", { name: "Guided Practice", exact: true }).click(); await start(page);
  await expect(page.getByText("Reported before playback.", { exact: false })).toBeVisible();
  await expect(page.getByText("First return: needs more work.", { exact: false })).toBeVisible();
  await save(page, "Acceptance fixture: first result survives repair and navigation.");
  await expect(page.locator(".pg-notice")).toContainText("within this session’s 20 minutes");
  await page.getByRole("button", { name: "Close lesson", exact: true }).click();
  await expect(page.getByText(/Review saved · lesson practice uses the remaining 17-minute allocation/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume session", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Try one return before playback", exact: true })).toHaveCount(0);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), stateKey);
  const review = stored.programProgress.attempts.find(a => a.section === "review");
  expect(review.reviewCheck.assessment).toBe("practising");
  expect(review.reviewCheck.beforeDemo).toBe(true);
  expect(review.reviewForSession).toBe("c1-d1-a");
});

test("export and durable import restore the same guided history after reset", async ({ page }) => {
  await page.goto("./"); await start(page); await save(page, "Acceptance backup marker.");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup", exact: true }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), "utf8"));
  expect(exported.programProgress.attempts).toHaveLength(1);
  await page.getByRole("button", { name: "Reset everything", exact: true }).click();
  await page.getByRole("button", { name: "Erase", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Choose a backup to import", { exact: true }).setInputFiles(backup(exported));
  await page.getByRole("button", { name: "Replace", exact: true }).click();
  await expect(page.getByText(/Backup restored/)).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByText("Acceptance backup marker.", { exact: true })).toBeVisible();
});

test("unreadable data is preserved and recovery reports quota failure before replacement", async ({ page }) => {
  const damaged = '{"version":9,"valuable":"recoverable original",';
  await page.addInitScript(({ key, damaged }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, damaged);
    window.__acceptanceBlockSave = true;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k, v) { if (this === localStorage && k === key && window.__acceptanceBlockSave) throw new DOMException("Test quota limit", "QuotaExceededError"); return original.call(this, k, v); };
  }, { key: stateKey, damaged });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Your saved practice needs attention", exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), stateKey)).toBe(damaged);
  const originalPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download original saved data", exact: true }).click();
  expect(await readFile(await (await originalPromise).path(), "utf8")).toBe(damaged);
  await page.getByRole("button", { name: "Retry loading", exact: true }).click();
  await page.getByLabel("Choose a recovery backup", { exact: true }).setInputFiles(backup(freshData()));
  await page.getByRole("button", { name: "Restore backup", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your saved practice needs attention", exact: true })).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "The backup could not be saved" })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), stateKey)).toBe(damaged);
  await page.evaluate(() => { window.__acceptanceBlockSave = false; });
  await page.getByRole("button", { name: "Restore backup", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start 20-minute session", exact: true })).toBeVisible();
});

test("keyboard, enlarged notation, reduced motion and automated accessibility", async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  // The loading Shell has its own skip link. Wait for the real application so
  // its replacement cannot remove keyboard focus halfway through this check.
  await expect(page.getByRole("button", { name: "Start 20-minute session", exact: true })).toBeVisible();
  // macOS WebKit follows Safari's native link-navigation preference: Option-Tab
  // includes links. Keep the actual keyboard/focus assertions on every host.
  // https://support.apple.com/guide/safari/cpsh003/mac
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(page.getByRole("link", { name: "Skip to practice", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#ws-main")).toBeFocused();
  await start(page);
  await expect(page.getByLabel("Follow score while playing", { exact: true })).not.toBeChecked();
  await page.getByLabel("Score size", { exact: true }).selectOption("1.5");
  await page.getByRole("region", { name: "Enlarged written score", exact: true }).focus();
  const before = await page.getByRole("slider", { name: /^Practice tempo/ }).inputValue();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("slider", { name: /^Practice tempo/ })).toHaveValue(before);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const settings = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(settings.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});

test("installed worker upgrades between real builds and retains offline history and drafts", async ({ page, context }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "One serial worker lifecycle check; other projects cover application flows.");
  test.setTimeout(90000);
  const nextRelease = "acceptance-B";
  const buildRelease = release => new Promise((resolve, reject) => {
    execFile(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
      env: { ...process.env, WOODSHED_RELEASE: release }, timeout: 45000, maxBuffer: 2 * 1024 * 1024,
    }, (error, stdout, stderr) => error ? reject(new Error(`Release ${release} build failed: ${error.message}\n${stdout}\n${stderr}`)) : resolve());
  });
  // A retry runs in a fresh browser context but shares dist with the first
  // attempt. Restore the normal baseline if that attempt already built B.
  const builtHtml = await readFile("dist/index.html", "utf8");
  if (builtHtml.includes(`content="${nextRelease}"`)) {
    const baseline = (process.env.WOODSHED_RELEASE || process.env.GITHUB_SHA?.slice(0, 12) || "local").trim();
    await buildRelease(baseline && baseline !== nextRelease ? baseline : "acceptance-A");
  }
  await page.goto("./");
  const releaseMeta = page.locator('meta[name="woodshed-release"]');
  const initialRelease = await releaseMeta.getAttribute("content");
  expect(initialRelease).toBeTruthy(); expect(initialRelease).not.toBe(nextRelease);
  const initialScripts = await page.locator('script[type="module"][src]').evaluateAll(nodes => nodes.map(node => node.getAttribute("src")));
  expect(initialScripts.length).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByText(`App version ${initialRelease}`, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await start(page); await save(page, "Offline history marker.");
  await note(page).fill("Offline and update draft marker.");
  await page.evaluate(() => { window.__woodshedBeforeUpdate = navigator.serviceWorker.controller; });
  await buildRelease(nextRelease);
  await page.evaluate(async () => {
    const previous = window.__woodshedBeforeUpdate;
    const registration = await navigator.serviceWorker.getRegistration();
    const observed = new Set();
    let check, timer;
    // Listen before update(), then inspect the current controller as well. An
    // automatic activation during the build must not leave us waiting for an
    // event that has already happened.
    const changed = new Promise((resolve, reject) => {
      check = () => {
        const controller = navigator.serviceWorker.controller;
        if (!controller || controller === previous) return;
        if (controller.state === "activated") { resolve(); return; }
        if (!observed.has(controller)) { observed.add(controller); controller.addEventListener("statechange", check); }
      };
      navigator.serviceWorker.addEventListener("controllerchange", check);
      timer = setTimeout(() => reject(new Error("New release did not take control")), 30000);
      check();
    });
    try { await Promise.all([registration.update(), changed]); }
    finally {
      clearTimeout(timer); navigator.serviceWorker.removeEventListener("controllerchange", check);
      for (const worker of observed) worker.removeEventListener("statechange", check);
      delete window.__woodshedBeforeUpdate;
    }
  });
  await page.reload();
  await expect(releaseMeta).toHaveAttribute("content", nextRelease);
  const updatedScripts = await page.locator('script[type="module"][src]').evaluateAll(nodes => nodes.map(node => node.getAttribute("src")));
  expect(updatedScripts, "the installed worker must deliver a new hashed application bundle").not.toEqual(initialScripts);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByText(`App version ${nextRelease}`, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Resume session", exact: true }).click();
  await expect(note(page)).toHaveValue("Offline and update draft marker.");
  await context.setOffline(true);
  try {
    await page.reload();
    await page.getByRole("button", { name: "Resume session", exact: true }).click();
    await expect(note(page)).toHaveValue("Offline and update draft marker.");
    await page.getByRole("button", { name: "Progress", exact: true }).click();
    await expect(page.getByText("Offline history marker.", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Chords", exact: true }).click();
    const chordTitle = "Build a C chord and hear home";
    const unopened = page.locator(".pg-card").filter({ has: page.getByRole("heading", { name: chordTitle, exact: true }) });
    await unopened.getByRole("button", { name: "Open lesson", exact: true }).click();
    await expect(page.getByRole("heading", { name: chordTitle, exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: `Written score for ${chordTitle}`, exact: true }).first()).toBeVisible();
    await expect(page.getByRole("slider", { name: /^Practice tempo/ })).toBeEnabled();
  } finally { await context.setOffline(false); }
});

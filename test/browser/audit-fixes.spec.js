import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { freshData } from "../../src/engine.js";
import { EXERCISES, SESSIONS } from "../../src/program/curriculum.js";
import { recordAttempt } from "../../src/program/progress.js";
import { QUESTION_BY_ID, knowledgeForExercise } from "../../src/program/knowledge.js";
import { todayStr, addDays } from "../../src/dateUtils.js";

const key = "woodshed-state-v1";
const note = page => page.getByRole("textbox", { name: "One thing to try next time", exact: true });
const start = page => page.getByRole("button", { name: "Start 20-minute session", exact: true }).click();
const save = async (page, value) => {
  await page.getByRole("spinbutton", { name: "Minutes practised", exact: true }).fill("1");
  await note(page).fill(value);
  await page.getByRole("button", { name: "Save practice", exact: true }).click();
  await expect(page.getByRole("button", { name: "Saving…", exact: true })).toHaveCount(0);
};
const seed = (page, state) => page.addInitScript(({ key, state }) => {
  if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(state));
}, { key, state });
test.beforeEach(async ({ page }) => {
  page.__auditErrors = [];
  page.on("pageerror", error => page.__auditErrors.push(error.message));
});
test.afterEach(async ({ page }) => expect(page.__auditErrors).toEqual([]));

test("two open app tabs retain both reports and a later reset cannot resurrect old history", async ({ page, context }) => {
  const second = await context.newPage(), errors = [];
  second.on("pageerror", error => errors.push(error.message));
  await page.goto("./"); await second.goto("./");
  await start(page); await start(second);
  const firstNote = "Concurrent UI fixture A; no piano performance measured.", secondNote = "Concurrent UI fixture B; no piano performance measured.";
  await save(page, firstNote); await save(second, secondNote);
  await second.getByRole("button", { name: "Close lesson", exact: true }).click();
  await second.getByRole("combobox", { name: "Piano unit", exact: true }).selectOption("g-major-foundations-2");
  await expect(second.getByRole("combobox", { name: "Piano unit", exact: true })).toHaveValue("g-major-foundations-2");
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByText(firstNote, { exact: true })).toBeVisible();
  await expect(page.getByText(secondNote, { exact: true })).toBeVisible();
  const reports = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).programProgress.attempts.map(a => a.note), key);
  expect(reports).toEqual([firstNote, secondNote]);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Reset everything", exact: true }).click();
  await page.getByRole("button", { name: "Erase", exact: true }).click();
  await second.getByRole("button", { name: "Guided Practice", exact: true }).click();
  await expect(second.getByRole("combobox", { name: "Piano unit", exact: true })).toHaveValue("c-major-foundations-1");
  await second.getByRole("combobox", { name: "Piano unit", exact: true }).selectOption("f-major-foundations-3");
  await expect.poll(() => second.evaluate(key => JSON.parse(localStorage.getItem(key)).programUnitId, key)).toBe("f-major-foundations-3");
  expect(await second.evaluate(key => JSON.parse(localStorage.getItem(key)).programProgress.attempts, key)).toEqual([]);
  expect(errors).toEqual([]);
});

test("crossing both responsive breakpoints retains the active lesson, playback and draft", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("./"); await start(page);
  const heading = page.getByRole("heading", { name: "The beat continues while notes change length", exact: true });
  await expect(heading).toBeVisible();
  await note(page).fill("Keep my responsive UI draft.");
  await page.getByRole("button", { name: /^Hear reference ·/ }).click();
  await page.setViewportSize({ width: 900, height: 900 });
  await expect(heading).toBeVisible(); await expect(note(page)).toHaveValue("Keep my responsive UI draft.");
  await expect(page.getByRole("button", { name: "■ Stop", exact: true })).toBeEnabled();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(heading).toBeVisible(); await expect(note(page)).toHaveValue("Keep my responsive UI draft.");
  await page.getByRole("button", { name: "■ Stop", exact: true }).click();
});

test("a revised current-plan draft resumes the exact later music block after reload", async ({ page }) => {
  const session = SESSIONS.find(s => s.legacySessionId === "c1-d4-b");
  const card = () => page.locator(".pg-session-grid .pg-card").filter({ has: page.getByRole("heading", { name: session.title, exact: true }) });
  await page.goto("./");
  await card().getByRole("button", { name: /^After the rain / }).click();
  await note(page).fill("Unfinished revised-plan music, not the first block.");
  await page.getByRole("combobox", { name: "Through bar", exact: true }).selectOption("2");
  await page.reload();
  await card().getByRole("button", { name: "Resume · 0/4 blocks", exact: true }).click();
  await expect(page.getByRole("heading", { name: "After the rain", exact: true })).toBeVisible();
  await expect(note(page)).toHaveValue("Unfinished revised-plan music, not the first block.");
  await expect(page.getByRole("combobox", { name: "Through bar", exact: true })).toHaveValue("2");
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key))?.programProgress.completedBlocks || {}, key)).toEqual({});
});

test("due workload recommends a resumable twenty-minute review visit without guided credit", async ({ page }) => {
  const state = freshData();
  const exercises = [...new Map(EXERCISES.filter(e => e.section !== "placement" && e.abc).map(e => [e.unitId, e])).values()].slice(0, 6);
  for (const e of exercises) state.programProgress = recordAttempt(state.programProgress, { exerciseId: e.id, section: "guided", date: addDays(todayStr(), -20), minutes: 3, assessment: "ready", hands: e.hands, bpm: 40, fromBar: 1, toBar: 1 });
  await seed(page, state); await page.goto("./");
  await expect(page.getByText(/6 skill checks due/)).toBeVisible();
  await page.getByRole("button", { name: "Start 20-minute consolidation visit", exact: true }).click();
  for (let index = 0; index < 5; index++) {
    await expect(page.locator(".pg-session-bar")).toContainText(`check ${index + 1} of 5`);
    await expect(page.getByRole("spinbutton", { name: "Minutes practised", exact: true })).toHaveValue("4");
    await page.getByRole("button", { name: "Felt steady", exact: true }).click();
    await note(page).fill(`Consolidation UI fixture ${index + 1}; no piano performance measured.`);
    await page.getByRole("button", { name: "Save practice", exact: true }).click();
    if (index < 4) await expect(page.locator(".pg-session-bar")).toContainText(`check ${index + 2} of 5`);
    if (index === 1) {
      await page.reload();
      await page.getByRole("button", { name: "Resume consolidation visit", exact: true }).click();
    }
  }
  await expect(page.locator(".pg-notice")).toContainText("Consolidation visit saved");
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).programProgress, key);
  const returns = saved.attempts.filter(a => a.reviewVisitId);
  expect(returns).toHaveLength(5); expect(returns.reduce((n, a) => n + a.minutes, 0)).toBe(20);
  expect(new Set(returns.map(a => a.reviewVisitId)).size).toBe(1);
  expect(saved.completedBlocks).toEqual({});
});

test("a known concept error receives a separate zero-minute repair without piano credit", async ({ page }) => {
  const question = QUESTION_BY_ID["g-signature"], exercise = EXERCISES.find(e => knowledgeForExercise(e).some(q => q.id === question.id));
  const state = freshData(); state.programUnitId = exercise.unitId;
  state.programProgress = recordAttempt({}, { exerciseId: exercise.id, section: "guided", date: addDays(todayStr(), -2), minutes: 3, assessment: "ready", knowledgeResults: [{ questionId: question.id, choice: (question.answer + 1) % question.options.length }] });
  await seed(page, state); await page.goto("./");
  await page.getByRole("button", { name: "Revisit this idea", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Revisit one musical idea", exact: true })).toBeVisible();
  await page.getByRole("radio", { name: question.options[question.answer], exact: true }).check();
  await page.getByRole("button", { name: "Check selected answers", exact: true }).click();
  await page.getByRole("button", { name: "Save understanding check", exact: true }).click();
  await expect(page.locator(".pg-notice")).toContainText("Understanding check saved");
  await expect(page.getByRole("button", { name: "Revisit this idea", exact: true })).toHaveCount(0);
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).programProgress, key);
  expect(saved.attempts.at(-1)).toMatchObject({ section: "knowledge", minutes: 0, knowledgeResults: [{ questionId: question.id, correct: true }] });
  expect(saved.completedBlocks).toEqual({});
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.locator(".pg-stats > div").filter({ hasText: "practice days · goal 5" }).locator("strong")).toHaveText("1");
  await expect(page.locator("#ws-main .ws-main")).toHaveCSS("opacity", "1");
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(accessibility.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
});

test("mobile Tuner stops the owned lesson reference before opening", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("./"); await start(page);
  await page.getByRole("button", { name: /^Hear reference ·/ }).click();
  await page.getByRole("button", { name: "Metronome and timer", exact: true }).click();
  await page.getByRole("dialog", { name: "Practice tools", exact: true }).getByRole("button", { name: /Tuner/ }).click();
  await page.getByRole("dialog", { name: "Tuner", exact: true }).getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("button", { name: "■ Stop", exact: true })).toBeDisabled();
});

import { test, expect } from "@playwright/test";

// A tablet on a music stand in landscape, then desktop. Below 1024px there is no rail.
const VIEWPORTS = [{ width: 1024, height: 768 }, { width: 1180, height: 820 }, { width: 1280, height: 900 }];
const chordCard = (page, title) => page.locator(".pg-card").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
const openChord = async (page, title) => {
  await page.getByRole("button", { name: "Chords", exact: true }).click();
  await chordCard(page, title).getByRole("button", { name: "Open lesson", exact: true }).click();
};

for (const viewport of VIEWPORTS) test.describe(`${viewport.width}×${viewport.height}`, () => {
  test.use({ viewport });
  test.beforeEach(({}, info) => { test.skip(info.project.name === "chromium-narrow", "Tablet-landscape and desktop widths only."); });

  test("the rail starts collapsed to tempo and play/stop and gives the score the width", async ({ page }) => {
    await page.goto("./");
    const rail = page.getByRole("complementary", { name: "Practice" });
    const show = rail.getByRole("button", { name: "Show metronome and timer", exact: true });
    await expect(show).toHaveAttribute("aria-expanded", "false");
    await expect(rail.getByRole("button", { name: "Start metronome", exact: true })).toBeEnabled();
    await expect(rail).toContainText("90");
    expect((await rail.boundingBox()).width).toBeLessThanOrEqual(64);
    expect((await page.locator("#ws-main").boundingBox()).width).toBeGreaterThanOrEqual(viewport.width - 200 - 64 - 1);
    await show.click();
    const hide = rail.getByRole("button", { name: "Hide metronome and timer", exact: true });
    await expect(rail.getByRole("button", { name: "Tap tempo", exact: false })).toBeVisible();
    expect((await rail.boundingBox()).width).toBeGreaterThan(300);
    // Keyboard activation keeps focus on the toggle across its swap (Safari never focuses a clicked button).
    await hide.focus(); await page.keyboard.press("Enter");
    await expect(show).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(hide).toBeFocused();
  });

  test("a chord lesson shows each shape on a keyboard with finger numbers", async ({ page }) => {
    await page.goto("./");
    await openChord(page, "C, F and G: leave home and return");
    const map = page.getByRole("region", { name: "Keys and fingers" });
    const shapes = map.getByRole("group", { name: "Hand shapes" }).getByRole("button");
    await expect(shapes).toHaveText(["C", "F", "G", "C"]);
    const keys = map.getByRole("img");
    await expect(keys).toHaveAttribute("aria-label", "C: right hand C4 finger 1, E4 finger 3, G4 finger 5: left hand C3 finger 5");
    await shapes.nth(1).click();
    await expect(shapes.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(keys).toHaveAttribute("aria-label", "F: right hand F4 finger 1, A4 finger 3, C5 finger 5: left hand F2 finger 5");
    await expect(map.locator(".ws-kb-finger")).toHaveText(["5", "1", "3", "5"]);
    const key = await map.locator(".ws-kb-white").first().boundingBox();
    expect(key.width, "keys stay big enough to read on a stand").toBeGreaterThanOrEqual(20);
    expect((await keys.boundingBox()).width).toBeLessThanOrEqual((await page.locator("#ws-main").boundingBox()).width);
  });

  test("too easy: skip a lesson, see it marked, and unskip it", async ({ page }) => {
    await page.goto("./");
    await openChord(page, "Build a C chord and hear home");
    await page.getByRole("button", { name: "Too easy — skip", exact: true }).click();
    await expect(page.locator(".pg-notice")).toContainText("Skipped: Build a C chord and hear home.");
    const card = chordCard(page, "Build a C chord and hear home");
    await expect(card.locator(".pg-status")).toHaveText("Skipped");
    await card.getByRole("button", { name: "Unskip", exact: true }).click();
    await expect(card.locator(".pg-status")).toHaveText("New");
  });

  test("Done saves a practised lesson as ready in one tap", async ({ page }) => {
    await page.goto("./");
    await openChord(page, "C, F and G: leave home and return");
    await expect(page.locator("details.ws-player-details")).not.toHaveAttribute("open", "");
    await page.getByRole("button", { name: "Done", exact: true }).click();
    await expect(page.locator(".pg-notice")).toContainText("Saved: C, F and G: leave home and return.");
    await expect(chordCard(page, "C, F and G: leave home and return").locator(".pg-status")).toContainText(/ready · 1 visit/i);
  });

  test("Done refuses more minutes than the form allows", async ({ page }) => {
    await page.goto("./");
    await openChord(page, "C, F and G: leave home and return");
    await page.locator("details.ws-player-details > summary").click();
    await page.getByLabel("Minutes practised").fill("2000");
    await page.getByRole("button", { name: "Done", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Minutes practised" })).toHaveText("Minutes practised must be 240 or fewer.");
    await expect(page.locator(".pg-notice")).toHaveCount(0);
  });
});

import { test, expect } from "@playwright/test";

const openCatalogue = async (page) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Catalogue", exact: true }).click();
};
const group = (page, name) => page.getByRole("region", { name, exact: true });

test("the catalogue is a shelf of music, grouped course, repertoire, outside", async ({ page }) => {
  await openCatalogue(page);
  await expect(page.locator(".pg-shelf-group > h2")).toHaveText(["Course pieces", "Repertoire", "Outside Woodshed"]);
  await expect(group(page, "Course pieces").locator(".pg-shelf-unit > h3")).toHaveText([
    "C major · Unit 1 · you're here", "G major · Unit 2", "F major · Unit 3", "A minor · Unit 4",
    "D major · Unit 5", "A major · Unit 6", "E major · Unit 7", "Musicianship · Unit 8",
  ]);
  await expect(group(page, "Course pieces").locator(".pg-shelf-item")).toHaveCount(27);
  await expect(group(page, "Repertoire").locator(".pg-shelf-item")).toHaveCount(13);
  await expect(group(page, "Outside Woodshed").getByRole("link")).toHaveCount(3);
  await expect(group(page, "Outside Woodshed").getByRole("link", { name: /Simple Disney Songs.*opens in a new tab/ })).toHaveAttribute("target", "_blank");
  await expect(page.locator(".pg-shelf-item.is-here")).toHaveCount(6);
  await expect(page.getByText("Hear and speak rhythm", { exact: false })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /C major scale/i })).toHaveCount(0);
});

test("filters narrow the shelf and say so when nothing matches", async ({ page }) => {
  await openCatalogue(page);
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  const difficulty = page.getByRole("group", { name: "Difficulty" }), shelf = page.getByRole("group", { name: "Shelf" });
  await difficulty.getByRole("button", { name: "Harder", exact: true }).click();
  await expect(group(page, "Course pieces")).toHaveCount(0);
  await expect(group(page, "Repertoire").locator(".pg-shelf-item")).toHaveCount(9);
  await difficulty.getByRole("button", { name: "Hardest", exact: true }).click();
  await expect(group(page, "Repertoire").locator(".pg-shelf-item")).toHaveCount(2);
  await difficulty.getByRole("button", { name: "Harder", exact: true }).click();
  await shelf.getByRole("button", { name: "Outside Woodshed", exact: true }).click();
  await expect(page.locator(".pg-shelf-item")).toHaveCount(1);
  await difficulty.getByRole("button", { name: "Easier", exact: true }).click();
  await expect(page.getByText("No pieces match.", { exact: true })).toBeVisible();
  await difficulty.getByRole("button", { name: "All", exact: true }).click();
  await shelf.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".pg-shelf-item")).toHaveCount(43);
});

test("list view is remembered and works when storage is blocked", async ({ page }) => {
  await openCatalogue(page);
  await page.getByRole("group", { name: "Layout" }).getByRole("button", { name: "List", exact: true }).click();
  await expect(page.locator(".pg-shelf-list")).toHaveCount(10);
  await page.reload();
  await page.getByRole("button", { name: "Catalogue", exact: true }).click();
  await expect(page.getByRole("group", { name: "Layout" }).getByRole("button", { name: "List", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.addInitScript(() => { Storage.prototype.getItem = function (key) { if (String(key).startsWith("woodshed:catalogue")) throw new DOMException("blocked", "SecurityError"); return null; }; });
  await page.reload();
  await page.getByRole("button", { name: "Catalogue", exact: true }).click();
  await expect(page.locator(".pg-shelf-grid").first()).toBeVisible();
});

test("a repertoire piece opens its score and a course piece opens to practise", async ({ page }, info) => {
  test.skip(info.project.name === "chromium-narrow", "The score panel is a desktop and tablet-landscape view.");
  await openCatalogue(page);
  await group(page, "Repertoire").getByRole("button", { name: /^Minuet in G Petzold/ }).click();
  await expect(page.getByText("Minuet in G (Petzold)", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Catalogue", exact: true }).click();
  await group(page, "Course pieces").getByRole("button", { name: /^Two Rooms/ }).click();
  await expect(page.getByRole("heading", { name: "Two Rooms: a complete AB piece" }).first()).toBeVisible();
});

test("older practice tools stay one tap away", async ({ page }) => {
  await openCatalogue(page);
  await page.getByRole("button", { name: "Browse repertoire tracks", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Skill tracks" })).toBeVisible();
});

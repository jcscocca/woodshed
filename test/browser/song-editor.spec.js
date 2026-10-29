import { test, expect } from "@playwright/test";
import { freshData } from "../../src/engine.js";
import { newSong } from "../../src/score/songs.js";

const key = "woodshed-state-v1";
const openSongs = async page => {
  await page.getByRole("button", { name: "Catalogue", exact: true }).click();
  await page.getByRole("button", { name: "Open exercise library", exact: true }).click();
  await page.getByRole("button", { name: "Lesson: Your song", exact: true }).click();
  await expect(page.locator(".ws-song").getByRole("textbox", { name: "Title", exact: true })).toBeVisible();
};
const savedSongs = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)).songs, key);

test("song editor retains rapid edits, restores failed drafts after reload and retries without losing another song", async ({ page }) => {
  // The earlier score editor is available at desktop widths; use that UI even
  // when this case is run under the suite's narrow-browser project.
  await page.setViewportSize({ width: 1280, height: 900 });
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  const state = freshData();
  state.songs = [newSong("browser-song-one"), { ...newSong("browser-song-two"), title: "Second saved song" }];
  await page.addInitScript(({ key, state }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(state));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (this === localStorage && storageKey === key && window.__songBlockSave) throw new DOMException("Song fixture quota", "QuotaExceededError");
      return original.call(this, storageKey, value);
    };
  }, { key, state });
  await page.goto("./"); await openSongs(page);
  const editor = page.locator(".ws-song"), title = editor.getByRole("textbox", { name: "Title", exact: true });
  const chords = editor.getByRole("textbox", { name: "Chords, bars split by |", exact: true });
  const picker = editor.getByRole("combobox", { name: "Song", exact: true });
  // Hold the real persistence lock while typing, so a single save remains
  // pending across several edits and a selection change.
  await page.evaluate(() => {
    const wait = new Promise(resolve => { window.__releaseSongLock = resolve; });
    window.__songLockHeld = false;
    window.__songLock = navigator.locks.request("woodshed-profile-v1", async () => { window.__songLockHeld = true; await wait; });
  });
  await expect.poll(() => page.evaluate(() => window.__songLockHeld)).toBe(true);
  await title.fill(""); await title.pressSequentially("Rapid title survives");
  await chords.fill(""); await chords.pressSequentially("Dm | G | C | C");
  await picker.selectOption("browser-song-two"); await title.fill("Second song also survives");
  await picker.selectOption("browser-song-one");
  await expect(title).toHaveValue("Rapid title survives"); await expect(chords).toHaveValue("Dm | G | C | C");
  await page.evaluate(async () => { window.__releaseSongLock(); await window.__songLock; });
  await expect.poll(async () => (await savedSongs(page)).map(song => [song.title, song.chords])).toEqual([
    ["Rapid title survives", "Dm | G | C | C"], ["Second song also survives", "C | G | Am | F"],
  ]);

  await page.evaluate(() => { window.__songBlockSave = true; });
  await title.fill("My retained failed draft");
  await expect(editor.getByRole("alert")).toContainText("could not be saved");
  await chords.fill("F | G | Am | C");
  expect((await savedSongs(page))[0].title).toBe("Rapid title survives");
  await page.reload(); await openSongs(page);
  await expect(title).toHaveValue("My retained failed draft"); await expect(chords).toHaveValue("F | G | Am | C");
  await expect(editor.getByRole("alert")).toContainText("draft has been restored");
  // Reload removes the temporary quota failure; restore stays explicit instead
  // of submitting a draft while the learner is reviewing it.
  expect((await savedSongs(page))[0].title).toBe("Rapid title survives");
  await editor.getByRole("button", { name: "Retry save", exact: true }).click();
  await expect(editor.getByRole("alert")).toHaveCount(0);
  await expect.poll(async () => (await savedSongs(page))[0]).toMatchObject({ title: "My retained failed draft", chords: "F | G | Am | C" });
  await page.reload(); await openSongs(page);
  await expect(title).toHaveValue("My retained failed draft"); await expect(chords).toHaveValue("F | G | Am | C");
  await picker.selectOption("browser-song-two"); await expect(title).toHaveValue("Second song also survives");
  expect(errors).toEqual([]);
});

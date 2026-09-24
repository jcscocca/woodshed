import assert from "node:assert/strict";
const { actionFor, clampBpm, KEY_HELP } = await import("../src/shortcuts.js");
const { toggleWatch, elapsedSec, RESET_WATCH } = await import("../src/stopwatch.js");

let failures = 0;
const test = (name, fn) => { try { fn(); console.log(`ok   ${name}`); } catch (e) { failures++; console.error(`FAIL ${name}\n     ${e.message}`); } };
const key = (k, extra = {}) => ({ key: k, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false, repeat: false, ...extra });

test("Space toggles the metronome", () => assert.deepEqual(actionFor(key(" ")), { type: "metronome" }));
test("T taps tempo, either case", () => {
  assert.deepEqual(actionFor(key("t")), { type: "tap" });
  assert.deepEqual(actionFor(key("T", { shiftKey: true })), { type: "tap" });
});
test("arrows nudge the tempo by 1, Shift by 10", () => {
  assert.deepEqual(actionFor(key("ArrowLeft")), { type: "bpm", delta: -1 });
  assert.deepEqual(actionFor(key("ArrowRight")), { type: "bpm", delta: 1 });
  assert.deepEqual(actionFor(key("ArrowRight", { shiftKey: true })), { type: "bpm", delta: 10 });
  assert.deepEqual(actionFor(key("ArrowLeft", { shiftKey: true })), { type: "bpm", delta: -10 });
});
test("S toggles the stopwatch", () => assert.deepEqual(actionFor(key("s")), { type: "stopwatch" }));
test("1-4 switch views", () => {
  assert.deepEqual(actionFor(key("1")), { type: "view", view: "today" });
  assert.deepEqual(actionFor(key("2")), { type: "view", view: "tracks" });
  assert.deepEqual(actionFor(key("3")), { type: "view", view: "library" });
  assert.deepEqual(actionFor(key("4")), { type: "view", view: "progress" });
});
test("L logs, Escape closes, ? opens help", () => {
  assert.deepEqual(actionFor(key("l")), { type: "log" });
  assert.deepEqual(actionFor(key("Escape")), { type: "close" });
  assert.deepEqual(actionFor(key("?", { shiftKey: true })), { type: "help" });
});
test("nothing fires while typing", () => {
  for (const k of [" ", "t", "ArrowLeft", "1", "l", "Escape", "?"]) assert.equal(actionFor(key(k), { typing: true }), null);
});
test("nothing fires while a dialog is open", () => {
  for (const k of [" ", "t", "ArrowRight", "4", "Escape"]) assert.equal(actionFor(key(k), { dialogOpen: true }), null);
});
test("Space is left to a focused button; other keys still work", () => {
  assert.equal(actionFor(key(" "), { buttonFocused: true }), null);
  assert.deepEqual(actionFor(key("t"), { buttonFocused: true }), { type: "tap" });
});
test("browser shortcuts pass through", () => {
  assert.equal(actionFor(key("l", { ctrlKey: true })), null);
  assert.equal(actionFor(key("t", { metaKey: true })), null);
  assert.equal(actionFor(key("1", { altKey: true })), null);
});
test("held keys repeat only for the tempo arrows", () => {
  assert.deepEqual(actionFor(key("ArrowRight", { repeat: true })), { type: "bpm", delta: 1 });
  assert.equal(actionFor(key(" ", { repeat: true })), null);
  assert.equal(actionFor(key("t", { repeat: true })), null);
});
test("unmapped keys do nothing", () => assert.equal(actionFor(key("x")), null));
test("clampBpm keeps 40-240", () => {
  assert.equal(clampBpm(35), 40);
  assert.equal(clampBpm(250), 240);
  assert.equal(clampBpm(92), 92);
});
test("KEY_HELP lists every shortcut", () => assert.equal(KEY_HELP.length, 10));
test("K toggles the band, P plays back", () => {
  assert.deepEqual(actionFor(key("k")), { type: "band" });
  assert.deepEqual(actionFor(key("P", { shiftKey: true })), { type: "playback" });
  assert.equal(actionFor(key("p"), { typing: true }), null);
  assert.equal(actionFor(key("k"), { dialogOpen: true }), null);
  assert.equal(actionFor(key("p", { repeat: true })), null);
});
test("stopwatch accumulates across pause and resume", () => {
  let w = toggleWatch(RESET_WATCH, 1000);              // start at t=1s
  assert.equal(elapsedSec(w, 6500), 5);
  w = toggleWatch(w, 6500);                           // pause at 5.5s elapsed
  assert.equal(elapsedSec(w, 99999), 5);              // paused: time doesn't move
  w = toggleWatch(w, 10000);                          // resume
  assert.equal(elapsedSec(w, 12000), 7);              // 5.5 + 2
});

process.on("exit", () => { if (failures) { console.error(`\n${failures} failing`); process.exit(1); } else console.log("\nall green"); });

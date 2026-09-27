// Desktop keyboard shortcuts. actionFor is pure so it can be tested in node;
// useShortcuts.js wires it to a keydown listener.
const VIEW_KEYS = { 1: "today", 2: "tracks", 3: "library", 4: "progress" };

export const clampBpm = (n) => Math.max(40, Math.min(240, Math.round(n)));

export const KEY_HELP = [
  ["Space", "Metronome start / stop"],
  ["T", "Tap tempo"],
  ["← →", "Tempo −1 / +1 (Shift: ±10)"],
  ["S", "Stopwatch start / pause"],
  ["1–4", "Today · Tracks · Library · Progress"],
  ["L", "Log today's set"],
  ["K", "Keyboard band: show / hide"],
  ["P", "Play back what you just played"],
  ["C", "Start / stop coaching the open lesson"],
  ["W", "Score: wait mode / play-along"],
  ["H", "Score: hands — both / right / left"],
  ["N", "Sight-reading: new drill"],
  ["[ ]", "Score: previous / next section"],
  ["5", "Back to the open score"],
  ["↑ ↓", "Score: move the page"],
  ["Esc", "Close the lesson or tuner"],
  ["?", "This list"],
];

export function actionFor(e, { typing = false, dialogOpen = false, buttonFocused = false } = {}) {
  if (e.ctrlKey || e.metaKey || e.altKey || typing || dialogOpen) return null;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === "ArrowLeft" || k === "ArrowRight") return { type: "bpm", delta: (k === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 10 : 1) };
  if (e.repeat) return null;
  if (k === " ") return buttonFocused ? null : { type: "metronome" };
  if (k === "t") return { type: "tap" };
  if (k === "s") return { type: "stopwatch" };
  if (VIEW_KEYS[k]) return { type: "view", view: VIEW_KEYS[k] };
  if (k === "l") return { type: "log" };
  if (k === "k") return { type: "band" };
  if (k === "p") return { type: "playback" };
  if (k === "c") return { type: "coach" };
  if (k === "Escape") return { type: "close" };
  if (k === "?") return { type: "help" };
  if (k === "w") return { type: "mode" };
  if (k === "h") return { type: "hands" };
  if (k === "n") return { type: "drill" };
  if (k === "[" || k === "]") return { type: "section", delta: k === "[" ? -1 : 1 };
  if (k === "5") return { type: "score" };
  if (k === "ArrowUp" || k === "ArrowDown") return { type: "scroll", delta: k === "ArrowUp" ? -1 : 1 };
  return null;
}

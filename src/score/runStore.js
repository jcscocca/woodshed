// Section, hands, mode, run state and the open sight-reading drill's ABC, shared by
// the score stage, rail panel and band readout (like src/midi/overlay.js). App never subscribes.
const INITIAL = {
  section: null,
  hands: "both",
  mode: "play",
  run: { state: "idle", statuses: null, cursor: -1, result: null, targets: null, flash: false },
  window: 0,
  drill: null,
};
let state = INITIAL;
const subs = new Set();

export const runStore = {
  get: () => state,
  set(patch) { state = { ...state, ...patch }; for (const f of subs) f(state); },
  reset() { state = INITIAL; for (const f of subs) f(state); },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
};

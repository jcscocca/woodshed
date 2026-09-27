// Section, hands, mode, run state and the panel-supplied ABC, shared by
// the score stage, rail panel and band readout (like src/midi/overlay.js). App never subscribes.
const INITIAL = {
  section: null,
  hands: "both",
  mode: "play",
  run: { state: "idle", statuses: null, cursor: -1, result: null, targets: null, flash: false },
  window: 0,
  abc: null, // the panel-supplied ABC: a sight-reading drill or Your song
};
const fresh = () => ({ ...INITIAL, run: { ...INITIAL.run } });
let state = fresh();
const subs = new Set();

export const runStore = {
  get: () => state,
  set(patch) { state = { ...state, ...patch }; for (const f of subs) f(state); },
  reset() { state = fresh(); for (const f of subs) f(state); },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
};

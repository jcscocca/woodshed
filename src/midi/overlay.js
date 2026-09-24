// What the open piano lesson and its coach run want drawn on the band. A tiny
// store so lesson/coach state reaches the band without going through App.
const EMPTY = { targets: [], range: null, statuses: null, next: [], readout: null, busy: false, hideTargets: false };
let state = EMPTY;
const subs = new Set();

export const overlay = {
  get: () => state,
  set(patch) { state = { ...state, ...patch }; for (const f of subs) f(state); },
  reset() { state = EMPTY; for (const f of subs) f(state); },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
};

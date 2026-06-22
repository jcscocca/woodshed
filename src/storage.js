// ============================================================
// Persistence layer. This is the ONLY file that knows where data
// lives. Today it's the browser's localStorage (per-device).
//
// The interface is async on purpose: when you want real cross-device
// sync, replace the bodies of loadState/saveState with fetch() calls
// to whatever backend you choose, and nothing else in the app changes.
// ============================================================

import { SCHEMA_VERSION } from "./engine.js";

const KEY = "woodshed-state-v1";

// Bring any saved state up to the current shape. Old saves stored practice
// stats on each item; those are derived from the session log now, so we drop
// them. New fields get safe defaults. Add a new `if` block per future version.
export function migrate(state) {
  if (!state || typeof state !== "object") return null;
  let s = { ...state };

  if (!s.version) {
    // v1 -> v2: stats move to the session log; items gain a `hidden` flag.
    s.items = (s.items || []).map(({ last, times, rating, ...rest }) => ({
      hidden: false,
      ...rest,
    }));
    s.version = 2;
  }

  // Defensive defaults so a partial or hand-edited file still loads.
  s.items = (s.items || []).map((it) => ({ hidden: false, ...it }));
  s.settings = {
    target: 20,
    weeklyGoal: 4,
    reminder: { enabled: false, time: "18:00" },
    enabled: { piano: true, guitar: true, bass: true, accordion: true },
    ...(s.settings || {}),
  };
  s.settings.reminder = { enabled: false, time: "18:00", ...(s.settings.reminder || {}) };
  s.sessions = Array.isArray(s.sessions) ? s.sessions : [];
  s.progress = { acked: {}, ...(s.progress || {}) };
  if (!s.progress.acked || typeof s.progress.acked !== "object") s.progress.acked = {};
  s.version = SCHEMA_VERSION;
  return s;
}

export async function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw));
  } catch (e) {
    console.warn("Woodshed: couldn't read saved state.", e);
    return null;
  }
}

// Returns true on success, false on failure — callers can surface a warning
// instead of silently losing data (e.g. private mode or a full quota).
export async function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.warn("Woodshed: couldn't save state.", e);
    return false;
  }
}

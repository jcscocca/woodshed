// ============================================================
// Persistence layer. This is the ONLY file that knows where data
// lives. Today it's the browser's localStorage (per-device).
//
// The interface is async on purpose: when you want real cross-device
// sync, replace the bodies of loadState/saveState with fetch() calls
// to whatever backend you choose, and nothing else in the app changes.
// ============================================================

import { SCHEMA_VERSION } from "./engine.js";
import { INSTRUMENTS, ECHO_SEED, SEED, trackItems } from "./seed.js";
import { COACH_ENABLED } from "./features.js";

const KEY = "woodshed-state-v1";

// v7 -> v8: placeholders retired (kept hidden, off their track, when they have history);
// items that kept their id but changed meaning take their new content fields.
export const RETIRED = ["pno-piece", "pno-voicings", "pno-hanon", "trk-pno-4", "trk-pno-5"];
export const REHOMED = ["pno-minuet", "trk-pno-1", "trk-pno-2", "trk-pno-3", "pno-improv"];
const CONTENT = ["title", "desc", "type", "diff", "min", "link", "trackId", "trackName", "order"];

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
  // Guitar Echo is off with the coach (src/features.js); piano Echo runs over MIDI.
  if (!COACH_ENABLED) s.items = s.items.filter((it) => !ECHO_SEED.some((e) => e.id === it.id && e.inst !== "piano"));
  s.settings = {
    target: 20,
    weeklyGoal: 4,
    enabled: { piano: true, guitar: true },
    ...(s.settings || {}),
  };
  // The daily reminder is gone; drop its setting from older saves.
  delete s.settings.reminder;
  s.sessions = Array.isArray(s.sessions) ? s.sessions : [];
  // v5 -> v6: bass and accordion moved to archive/. Drop their items, sessions
  // and rotation toggles; export a backup first to keep that history.
  s.items = s.items.filter((it) => it.inst in INSTRUMENTS);
  s.sessions = s.sessions.filter((x) => x.inst in INSTRUMENTS);
  s.settings.enabled = Object.fromEntries(Object.entries(s.settings.enabled).filter(([inst]) => inst in INSTRUMENTS));
  // v5 saves may carry Loom's thumbnail history; Loom is gone, so drop it.
  delete s.loomPaintings;
  s.progress = { acked: {}, ...(s.progress || {}) };
  if (!s.progress.acked || typeof s.progress.acked !== "object") s.progress.acked = {};
  // v3 -> v4: session entries gained optional coach fields (accuracy, coached,
  // missed). They're additive and read with safe defaults, so old sessions need
  // no backfill — only the stamped version changes.
  // v6 -> v7: the score engine remembers tempo-ladder bpm per section and the sight-reading level.
  // v7 -> v8: adds the tempo-clean-at-target flag and saved chord-chart songs.
  for (const k of ["ladder", "sightLevel", "targetClean"]) if (!s[k] || typeof s[k] !== "object" || Array.isArray(s[k])) s[k] = {};
  if (!Array.isArray(s.songs)) s.songs = [];
  if ((s.version || 0) < 8) {
    const defaults = Object.fromEntries([...SEED, ...trackItems()].map((d) => [d.id, d]));
    const practised = new Set(s.sessions.map((x) => x.itemId));
    s.items = s.items.flatMap((it) => {
      if (RETIRED.includes(it.id)) {
        if (!practised.has(it.id)) return [];
        const { trackId, trackName, order, ...rest } = it;
        return [{ ...rest, hidden: true }];
      }
      if (REHOMED.includes(it.id) && defaults[it.id]) {
        const d = defaults[it.id], fresh = {};
        for (const f of CONTENT) if (f in d) fresh[f] = d[f];
        return [{ ...it, ...fresh }];
      }
      return [it];
    });
  }
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

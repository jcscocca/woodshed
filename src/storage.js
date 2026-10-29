// ============================================================
// Persistence layer. This is the ONLY file that knows where data
// lives. Today it's the browser's localStorage (per-device).
//
// Mutations run against the latest profile under a same-origin Web Lock.
// Revision checks protect explicit replacements; generations prevent an old
// tab from replaying practice into an imported or reset profile.
// ============================================================

import { SCHEMA_VERSION } from "./engine.js";
import { INSTRUMENTS, ECHO_SEED, SEED, trackItems } from "./seed.js";
import { COACH_ENABLED } from "./features.js";
import { normalizeProgress } from "./program/progress.js";
import { COURSE, UNITS } from "./program/curriculum.js";
import { REMOVED_UNIT_REPLACEMENTS } from "./program/legacyPractice.js";

const KEY = "woodshed-state-v1";
const LOCK = "woodshed-profile-v1";
const snapshots = new WeakMap();
const metadata = (state) => state?._persistence && Number.isSafeInteger(state._persistence.revision)
  && state._persistence.revision > 0 && typeof state._persistence.generation === "string"
  ? state._persistence : null;
export const stateRevision = (state) => metadata(state)?.revision || 0;
export const stateGeneration = (state) => metadata(state)?.generation || "legacy";

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
    if (s.currentSession?.items) s.currentSession.items = s.currentSession.items.filter((x) => !RETIRED.includes(x.itemId));
  }
  // v8 -> v9: the self-guided piano course keeps learner-reported evidence
  // separate from the older MIDI accuracy and tempo-ladder records.
  s.programProgress = normalizeProgress(s.programProgress);
  // Removed bridge navigation returns to a related existing unit. Its reports,
  // block marks, notes and first checks remain unchanged in programProgress.
  if (Object.hasOwn(REMOVED_UNIT_REPLACEMENTS, s.programUnitId)) s.programUnitId = REMOVED_UNIT_REPLACEMENTS[s.programUnitId];
  if (!UNITS.some((unit) => unit.id === s.programUnitId)) s.programUnitId = COURSE.id;
  s.version = SCHEMA_VERSION;
  return s;
}

export class SavedStateError extends Error {
  constructor(code, raw = null) {
    super("Saved practice could not be loaded.");
    this.name = "SavedStateError";
    this.code = code;
    this.raw = raw;
  }
}

export class StateConflictError extends Error {
  constructor(code = "conflict") {
    super(code === "replaced" ? "Practice was replaced in another tab. Reopen this lesson before saving." : "Practice changed in another tab. Review the latest history and try again.");
    this.name = "StateConflictError";
    this.code = code;
  }
}

function readRaw() {
  try { return localStorage.getItem(KEY); }
  catch { throw new SavedStateError("read"); }
}

function decode(raw) {
  if (raw === null) return null;
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { throw new SavedStateError("parse", raw); }
  try {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid save");
    const state = migrate(parsed);
    if (!state) throw new Error("Invalid save");
    snapshots.set(state, raw);
    return state;
  } catch { throw new SavedStateError("migration", raw); }
}

export async function loadState() { return decode(readRaw()); }

function unchanged(base, current, raw) {
  if (metadata(base)) return !!metadata(current) && stateRevision(base) === stateRevision(current)
    && stateGeneration(base) === stateGeneration(current);
  if (base && snapshots.has(base)) return snapshots.get(base) === raw;
  return raw === null || JSON.stringify(base) === raw;
}

async function exclusive(action) {
  // A same-origin Web Lock covers the read, mutation and write across tabs.
  // localStorage has no atomic compare-and-swap: a lease/spinlock fallback can
  // silently lose a concurrent write, so unsupported browsers refuse to save.
  if (!globalThis.navigator?.locks?.request) return { ok: false, error: new SavedStateError("locking-unavailable") };
  try { return await navigator.locks.request(LOCK, { mode: "exclusive" }, action); }
  catch (error) { return { ok: false, error }; }
}

const generationId = () => globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function write(current, next, replacement) {
  if (!next || typeof next !== "object" || Array.isArray(next) || typeof next.then === "function") throw new TypeError("A saved profile must be an object.");
  if (!replacement && metadata(current)) {
    const { _persistence: _old, ...before } = current;
    const { _persistence: _next, ...after } = next;
    if (JSON.stringify(before) === JSON.stringify(after)) return { ok: true, state: current };
  }
  const state = { ...next, _persistence: { revision: stateRevision(current) + 1,
    generation: replacement || !current ? generationId() : stateGeneration(current) } };
  const raw = JSON.stringify(state);
  localStorage.setItem(KEY, raw);
  snapshots.set(state, raw);
  return { ok: true, state };
}

// Re-run an action against the latest durable profile. A revision may advance
// normally, but a replacement generation must never accept an old action.
export async function mutateState(base, updater) {
  return exclusive(() => {
    const raw = readRaw(), current = decode(raw);
    if (current) {
      if (metadata(base)) {
        if (!metadata(current) || stateGeneration(base) !== stateGeneration(current)) throw new StateConflictError("replaced");
      } else if (metadata(current)) {
        if (!snapshots.has(base) || stateGeneration(current) !== "legacy") throw new StateConflictError("replaced");
      } else if (!snapshots.has(base) && !unchanged(base, current, raw)) throw new StateConflictError("replaced");
    } else if (metadata(base) || snapshots.has(base)) throw new StateConflictError("replaced");
    return write(current, updater(current || base), false);
  });
}

// Import/reset and corrections are explicit replacements, not unions of logs.
// A stale replacement fails rather than deleting another tab's newer work.
export async function replaceState(base, next, { expectedRaw } = {}) {
  return exclusive(() => {
    const raw = readRaw();
    let current;
    if (expectedRaw !== undefined) {
      if (raw !== expectedRaw) throw new StateConflictError();
      try { current = decode(raw); } catch { current = null; }
    } else {
      current = decode(raw);
      if (!unchanged(base, current, raw)) throw new StateConflictError();
    }
    return write(current, next, true);
  });
}

// Compatibility for complete-snapshot callers: compare the loaded revision,
// never blindly replace a newer profile. App actions use mutateState instead.
export async function saveState(state) {
  const result = await exclusive(() => {
    const raw = readRaw(), current = decode(raw);
    if (!unchanged(state, current, raw)) throw new StateConflictError();
    return write(current, state, false);
  });
  if (result.ok) {
    state._persistence = result.state._persistence;
    snapshots.set(state, snapshots.get(result.state));
    return true;
  }
  console.warn("Woodshed: couldn't save state.", result.error);
  return false;
}

export function subscribeState(listener) {
  const onStorage = (event) => { if (event.key === KEY || event.key === null) listener(); };
  globalThis.window?.addEventListener("storage", onStorage);
  return () => globalThis.window?.removeEventListener("storage", onStorage);
}

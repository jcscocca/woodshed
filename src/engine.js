// ============================================================
// The "brain": pure functions that build each day's session from
// your logged history and compute progress stats. No React, no I/O —
// easy to unit-test, and the natural seam for a future local-model
// version (swap generateSession for an LLM call, keep everything else).
// ============================================================

import { todayStr, addDays, daysSince } from "./dateUtils.js";
import { INSTRUMENTS, SEED, trackItems } from "./seed.js";

// ---- skill tracks: lock/unlock state ----
// Group track items by track, in order; the first not-yet-mastered stage is the
// "current" edge, everything after it is "locked" (kept out of rotation).
export function trackStatus(items) {
  const byTrack = {};
  for (const it of items) {
    if (!it.trackId) continue;
    (byTrack[it.trackId] = byTrack[it.trackId] || []).push(it);
  }
  const result = {};
  for (const tid of Object.keys(byTrack)) {
    const stages = byTrack[tid].slice().sort((a, b) => a.order - b.order);
    let currentTaken = false;
    result[tid] = stages.map((st) => {
      let status;
      if (st.mastered) status = "done";
      else if (!currentTaken) { status = "current"; currentTaken = true; }
      else status = "locked";
      return { ...st, status };
    });
  }
  return result;
}

export function trackLocks(items) {
  const locked = new Set();
  const status = trackStatus(items);
  for (const tid of Object.keys(status))
    for (const st of status[tid]) if (st.status === "locked") locked.add(st.id);
  return locked;
}

// Add any default content (free-practice seeds + track stages) that isn't
// already in the saved item list — so existing users pick up newly added
// tracks without losing their data.
export function mergeContent(items) {
  const have = new Set(items.map((it) => it.id));
  const defaults = [...SEED.map((s) => ({ ...s, hidden: false })), ...trackItems()];
  const additions = defaults.filter((d) => !have.has(d.id));
  return additions.length ? [...items, ...additions] : items;
}

const isRep = (it) => it.type === "song" || it.type === "creative";

// Derive each item's last-practiced date, practice count, and most-recent
// rating from the session log, rather than storing them on the item. This is
// what makes editing and deleting sessions correct: the log is the single
// source of truth, and stats recompute from it automatically.
export function withDerivedStats(items, sessions) {
  const times = {}, last = {}, lastRating = {}, lastBpm = {}, bpmDate = {};
  for (const s of sessions) {
    times[s.itemId] = (times[s.itemId] || 0) + 1;
    if (s.bpm != null && (!(s.itemId in bpmDate) || s.date >= bpmDate[s.itemId])) {
      lastBpm[s.itemId] = s.bpm; // most recent dated tempo (not array order — survives edits/imports)
      bpmDate[s.itemId] = s.date;
    }
    if (!last[s.itemId] || s.date >= last[s.itemId]) {
      last[s.itemId] = s.date;
      lastRating[s.itemId] = s.rating; // rating of the most recent session
    }
  }
  return items.map((it) => ({
    ...it,
    last: last[it.id] || null,
    times: times[it.id] || 0,
    rating: lastRating[it.id] ?? null,
    lastBpm: lastBpm[it.id] ?? null,
  }));
}

// ---- activity-aware progression ----
// Look at what's actually been logged and SUGGEST changes — never apply them.
// `acked` maps itemId -> the practice count at which the user last accepted or
// dismissed a suggestion, so we don't nag again until they've practiced more.
function trailingCount(arr, rating) {
  let n = 0;
  for (let i = arr.length - 1; i >= 0; i--) { if (arr[i].rating === rating) n++; else break; }
  return n;
}
function hasRecent(arr, rating, k) { return arr.slice(-k).some((s) => s.rating === rating); }

// Coaching gate: average of the last few *coached* accuracy scores. With no
// coached data we return null and callers treat that as "ready" — so practice
// without the coach behaves exactly as before (never withheld for missing data).
export function accuracyReady(mine, threshold = 80, k = 2) {
  const c = mine.filter((s) => s.coached && s.accuracy != null);
  if (!c.length) return true;
  const recent = c.slice(-k);
  return recent.reduce((t, s) => t + s.accuracy, 0) / recent.length >= threshold;
}

export function progressionProposals(items, sessions, acked = {}) {
  const live = withDerivedStats(items, sessions);
  const status = trackStatus(live);
  const isCurrentEdge = new Set();
  for (const tid of Object.keys(status))
    for (const st of status[tid]) if (st.status === "current") isCurrentEdge.add(st.id);

  const out = [];
  for (const it of live) {
    if (it.hidden || it.mastered || it.times < 2) continue;
    if ((acked[it.id] || 0) >= it.times) continue; // already handled at this level of practice
    const mine = sessions.filter((s) => s.itemId === it.id);
    const easy = trailingCount(mine, "easy");
    const hard = trailingCount(mine, "hard");

    // Track stages don't change difficulty — they advance to the next stage.
    if (it.trackId) {
      if (!isCurrentEdge.has(it.id)) continue;
      if (((easy >= 2) || (it.times >= 5 && !hasRecent(mine, "hard", 3))) && accuracyReady(mine)) {
        out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "advance", trackName: it.trackName,
          reason: easy >= 2
            ? `The last ${easy} felt easy — ready for the next stage of ${it.trackName}.`
            : `${it.times} sessions in — ready to move on in ${it.trackName}?` });
      }
      continue;
    }

    if (it.diff >= 5 && it.times >= 4 && easy >= 2 && accuracyReady(mine)) {
      out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "graduate",
        reason: `Played ${it.times}× and still too easy at the top level — rotate it out to make room.` });
    } else if (easy >= 2 && it.diff < 5 && accuracyReady(mine)) {
      out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "level-up", from: it.diff, to: it.diff + 1,
        reason: `The last ${easy} times felt too easy.` });
    } else if (hard >= 2 && it.diff > 1) {
      out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "ease", from: it.diff, to: it.diff - 1,
        reason: `The last ${hard} times felt tough — ease off and rebuild it.` });
    } else if (it.times >= 6 && it.diff < 5 && !hasRecent(mine, "hard", 3) && accuracyReady(mine)) {
      out.push({ itemId: it.id, inst: it.inst, title: it.title, kind: "level-up", from: it.diff, to: it.diff + 1,
        reason: `You've put in ${it.times} sessions on this — ready to push the challenge up?` });
    }
  }
  return out;
}

export function lastByInstrument(sessions) {
  const map = {};
  for (const s of sessions) if (!map[s.inst] || s.date > map[s.inst]) map[s.inst] = s.date;
  return map;
}

// Comfort level per instrument drifts from the base as you rate sessions:
// repeated "too easy" pushes it up, "tough" pulls it back.
export function levelFor(inst, sessions) {
  let lvl = INSTRUMENTS[inst].base;
  for (const s of sessions) {
    if (s.inst !== inst) continue;
    if (s.rating === "easy") lvl += 0.5;
    else if (s.rating === "hard") lvl -= 0.5;
  }
  return Math.max(1, Math.min(5, Math.round(lvl)));
}

// Greedily pick items for one instrument to roughly fill a time budget,
// favoring the learning edge, balancing a drill with a song, rotating
// within the instrument, and spacing out repertoire.
export function fillInstrument(inst, budget, data, today, relax) {
  const locked = trackLocks(data.items);
  const pool = data.items.filter((it) => it.inst === inst && !it.hidden && !locked.has(it.id) && (relax || it.last !== today));
  const level = levelFor(inst, data.sessions);
  const out = [];
  let rem = budget;
  while (rem >= 5 && out.length < pool.length) {
    let best = null, bestScore = -1e9;
    for (const it of pool) {
      if (out.includes(it)) continue;
      const dsi = daysSince(it.last, today);
      let s = Math.min(dsi, 14) * 0.6; // rotate within the instrument
      const gap = it.diff < level ? level - it.diff : it.diff > level + 1 ? it.diff - (level + 1) : 0;
      s += gap === 0 ? 6 : -2.2 * gap; // sit at the learning edge
      const haveSong = out.some(isRep), haveTech = out.some((o) => !isRep(o));
      if (isRep(it) && !haveSong) s += 4;
      if (!isRep(it) && !haveTech) s += 3;
      if (isRep(it)) {
        const interval = [1, 2, 4, 7, 12][Math.min(it.times, 4)];
        s += dsi >= interval ? 3 : -2; // spaced repetition for repertoire
      }
      if (it.rating === "easy") s -= 2.5;
      if (it.rating === "hard") s += 1.5;
      if (it.min > rem + 4) s -= 3;
      s += Math.random() * 1.2;
      if (s > bestScore) { bestScore = s; best = it; }
    }
    if (!best) break;
    out.push(best);
    rem -= best.min;
  }
  return out;
}

// Build today's set: bias toward the most-overdue instrument, sometimes
// add a second for variety, then fill with fillInstrument.
export function generateSession(data) {
  const today = todayStr();
  const enabled = Object.keys(INSTRUMENTS).filter((i) => data.settings.enabled[i]);
  if (!enabled.length) return { date: today, items: [], completed: false };

  const lastBy = lastByInstrument(data.sessions);
  const due = enabled
    .map((i) => ({ i, score: daysSince(lastBy[i], today) + Math.random() * 0.6 }))
    .sort((a, b) => b.score - a.score);

  const primary = due[0].i;
  const target = data.settings.target;
  const insts = [primary];
  if (enabled.length >= 2 && target >= 18 && Math.random() < 0.6) insts.push(due[1].i);

  let items = [];
  if (insts.length === 1) {
    items = fillInstrument(primary, target, data, today, false).map((it) => ({ itemId: it.id, minutes: it.min }));
  } else {
    const a = fillInstrument(insts[0], Math.round(target * 0.6), data, today, false);
    const b = fillInstrument(insts[1], target - a.reduce((t, x) => t + x.min, 0), data, today, false);
    items = [...a, ...b].map((it) => ({ itemId: it.id, minutes: it.min }));
  }
  if (!items.length) {
    items = fillInstrument(primary, target, data, today, true).slice(0, 2).map((it) => ({ itemId: it.id, minutes: it.min }));
  }
  return { date: today, items, completed: false };
}

// Replace one item in the current set with the next-best alternative
// from the same instrument.
export function swapInSession(session, itemId, data) {
  const today = todayStr();
  const cur = data.items.find((it) => it.id === itemId);
  if (!cur) return session;
  const inSession = new Set(session.items.map((x) => x.itemId));
  const locked = trackLocks(data.items);
  const candidates = data.items.filter(
    (it) => it.inst === cur.inst && !it.hidden && !locked.has(it.id) && !inSession.has(it.id) && it.last !== today
  );
  const level = levelFor(cur.inst, data.sessions);
  let best = null, bestScore = -1e9;
  for (const it of candidates) {
    const dsi = daysSince(it.last, today);
    let s = Math.min(dsi, 14) * 0.6;
    const gap = it.diff < level ? level - it.diff : it.diff > level + 1 ? it.diff - (level + 1) : 0;
    s += gap === 0 ? 6 : -2.2 * gap;
    if (it.rating === "easy") s -= 2.5;
    s += Math.random();
    if (s > bestScore) { bestScore = s; best = it; }
  }
  if (!best) return session;
  return { ...session, items: session.items.map((x) => (x.itemId === itemId ? { itemId: best.id, minutes: best.min } : x)) };
}

// ---- stats ----
// Forgiving streak: a single missed day (a rest day) is tolerated; the streak
// only breaks after two or more consecutive missed days. Counts practiced days.
const ordinal = (d) => Math.floor(new Date(d + "T00:00:00").getTime() / 86400000);

export function streakInfo(sessions) {
  const dates = [...new Set(sessions.map((s) => s.date))].sort();
  if (!dates.length) return { current: 0, longest: 0 };
  const ords = dates.map(ordinal);
  let longest = 1, run = 1;
  for (let i = 1; i < ords.length; i++) {
    if (ords[i] - ords[i - 1] <= 2) run++; // gap with at most one rest day
    else { longest = Math.max(longest, run); run = 1; }
  }
  longest = Math.max(longest, run);
  const lastGap = ordinal(todayStr()) - ords[ords.length - 1];
  return { current: lastGap <= 1 ? run : 0, longest };
}

// Distinct days practiced in the current calendar week (Sun–Sat).
export function weekCount(sessions) {
  const today = todayStr();
  const dow = new Date(today + "T00:00:00").getDay();
  const start = addDays(today, -dow);
  const set = new Set(sessions.map((s) => s.date));
  let n = 0;
  for (let i = 0; i <= dow; i++) if (set.has(addDays(start, i))) n++;
  return n;
}

export function minutesByInst(sessions) {
  const m = { piano: 0, guitar: 0, bass: 0, accordion: 0 };
  for (const s of sessions) m[s.inst] = (m[s.inst] || 0) + (s.minutes || 0);
  return m;
}

export function minutesInLastDays(sessions, n) {
  const today = todayStr();
  return sessions.filter((s) => daysSince(s.date, today) < n).reduce((t, s) => t + (s.minutes || 0), 0);
}

// ---- fresh install state ----
export const SCHEMA_VERSION = 4;
export function freshData() {
  return {
    version: SCHEMA_VERSION,
    items: [...SEED.map((s) => ({ ...s, hidden: false })), ...trackItems()],
    settings: { target: 20, weeklyGoal: 4, reminder: { enabled: false, time: "18:00" }, enabled: { piano: true, guitar: true, bass: true, accordion: true } },
    sessions: [],
    progress: { acked: {} },
    currentSession: null,
  };
}

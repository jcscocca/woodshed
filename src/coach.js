// ============================================================
// Coaching core — pure, no React, no Web Audio. The useCoach hook
// feeds it live mic frames; the tests feed it synthetic frames and
// note events. Three stages: confirm jumpy frames into stable notes
// (createNoteStream), then grade those notes against the lesson's
// known targets (gradeLine / gradeArpeggio).
// ============================================================
import { noteFromFrequency } from "./audio/dsp.js";

// Stabilizer + segmentation. A frame is { freq, clarity, level, t(ms) }. A note
// is only "confirmed" once the same pitch holds for holdMs with enough clarity
// and loudness — so a single stray frame can never produce a judgment, and a
// note that won't sustain (a dead/choked string) never confirms. Segmentation
// is primarily by pitch *change* (robust to legato, where there's no new
// attack); a re-struck same note is caught by the silent-gap reset.
export function createNoteStream({ holdMs = 90, clarityFloor = 0.5, levelFloor = 0.02, gapMs = 70 } = {}) {
  let cand = null, candStart = 0, candPeak = 0, confirmed = false, lastValidT = -Infinity;
  return {
    push({ freq, clarity, level, t }) {
      const valid = freq > 0 && clarity >= clarityFloor && level >= levelFloor;
      if (valid) {
        const midi = noteFromFrequency(freq).midi;
        const sameNote = cand != null && midi === cand && (t - lastValidT) <= gapMs;
        if (!sameNote) { cand = midi; candStart = t; candPeak = level; confirmed = false; }
        else if (level > candPeak) candPeak = level;
        lastValidT = t;
        if (!confirmed && t - candStart >= holdMs) {
          confirmed = true;
          const n = noteFromFrequency(freq);
          return { midi: n.midi, name: n.name, octave: n.octave, tStart: candStart, peak: candPeak };
        }
      } else if (cand != null && t - lastValidT > gapMs) {
        cand = null; confirmed = false; // note-off
      }
      return null;
    },
  };
}

// Run a whole frame array through a fresh stream (for tests / offline grading).
export function runNoteStream(frames, opts) {
  const s = createNoteStream(opts);
  const out = [];
  for (const f of frames) { const e = s.push(f); if (e) out.push(e); }
  return out;
}

const samePitch = (aMidi, bMidi, octaveStrict) => octaveStrict ? aMidi === bMidi : ((aMidi % 12) + 12) % 12 === ((bMidi % 12) + 12) % 12;

// Walk targets against confirmed events with a one-step lookahead so a single
// wrong note marks that target "missed" and moves on instead of desyncing the
// whole line. Pending targets (not yet reached when the player stops) stay
// pending and count against accuracy.
export function gradeLine(targets, events, { octaveStrict = false } = {}) {
  const results = targets.map((t) => ({ target: t, status: "pending" }));
  let cur = 0, lastHeard = null;
  for (const e of events) {
    if (cur >= targets.length) break;
    if (samePitch(e.midi, targets[cur].midi, octaveStrict)) { results[cur].status = "caught"; cur++; lastHeard = null; }
    else if (cur + 1 < targets.length && samePitch(e.midi, targets[cur + 1].midi, octaveStrict)) {
      results[cur].status = "missed"; results[cur + 1].status = "caught"; cur += 2; lastHeard = null;
    } else { lastHeard = e; } // stray — stay put, surface as a hint
  }
  // Attempt ended: a stray heard on the current target that was never corrected
  // is a genuine miss (e.g. a wrong octave under octaveStrict), not "pending".
  if (lastHeard !== null && cur < targets.length) results[cur].status = "missed";
  const caught = results.filter((r) => r.status === "caught").length;
  return {
    results,
    cursor: cur,
    lastHeard,
    done: cur >= targets.length,
    accuracy: targets.length ? Math.round((100 * caught) / targets.length) : 0,
    missed: results.filter((r) => r.status === "missed" || r.status === "pending").map((r) => r.target.label),
  };
}

// Soft, tempo-independent timing read: the coefficient of variation of the gaps
// between confirmed notes. Needs >= 3 gaps (4 notes). Deliberately forgiving —
// a nudge in the summary, never scored. Returns { band, cv } or null.
export function evenness(events) {
  if (events.length < 4) return null;
  const iois = [];
  for (let i = 1; i < events.length; i++) iois.push(events[i].tStart - events[i - 1].tStart);
  if (iois.some((g) => g <= 0)) return null; // assumes monotonic tStart (note stream guarantees it)
  const mean = iois.reduce((a, b) => a + b, 0) / iois.length;
  if (mean <= 0) return null;
  const variance = iois.reduce((a, b) => a + (b - mean) ** 2, 0) / iois.length;
  const cv = Math.sqrt(variance) / mean;
  return { band: cv <= 0.2 ? "even" : "uneven", cv };
}

// Step-gated, octave-aware grading for an arpeggiated chord. Events arrive in
// play order (low->high), as the live stream produces them. A pitched string is
// "caught" when its exact note rings; a string whose note never rings while a
// LATER string does is "missed" (dead/skipped); strings not yet reached stay
// "pending" (so live display dims them rather than flashing red). Muted strings
// should stay silent — an event at the open pitch is flagged "rang" (advisory,
// never scored). Stray events that match no upcoming string are skipped.
export function gradeArpeggio(targets, events) {
  const results = targets.map((t) => ({ target: t, status: "pending" }));
  let ei = 0;
  for (let ci = 0; ci < targets.length; ci++) {
    const t = targets[ci];
    if (t.muted) {
      if (ei < events.length && events[ei].midi === t.openMidi) { results[ci].status = "rang"; ei++; }
      else results[ci].status = "muted-ok";
      continue;
    }
    const later = new Set(targets.slice(ci + 1).filter((x) => !x.muted).map((x) => x.midi));
    while (ei < events.length && events[ei].midi !== t.midi && !later.has(events[ei].midi)) ei++; // skip strays
    if (ei < events.length && events[ei].midi === t.midi) { results[ci].status = "caught"; ei++; }
    else if (ei < events.length && later.has(events[ei].midi)) results[ci].status = "missed"; // a later string rang -> this one was skipped
    else break; // events exhausted -> the rest simply aren't played yet (pending)
  }
  const pitched = results.filter((r) => !r.target.muted);
  const caught = pitched.filter((r) => r.status === "caught").length;
  return {
    results,
    cursor: results.findIndex((r) => r.status === "pending"),
    done: !results.some((r) => r.status === "pending"),
    accuracy: pitched.length ? Math.round((100 * caught) / pitched.length) : 0,
    missed: pitched.filter((r) => r.status === "missed").map((r) => r.target.stringName || r.target.label),
  };
}

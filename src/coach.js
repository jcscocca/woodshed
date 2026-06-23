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

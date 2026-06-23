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

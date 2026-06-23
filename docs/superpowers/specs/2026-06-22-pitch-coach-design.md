# Pitch Coach — Design

**Date:** 2026-06-22
**Status:** Approved design, pending implementation plan

## Problem

Woodshed already listens to the microphone — `src/useListener.js` is a beta
"tuner & listener" that detects a clear note's pitch (and cents) and roughly
estimates tempo. But it's passive: it tells you *what* you played, never whether
it was *what the exercise asked for*. Meanwhile every lesson with a shape already
encodes its exact expected pitches (`shapeToVoices` in `src/audio/notes.js`
turns a fretboard/keyboard/chord shape into frequencies). The two halves —
"what you played" and "what was wanted" — never meet.

The honest constraint that shapes everything: the detector reliably hears **one
clear note at a time**. Not chords-as-strummed, not accordion reeds. So a coach
has to be built around monophonic playing and the data we already have.

## Goal

Promote the tuner into an **exercise-aware coach** that, for a gradeable
exercise, gives **restrained live feedback** while you play and an **honest
summary** after — then feeds that result into your stats and the suggestion
engine, without ever auto-changing anything.

Two guiding instincts from the brainstorm, treated as hard requirements:

1. **Ambient while playing, detailed after.** No buzzers, no flashing, no score
   popping mid-line. The diagram quietly progresses; detail waits for the summary.
2. **Be reasonable.** The raw detector is jumpy. No judgment is ever made on a
   raw frame — every reading passes through confidence/loudness floors and a
   ~100 ms stability window first. The player is never blamed for the detector's
   noise.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Core experience | Blended **live + post-attempt summary** |
| Live feedback style | **Ambient/restrained** — one pulsing target, green-on-catch, single calm "off" hint |
| What v1 grades | **Right notes only.** Timing **cut** (onset tracker too coarse for fast/legato). Intonation stays with the tuner |
| Where it lives | **In the lesson sheet** — "Hear it → Coach me"; the shape diagram becomes the live display |
| Octave matching | **Per-instrument:** piano octave-strict, guitar/bass octave-forgiving. **Per-mode:** arpeggio always octave/position-aware |
| Wrong-octave (piano) | Surfaced as a coaching line: "C — but an octave too low" |
| Chord support | **Comprehensive arpeggio mode** — guided string-by-string, muted-string advisory, optional down-pass, clean-ring check, per-string memory |
| Accordion | **No coach in v1** — reeds detect poorly; better nothing than broken |
| Summary tone | A **count, not a grade** ("4 of 6 clean" + soft band). 0–100 stored internally |
| Engine integration | Accuracy **gates** advance/level-up suggestions — but **falls back to today's rating-only behavior when there's no coached data** |
| Performance | **Main thread**, via exercise-aware lag-search narrowing. Web Worker = documented escape hatch, not built |

## Delivery boundary

**In v1:**

- Single-note line coaching (scales, pentatonics, five-finger patterns) — the
  ~10 fretboard/keyboard-sequence exercises.
- Comprehensive arpeggio mode for the 12 guitar chord exercises — including the
  muted-string advisory, optional down-pass, clean-ring check, and per-string
  memory (all in the first milestone; built last within it for risk-sequencing).
- Live ambient feedback + post-attempt summary in the lesson sheet.
- Accuracy persisted (schema v4) and wired into Progress + the suggestion gate.
- Automated tests for the gradeable core; a manual device checklist.
- Documentation: README section, file-table + "What's next" updates, honest
  limits, module comments.

**Deferred (designed-for, not built):**

- The soft **timing/evenness** read (revisit once segmentation is proven).
- **Web Worker / AudioWorklet** offload (only if mobile lags).
- Coaching for **accordion** and for **prose-only** exercises (no shape = no
  target).
- Polyphonic (true chord) detection.

## Architecture

The feature is mostly assembled from parts that already exist. The genuinely new
code is three small, pure, testable functions plus a hook and a UI panel.

### 1. The grading pipeline

A frame-by-frame pipeline, identical live and in tests (tests feed buffers
instead of a mic):

1. **Capture** — *exists.* `useListener`'s path: mic → `AudioContext` →
   2048-sample frames at ~60 fps, raw (echo/noise/gain processing all off).
2. **Per-frame readout** — *extend `audio/dsp.js`.* `detectPitch` + `rms` already
   give frequency and loudness; additionally **expose the AMDF clarity value it
   already computes** (`(mean − d[lag]) / mean`) as a confidence score (a new
   `detectPitchDetailed`; `detectPitch` becomes a thin wrapper). No new octave
   option is needed: the coach clamps `detectPitch`'s existing `minF`/`maxF` to
   the exercise's pitch span itself (§7), which is both cheap and keeps
   out-of-range octave artifacts from registering.
3. **Stabilizer** — *new (`coach.js`).* The "be reasonable" core. Holds a short
   ring buffer (~100 ms) of frames and emits a *confirmed* note only when the
   frames agree on one pitch, clarity clears a floor, and loudness clears a floor.
   A single stray frame can never produce a judgment.
4. **Segmentation** — *new (`coach.js`).* Emits a discrete *played-note event*
   `{ midi, name, octave, tStart, peak }`. **Primary trigger is a stable pitch
   *change*** (robust to legato — hammer-ons, slurs, pedaled piano — where there's
   no new attack). A **re-articulated repeated note** (same pitch struck twice) is
   caught by a brief silent-gap reset between confirmations, not the amplitude
   onset tracker — whose 160 ms refractory would have dropped fast scale notes.
   "Clean ring" falls out of this for free: a note that won't sustain past the
   hold window simply never confirms (a dead/choked string reads as missed).
5. **Matcher** — *new, pure (`coach.js`).* Walks the expected sequence against the
   played-note stream with **windowed lookahead** so a mistake never desyncs the
   line:
   - Played event matches `expected[i]` (per octave policy) → mark `i` **caught**,
     advance.
   - Else matches `expected[i+1]` (small lookahead) → mark `i` **missed**, mark
     `i+1` caught, advance past both.
   - Else → the player is fumbling on target `i`: record a stray, **do not
     advance**, surface the single calm hint ("hearing F♯ · looking for G").
     Bounded so repeated strays still can't desync.
   - Octave policy applied here (§1e); arpeggio uses the step-gated variant (§3).
6. **Scorer** — *new, pure (`coach.js`).* Tallies caught/missed →
   `{ accuracy: 0–100, missed: [labels], perNote: [...] }`. Muted-string checks
   are advisory and excluded from the denominator.

Then: **`useCoach` hook** (new) drives the live ambient diagram from matcher
state and returns the final score to the summary.

### 2. Expected-sequence model

A small builder (in `audio/notes.js`, beside `shapeToVoices`) turns a lesson
shape into the matcher's target list, applying:

- **Octave policy** — `piano` strict (keep octave), `guitar`/`bass` forgiving
  (fold to pitch class). Arpeggio overrides to octave/position-aware regardless
  of instrument.
- **Sequence-vs-block classification** — most fretboard/keyboard shapes are
  monophonic sequences. **Keyboard voicings** (block chords written as notes,
  e.g. `trk-pno-5` = C–E–G–C) are flagged and routed through arpeggio mode rather
  than mis-graded as a melodic line.
- **Gradeability** — a shape is gradeable if it resolves to a monophonic sequence
  *or* a chord (→ arpeggio). Prose-only exercises and accordion are not gradeable;
  they simply show no **Coach me** button.

### 3. Modes

**Single-note line** — the matcher of §1e over the expected sequence, self-paced.
The current target softly pulses; a note fills green once the right pitch holds
~100 ms, then auto-advances.

**Arpeggio (chords)** — same single-note grader, **step-gated** so each string is
graded against *that string's* exact pitch (octave-aware, which also resolves the
repeated-pitch-class problem — a C-major arpeggio has two C's and two E's):

- Guided low→high; the current string is highlighted, with its target note.
- **Muted (`x`) strings** open a short "should be silent" window. A confirmed
  pitch there is an **advisory** flag ("low E rang — mute it") — never a fail.
- **Optional down-pass** — an "↓ once more" prompt after the up-pass, not mandatory.
- **Clean-ring check** — confirms the note sustained a moment (from `peakRms`/`dur`),
  catching dead/choked strings. Advisory; buzz detection is acknowledged as
  low-confidence.
- **Per-string memory** — `missed` records which string, so "your D string keeps
  buzzing" can surface over time.

### 4. UI — lesson-sheet integration

`CoachPanel.jsx` (new) renders inside `LessonSheet.jsx`:

- A **Coach me** button beside the existing **Hear it** (only for gradeable
  exercises).
- **Live state** — the existing shape diagram becomes the live display (done /
  current / upcoming), plus a one-line readout and a **Stop**.
- **Summary state** — the diagram replays the run color-coded; a count + soft
  band; secondary chips; **↻ Try again** and **Log it →**.
- **Log handoff** — "Log it" opens the normal **Done — log it** sheet
  (`commitLog` in `App.jsx`) with `accuracy`/`coached`/`missed` attached
  read-only; the user still sets felt rating and minutes.

Styling follows the existing sheet conventions (`ws-sheet`, instrument accent
var, ARIA live region on the readout, Escape-to-close).

### 5. Data model & persistence

Extend the session-log entry (currently `{ id, date, itemId, inst, minutes,
rating, bpm, note }`) with:

```js
{ …existing,
  accuracy: 83,        // 0–100, measured; null if not coached
  coached: true,
  missed: ["G", "D"],  // per-note / per-string labels
}
```

`storage.js` `migrate()` gains a **v3 → v4** block (mirroring how earlier fields
were added); the `SCHEMA_VERSION` constant (defined in `engine.js`, imported by
`storage.js`) goes to 4. Defensive defaults: `accuracy ?? null`,
`coached ?? false`, `missed ?? []`. Stats stay **derived, not stored** — accuracy
trends are computed from the log like everything else.

### 6. Engine integration

In `engine.js`, beside `trailingCount`/`hasRecent`, add `trailingAccuracy(mine,
threshold, k)` and a `hasCoachedData(mine)` check, then adjust
`progressionProposals`:

- **Gate:** `advance` / `level-up` / `graduate` are emitted only if, *when coached
  data exists*, trailing coached accuracy clears a threshold (e.g. ≥ 80 over the
  last ~2 coached sessions).
- **Cold-start fallback (required):** if there is **no** coached data for an item,
  behave exactly as today — rating-only, never withheld. The coach must never make
  existing suggestions *worse* for un-coached practice.
- **Forgiving:** one low coached session doesn't gate; it takes a sustained low
  reading.

**Progress** gains a per-exercise **accuracy trend**, derived from coached
sessions, rendered alongside the existing tempo trend.

### 7. Performance

The recon flagged the per-frame AMDF scan as the first thing to optimize. The
coach sidesteps it: because it **knows the expected notes**, it clamps
`detectPitch`'s `minF`/`maxF` to a tight band around the target, so each frame
searches far fewer lags. Cheap enough to stay on the main thread for v1. A Web
Worker / AudioWorklet is documented as the escape hatch if a real device lags.

## Non-goals

- Polyphonic / true-chord pitch detection (arpeggio is the chord story for v1).
- Timing/evenness grading (deferred).
- Accordion and prose-only coaching.
- Any auto-change to a user's set, level, or track — suggestions only, always
  confirmed.
- A Web Worker in v1.

## Testing

- **Web (automated, must stay green):**
  - `npm test` — extend with `test/coach.test.mjs`: **matcher + scorer** as pure
    functions over synthetic played-note streams. Cases: clean run; wrong note;
    octave slip (forgiven on guitar, failed on piano); missed note + lookahead
    recovery; repeated note; arpeggio order; muted-string advisory; keyboard
    voicing routed to arpeggio.
  - `npm run test:audio` — extend `generate-fixtures.py` with a rendered **scale**;
    assert an end-to-end clean run (detection → stabilizer → line grader) scores
    ~full. (Arpeggio + octave-strict logic are covered by the synthetic unit
    tests, including a C5 event that must **not** satisfy a C4 target.)
- **Native (manual device checklist — can't run here):**
  - Mic permission prompt (desktop + Android via Capacitor `RECORD_AUDIO`).
  - Live latency feels responsive; green-on-catch isn't sluggish.
  - CPU cost acceptable on a real phone (the main-thread bet); note if the worker
    escape hatch is needed.
  - Single-note line and arpeggio both usable by ear on a real instrument.

## Risks / notes

- **Segmentation is the hardest part.** Pitch-change-primary segmentation is more
  robust than attacks for legato, but very fast runs and ornaments will still
  blur. Honest limit: the coach is for *deliberate* practice tempo, not shred.
- **Clean-ring / muted-ring detection is low-confidence** (buzz is spectral, not
  loudness). Both are advisory-only by design. They are **in scope for the first
  milestone** (per the user's call), but **built last within it**, behind the
  reliable single-note core — risk-sequencing, not droppable scope.
- **Octave-bias must disambiguate, not override.** It may only resolve genuinely
  ambiguous frames toward the target — a confidently wrong octave must still read
  wrong, or piano strictness is meaningless. Covered by the C5≠C4 test.
- **The gate adds a path where bad detection → bad advice.** Mitigated by the
  cold-start fallback and the "sustained low, not one-off" rule.
- **Document the honest limits** in the README, in the voice of the existing
  "Listener notes" — what the coach grades, what it can't, and why accordion and
  chords-as-strummed are out.

## Files

**New:**

- `src/coach.js` — pure stabilizer + segmentation + matcher + scorer.
- `src/useCoach.js` — hook wiring mic stream → pipeline → live state + score.
- `src/CoachPanel.jsx` — live diagram + summary UI, inside the lesson sheet.
- `test/coach.test.mjs` — matcher/scorer unit tests.

**Edited:**

- `src/audio/dsp.js` — expose clarity/confidence via `detectPitchDetailed`; the coach narrows `minF`/`maxF` itself (existing option, no new API).
- `src/audio/notes.js` — expected-sequence builder (octave policy, sequence-vs-block,
  gradeability).
- `src/LessonSheet.jsx` — **Coach me** button + `CoachPanel` mount.
- `src/App.jsx` — log handoff carrying `accuracy`/`coached`/`missed` into `commitLog`.
- `src/engine.js` — `trailingAccuracy`/`hasCoachedData`; gate in `progressionProposals`; bump `SCHEMA_VERSION` to 4.
- `src/storage.js` — v3 → v4 migration block in `migrate()`.
- `src/styles.css` — coach panel + summary styling.
- Progress view (in `App.jsx`) — accuracy trend.
- `test/audio/generate-fixtures.py` — scale + arpeggio fixtures.
- `README.md` — "how the coach works" + honest limits; "Make it yours" table;
  "What's next".

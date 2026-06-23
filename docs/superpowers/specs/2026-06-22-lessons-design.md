# Woodshed Lessons — Design

**Date:** 2026-06-22
**Status:** Approved design, pending implementation plan

## Problem

Woodshed tells you *what* to practice but never *how*. An exercise reads
"Play through a 4-chord song, counting or singing along to hold the time" — and
leaves you to figure out which four chords, how to hold them, and what you're
building. The terse `desc` field gives a prompt, not teaching. This is uniform
across the whole library and the skill tracks.

## Goal

Every exercise gains an optional, hand-authored **lesson** that makes it
self-contained: the concrete specifics (which chords/notes, drawn), the how-to
steps, the common mistakes, and an audio demo. The user should be able to start
cold without leaving the app for YouTube.

Scope confirmed during brainstorming: fill in **the concrete specifics** and
**the how-to/technique** (not primarily motivation/"why", and not just pointers
to external instruction — the app teaches it itself).

## Non-goals (deliberately deferred)

- **LLM generation.** The README flags a local-model (LM Studio) path. We do
  *not* build it here, but the lesson schema is designed so a model could later
  fill the same fields. Rationale: a local model can hallucinate wrong chord
  shapes/fingerings, which is actively harmful for a beginner; hand-authored
  content is correct, deterministic, and offline.
- **Accordion Stradella bass-button diagrams.** Text-described for now; the
  keyboard renderer covers the accordion's right hand.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Content source | Hand-authored, baked into the app's data |
| Depth | Concrete shape + 2–3 how-to steps + 1–2 "watch for" notes |
| Presentation | Slide-up sheet, reusing the existing `ws-sheet` pattern |
| Rendering kit | One fretboard renderer (guitar+bass), one keyboard (piano+accordion RH), text prescriptions for rhythm/technique |
| Coverage | All ~50 curated items, all four instruments |
| File layout | Lessons split per instrument under `src/lessons/` |
| Audio demos | **In scope**, derived from shape data |

## Architecture

### 1. Lessons are static, keyed by exercise id, never persisted

New directory `src/lessons/` with one file per instrument plus an index:

```
src/lessons/
  guitar.js      // export default { "gtr-song": {…}, "trk-gtr-1": {…}, … }
  piano.js
  bass.js
  accordion.js
  index.js       // merges all four; exports getLesson(id) -> lesson | null
```

`getLesson(id)` is called **at render time** by the lesson id (the stable
exercise/stage id). Lessons are **never copied into `localStorage`**.

Consequences (all intended):
- **Existing users get lessons with zero migration** — the lookup keys off
  stable seed/track ids, which are already in their saved library.
- Editing an exercise's title/difficulty/length never affects its lesson.
- User-added exercises (custom ids) simply have no lesson — handled gracefully
  (no "Learn" affordance shown).

This sidesteps the README's "editing `SEED` only affects fresh installs"
caveat: because lessons resolve by id at render rather than being seeded into
storage, updates reach everyone.

### 2. Lesson schema

```js
{
  summary:   string,        // 1–2 sentences; the concrete framing, richer than `desc`
  shape:     Shape | null,  // the drawn specifics; null for rhythm/technique drills
  prescribe: string | null, // precise "what to do today" for drills with no shape
  bpm:       number | null, // default tempo for audio demo / click; optional
  steps:     string[],      // ordered how-to (required, 1+)
  watch:     string[],      // common mistakes / what "good" feels like (0+)
}
```

`Shape` is a discriminated union on `kind`:

```js
// Guitar / bass chord(s). strings are low→high; entries are fret number,
// 0 (open), or "x" (muted). One or more chords per lesson.
{ kind: "chords", instrument: "guitar" | "bass",
  chords: [ { name: "G", strings: [3,2,0,0,0,3], fingers?: [2,1,0,0,0,3] }, … ] }

// Guitar / bass single-position scale or pattern across several frets.
{ kind: "fretboard", instrument: "guitar" | "bass",
  baseFret: number, dots: [ {string, fret, label?} ] }

// Piano / accordion right hand. Notes with octave; optional fingering.
{ kind: "keyboard",
  notes: [ {name:"C", octave:4}, … ], fingers?: [1,2,3,1,2,3,4,5] }
```

Only `kind: "chords"` and `kind: "keyboard"` are required for v1 coverage;
`fretboard` (scale patterns) is included for pentatonic/scale exercises and
may be authored as `prescribe` text where a diagram doesn't add much.

### 3. Pitch mapping (pure, node-testable) — `src/audio/notes.js`

Turns shape data into frequencies so the audio demo needs no separate authoring.

- Open-string MIDI, low→high:
  - Guitar: E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
  - Bass:   E1=28, A1=33, D2=38, G2=43
- Chord/fretboard: `midi = openMidi[stringIndex] + fret` (skip `"x"`).
- Keyboard: `{name, octave}` → MIDI via the 12-tone table.
- `freq = 440 * 2^((midi - 69) / 12)`.

Exports: `shapeToFrequencies(shape) -> number[][]` (one array per chord/strum
group; scales/keyboards return one group per note). Pure — covered by tests.

### 4. Audio synth — `src/lessonAudio.js`

Web Audio, oscillator-based (no audio files; consistent with offline ethos and
the existing `useMetronome.js` scheduler). AudioContext is created on the user
gesture (the "Hear it" tap).

- `playChords(freqGroups, {bpm, strum:true})` — schedules each group as a bar;
  within a group, notes are staggered ~25ms (a strum); each note is a triangle
  oscillator through a lowpass with a short AD envelope (~1.2s decay).
- `playSequence(freqGroups, {bpm})` — one note per beat (scales, melodies).
- `playClick({bpm})` — reuses the metronome click for prescribe-only drills.
- `stop()` — stop and release.

The `LessonSheet` picks the call from `shape.kind` (chords → `playChords`,
keyboard/fretboard → `playSequence`, none → `playClick` at `bpm`).

### 5. Diagram renderers (pure SVG) — `src/diagrams.jsx`

- `ChordDiagram({ instrument, strings, fingers })` — vertical fretboard, 4 or 6
  strings; dots for fretted notes, o/× markers above for open/muted.
- `Keyboard({ notes, fingers })` — white/black keys, highlighted notes with
  optional fingering numbers.
- `FretboardPattern({ instrument, baseFret, dots })` — multi-fret pattern for
  scales/boxes.

Styling via new rules in `src/styles.css`, matching the existing palette
(diagram dots use `--gold`; strings/frets use muted lines).

### 6. UI integration — `src/LessonSheet.jsx` + edits to `src/App.jsx`

- **Learn affordance.** On any exercise card, render a "Learn" control **only
  when `getLesson(id)` exists**. Added to `SessionItem` (Today) and the
  equivalent rows in Library and Tracks.
- **LessonSheet.** New component built on the existing sheet markup
  (`ws-sheet-wrap` / `ws-sheet` / `ws-sheet-grip`) and the `useEscape` hook
  (`App.jsx:270`), so click-outside-to-close, Escape, and grip styling are
  reused. Rendered from the root the same way as `LogSheet` / `PracticeSheet`
  (`{lessonFor && <LessonSheet … onClose={…} />}`).
- **Sheet contents, in order:** title + tags · `summary` · shape diagram (if
  any) · "▶ Hear it" button · `prescribe` (if any) · numbered `steps` ·
  "Watch for" `watch` list · the existing `link` (if present) as a footer
  "Go deeper" link. External instruction stays one tap away — a bonus, not the
  primary path.

## Content authoring

The bulk of the work: ~50 correct lessons (29 library items + 20 track stages),
all four instruments. Authored into the per-instrument files in `src/lessons/`.
Correctness of musical content (chord shapes, fingerings, note names) is the
top priority — these are verified against the pitch-mapping tests and by ear via
the audio demo during review.

## Testing

Consistent with the existing Node-script test approach (no UI framework is
installed; `npm test:audio` etc. are plain `node` scripts):

- New `test/lessons.test.mjs`:
  - **Schema validation** over every lesson: required `summary` + `steps`;
    valid `shape.kind`; chord `strings` arrays well-formed (length 4 or 6 to
    match `instrument`); fingering lengths consistent; no lesson keyed to an id
    that doesn't exist in `SEED` or `trackItems()` (no orphans).
  - **Pitch correctness** via `src/audio/notes.js`: e.g. the G-major guitar
    shape `[3,2,0,0,0,3]` → MIDI `[43,47,50,55,59,67]` (G2 B2 D3 G3 B3 G4) →
    expected frequencies.
- Add an `npm` script (e.g. `"test:lessons"`).
- The SVG renderers and the live audio path are verified **visually/by ear**,
  the same way the microphone/audio UI is verified on-device (documented limit).

## Files

**New:** `src/lessons/{guitar,piano,bass,accordion,index}.js`,
`src/audio/notes.js`, `src/lessonAudio.js`, `src/diagrams.jsx`,
`src/LessonSheet.jsx`, `test/lessons.test.mjs`.
**Edited:** `src/App.jsx` (Learn affordance + sheet wiring),
`src/styles.css` (diagram + lesson-sheet styles), `package.json` (test script),
`README.md` (document the lessons feature).

## Risks / open notes

- **Authoring volume.** 50 lessons is the real cost; the implementation plan
  should sequence it instrument-by-instrument so each is reviewable.
- **Musical correctness.** Mitigated by the pitch test + audio-by-ear review.
- **Sheet a11y.** Match the existing sheets exactly; do not regress. (Full
  `role="dialog"` focus-trapping remains a separate, pre-existing TODO.)

## Future

When the LM Studio path lands (`generateSession` swap point in the README), a
model can populate the same `lesson` fields for exercises without authored
content — the schema and renderers already accommodate it.

# Ear Training — Design

**Date:** 2026-07-12
**Status:** Approved design, pending implementation plan

## Problem

The exercise taxonomy has had an `ear` type since day one, but the app has
exactly one ear exercise (`pno-ear`, "Transcribe by ear") and gives it no
support — the card just tells you to go do it. Meanwhile the two halves of a
real call-and-response loop already exist and are hardened:

- the lesson synth (`src/lessonAudio.js`) can play any note sequence and
  reports how long it will take (`playSequence` returns its duration in ms);
- the coach (`src/coach.js` + `src/useCoach.js`) can stabilize mic input into
  confirmed notes and grade them against an arbitrary target sequence
  (`gradeLine`), with per-instrument detector routing (accordion → spectral)
  already handled.

What's missing is the connective tissue: something to *generate* a phrase the
player hasn't seen, play it, listen to the echo, and grade it — without ever
showing the answer mid-attempt.

## Goal

Ear exercises that rotate into daily sets like any other library item. Each
opens a call-and-response session: the app plays a short phrase, you play it
back, the coach grades it. Accuracy logs through the existing coached-accuracy
path and feeds the same progression gating.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Integration | **Library exercises**, scheduled and logged like everything else. (A free-practice "ear gym" tool is a possible later addition, not in scope.) |
| Content ladder | **Intervals → phrases.** Diff 1–2: two-note interval echoes. Diff 3: three-note diatonic phrases. Diff 4–5: four-to-six-note phrases with wider leaps. One generator, difficulty-scaled. |
| Help ladder | **Tightens with difficulty.** Every prompt naturally sounds its first note; diff 1–2 additionally *names* it ("starts on C4") and allows unlimited replays; diff 3 drops the name and allows 2 replays; diff 4–5 allow 1. |
| Octave policy | **Forgiving at every difficulty** (`octaveStrict: false`). The synth's octave may not sit where the player's instrument does; the ladder tightens via hints and replays, never via octave. |
| Hidden targets | During an attempt the target notes are **never shown** — blank pips with status color only. Names appear at reveal. The CoachPanel "looking for X" hint is likewise omitted in ear mode (it would name the answer); only "hearing X" shows. |
| Timing / evenness | **Not read.** Ear training tests recall, not rhythm; phrases are ≤ 6 notes anyway (evenness needs ≥ 4 confirmed notes to say anything). |
| Grading core | **`gradeLine` unchanged.** Ear rounds feed it ordinary `{ midi, label }` targets. |
| Existing users | New seed items ride the **existing `mergeContent` path** — `src/engine.js` already appends missing default content by id on every load (it's how new track stages reach existing users). No migration, no schema bump. |

## Delivery boundary

**In scope:** phrase generator + round machine (pure, tested); `EarPanel` UI in
the lesson sheet; ear exercises in the seed for all four instruments with
hand-authored lesson entries; logging through the existing coached-accuracy
handoff; README updates.

**Deferred / non-goals:** a standalone free-practice ear tool; ear stages in
skill tracks; ear support for user-added custom exercises (they have no lesson
entry, so they behave like any other lesson-less item); chord-quality or
harmonic dictation; any change to `coach.js`, `useCoach.js`, or the engine's
suggestion logic.

## Architecture

### 1. Phrase generator — pure, in new `src/ear.js`

```js
generateRound({ diff, ear, rng })
// ear: the lesson's config { range: [loMidi, hiMidi], keys: [...], bpm }
// → { targets: [{ midi, label }], promptVoices: [[freq], ...], bpm }
```

- `targets` are in the exact shape `gradeLine` consumes; `label` is the note
  name with octave ("C4") for the reveal chips.
- `promptVoices` come straight from the target midis via `midiToFreq`, in the
  shape `playSequence` consumes — the prompt always sits inside the
  instrument's configured range.
- Difficulty mapping:
  - **1:** two notes; interval drawn from {M2, m3, M3, P4, P5}, either direction.
  - **2:** two notes; any interval up to P8, either direction.
  - **3:** three notes, diatonic in a key drawn from `ear.keys`; steps and thirds.
  - **4:** four–five notes, diatonic; leaps to a sixth.
  - **5:** five–six notes; leaps to an octave, chromatic neighbors allowed.
- `diff` is the item's *current* difficulty — so the engine's existing
  level-up/ease-off suggestions walk the ear ladder with no ear-specific code.
- `rng` is a caller-supplied PRNG (`mulberry32(seed)` exported alongside).
  Tests pass fixed seeds; the app seeds per session. The generator holds no
  state and touches no globals.
- `intervalLabel(prevMidi, curMidi)` helper ("↓m3", "↑P4") — used for missed
  labels and trouble-spot memory.

### 2. Round machine — pure, also in `src/ear.js`

```js
createEarSession({ diff, ear, rounds = 5 })
```

A plain state object stepping `idle → prompt → listen → reveal → (prompt … | done)`
with methods `begin(rng)`, `promptEnded()`, `replay()`, `roundGraded(result)`,
`next(rng)`, and `summary()`. No React, no audio, no timers — the panel drives
transitions, so the whole session flow unit-tests as data.

- Replay budget per round, reset each round: diff 1–2 unlimited, diff 3 two,
  diff 4–5 one. `replay()` throws nothing and does nothing when exhausted —
  the panel disables the button off the exposed count.
- `roundGraded` stores the round's `{ accuracy, missed }` (missed as interval
  labels via `intervalLabel`).
- `summary()` → `{ accuracy: round-mean (rounded), missed: aggregated labels, rounds }`.

### 3. `EarPanel.jsx` — the session surface

Mounted by the lesson sheet (see §4), mirroring CoachPanel's restraint:

- **prompt:** panel stops the mic if open, calls `playSequence(promptVoices, { bpm })`,
  and waits out the returned duration + 250 ms before entering listen. The mic
  is **never open while the synth plays** — the coach must not grade its own
  prompt. Replays repeat this cycle with the same targets.
- **listen:** `useCoach` runs with the round's targets (`mode: "line"`,
  `octaveStrict: false`, `inst` from the item — accordion routes spectral for
  free). Display: one blank pip per target, colored by status
  (caught/missed/pending), a "note 2 of 4" cursor, and a "hearing G3" line.
  At diff 1–2 a "starts on C4" line shows above the pips. The round auto-ends
  when `gradeLine` reports `done`; a **Reveal** button ends it early (unplayed
  targets stay pending and count against accuracy — `gradeLine`'s existing
  contract).
- **reveal:** pips flip to labeled chips (existing `ws-coach-chip` styles),
  plus the round score. **Next** advances; after the last round, the session
  summary: rounds clean, overall accuracy, "to revisit" as interval names.
- **Log it →** hands `{ accuracy, missed }` to the same
  `onLog → onCoachResult(item.id, …) → onRequestLog` chain CoachPanel uses;
  the entry gets `coached: true` exactly as today.
- Trouble-spot memory reuses CoachPanel's pattern verbatim: interval labels
  that past sessions missed ≥ 2 times surface as "Trouble spots last time:
  ↓m3" before the session starts.
- Per-round mic handling follows CoachPanel's launch discipline: targets only
  change while the mic is stopped (`runToken` pattern), so the rAF loop never
  sees a mid-run target swap.

### 4. Lesson sheet mount

In `LessonSheet.jsx`:

- render `<EarPanel …>` when `lesson.ear && onCoachResult && onRequestLog`;
- hide the generic "▶ Hear it" button when `lesson.ear` (the prompt lives
  inside the round flow; the shapeless fallback would just play a click);
- CoachPanel's gate needs no change — `isCoachable` requires `lesson.shape`,
  and ear lessons have none.

### 5. Content — seed items + lesson entries

- Two ear exercises per instrument in `SEED` (piano, guitar, bass, accordion):
  an intervals item starting at **diff 1** and a phrases item starting at
  **diff 3**, with honest `min` estimates. An item's diff is a single number;
  as level-up suggestions raise it, the generator tightens automatically (§1).
  The existing `pno-ear` transcription card stays as-is — self-directed
  transcription is a different (worthwhile) activity.
- Each new item gets a lesson entry in new `src/lessons/ear.js` (merged in
  `lessons/index.js`): the usual `summary` / `steps` / `watch`, a `prescribe`
  line (the lesson schema requires shape *or* prescription, and it reads well
  in the sheet), **no `shape`**, plus the `ear` config block
  `{ range, keys, bpm, rounds }` with per-instrument ranges (e.g. bass sits
  low, piano centered).

### 6. Reaching existing installs — no migration

`mergeContent` (`src/engine.js`) already appends any default content missing
from a saved library, by id, on every load — it's how newly added track stages
reach existing users. The ear exercises simply join `SEED` and ride it: no
schema bump, no `storage.js` change, nothing to run once. A user who *hides*
an ear exercise keeps it hidden — the item is still present, so nothing
re-appends. (An earlier draft specified a v4 → v5 append migration; it was
redundant with this existing mechanism and is dropped.)

### 7. Engine

No changes at all. Ear exercises are ordinary
library items: the scheduler rotates them by the same overdue/difficulty
logic, and accuracy gating already reads coached log entries.

### 8. Errors & edges

- Mic errors surface through `useCoach`'s existing error strings, rendered as
  in CoachPanel.
- Silence during listen: targets stay pending; Reveal shows them as not
  caught. No special casing.
- A `prompt → listen` transition races nothing: the panel holds a single
  timeout keyed on `playSequence`'s returned duration, cleared on unmount
  (same discipline as LessonSheet's `hear`).

## Testing

New `test/ear.test.mjs`, wired into `npm test` as `test:ear`:

- **Generator:** same seed → identical rounds; per-diff constraints hold over
  many seeded draws (interval-set membership, phrase length, range bounds,
  diatonic membership for diff 3–4); labels well-formed.
- **Round machine:** a full scripted session (begin → prompt → listen →
  reveal → … → done); replay budget enforcement per diff; summary math
  (round-mean accuracy, missed aggregation).
- **Lesson schema:** `test/lessons.test.mjs` gains an ear-config check (range
  spans ≥ an octave so P8 prompts fit, keys the generator knows, sane
  rounds/bpm, shapeless-with-prescribe).
- **Grading:** no new tests — `gradeLine` is untouched and already covered by
  `test/coach.test.mjs`.

UI verification is manual on-device, matching house practice (no jsdom/RTL in
this repo).

## README updates

- The coach section gains an ear-training paragraph: what a session looks
  like, the help ladder, octave-forgiving grading, hidden-targets honesty.
- The "ear" type moves from implicitly unsupported to supported.
- The seed-editing note gains a line: newly *added* default items (like these)
  reach existing installs automatically via the content merge; the "seed edits
  need a reset" caveat only applies to edits of existing items.

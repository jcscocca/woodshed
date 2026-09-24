# Woodshed — current direction

**Set:** 2026-09-23, after a full code + content review.
**Supersedes:** the README's *What's next* section and the roadmap in earlier specs.

## What Woodshed is now

A **desktop-first practice app for piano and guitar.** The loop: a short daily
set → a lesson for each item → log how it went → see progress. No account, no
server; data lives in the browser.

## Decisions

| Area | Decision |
|---|---|
| Instruments | **Piano and guitar only.** Bass and accordion are archived, not deleted (see *Archive*). |
| Platform | **Desktop-first.** A wide three-pane layout at ≥1024px — sidebar nav, main view, persistent practice rail (metronome + stopwatch on top; lesson or tuner below). The phone layout stays as-is below 1024px. Installable from Chrome/Edge; works offline. |
| Data | Fresh start on desktop. No sync, no migration from the phone. |
| Piano input | **USB-MIDI (Web MIDI), piano only.** Its own spec. Guitar stays on the microphone; nothing MIDI touches guitar code paths. |
| Progression | **Tracks drive progression.** The only suggestion kept is "ready for the next stage." |
| Pitch coach + Echo | **Disabled, code kept** behind one flag. Up for a rethink — see below. |

## Cut

- **Loom** (canvas art mode).
- **Adaptive difficulty** — the per-instrument level (`levelFor`) and the
  level-up / ease-off / rotate-out suggestions. They relabeled a difficulty
  number without changing what you practice.
- **Song spacing** — spaced repetition applied to one or two placeholder songs.
- **Daily reminder** — only ever fired while the app was already open.
- **Tuner tempo estimate.** The tuner itself stays.

## Archive

Bass and accordion content (seed items, tracks, lessons, Echo items) moves to
`archive/` out of the build, and the last four-instrument version is tagged
`four-instruments`. Loading this version over saved four-instrument data drops
the bass/accordion items and sessions — export first if that history matters.

## Open: pitch coach rethink

Disabled because mic grading proved fragile (the review found a chord-scoring
cascade, double-counted notes, mic leaks and a too-narrow octave window — all
since fixed) and because it only covers lessons with a diagram: 5 on piano,
13 on guitar. The rethink should answer:

1. Does the coach come back **piano-first over MIDI**, where grading is exact
   and chords work as played?
2. Is mic grading for **guitar** worth keeping, and for which lesson kinds?
3. Does **Echo** return over MIDI, and on guitar at all?

The review's coach fixes are merged, so the code is correct when re-enabled.

## The real gap: content

Each instrument has ~15 thin items (average lesson: 71 words, 3 steps); 33 of
59 lessons have no diagram; several "exercises" are placeholders ("Your current
piece", "A four-chord song"). The machinery outran the content. With two
instruments instead of four, content work goes deeper: fuller piano and guitar
tracks, a diagram and demo on every lesson that can have one, and real songs.

## Parked

Android/Capacitor app, local-model exercise generation, push-backed reminders,
cross-device sync. Specs stay in `docs/` for reference.

## Order of work

1. Land the review fixes (three lanes), minus items the cuts make moot.
2. Cuts, archive, and the coach/Echo disable flag.
3. Desktop layout — spec → plan → build.
4. Piano over MIDI — spec → plan → build (piano-only; the coach rethink for
   piano happens here).
5. Content — deepen piano and guitar tracks and lessons.

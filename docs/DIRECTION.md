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
13 on guitar. The rethink asked three questions; the piano one is decided, the
guitar ones stay open:

1. **Decided, piano:** the coach is back **piano-first over MIDI** (its own
   spec, `docs/superpowers/specs/2026-09-24-piano-midi-design.md`). Grading is
   exact — MIDI pitch needs no stabilizer: rolled chords grade in order, and
   the two hands-together scale lessons grade each hand as its own line (a
   pair counts when both hands got it). Mic grading stays off for piano; there's no
   fallback. `COACH_ENABLED` (mic) stays `false` throughout.
2. **Open:** is mic grading for **guitar** worth keeping, and for which lesson
   kinds?
3. **Decided, piano; open, guitar:** **Echo** returns over MIDI for piano
   (intervals and short phrases, band dark during the prompt). Whether it
   returns on guitar at all is still open.

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
   piano happens here). **Done.**
5. Content — deepen piano and guitar tracks and lessons. Split into two
   projects: the notation engine — grand-staff pieces, wait mode and
   play-along grading, the tempo ladder, sight-reading drills (its own spec,
   `docs/superpowers/specs/2026-09-26-notation-pieces-design.md`) — is
   **done**. Piano content — its own spec,
   `docs/superpowers/specs/2026-09-27-piano-content-design.md` — is **done**
   too: 22 scored stages across three tracks (**Pieces**, **Pop from
   chords**, **Two-hand technique**), plus "Your song" for typing in any
   song's chords. **Next: guitar content**, its own spec. Parked: any-voicing
   chord grading, swing/shuffle feel, compound metres (6/8, 3/8), and "Hear
   this section"/the app playing the other hand — the last two until the
   metronome and the lesson synth share one AudioContext.

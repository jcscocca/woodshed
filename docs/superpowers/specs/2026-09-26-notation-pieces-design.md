# Notation and Pieces — Design

**Date:** 2026-09-26
**Status:** Approved design, pending implementation plan
**Direction:** [docs/DIRECTION.md](../../DIRECTION.md) — step 5 (content), project 1 of 2: the engine that piano content will be written in. Project 2 (piano content) gets its own spec.
**Builds on:** [2026-09-23-desktop-layout-design.md](2026-09-23-desktop-layout-design.md), [2026-09-24-piano-midi-design.md](2026-09-24-piano-midi-design.md).
**UI review:** §1 is a second-opinion layout (prototyped against the real panes at 1440×900 and 1024) and was adopted as-is.

## Problem

The owner is an early-intermediate pianist who wants to play pop songs from
chord charts and written classical pieces. Woodshed shows only keyboard
diagrams and note names, white keys only, one short shape per lesson. It can't
show sheet music, can't hold a piece, and can't train reading — while MIDI now
makes exact grading of written music possible.

## Goal

A notation engine for piano (desktop layout, MIDI connected): pieces shown as a
grand staff and practised with section loops, hands separately, a wait mode and
a graded play-along (notes **and** rhythm against the metronome) with a tempo
ladder; plus generated, leveled sight-reading drills.

## Decisions

| Decision | Choice |
|---|---|
| Format + renderer | ABC notation text, rendered by **abcjs** (MIT, 6.7.x), lazy-loaded (~500 KB). One abcjs source line = one 4-bar system. |
| Grading | Notes + rhythm: each written onset has an expected time against the metronome; on / early / late / missed / wrong. Separate notes % and rhythm %. |
| Drills | Generated, leveled (10 levels), seeded, never the same twice. |
| Piece tools | Section loops, hands separately, wait mode, tempo ladder — all four. |
| Placement | The score opens in the main pane as the open item's lesson; controls in the rail; 88-key band below (see §1). |
| Scope | Piano only, desktop only. Guitar untouched; phone shows the text lesson plus "Open on the desktop to read the score". |

## Non-goals / deferred

Focus mode; zoom; smooth auto-scroll; a "Pieces" nav view; phone score;
**"Hear this section"** and **the app playing the other hand** (both need the
metronome and the lesson synth on one audio clock — move the AudioContext into
PracticeProvider first, in a later project); 6/8 and other non-quarter-beat
meters; pickup (anacrusis) bars; the 61-key band; pop arrangements and more
pieces (project 2).

---

## 1. Placement (desktop, piano enabled)

```
┌──────────┬───────────────────────────────────────────┬──────────────────┐
│ Woodshed │ Minuet in G · G major · 3/4 · bars 9–12    │ ●●●    84 bpm    │
│ streak   │                                            │ [−][ Start ][+]  │
│  Today  1│  𝄞/𝄢  bars 5–8    (dimmed: outside section)│ ⏱ 00:00 [▶][↺] Tuner│
│  Tracks 2│▎𝄞/𝄢  bars 9–12   ← cursor, hits/misses     ├──────────────────┤
│  Library3│  𝄞/𝄢  bars 13–16  (read-ahead)             │ SCORE          ✕ │
│ Progress4│                                            │ Section [A][B][all] 9–12│
│ ▸ Score 5│                                            │ Hands [Both][RH][LH]│
│          │                                            │ Mode [Wait][Play-along]│
│⚙ Settings│                                            │ Tempo 84 → 100   │
│          │                                            │ [ ● Start     C ]│
├──────────┴────────────────────────────────────────────┼──────────────────┤
│ 88 keys · held keys lit · wait mode: next keys outlined │ count-in / bar 10│
└─────────────────────────────────────────────────────────┴──────────────────┘
```

1. **The score is the open item's lesson**, rendered in the main pane while
   `lessonFor` is a scored item (its lesson has `score` or `sightread`). No new
   permanent nav view.
2. **Sidebar "Score" entry** (key **5**, `aria-current`) appears while a scored
   item is open; 1–4 still switch views and 5 returns; closing the lesson
   (Esc / ✕) removes the entry.
3. **Stage:** width = min(main − 72, 1000), centred; `overflow: hidden` (the
   stage owns its height; no page scroll); a 36px header (title · key · metre ·
   section). Always **4 bars per system**, abcjs `oneSvgPerLine`, scale 1.25,
   `foregroundColor: var(--text)`.
4. **Window of S systems**, S = floor(stage height / 205) (3 at 900 tall, 4 at
   1080). **Replace above:** when the cursor enters the last visible system,
   the systems above refill with the following ones — the current line never
   moves, and ~8 bars ahead stay visible. Idle: ↑/↓, PgUp/PgDn and the wheel
   move by one system.
5. **Sections never re-layout:** bars outside the section dim to 35% opacity;
   the window shows the systems containing it. Click a bar number = section
   start, shift-click = end. Rail presets (the score's named sections + "all")
   and from–to inputs mirror it.
6. **Feedback on the staff only** during a score run, reusing the coach
   palette: on time `#7fc4bc`, early/late `var(--gold)`, wrong/missed
   `#e8916f`; the current system gets a 2px `--gold-dim` left marker. The band
   shows held keys, plus the next keys outlined (with fingers when known) in
   **wait mode only** — never hit/miss.
7. **Controls live in the rail slot** (title, section, hands, mode, tempo,
   Start, then the summary). The lesson's steps shrink to a short "Notes" block
   under Start. Keep Start above the fold; the summary may scroll.
8. **Lesson snippets** (a scale, a pattern) render in the rail at scale 0.9, at
   most 2 systems of 2 bars, static (no cursor, no grading); shown even when
   the band hides the keyboard diagram.
9. **Sight-reading** uses the same stage: one system of 2–4 bars (2-bar drills
   at half width), always play-along with a count-in; **New drill** (N)
   replaces it in place.
10. **Summary:** colours persist until the next pass; "to revisit" bars get an
    outline; the rail shows notes % · rhythm % · extras · to revisit (buttons
    set the section) · [↻ again] [↑ next tempo] [Log it →].
11. **1024–1279px:** 2 bars per system at the same scale; supported, not tuned.
12. **Loading:** abcjs loads when a scored item opens; three 200px slabs show as
    a skeleton meanwhile.

## 2. Architecture

- **`src/score/scoreModel.js`** (pure; node-tested): `parseScore(abc, abcjs)`
  → `{ meter: [n, 4], key, bars: [{ n, beat }], notes: [{ midi, beat, dur,
  bar, hand, onset }] }` from `abcjs.parseOnly(abc)[0].setUpAudio()` (verified
  to work without a DOM). `abcjs` is passed in so the browser can lazy-load it
  and tests can `import` it. Beats are quarter notes from the start of the
  piece; `bar` from the metre (no pickups); `onset` groups notes starting on
  the same beat. **ABC convention:** voice 1 = right hand, voice 2 = left
  hand; a one-voice score's hand comes from its clef (treble = RH, bass = LH).
  Helpers: `inSection(notes, from, to)`, `forHands(notes, hands)`.
- **`src/score/timedGrade.js`** (pure): `gradeTimed(targets, events, { t0,
  bpm, now })`. Each target's expected time = t0 + (beat − sectionStartBeat) ×
  60000 / bpm. A same-pitch event nearest the expected time within **±180ms**
  matches it: |Δ| ≤ **60ms** → `on`, else `early` / `late`. A target whose
  window has passed (`now` > t + 180) unmatched → `missed`; before that →
  `pending`. Events matching no target → `wrong` (kept with their nearest bar
  for the summary). Every target has its own window, so a slip never shifts
  later notes. Returns `{ statuses, notesPct = hits / targets, rhythmPct = on /
  hits, extras, revisitBars, done }`. **Clean pass** = notes ≥ 90% and rhythm ≥
  80%.
- **`src/score/waitGrade.js`** (pure): onset groups in the played hands; the
  current group advances once each of its notes has been pressed since it
  became current (so rolled chords work); a wrong press is recorded and flashes
  but never advances. Result: notes found, wrong presses and the bars they
  were in. Wait-mode runs are **not logged** as coached accuracy.
- **`src/score/sightread.js`** (pure): `generateDrill(level, seed)` → ABC
  (§3), using the seeded PRNG already in `src/ear.js` (`mulberry32`).
- **`src/score/runStore.js`**: a small subscribable store (like
  `src/midi/overlay.js`): `{ section: { from, to }, hands, mode, run: {
  state: idle|countin|running|done, statuses, cursor, result }, readout }`.
  The stage, the rail panel and the band readout subscribe; App never does.
- **Components:** `ScoreStage.jsx` (main pane: header, the system window with
  replace-above, per-note colouring by mapping parsed notes to abcjs's
  rendered note elements — walk the rendered tune's voices accumulating
  durations, keyed by hand, beat and pitch — bar-number clicks, section
  dimming, skeleton, lazy abcjs); `ScorePanel.jsx` (rail: section, hands,
  mode, tempo/ladder, Start, summary, Log it; sight-reading level picker, New
  drill, level-up offer).
- **Metronome:** `useMetronome` gains `start({ countIn })` (one bar of clicks,
  then the run begins on the next downbeat) and `timeline()` → `{ t0, bpm,
  beatsPer }` on the `performance.now()` clock (mapped from the AudioContext
  clock via `getOutputTimestamp()`), so beats and MIDI timestamps share one
  clock. Opening a scored item sets beats-per-bar from its metre (the rail's
  2/4 3/4 4/4 buttons display it during a run). A run the panel started stops
  the metronome when it ends.
- **Tempo ladder:** a clean play-along pass raises the metronome by **4 bpm**
  (capped at the score's `target`); a messy pass holds. The tempo is
  remembered per item and section and restored when the section opens.
- **Data:** a lesson may carry `score: { abc, bpm, target, sections: [{ name,
  from, to }] }` or `sightread: { defaultLevel }`. Saved state gains
  `ladder: { [itemId]: { [sectionKey]: bpm } }` and `sightLevel: { [itemId]:
  level }` (`migrate()` defaults both to `{}`; schema version +1). A logged
  play-along run records `accuracy` (notes %), `rhythm` (rhythm %), `section`,
  `bpm` and `coached: true`, so it feeds the accuracy trend and the
  track-advance check.
- **App:** while a scored item is open the main pane shows `ScoreStage`
  instead of the current view and the sidebar shows "Score" (5). Phone:
  scored items show the text lesson plus "Open on the desktop to read the
  score".
- **Isolation:** piano only, desktop only; nothing outside `src/score/`, the
  stage/panel, App's routing, the metronome additions and the new lesson/data
  fields knows notation exists.

## 3. Sight-reading ladder and first content

**Ladder** (2 bars at the low levels, 4 at the top; every drill ends on the
tonic, fills its bars exactly, and moves mostly by step with some skips —
repeated notes are fine, since every note has its own time window):

| Level | New | Hands | Range / key | Rhythms |
|---|---|---|---|---|
| 1 | Reading one hand | RH | C4–G4, C major | quarters, halves |
| 2 | Bass clef | LH | C3–G3 | quarters, halves |
| 3 | Switching hands | RH and LH alternate by bar | both C positions | + wholes, 3rds |
| 4 | Hands together | RH tune; LH holds a root (C, F, G) each downbeat | C major | quarters, halves |
| 5 | Moving faster | same | RH C4–C5 | + eighth pairs |
| 6 | Three beats | same | same | 3/4, dotted halves |
| 7 | First sharp key | same | G major (F#) | same |
| 8 | First flat key | same | F major (Bb) | + dotted quarter–eighth |
| 9 | Longer, moving bass | LH root–fifth in quarters | C, G, F | 4 bars |
| 10 | Accidentals | same | up to D and Bb major | chromatic neighbour notes |

Default tempo 60 at level 1 rising to 72 at level 10; the rail metronome
changes it. The rail has a level picker; after **3 drills in a row** at notes
≥ 90% and rhythm ≥ 80% it offers **"Level up →"** (never automatic). The level
is saved per item.

**Content hooks (engine proof; project 2 adds the real content):**
1. **Sight-reading** (`pno-sight`) becomes the generated drill
   (`sightread: { defaultLevel: 1 }`); its placeholder text is replaced.
2. **Minuet in G major, BWV Anh. 114** (public domain), bars 1–16, sections A
   (1–8) and B (9–16): a new piano library item, type `song`, start tempo 72,
   target 100.
3. **C major scale, hands together** as a static rail snippet on the
   major-scales lessons (`pno-scales`, `trk-pno-3`), beside their existing
   coaching.
4. **"Your current piece" stays** for music from your own books.

## 4. Interaction rules

1. **Keys** (desktop, through `actionFor`'s typing/dialog guards; added to
   `KEY_HELP`): **C** start/stop the run (its existing meaning); **W** wait ↔
   play-along; **H** cycle hands; **N** new drill; **[ / ]** previous/next
   section; **5** Score; **↑/↓** move the window when idle.
2. **During a play-along run:** Space **stops the run** (amends the MIDI spec's
   "Space keeps toggling the metronome during a run" for score runs); ←/→ are
   ignored; **Esc** stops a run first and closes the score on a second press.
   The from–to inputs are covered by the typing guard and blur on Enter.
3. **Count-in:** Start drives the rail metronome — `start({ countIn: beatsPer
   })`; if it is already playing it restarts (one hiccup). Wait mode never
   touches the metronome.
4. **Hands separately:** the other staff dims and its keys are ignored.
5. **Wait mode, both hands:** an onset is every note starting there in the
   played hands; advance when all have been pressed; wrong presses flash and
   never advance.
6. **Accessibility:** each system SVG is `role="img"` "bars 9–12"; the stage
   container is focusable (`tabIndex=-1`) so keys work after a bar click;
   bar-number clicks are pointer-only (the rail inputs are the accessible
   path); the readout's `aria-live` announces count-in start, section changes
   and results — never bars at tempo; `prefers-reduced-motion` steps the
   cursor per onset and drops the pulse.
7. **Clocks:** use abcjs only for rendering and note ↔ element / pitch /
   duration; never its TimingCallbacks or CursorControl (their own
   `setTimeout` clock).
8. **abcjs quirk:** `staffwidth` is multiplied by `scale` above 1 but not below
   it — measure the rendered SVG box rather than computing it.

## 5. Testing

- **Unit (node):** `test/score.test.mjs` — `parseScore` on a two-voice
  grand-staff excerpt (pitches incl. key signature, beats, bars, hands,
  chords in one onset, one-voice clef → hand), `inSection`/`forHands`;
  `gradeTimed` (on/early/late at the 60 and 180ms edges, missed after the
  window, pending before it, wrong extras with bars, a slip not shifting later
  notes, repeated notes, chords, notes % / rhythm %, clean pass); `waitGrade`
  (advance only when all notes of a chord are pressed, rolled chords, wrong
  presses don't advance, hands filter); `generateDrill` for every level ×
  many seeds (parses, fills bars exactly, stays in range and key, ends on the
  tonic, deterministic per seed, level features present); the Minuet's
  sections parse to the right bar ranges; `migrate` defaults `ladder` and
  `sightLevel`; shortcuts W/H/N/[/]/5 and their guards.
- **Browser (dev, `?fakemidi`, 1440×900):** open the Minuet → stage with 3
  systems, sidebar "Score"; set section B by bar clicks; wait mode RH only
  (next note highlighted on staff + band outlines; wrong press flashes, no
  advance); play-along with count-in at 72 (drive onsets on time, one late,
  one wrong) → staff colours, readout bar numbers, summary with notes/rhythm %,
  a clean pass raises the tempo to 76 and it is remembered; Log it records
  accuracy + rhythm; the replace-above refill on a long section; sight-reading
  level 1 and level 7 drills (key signature), New drill, level-up offer after 3
  clean drills; the C-scale snippet in the rail; Esc/Space/←→ rules during a
  run; phone preset shows the fallback note; no console errors.
- **Gate:** `npm test` and `npm run build` pass on every commit; the
  production bundle loads abcjs as a separate lazy chunk.

## Acceptance criteria

1. Opening the Minuet (desktop, piano) shows a grand staff in the main pane, 4 bars per system, 3 systems at 900px tall, with a "Score" sidebar entry; the rail shows the controls.
2. Sections (presets, bar clicks, from–to) dim the rest without re-layout; hands separately dims and ignores the other staff.
3. Wait mode advances only on the right notes (chords when all are pressed); the band outlines the next keys.
4. A play-along run counts in one bar, grades every note on/early/late/missed/wrong with the stated windows, colours the staff, and summarises notes % and rhythm %; the system window refills above without moving the current line.
5. A clean pass raises the tempo 4 bpm toward the target, remembered per section; Log it records accuracy, rhythm, section and bpm.
6. Sight-reading generates valid drills for all 10 levels; New drill replaces in place; "Level up →" appears after 3 clean drills in a row.
7. The C-scale snippet shows in the major-scales lessons' rail; guitar and the phone layout are unchanged apart from the phone fallback note.
8. abcjs is lazy-loaded; `npm test` and `npm run build` pass.

## ABC authoring conventions

The engine grades the music as written: one walk over the parsed voices
(`walkTune` in `scoreModel.js`) gives both the grading targets and the stage's
note map. `test/lessons.test.mjs` lints every `score.abc` and `snippet` against
these rules.

- **Hands:** voice 1 is the right hand, voice 2 the left, one voice per staff
  (`%%staves {1 2}` or `%%score {1 2}`, with `V:1 clef=treble` and `V:2
  clef=bass`). At most two voices; no voice overlay (`&`). A one-voice score
  takes its hand from the clef.
- **Layout:** one 4-bar system per source line (the stage draws one SVG per
  line).
- **Form:** write repeats out — no `|:`, `:|`, `::` or first/second endings
  (the engine grades the page once, as written).
- **Bars:** the first bar is full; pad a pickup with rests into a whole bar.
- **Metre:** 2/4, 3/4 or 4/4, set once in the header; no inline `[M:]`
  changes.
- **Ornaments:** chord symbols (`"C"`) are display only; grace notes and
  decorations (`!trill!`) are graded on their main note; a tie is one note;
  tuplets and `y` spacers are fine.
- **Tempo:** `bpm` and `target` are quarter-note beats per minute.
- **A `score`** needs `abc`, `bpm`, `target` (≥ `bpm`) and `sections` (`{
  name, from, to }`, bars within the piece). A scored lesson carries no
  `shape`.

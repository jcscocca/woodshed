# Piano Content — Design

**Date:** 2026-09-27
**Status:** Approved design, pending implementation plan
**Direction:** [docs/DIRECTION.md](../../DIRECTION.md) — step 5 (content), project 2 of 2. Project 1 (the notation engine) is done.
**Builds on:** [2026-09-26-notation-pieces-design.md](2026-09-26-notation-pieces-design.md) — its *ABC authoring conventions* bind every score here.

## Problem

Piano has 8 library items (four of them placeholders — "Your current piece",
"Comping from a lead sheet", "Improvise over a progression", "Transcribe by
ear"), one 5-stage track, two Echo items, and exactly one scored piece. The
notation engine can now show, grade and ladder written music, but there is
almost nothing to play. The owner, an early-intermediate pianist on a USB-MIDI
piano, wants two things: written classical pieces, and pop songs played from
chords.

## Goal

A first content pass of 22 scored track stages across three piano tracks, plus
a "Your song" chord chart for any song the owner knows the chords to. Pop is
taught from chords, never from copyrighted melodies: a chord chart plus an
accompaniment pattern is written out as a score and graded like any piece.

## Decisions

| Area | Decision |
|---|---|
| Pop format | Chord charts. `chartToAbc` writes chords + a named pattern out as two-voice ABC; everything downstream (parse, grading, stage, panel, ladder, lint) is reused unchanged. |
| Pop content | Pattern stages over common progressions (songs named by title only as examples), public-domain lead sheets (melody in the right hand over a generated left hand), and "Your song". No copyrighted melody or lyric is stored anywhere. |
| Chord grading | Exact: the generated pattern is the target, note for note. "Any voicing counts" is deferred. |
| Organisation | Three piano tracks — **Pieces**, **Pop from chords**, **Two-hand technique** — each feeding its current stage into the daily set. Sight-reading, Echo, "Your song" and the kept free items stay in the library. |
| Size | 22 stages: Pieces 8, Pop 8, Technique 6. Tracks grow later without migration (`mergeContent` adds new stages). |
| Advancing | A scored stage offers "ready for the next stage" after one clean pass over the whole piece at its target tempo. Unscored stages keep the "felt easy" rule. |
| Repeats | Plain repeat signs are dropped — each section is played once; the lesson text says the original repeats. D.C./D.S. returns are written out. |
| Sources | Pieces are transcribed from public-domain editions (Mutopia Project first, IMSLP scans as fallback) and each lesson cites its source. Reference files stay out of the repo; only derived note fixtures are committed. |
| Lesson text | Drafted during the build; the owner reviews all 22 stages' text as one numbered list at the end. It doesn't block the build. |

## Non-goals / deferred

- "Any voicing counts" grading for free comping.
- Swing / shuffle feel (the boogie pattern is straight eighths), compound metres (6/8, 3/8 — "Für Elise", "Greensleeves", "The Wild Horseman").
- Guitar content — a later project with its own spec.
- The app playing the other hand or "Hear this section" (parked in project 1 until the metronome and synth share one AudioContext).
- Pieces past early intermediate (Bach Prelude in C, Gymnopédie No. 1) — next pass.

## 1. Content inventory

IDs are final. "Keeps its ID" means saved history (sessions, ladder, mastered) carries over.

**Pieces** (`trk-pno-pieces`, "Pieces", type `song`, easiest first)

| # | ID | Piece | Metre, key | Teaches |
|---|---|---|---|---|
| 1 | `pno-minuet` (keeps its ID) | Minuet in G, BWV Anh. 114 (Petzold), full 32 bars, original left hand | 3/4, G | both clefs, 3/4, stepwise melody |
| 2 | `pcs-minuet-gmin` | Minuet in G minor, BWV Anh. 115 (Petzold) | 3/4, G minor | minor key, F♯ and E♭ |
| 3 | `pcs-musette` | Musette in D, BWV Anh. 126 | 2/4, D | left-hand octave leaps |
| 4 | `pcs-schumann-melody` | Schumann, "Melody", Op. 68 No. 1 | 4/4, C | singing line over flowing eighths |
| 5 | `pcs-soldiers-march` | Schumann, "Soldier's March", Op. 68 No. 2 | 2/4, G | dotted rhythms, chords in both hands |
| 6 | `pcs-la-candeur` | Burgmüller, "La Candeur", Op. 100 No. 1 | 4/4, C | legato over broken chords |
| 7 | `pcs-clementi-36-1` | Clementi, Sonatina Op. 36 No. 1, I | 4/4, C | Alberti bass, scale runs, sonata form |
| 8 | `pcs-arabesque` | Burgmüller, "Arabesque", Op. 100 No. 2 | 2/4, A minor | fast figures passed between the hands |

**Pop from chords** (`trk-pno-pop`, "Pop from chords", type `song`)

| # | ID | Stage | Chart |
|---|---|---|---|
| 9 | `pop-four-chords` | The four chords | I–V–vi–IV in C, pattern `block` (root position). Examples: "Let It Be", "Don't Stop Believin'", "Someone Like You". |
| 10 | `pop-voice-leading` | Voice leading | I–V–vi–IV in C, pattern `voiceled` (closest inversions). |
| 11 | `pop-ballad` | Pop-ballad left hand | I–V–vi–IV and vi–IV–I–V in C, pattern `ballad`. Examples: "Zombie", "Despacito". |
| 12 | `pop-pulse` | Pulse the right hand | I–V–vi–IV in G, pattern `pulse`. |
| 13 | `pop-fifties` | The '50s progression | I–vi–IV–V in G, pattern `arpeggio`. Examples: "Stand By Me", "Every Breath You Take". |
| 14 | `pop-blues` | 12-bar blues | 12-bar blues in C (C7 F7 G7), pattern `boogie`. Examples: "Johnny B. Goode", "Hound Dog". |
| 15 | `pop-ode-to-joy` | Lead sheet: "Ode to Joy" | melody (Beethoven, public domain) over pattern `ballad`, 4/4. |
| 16 | `pop-amazing-grace` | Lead sheet: "Amazing Grace" | melody ("New Britain", public domain) over pattern `waltz`, 3/4. |

**Two-hand technique** (`trk-pno-hands`, keeps its ID and name, type `technique`, all scored)

| # | ID | Stage |
|---|---|---|
| 17 | `trk-pno-1` (keeps its ID) | Five-finger patterns, hands separate, C and G |
| 18 | `trk-pno-2` (keeps its ID) | Hands together, contrary motion |
| 19 | `trk-pno-3` (keeps its ID and snippet) | Major scales, one octave, hands together — C, G, F |
| 20 | `tec-hanon-1` | Hanon No. 1, hands together, C |
| 21 | `tec-cadences` | Primary chords and cadences: I–IV–I–V–I with inversions in C, G, F |
| 22 | `tec-arpeggios` | Arpeggios, one octave — C, G, F major; A, E, D minor |

**Library**

- New: `pno-song` "Your song" (§3).
- Retired: `pno-piece` "Your current piece", `pno-voicings` "Comping from a lead sheet", `pno-hanon` "Finger independence (Hanon)" (now stage 20), and the technique stages `trk-pno-4` "Melody over block chords" and `trk-pno-5` "Arpeggiated accompaniment" (now stages 9, 11, 13).
- Reworded: `pno-improv` — loop one of the Pop track's progressions and improvise over it (unscored).
- Unchanged: `pno-ear`, `pno-scales`, `pno-sight`, `pno-ear-int`, `pno-ear-phr`.

## 2. Chord charts

### Chart shape

A lesson may carry `chart` instead of `score`:

```js
chart: {
  key: "C",                 // ABC key: "C", "G", "Am", "Bb", …
  meter: "4/4",             // "3/4" or "4/4"
  chords: "C | G | Am | F", // bars split by "|"; 1 chord per bar, or 2 in 4/4 (half a bar each)
  pattern: "block",         // a name from PATTERNS
  melody: undefined,        // lead sheets only: ABC body of voice 1, same bar count as chords
  bpm: 60, target: 80,
  sections: [{ name: "A", from: 1, to: 4 }, …],
}
```

### Chord vocabulary

Root `A`–`G` with optional `#`/`b`; quality `""` (major), `m`, `7`, `maj7`, `m7`, `sus2`, `sus4`, `dim`; optional slash bass `/E`. Anything else is a parse error naming the bar and token.

### Patterns

Each pattern defines a right-hand part and a left-hand part per chord span (a whole bar, or half a 4/4 bar — the half-bar figure is the first half of the bar figure). A lead sheet replaces the right-hand part with the melody.

| Pattern | Metres | Right hand | Left hand |
|---|---|---|---|
| `block` | 3/4, 4/4 | triad held, root position | root held |
| `voiceled` | 3/4, 4/4 | triad held, closest inversion | root held |
| `ballad` | 4/4 | triad held, closest inversion | root–fifth–octave–fifth in eighths |
| `pulse` | 4/4 | closest-inversion triad on 1, 2&, 4 (q, e-rest, dotted q, q); half bar: q, e-rest, e | root held |
| `arpeggio` | 3/4, 4/4 | closest-inversion triad broken in eighths, up then down | root held |
| `boogie` | 4/4 | 7th-chord shell held | root–fifth–sixth–fifth in straight eighths |
| `waltz` | 3/4 | closest-inversion triad on 2 and 3 | root on 1; in a lead sheet the left hand also takes the chord on 2 and 3 (close position, around C3) |

### Generator rules (`chartToAbc`)

- **Ranges.** Right-hand chord tones between G3 and G5 (MIDI 55–79); left-hand roots between C2 and B2 (36–47), with the fifth/sixth/octave above.
- **Voicing.** Root position for `block`; otherwise the inversion whose voices move least (sum of absolute moves) from the previous chord, ties to the lower; the first chord takes the inversion whose lowest note is nearest C4 (MIDI 60).
- **Qualities.** Triads are three notes. `7`, `maj7`, `m7` play a rootless 3rd–5th–7th in the right hand (the left hand has the root). `sus2`/`sus4`/`dim` spell as named. A slash bass replaces the left-hand root.
- **Spelling.** Chord tones are spelled from the root's letter (B♭ in F, never A♯). Notes are written against the key signature, and the generator tracks ABC's rule that an accidental holds for that pitch and octave until the bar line — emitting `=` naturals where the key or an earlier accidental would otherwise apply.
- **Output.** Two voices (`%%staves {1 2}`, `V:1 clef=treble`, `V:2 clef=bass`), one 4-bar system per source line, chord symbols (`"Am"`) above voice 1 for display, meter and key in the header. Output obeys the ABC authoring conventions and passes the content lint.

## 3. Your song

- **Item:** `pno-song` "Your song", a library item (type `song`). Its rail shows a song picker ("New song" + saved songs) above the normal score panel.
- **Editor fields:** title, key (major and minor keys up to 4 sharps/flats), meter (3/4, 4/4), chord line (`C | G | Am F | G7`), pattern (filtered by metre), bpm. Parse errors show inline ("bar 3: 'Hm' isn't a chord I know"); the stage re-renders on every valid edit (debounced).
- **Sections:** derived — one per 4-bar line ("1–4", "5–8", …) plus "all".
- **Data:** `data.songs = [{ id, title, key, meter, chords, pattern, bpm }]`. Deleting a song asks to confirm. Tempo ladder keyed `song:<id>`. Songs never feed the advance rule.

## 4. Architecture

- `src/score/chords.js` — `parseChord(token)` and `parseChordLine(line, meter)` → bars of `{ root, quality, bass, beats }` or `{ error: { bar, token } }` (pure).
- `src/score/patterns.js` — `PATTERNS` (the table above) and voicing helpers (pure).
- `src/score/chartToAbc.js` — `chartToAbc(chart)` → ABC string (pure).
- `src/score/scoreFor.js` — `scoreFor(lesson, data, opts)` → `{ abc, bpm, target, sections }` from `score`, `chart`, a song (`opts.songId`) or a sight-reading drill. ScoreStage and ScorePanel read only this; `hasScore` also accepts `chart` and `pno-song`.
- `src/score/SongEditor.jsx` — the §3 editor, rendered by ScorePanel for `pno-song`.
- Content: `src/lessons/piano.js` gains the pieces, charts and technique scores (ABC constants per piece may live in `src/lessons/pieces/*.js` if the file grows past readability); `src/seed.js` gains the two tracks and the reworked technique track; retired items leave the seed.
- **Advance rule:** `data.targetClean[itemId]` records the first clean pass on the "all" section at `bpm ≥ target`. `progressionProposals` offers "ready for the next stage" for a scored current-edge stage once `targetClean[id]` is set (acked as today); unscored stages keep the ratings rule.

## 5. Migration (schema 8)

- Adds `songs: []` and `targetClean: {}` (objects/arrays validated like `ladder`).
- One-time content refresh for items that keep their ID but change meaning: `pno-minuet` joins the Pieces track (title, desc, trackId, trackName, order); `trk-pno-1`–`3` take their new titles and descriptions; `pno-improv` its new description. User fields (`hidden`, `mastered`) are kept.
- Retired items (`pno-piece`, `pno-voicings`, `pno-hanon`, `trk-pno-4`, `trk-pno-5`) are removed if they have no sessions; otherwise they are kept hidden and detached from their track, so history survives.
- New stages arrive through `mergeContent` as today.

## 6. Transcription and verification

- **Source.** Each piece is transcribed into ABC from a public-domain edition — the Mutopia Project's LilyPond source first (prefer public-domain-dedicated entries), an IMSLP public-domain scan where Mutopia lacks the piece or only has a share-alike edition. The lesson cites it: `source: { label, url }`.
- **Reference files** (LilyPond, MIDI, PDF) are downloaded to scratch space outside the repo and never committed or shipped.
- **Fixtures.** A small authoring script reads a reference MIDI and writes `test/fixtures/pieces/<id>.json` — the expected `[beat, midi]` onsets with repeats handled as in §Decisions. The fixture, not the MIDI, is committed.
- **Test.** For every piece, `parseScore(abc)` onsets must equal the fixture, except entries listed in the fixture's `deviations` (each with a reason, e.g. an ornament simplified to its main note). Pieces without a MIDI reference are checked by hand against the scan and marked `verified: "manual"`.
- Lead-sheet melodies are checked the same way where a public-domain reference exists, otherwise by hand.

## 7. Lesson text

Every stage gets a summary, 3–4 steps, 1–2 watch points, named sections, and a start/target tempo (start ≈ 60–70% of target). Pop stages name example songs by title only. After the build, all 22 stages' text goes to the owner as one numbered list (a = summary + steps, b = watch points); edits land as a final pass.

## 8. Testing

- `chords.test`: every quality, accidentals, slash bass, two-chord bars, error messages.
- `chartToAbc`: every pattern × metre × a set of charts (including flat and sharp keys, minor keys, chromatic chords like E7 in A minor) round-trips through `parseScore` with the intended pitches and beats; accidental carry within a bar is exercised; the ranges hold; voice-leading picks the closest inversion.
- Pieces: fixture comparison (§6); every score, chart and lead sheet passes the content lint; sections lie within the bars.
- Migration: schema 7 → 8 on a saved state with the retired items (with and without sessions), the Minuet's ladder, and a mastered `trk-pno-1`.
- Advance rule: a clean "all" pass at target sets `targetClean` and yields the proposal; a clean pass below target doesn't.
- Browser: each track's first stage opens on the stage; a pop stage plays and grades; "Your song" edits re-render and grade; a lead sheet shows chord symbols over the melody.

## Acceptance criteria

1. The Library and Tracks views show three piano tracks with the stages above; retired placeholders are gone (or hidden with their history).
2. Every stage opens as a score on the desktop stage and grades over MIDI; the Minuet shows all 32 bars and keeps its tempo history.
3. A chord chart in any supported key renders with correct spelling, chord symbols above, and grades note for note.
4. "Your song" turns a typed chord line into a playable, graded score, remembered across reloads.
5. Every piece matches its reference fixture (or a listed, reasoned deviation) and cites its source.
6. A clean full pass at target tempo offers "ready for the next stage".
7. `npm test` and `npm run build` pass.

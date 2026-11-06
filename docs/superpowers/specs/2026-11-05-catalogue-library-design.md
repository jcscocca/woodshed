# Catalogue as a sheet-music library — design

## Why

The user expected Catalogue to be a shelf of sheet music: open it, pick a piece, play it. Today it is mostly an index of the course's scale and chord drills (507 of 539 entries), filtered to the current unit, with the real pieces scattered among them and the best classical repertoire hidden two clicks deep behind "Browse repertoire tracks". They practise on a tablet on a music stand (landscape, ≥1024px, is the primary width), so the page must read at a glance and stay in the same bare teaching-tool tone PR #5 set: no filler prose.

## Goals

- Catalogue shows only music: pieces you play from a score inside Woodshed, plus a few outside sheet-music links.
- Every piece is visible regardless of the current unit, and every in-app piece opens freely.
- A piece tells you where it sits in the course; it never says you are not allowed to play it.
- Pieces can be filtered by difficulty and by shelf.

## Non-goals

- Transcribing Bach, Satie or Tchaikovsky into in-app scores. That is a separate follow-up.
- Changing the Chords, Scales or Guided Practice tabs, or the guided course content.
- Changing the older tracks and library views themselves.
- A key filter (the course shelf is already grouped by key).

## Anti-goals

- Drills, warm-ups or teaching references on the shelf.
- Difficulty dots or ratings shown on cards or rows.
- Locked or greyed-out pieces.
- Long descriptions on cards. One short "who" line only.
- Emoji standing in for anything.

## The page

Title "Catalogue", with a **Grid / List** switch and a **Filter** control beside it.

Three groups, in this order, each with a heading:

1. **Course pieces.** The 27 built-in pieces (each unit's `musicIds` / music exercises, not scales or chords), grouped by unit in course order. Each unit group is headed by its key and unit number, e.g. "G major · Unit 2". The current unit's heading adds "you're here" and its pieces get a gold edge (the existing `--gold` token). Tapping opens the piece in the existing practice sheet, as the current "Practise this music" button does.
2. **Repertoire.** The ten pieces moved from the older skill tracks: the eight classical pieces of the "Pieces" track (`trk-pno-pieces`: Minuet in G, Minuet in G minor, Musette in D, Schumann Melody, Soldier's March, La Candeur, Clementi Sonatina Op. 36 No. 1 first movement, Arabesque) and the two lead sheets from "Pop from chords" (`pop-ode-to-joy`, `pop-amazing-grace`). Ordered easiest first. Tapping opens each in the lesson sheet it uses today (App's `openLesson`, which shows the score/chart).
3. **Outside Woodshed.** The six external sheet-music links: Bach Prelude in C, Tchaikovsky Old French Song, Satie Gymnopédie No. 1, the Star Wars book, the Simple Disney Songs book, Studio Ghibli Favorites for Beginners 2. Shown in the piano teal (`--piano`) with a ↗ so they read as leaving the app; open in a new tab as now.

At the bottom, a small **"Older practice tools"** heading with the two existing buttons (repertoire tracks, exercise library) and the existing note that they need a MIDI keyboard. These are the only way into those views and the song editor, so they stay reachable from here.

### Grid view (default)

Cards in a responsive grid (three or more across at tablet landscape). Each card: title, then one short "who" line (composer, "Original study", "arr." where relevant, or the outside source). A course piece that can substitute for an unfinished block in the next guided session keeps its "Use in current guided session" button on the card (as today, via `substitutesFor`).

### List view

One row per piece inside the same groups: title, "who" line, a › at the right edge (↗ for outside links). The gold edge marks current-unit rows. No substitute button in list rows.

The Grid / List choice is remembered on this device.

### Filter

- **Difficulty:** All, Easier, Middle, Harder.
- **Shelf:** All, Course pieces, Repertoire, Outside Woodshed.

Difficulty is used only to filter and is never displayed. Empty groups hide while a filter is on; if nothing matches, say so in one line.

## Difficulty ranking

Every piece on the shelf (all three groups) gets one of three levels, decided by examining the piece itself: range and hand position changes, shortest note values and rhythmic complexity (dotted, syncopated, sixteenths), how independent the hands are, accidentals and key, length and form. For outside pieces, judge from the score notes already recorded in their descriptions. The existing `diff` numbers on the track stages are a hint, not the answer.

The ranking is bulk content: it goes to the user as a numbered list (piece, proposed level, one-line reason) for review before it is applied.

## Copy

Each piece's "who" line is new short copy written from its existing title and description. The full set goes to the user as a numbered list for review before it is applied, along with any title shortenings and every group heading. The long `description` text stays in the data untouched; it is simply not shown on the shelf.

## What leaves Catalogue

- All scale and chord entries. They remain under Chords and Scales.
- The two teaching references: "Hear and speak rhythm: Takadimi" and "Ledger notes and a family of Cs".

## Constraints

- Smallest diff that works; match the surrounding code's style (dense JSX in `Program.jsx`, `pg-` classes in `src/styles.css`).
- `npm test` and `npm run test:browser` stay green. Some Node tests (`test/program-content.test.mjs`, `test/program-coverage.test.mjs`, `test/program-scales.test.mjs`) currently treat a chord/scale `CATALOGUE` entry as a route to a lesson; `test/browser/song-editor.spec.js` reaches the song editor through Catalogue's "Open exercise library" button.
- Checked at tablet landscape widths (1024, 1180, 1280), plus the narrow project the browser suite already runs.
- One PR against `main` from branch `catalogue-library`.

## Decided while writing (builder's calls, settled)

- **Drill entries leave the `CATALOGUE` data**, not just the view. The three Node tests that use a catalogue entry as a drill's route are rewritten to assert the real route: the exercise is in `EXERCISES` with `section` "chords" or "scales" and a `unitId` the Chords or Scales tab shows. `CATALOGUE` is read only by `Program.jsx`, so nothing else depends on those entries.
- **Repertoire items** are resolved by id in App: the matching `live.items` entry if present (hidden or mastered still opens), otherwise the seed stage from `trackItems()`. Program gets a new prop beside `onLegacyView` that takes the id.
- **The score panel** keeps its existing ≥1024px rule (`useIsDesktop`). Tablet landscape gets the score; a narrow phone gets the lesson sheet without it, as today.
- **Practising a later-unit piece** records progress exactly as any free practice does today. No progress-side change.
- **Difficulty levels** live in one id → level map next to the shelf data, applied after the user approves the ranking.
- **Unit 8's heading** is "Musicianship · Unit 8" (its `key` is "Across keys"); it goes to the user with the other headings.

## Left to the builder

- How the remembered view choice is stored, provided it survives reload and fails safe.
- Exact control styling, within the existing `ws-btn` / `pg-` vocabulary.
- Browser test coverage for the new page: groups render, filters narrow, list/grid switch persists, a repertoire piece opens its score. `test/browser/song-editor.spec.js` keeps working while "Open exercise library" stays a button on the page.

# Critical audit fixes for review

This release revision addresses the audit's data-loss, lesson-state,
musical-alignment and feedback findings. The course is still
eight units and 80 authored twenty-minute visits; consolidation and repeat
practice can extend the actual schedule.

## Saved practice across tabs

Current builds use one same-origin Web Lock around reading the latest profile,
applying an action and writing the result. Ordinary reports from two tabs can
both survive, and an ordinary remote update keeps the open lesson in place.
Stale corrections and replacements fail with a conflict message. Import/reset
creates a new profile generation, so an old in-flight practice action cannot
bring replaced history back. Backup export reads the latest durable profile.

This protects cooperating current builds, not older already-open versions or
external writes that bypass the protocol. Reload older app versions before
editing. When Web Locks is unavailable, saved-profile writes are refused with
an explicit warning; existing data can still be read and backed up. There is no
unsafe lease/spinlock fallback. Drafts and audio remain separate from durable
history. See [storage](../src/storage.js) and [data guidance](../README.md#data-installation-and-compatibility).

Earlier exercise/session forms wait for the durable result before closing.
Failed saves and deletes keep the form and its edits available for retry;
repeated submissions are guarded while the write is pending.

**Your song** keeps typing local while its durable saves run in order. Later
edits are coalesced into the next complete draft, so an older completion cannot
replace newer typing. Creation/deletion changes song selection only after a
successful write. A failure retains the exact song fields, selected song,
uncommitted tempo text and accepted comparison base in this tab's draft storage,
including across navigation/reload. **Retry save** checks that base again; it
does not silently rebase over another tab's saved songs. **Use saved songs**
requires confirmation before discarding local changes. These drafts are not JSON
backup history and are invalidated by deliberate import/reset. The
[15 focused SongEditor scenarios](../test/song-editor-persistence.test.mjs) are
part of `test:score`; final combined verification remains recorded below.

Import/reset synchronously invalidates the tab's draft-generation token. The
editor checks its captured token before writing a draft, continuing queued
callbacks, creating/deleting or retrying. A late failure therefore cannot
recreate a deliberately discarded draft, even before the old editor unmounts.
A synchronous persistence exception also releases the save queue so an explicit
retry can run. These are separate from the saved profile's durable generation
checks.

## Keeping the actual lesson open

Crossing the desktop/compact breakpoint keeps the same lesson, draft, playback
controller and in-memory take mounted. Ordinary cross-tab updates likewise do
not close the lesson. Mobile Tuner follows the desktop recording/save locks and
stops owned lesson playback before opening. **From bar** and **Through bar** keep
their visible labels in their accessible names.

Resume finds the exact saved later block for both original and revised plans.
Unfinished return/fresh-example drafts retain their source, variant, score and
first-check evidence when the due queue changes. Earlier completion counts once
without becoming credit for new tasks; a completed revised visit still leaves
an unfinished original accessible through **Resume earlier**. Import/reset is a
deliberate replacement and invalidates stale work rather than restoring it.

## Musical alignment and feedback

C Day 4 B now names two real differences. The chord worksheet is C–G–Am–F;
*After the Rain* reorders those shapes to C–Am–F–G. Only the first three LH
preparation bars match. Its G2–B2–C3 ending holds C3 for two beats on 5–2–1,
whereas the piece uses G2–B2–D3–B2 quarters on 5–3–1–3. The destination block
first isolates that actual LH bar, then adds the melody.

All **637 existing scores** remain unchanged, including the original 193 course
scores. Reused exact-match claims now have note/rhythm/register comparisons, and
the three new preparations must precede their named destination rather than
merely another final activity. [The integration map](integrated-lessons.md)
lists the 23 revised visits.

Four focused questions bring the active bank to **50**, while all **15 historical
definitions** remain readable. They check Canon placement, Mozart's fixed
fingering and the written/heard blues D/D# contrast. Known mistakes have their
own follow-up. A same-day correction needs a later-date correct answer; these
zero-minute concept reports cannot complete piano blocks, add piano practice
days or extend a passage's spacing.

The three preparations also receive eight finite fresh studies each. There are
now **200 studies across nine supported families**: 176 unchanged earlier
examples plus 24 for Canon travel, Mozart's A4–E5 position and blues seventh
chords. They retain known notes, registers and fingerings while changing order.
Transfer does not credit the original passage's readiness or spacing, and
unsupported passages continue to use ordinary returns.

## Review load and the cost of extra practice

The guided page separates recommended skill checks from raw passages available
for return, including their oldest overdue age. Explicit related preparations
and versions of a named project rotate as recommendations: 187 distinct assigned
exercises form 148 families, including 18 multi-source groups. This selection
never credits another passage's readiness, completion or spacing. Technical
key/form/range/hand setups remain independent; difficult passages retain their
own repair.

Only an actual comparable, steady before-playback return can pause related
recommendations for three days. Ordinary practice, assisted/narrower checks or a
same-day setback cannot. A passage seven days overdue bypasses the pause. The
next family choice favours a passage with the least recent actual return.

At least five representative checks due, or three with the oldest a week overdue,
can recommend a twenty-minute consolidation for up to five passages. Once a
consolidation check is saved today, no second new consolidation is recommended
that day. An unfinished plan can still resume. Regular lessons and individual
returns remain available; consolidation can replace a normal practice slot and
extend the course's calendar instead of becoming a required extra session.

The deterministic comparison in
[the scheduling test](../test/program-review-schedule.test.mjs) assumes two visits
per weekday and honest, always-ready reports. It is a workload model, not piano
playing or learning evidence:

| Model | Total visits / minutes | Raw passages still due | Oldest overdue |
|---|---|---|---|
| Original one-check-inside-course only | 80 / 1,600 | 164 | 37 days |
| Unbounded consolidation prototype | 306 / 6,120 | 7 | 1 day |
| Current rotation plus daily recommendation cap | 152 / 3,040, including 72 consolidations | 98 | 18 days |

The current run completes 80 course visits over 106 calendar days and ends with
80 representative/repair checks still due. Persistent-difficulty simulation
completes 51 course visits plus 49 consolidations in 100 slots, with 130 raw
repairs still due. Rotation and caps reduce overload and keep the course moving;
they do not guarantee a forty-practice-day course or timely service of every
review clock. The raw backlog remains visible.

## Dependency disposition

Vite moves to **6.4.5**, a [security-supported branch](https://vite.dev/releases),
with compatible transitive updates and the existing PWA settings. Runtime
dependency versions are unchanged. Runtime audit reports zero findings; the full
audit has zero high/moderate and four low entries from one
[unpatched deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)
in the Workbox build chain. No forced downgrade, override or audit exclusion is
used. Final frozen-source builds pass on Node 22.23.4 and Node 26.8.1, including
service-worker generation.

## Verification boundary

The earlier 37-case passing integration result predates these audit fixes.
After the SongEditor reset-race guard, the complete `npm test` passes on Node
26.8.1 and actual Node 22.23.4; both final production builds pass. The clean full
browser run passes **58 of 60 scheduled cases**, with two intentional duplicate
PWA project skips. It covers twenty cases across desktop/narrow Chromium and
WebKit; the real PWA upgrade/offline case runs once in desktop Chromium.

The current IAB walkthrough confirmed the corrected C4B goal and exact
LH-bar-4/tempo-48/note restoration after reload; owned playback controls started
and stopped correctly. Detailed evidence belongs in
[release readiness](release-readiness.md). Independent physical-piano/teacher review, learner returns,
native devices and assistive-technology acceptance remain pending. Software
checks do not establish safe technique for every learner or learning efficacy.

A follow-up live walkthrough on 2026-10-28 passed in the isolated preview at
`127.0.0.1:51917`: all four C Day 1 A blocks, passage/loop/note restoration,
separate concept correction, all-key scale filters and scope, independent song
editing/reload, and lesson continuity across the compact breakpoint. Compact
Tuner stopped owned playback and waited for an explicit listening action.
These were UI fixture reports, not measured playing. The observed scope is
recorded in [release readiness](release-readiness.md#follow-up-live-walkthrough--2026-10-28).

## Score and code audit — 2026-11-09

A second audit covered the 49 Mutopia scores and the code merged since the first
one (`a1b510b..d87daf6`). It found no wrong notes. It did find six defects, all
fixed here, and a class of shortened notes in the Handel scores.

| Finding | Fix | Check |
|---|---|---|
| **Unskip from the Catalogue could not save.** The Catalogue's player was mounted without the progress handler, so Unskip showed "That change could not be saved" and the piece stayed skipped. | The Catalogue mount passes `onChangeProgress`, as the course mount does. | `test/browser/catalogue.spec.js`: skip a piece from the shelf, reopen it and unskip it. |
| **Done skipped the minutes check.** The one-tap Done button bypassed the form's 240-minute limit, so a typo such as 2000 was saved as zero minutes and still completed the block. | Done refuses more than 240 minutes and says so under the form. An empty or below-1 entry still falls back to the lesson's default, as before. | `test/browser/tablet.spec.js`: Done with 2000 minutes shows the message and saves nothing. |
| **Four lengths abcjs cannot draw.** A rest or note of 5 or 10 units has no single symbol, so abcjs warned and drew a length that disagrees with the beat the score grades: `z5` in Greensleeves, `z10` in Handel's Menuet I in F and Passepied (both voices), and `D5` in Burgmüller's La Pastorale. | Each is split into drawable lengths (`z4 z`, `z8 z2`, `D3-D2`). The parsed notes are identical before and after. | `test/lessons.test.mjs` fails on any abcjs warning in any score, chart or snippet. |

The score audit also found 386 notes that folding two voices into one had
shortened. Two groups were restored, in ten Handel files:

- **Holds the lesson text asks for.** Where a lesson says to keep a note down, the
  note is now tied for its full length: Air in B flat, Entrée, Gavotte, Menuet I
  in D minor, Menuet I in F, Menuet (Trio) in A minor and Passepied.
- **Left-hand bass notes.** The Sonatina in A minor and the Allegro in D minor
  now write the left hand's second voice as a third voice (`%%staves {1 (2 3)}`),
  and the Preludio's last bar ties its low D. No shortened left-hand note remains.

The per-piece record is in the
[repertoire table](piano-curriculum-evidence.md#repertoire-scores-from-mutopia).
The remaining shortened notes are right-hand inner voices; every onset is still
graded.

Verification on this branch: `npm test` passes, the production build passes, and
the browser suite passes 105 of 123 scheduled cases with 18 intentional skips
(narrow-width and duplicate-project cases). Unskip and the Done limit were also
exercised by hand in a 1180×820 preview.

The audit also read every lesson's summary, steps and watch notes against its
score. A follow-up on 2026-11-11 made 49 corrections in 29 pieces where the
text named the wrong bar, key, interval, rhythm or accidental, or described a
pattern as running through bars it does not cover. Sixteen further flags were
judged acceptable shorthand and left alone. Only prose changed; no score did.

The playability measure scored all 119 in-app scores and found 20 whose score
sat in another level's middle half. On 2026-11-12 seven of them changed level
and thirteen were kept:

| Piece | Was | Now | Why |
|---|---|---|---|
| Ain't She Sweet | Harder | Middle | The left hand stays in one place and the melody is mostly on the beat. |
| Swing Low, Sweet Chariot | Harder | Middle | Four bars in F with no accidentals. |
| Sakura | Easier | Middle | The ballad left hand moves in every bar. |
| Body and Soul | Hardest | Harder | One melody line over single left-hand notes at a slow tempo. |
| Carol of the Bells | Middle | Harder | 32 bars at 120 with the most left-hand travel among the waltz-pattern songs. |
| La Chasse | Harder | Hardest | 57 bars at 160 with a busy left hand. |
| Air in B flat | Harder | Hardest | Both hands move in every bar; it outscores most of the Hardest shelf. |

The measure counts what is printed, and a song's left hand is generated from
its pattern, so the thirteen kept labels are mostly songs whose difficulty is
syncopation or accidentals (kept Harder) or whose waltz pattern inflates the
count (kept Middle). The level filter is the only place a level is used.

The same measure flagged three hand questions in Gymnopédie No. 1, settled on
2026-11-12 against the Mutopia source:

- **Bars 37 and 76.** The left hand was asked for two tenths. The edition gives
  the left hand its own inner voice there (B, then E), so the chords above it
  now sit in the right hand's voice, tied under the held F sharp. The same 455
  notes parse with the same lengths; ten change hand.
- **Ninths in bars 24–26 and 29–31.** These are Satie's left-hand chords, so the
  score is unchanged and a watch note suggests rolling them.
- **Bars 9–12 and 48–51.** The chord's top note is the F sharp the right hand
  holds. Wait mode needs every chord note pressed, so a watch note says to
  restrike it.

Still open from the same audit: the Gavotte's bar 17, where the right hand has
F sharp 3 under G4. It matches the Mutopia file, but the octaves in bars 18–19
suggest the print has G; it waits on a check against a printed edition.

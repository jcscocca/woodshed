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

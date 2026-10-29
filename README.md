# Woodshed

Woodshed is a guided piano practice app for a returning learner: choose a small
musical goal, work from the score, try it without the model, record what happened,
and return to it later. No account or application server is required. Practice
history stays in the browser, with JSON export/import for backups and moving it.

The v1 core is **Guided Practice, Chords, Scales, Catalogue and Progress** across
**eight units, 196 self-contained exercises and 80 guided sessions**. A MIDI
keyboard and microphone are optional. Earlier piano/guitar tools remain available
through Catalogue; guitar is outside the guided piano course.

The Scales tab also offers an optional [all-key reference](docs/continuing-scales.md):
all twelve major and minor tonics, natural/harmonic/classical melodic minor,
one- and two-octave work, arpeggios, contrary motion and chromatic scales.
Choose a key and pattern when a musical project needs them. Its 441 setups join
shared Progress and cumulative review; they are not a completion checklist.

[Integrated lessons](docs/integrated-lessons.md) connect preparation to the
existing music in 23 revised visits, adding only three focused exercises. The
course retains eight units and 80 visits; there are 637 active exercises across
the course and optional reference. Earlier started plans and saved reports remain
readable, without awarding old block credit to a different task.

[Product direction](docs/DIRECTION.md) · [Release readiness](docs/release-readiness.md)
· [Teacher review and learner pilot](docs/teacher-review-pilot.md)
· [Critical audit fixes](docs/audit-fixes.md)

## The guided course

Each foundation unit has five rolling practice days with two planned 20-minute visits:
**A — foundations**, then **B — musical application**. Days are a sequence, not
calendar deadlines. Repeat a lesson or day whenever useful. The default weekly
goal is five practice days and 200 minutes; all 80 sessions total 1,600 planned
minutes. Time logged is the learner's actual report, rather than a countdown or
an automatic performance score.

| Unit | Main musical work |
|---|---|
| C major | Pulse, ledger landmarks, held/broken bass, scale crossings, primary chords and original short studies. |
| G major | F♯ in both clefs, scale crossings, close G/C/D7/Em changes and independent rhythms. |
| F major | B♭, the RH finger-4 scale turn, F/B♭/C7/Dm and new musical studies. |
| A minor | Natural/harmonic minor, Am/Dm/E7, 3/8 and sixteenth-note preparation for the Für Elise pickup and opening strain. |
| D major | Two sharps and a disclosed original piano realization of the Canon bass; separate 6/8 preparation. |
| A major | Three sharps, sixths/sevenths and 6/8; student versions of Mozart K.331's opening melody and a complete original AB piece. |
| E major | Four sharps, a disclosed four-bar Morning Mood arrangement and a complete original twelve-bar blues. |
| Musicianship across keys | Inversions, double notes, reading/aural retrieval, expression, optional pedal, repeat endings and complete original AB/ABA pieces. |

Start with the three short placement checks or open a lesson directly. Placement
records a useful starting report; it does not assign an exam grade or restrict
access. The **Piano unit** selector keeps progress separate for each unit.
**Resume** opens the first unfinished guided block. Practice in Chords or Scales
can satisfy a matching block in the current guided session. Revisit walks through
an already completed session without clearing earlier reports.

Changed visits have a new plan identity. Saved blocks, session review or an
unfinished lesson/review draft normally retain the original plan; untouched
visits use the revised plan. **Preview updated preparation** lets you try the
revision separately. Completing it counts the visit once and keeps any earlier
unfinished plan accessible through **Resume earlier Day … · Session …**. Partial
plans never combine into completion. Unfinished review/fresh-example drafts
restore their exact passage and variant even when the due queue changes.
Old reports and removed experimental-unit titles remain in history.
[The integration guide](docs/integrated-lessons.md) explains compatibility details.

Technical lessons ask what was actually played: a chunk, the complete ascent,
or the ascent and return. Full-range and delayed-return labels require an
explicit scope report with matching bars, hands and tempo. Earlier logs do not
gain invented scope evidence, and all lessons remain open.

Every core exercise includes a score, fingering, counting/practice steps,
listening goals and self-checks. **Hear slowly**, **Hear reference** and **Play
along** use the displayed score's notes and timing. Choose hands, tempo and a bar
range; use count-in, looping and optional model notes while playing. Pickups retain
their written timing and bar labels. Follow-score can be disabled to browse.
The synthesized model does not demonstrate a pianist's phrasing or assess touch.

The lesson and desktop practice rail share one tempo and playback controller.
The rail returns to its standalone metronome after the lesson closes. Playback
stops when the lesson is left. Changing between desktop and compact layouts keeps
the same lesson, draft and in-memory take mounted. Mobile Tuner follows the same
recording/save locks as the desktop rail and stops owned lesson playback before
opening. At 1024px and wider, navigation, the main view and
the practice rail form three panes; narrower windows use the compact layout.
**Score size** offers Fit width, 125% and 150%; the enlarged score is a focusable
region that can be scrolled with arrow keys. A **Skip to practice** link bypasses
navigation. With the system's reduced-motion preference, new lessons start with
follow-score off and decorative motion is suppressed; follow-score remains an
explicit learner choice.
Passage controls keep **From bar** and **Through bar** in their accessible names.

**Save practice** records minutes, assessment, hands, tempo, passage, goal,
observed criteria and a next-step note. Progress supports corrections/removal.
Saving a block records practice, not verified mastery. If saving fails, the lesson
stays open with its report. Unfinished edits, choices and understanding-check
answers are restored when reopening the same lesson context in the same browser
tab, including after reload. Drafts are separate from saved history: they are not
exported, should not be relied on after the tab closes, and are cleared after a
successful save or when importing/resetting the profile.

## Cumulative review and fresh examples

The review queue draws from practised lessons across every unit, preserving the
previous hands, tempo, passage and next-step note. Up to three recommended skill
checks are shown alongside the raw number of passages available for return and
their oldest overdue date. Try once with the written score **before app playback**, report that first
attempt, then listen and repair. The first result and its scope remain separate
from the final assessment. Skipping that report records practice without
inventing retention evidence.

When starting a new session with a due review, one check fits **inside** its
20-minute plan: **3 minutes of review + 17 minutes across all original blocks**.
The review itself never completes a core block. Saving it preserves that session's
allocation across reload and backup/import. Already-started sessions keep their
plan; skipping review and complete-session revisits retain their original
20-minute lesson allocation. Directly opened lessons use their listed time.

Ready practice first returns after three days. A comparable, steady delayed
before-playback report can extend the next gap to seven, fourteen and thirty
days. Difficulty brings next-day practice, followed by a three-day rebuilding
gap after a successful return. Same-day repetition cannot extend spacing.
Comparability includes the earlier passage, hands and tempo.

Related preparations and versions of the same named project can rotate through
one recommendation family. This chooses what to practise next; it does not
create a report, readiness, completion or spacing credit for another passage.
Only an actual comparable, steady before-playback return can trigger a short
three-day family scheduling pause. Ordinary practice cannot do so, difficult
passages retain their own repair, and a passage seven days overdue bypasses
that pause. Scale forms, hands and ranges remain independent.

When at least five representative checks are due, or three are due with the
oldest a week overdue, the app can recommend a resumable **20-minute consolidation
visit** for up to five passages. At most one new consolidation is recommended
per day once a check is saved; an unfinished visit can still resume. This is a
choice of practice visit, with regular lessons always available. It can extend
the number of days or visits needed for the course. The raw backlog remains
visible, and this schedule does not promise every passage is checked on time.
[The audit guide](docs/audit-fixes.md) records the synthetic workload comparison.

After two qualifying steady returns since the last setback or transfer,
supported skills can receive a **fresh example** in an already taught key.
Nine bounded families vary pulse, subdivision, landmark reading, held bass,
two-to-one coordination, chord routes, Canon's released minor-chord travel,
Mozart's fixed position and blues seventh-chord colours. The bank has 200 studies:
176 previous examples plus 24 for the three focused preparations. Examples have stable IDs; used ones
are skipped and an exhausted bank falls back to ordinary review. Fresh-example
reports are separate transfer evidence; they do not raise the original passage's
readiness or spacing. A difficult fresh attempt carries its repair note forward.
These intervals and eligibility rules are product defaults, **not a validated
mastery model or a promise of learning outcomes**.

Relevant lessons also offer **50 written/listening understanding questions** with
staff examples, audio and explanations. Answers are saved separately from piano
self-assessment and never lock lessons. Known mistakes appear in **Revisit an
idea**. A correction on the same date still needs a correct answer on a later
date. These answer-only reports record zero practice minutes and cannot complete
a piano block, advance its spacing, or add a piano practice day.

## Optional tools and material limits

Catalogue includes optional resources and built-in alternatives for some guided
goals. Commercial repertoire links are external resources; the core does not
require buying or leaving the app. Named classical material is explicitly
identified as an excerpt or arrangement, with source and edition notes.

- [Curriculum/source review](docs/piano-curriculum-evidence.md) records inspected
  editions, exact arrangement choices and deferred material.
- [Topic coverage](docs/piano-topic-coverage.md) maps 29 benchmark areas to concrete
  lessons. Coverage does not establish an exam level or teaching effectiveness.
- Earlier repertoire tracks, exercise editing, chord charts, Your song and
  sight-reading remain in Catalogue. Their piano MIDI tools retain their own
  grading and progress model; guided lessons do not require this hardware.
  See the [earlier practice tools reference](docs/earlier-practice-tools.md) for
  connection, score, chart/song, editing and keyboard instructions.
- Earlier guitar tools are optional retained tools. Guitar mic coaching and Echo
  remain disabled behind `COACH_ENABLED`; the tuner is a single-note beta tool.
- Lesson recording requests the microphone only when Record is pressed. Takes
  stay in memory, last at most three minutes and are never uploaded. Download
  before leaving/saving the lesson if you want to keep audio. Permission denial
  does not prevent practice or logging.

Settings shows the guided course's fixed schedule. Its collapsed **Earlier
practice settings** section controls the retained rotation/history settings,
including instruments and the older weekly goal; it does not resize the course.

## Data, installation and compatibility

Saved practice uses this origin's browser `localStorage`; unfinished lesson
drafts use this tab's `sessionStorage` with an in-memory fallback. Devices,
browsers and different site URLs have separate profiles. Export a backup from
**Settings → Your data** before changing devices or replacing a profile. Export
contains saved history/settings, not audio takes or unfinished drafts. Import
replaces the profile after confirmation and a successful durable save. Failed
import/reset leaves existing history and unfinished drafts intact; they are
replaced/cleared only once the replacement profile is saved. Current C-major IDs
and completed blocks remain compatible when later units are added.

Current builds serialize same-origin profile changes with the browser's
[Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API). A normal action applies to the latest saved profile, so two tabs can
retain both reports without closing an open lesson. Import/reset creates a new
profile generation; stale actions cannot bring back the replaced history.
Corrections and replacements reject stale revisions instead of overwriting newer
work. Backup export reads the latest durable profile. This protocol only covers
builds that follow it: older already-open app versions and external storage edits
are outside the guarantee. Close or reload older versions before editing.

When Web Locks is unavailable, saved-profile writes are refused with an explicit
warning. Existing history can be read and backed up; the app does not use an
unsafe concurrent-write fallback. Drafts and audio remain separate from durable
history. Use a current browser on HTTPS or localhost for saving.

Earlier exercise/session forms close only after durable success and retain edits
when a save fails. **Your song** saves typing in order, coalescing newer edits
while a write is pending. Failed changes retain the exact draft, selected song
and uncommitted tempo text in the current tab. **Retry save** checks the accepted
saved-song base again; it does not overwrite another tab's newer songs. **Use
saved songs** asks before discarding local changes. Song drafts, like lesson
drafts, are not part of exported history and are cleared by successful
import/reset. Draft-generation invalidation prevents an older pending editor
callback from recreating a discarded draft after that replacement.

### When saved practice cannot be opened

Woodshed shows **Your saved practice needs attention** rather than silently
replacing an unreadable profile. Use **Download original saved data** when
available to keep the original bytes, then allow site storage and **Retry
loading**, or choose a known JSON backup and **Restore backup**. A failed restore
keeps the original data and reports the error. Recovery does not require erasing
the browser's site data.

Earlier four-instrument versions also contained bass and accordion. Migration
removes those archived instruments from active data; retain an export first if
their older history matters. Content remains in `archive/` and repository
history.

The production build includes a web-app manifest and a precached service worker
configured for automatic updates. Settings shows an App version, also exposed
in the page's `woodshed-release` meta tag, to identify deployed builds. Installation,
offline reopening and upgrade behavior must be checked on the actual browser/device before being claimed as
release support. The [readiness matrix](docs/release-readiness.md) distinguishes
in-app-browser observations from Chrome, Edge, Safari and physical-device tests.

Desktop keyboard shortcuts include **Space** for the open guided lesson's
play-along (otherwise the metronome), **T** for tap tempo, **←/→** for tempo,
**S** for the stopwatch, **1–5** for sections and **?** for help. A focused button
keeps normal Space activation; typing fields/dialogs suppress app shortcuts.
Optional earlier scored tools expose their own additional shortcuts.

## Develop and deploy

Use Node.js 22 to match deployment CI.
Vite 6.4.5 is the supported security branch used here. Node 22 and Node 26 builds
have been checked; runtime dependency versions remain unchanged by the tooling
update. Runtime audit reports zero findings. The full audit retains four low
entries from one [unpatched deepmerge advisory](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)
in the Workbox build chain, with no high or moderate findings. No audit exclusions
or forced dependency overrides are used.

```bash
npm ci
npm run dev             # http://localhost:5173
npm test                # complete automated suite
npm run test:program    # guided course checks
npx playwright install chromium webkit  # once: browser acceptance dependencies
npm run test:browser    # production build + Playwright acceptance
npm run build           # production files in dist/
npm run preview         # serve the built app locally
```

`npm run dev -- --host` exposes the dev server for another device on the local
network. Use a production HTTPS origin for install/permission/offline acceptance.
`npm run test:audio` is the separate recorded-audio DSP suite; its fixture setup is
in [test/audio/README.md](test/audio/README.md). Automated DSP checks do not verify
a real microphone, speakers, room noise or MIDI hardware.

Pull requests run the reusable release checks on an ephemeral GitHub-hosted
runner: runtime dependency audit, the Node suites and production-browser
acceptance in desktop Chromium, narrow Chromium and desktop WebKit. Reports,
failure screenshots and traces are retained as workflow artifacts. These engine
tests supplement native browser and physical-device acceptance.

GitHub Pages deployment on `main` is gated by those same reusable checks before
the production artifact is built/deployed. A separate fresh Chromium profile then
checks the actual Pages release identifier, saves a labeled one-minute fixture,
reloads and verifies its history. This never uses a person's existing browser
profile. JSON evidence and screenshots are retained as deployment artifacts.
The site is [Woodshed on GitHub Pages](https://jcscocca.github.io/woodshed/).
Record the completed workflow in the release checklist. Relative asset paths
support static hosting under a subpath.

Core implementation lives in `src/program/` (curriculum, progress, review,
transfer, session plans, player and drafts). `src/storage.js` owns saved-profile
persistence/migration; `PracticeProvider` owns shared practice controls.
`src/lessons/`, `src/score/` and `src/midi/` retain the optional earlier tools.
Historical implementation specs remain in `docs/superpowers/`; the current
scope and release gates are in the documents linked above.

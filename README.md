# Woodshed

Woodshed is a guided piano practice app for a returning learner: choose a small
musical goal, work from the score, try it without the model, record what happened,
and return to it later. No account or application server is required. Practice
history stays in the browser, with JSON export/import for backups and moving it.

The v1 core is **Guided Practice, Chords, Scales, Catalogue and Progress** across
**eight units, 193 self-contained exercises and 80 guided sessions**. A MIDI
keyboard and microphone are optional. Earlier piano/guitar tools remain available
through Catalogue; guitar is outside the guided piano course.

[Product direction](docs/DIRECTION.md) · [Release readiness](docs/release-readiness.md)
· [Teacher review and learner pilot](docs/teacher-review-pilot.md)

## The guided course

Each unit has five rolling practice days with two planned 20-minute visits:
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

Every core exercise includes a score, fingering, counting/practice steps,
listening goals and self-checks. **Hear slowly**, **Hear reference** and **Play
along** use the displayed score's notes and timing. Choose hands, tempo and a bar
range; use count-in, looping and optional model notes while playing. Pickups retain
their written timing and bar labels. Follow-score can be disabled to browse.
The synthesized model does not demonstrate a pianist's phrasing or assess touch.

The lesson and desktop practice rail share one tempo and playback controller.
The rail returns to its standalone metronome after the lesson closes. Playback
stops when the lesson is left. At 1024px and wider, navigation, the main view and
the practice rail form three panes; narrower windows use the compact layout.
**Score size** offers Fit width, 125% and 150%; the enlarged score is a focusable
region that can be scrolled with arrow keys. A **Skip to practice** link bypasses
navigation. With the system's reduced-motion preference, new lessons start with
follow-score off and decorative motion is suppressed; follow-score remains an
explicit learner choice.

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
previous hands, tempo, passage and next-step note. Up to three due options are
shown. Try once with the written score **before app playback**, report that first
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

After two qualifying steady returns since the last setback or transfer,
supported skills can receive a **fresh example** in an already taught key.
Six bounded families vary pulse, subdivision, landmark reading, held bass,
two-to-one coordination and a chord route. Examples have stable IDs; used ones
are skipped and an exhausted bank falls back to ordinary review. Fresh-example
reports are separate transfer evidence; they do not raise the original passage's
readiness or spacing. A difficult fresh attempt carries its repair note forward.
These intervals and eligibility rules are product defaults, **not a validated
mastery model or a promise of learning outcomes**.

Relevant lessons also offer **46 written/listening understanding questions** with
staff examples, audio and explanations. Answers are saved separately from piano
self-assessment and never lock lessons.

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
the production artifact is built/deployed. The intended site is
[Woodshed on GitHub Pages](https://jcscocca.github.io/woodshed/). A successful push
is not deployment evidence: record the completed workflow and live-site check in
the release checklist. Relative asset paths support static hosting under a
subpath.

Core implementation lives in `src/program/` (curriculum, progress, review,
transfer, session plans, player and drafts). `src/storage.js` owns saved-profile
persistence/migration; `PracticeProvider` owns shared practice controls.
`src/lessons/`, `src/score/` and `src/midi/` retain the optional earlier tools.
Historical implementation specs remain in `docs/superpowers/`; the current
scope and release gates are in the documents linked above.

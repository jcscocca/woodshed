# Woodshed — current direction

Updated for the v1 candidate. This replaces the September 23 piano/guitar daily-rotation
roadmap. Earlier specs describe historical implementations, not the current v1
release contract.

## Product and audience

Woodshed v1 is a guided piano practice app for a returning adult learner who
wants pulse, coordination and reading to catch up with music they enjoy.
The central loop is a small musical goal → an initial attempt → focused repair →
a saved next step → a delayed return. It works without MIDI, a microphone,
an account or an application server.

The core comprises Guided Practice, Chords, Scales, Catalogue and Progress:
193 self-contained exercises and 80 sessions across C, G, F, A minor, D, A, E
and musicianship across keys. The plan offers five rolling days per unit,
two 20-minute visits a day; 200 minutes per planned week and 1,600 across the
course. This is a flexible practice structure, not a time-to-mastery claim.

## v1 decisions

| Area | Current contract |
|---|---|
| Learning sequence | Key-based foundations connect rhythm, reading, coordination, scales and harmony to returning musical projects. All lessons remain open; placement helps choose a starting point. |
| Cumulative review | Global across practised units. A due check fits inside a newly started visit as 3 minutes review + 17 minutes of original lesson goals. Saved review preserves that allocation; review never completes a core block. |
| Retention evidence | First before-playback self-report remains separate from subsequent repair. Comparable delayed returns can extend 3/7/14/30-day gaps; difficulty returns sooner. Same-day practice cannot extend spacing. |
| Transfer evidence | Finite authored variations cover six supported skill families in familiar keys, after two qualifying returns. Used/exhausted variants fall back to ordinary review. Transfer does not raise the source passage's spacing/readiness. |
| Feedback | Minutes, readiness, criteria and musical notes are learner reports. Understanding questions assess the authored answer only. No implied automatic piano assessment or validated mastery score. |
| Player | Written score, hands, selected passage, loop, count-in and model/play-along. Open lesson and desktop rail share tempo/playback. Leaving a lesson stops its audio. Score size offers fit/125%/150%; enlarged notation supports keyboard scrolling. |
| Resume | Saved progress survives reload and export/import. Unfinished edits are scoped by lesson/session/review/variant and restored in the same tab; drafts are separate from history and are cleared on successful save/import/reset. |
| Platforms | Desktop is the primary layout at ≥1024px; the compact layout remains part of the core acceptance pass. Actual browser/device support is gated by the release matrix. |
| Persistence | Browser-local saved profile; JSON backup/import. No account, sync or server dependency. Recording is optional in-memory audio with explicit download. |
| Recovery and access | Unreadable saved data gets download/retry/backup recovery. Import/reset replaces history and clears drafts only after durable save. Skip-to-practice, visible focus and reduced-motion defaults support keyboard access. |
| Earlier tools | Piano repertoire, MIDI tools and exercise library stay accessible in Catalogue. Earlier guitar is optional retained scope, not a second guided v1 course. Older rotation settings are explicitly separate from the guided schedule. |

The source and arrangement limits are recorded in
[piano-curriculum-evidence.md](piano-curriculum-evidence.md); the
[topic checklist](piano-topic-coverage.md) establishes coverage only. Interval
choices, session duration and transfer eligibility are product defaults. No
teacher review or learner pilot is implied by having content and passing tests.

## Release decision

Finish the current core before expanding it. The
[release checklist](release-readiness.md) tracks automated checks, browser/device
acceptance, storage/recovery and PWA upgrades. The
[teacher review and learner pilot](teacher-review-pilot.md) supplies the human
content and usability gates across all eight units.

A deployable candidate may be published for this review. The final v1 tag and
claims of release readiness stay on hold until blocking findings are resolved,
required environments have evidence, and the human review/pilot is recorded.
Unfinished gates must remain visibly pending.

Pull requests run reusable release checks on a GitHub-hosted runner: runtime
dependency audit, Node suites and production Chromium/WebKit acceptance. Main's
Pages deploy depends on the same checks. A workflow definition is not a passing
workflow run; the checklist records actual candidate results.

## Retained history and boundaries

The earlier daily-rotation engine and MIDI score tools have separate progress
rules. Their successful checks do not establish learning outcomes for the guided
course. Guitar mic grading/Echo remain disabled behind `COACH_ENABLED`; piano's
earlier MIDI tools do not create a microphone requirement for core lessons.
Bass and accordion remain archived outside the build.
The [earlier tools reference](earlier-practice-tools.md) preserves MIDI, scoring,
song editing and keyboard usage with current Catalogue entry paths.

Cross-device sync, a native Android wrapper, generated curricula and notifications
are outside this release. Historical specs remain useful implementation context;
they do not create additional v1 work or override the acceptance gates above.

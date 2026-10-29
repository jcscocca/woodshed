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
196 self-contained exercises and 80 sessions across C, G, F, A minor, D, A, E
and musicianship across keys. The plan offers five rolling days per unit,
two 20-minute visits a day; 200 minutes per planned week and 1,600 across the
course. This is a flexible practice structure, not a time-to-mastery claim.

A separate [all-key reference](continuing-scales.md) extends the Scales tab
through all twelve major and minor tonics, three minor forms, longer ranges,
arpeggios, contrary motion and chromatic work. It accompanies the eight units;
its visits are optional practice, not additional fixed weeks or a completion path.

[Integrated lessons](integrated-lessons.md) revise 23 existing visits so the
actual music determines the preparation. Three focused exercises fill specific
gaps in Canon, Mozart and the blues; existing material supplies the other
connections. The inventory is 637 active exercises: 196 course exercises and
441 optional reference setups. There are 50 active understanding questions and
nine supported transfer families with 200 bounded studies; the earlier 176
studies and all 637 existing scores remain unchanged. Removed experimental units are retained only
as historical display metadata, including 15 earlier question definitions.

## v1 decisions

| Area | Current contract |
|---|---|
| Learning sequence | Key-based foundations connect rhythm, reading, coordination, scales and harmony to returning musical projects. All lessons remain open; placement helps choose a starting point. |
| All-key reference | Pattern/range and key selection make the optional bank usable when a piece needs another key, form or range. Saved visits join shared history and due returns; there is no requirement to complete the bank. |
| Musical integration | Preparation names the actual passage, register, hand movement or harmony it serves. Existing visits remain twenty minutes. New plan identities prevent old block credit from claiming new work; started plans retain their original allocation. |
| Technical scope | Learners explicitly report chunk/ascent/round-trip. Full-range and delayed-return labels also require appropriate bars, hands and tempo. They describe these reports without locking content or measuring performance. |
| Cumulative review | Global across practised units, with related preparations/projects rotating as recommendations while the raw passage backlog stays visible. A check fits inside a new visit as 3 minutes review + 17 minutes of original lesson goals. High workload can recommend one new 20-minute consolidation per day; pending visits remain resumable and regular lessons stay available. No sibling completion/readiness/spacing credit is created. |
| Retention evidence | First before-playback self-report remains separate from subsequent repair. Comparable delayed returns can extend 3/7/14/30-day gaps; difficulty returns sooner. Same-day practice cannot extend spacing. |
| Transfer evidence | Finite authored variations cover nine supported skill families in familiar keys, after two qualifying returns. The three added families test Canon travel, Mozart's fixed position and blues seventh chords. Used/exhausted variants fall back to ordinary review. Transfer does not raise the source passage's spacing/readiness. |
| Feedback | Minutes, readiness, criteria and musical notes are learner reports. Understanding errors have their own answer-only repair loop; same-day correction needs a later-date confirmation. These zero-minute reports award no piano practice, block or spacing credit. No automatic piano assessment or validated mastery score is implied. |
| Player | Written score, hands, selected passage, loop, count-in and model/play-along. Open lesson and desktop rail share tempo/playback. Responsive layout changes keep the same lesson, draft and take mounted; mobile Tuner uses the same ownership and recording/save locks. Leaving a lesson stops its audio. Score size offers fit/125%/150%; enlarged notation supports keyboard scrolling. |
| Resume | Saved progress survives reload and export/import. Original saved work normally retains its plan; a completed revision counts that visit once while keeping earlier unfinished work accessible. Partial versions never combine into completion. Same-tab review/fresh-example drafts restore the exact source, variant, score and first report even if the queue changes. Drafts remain separate from history and clear on successful save/import/reset. |
| Platforms | Desktop is the primary layout at ≥1024px; the compact layout remains part of the core acceptance pass. Actual browser/device support is gated by the release matrix. |
| Persistence | Same-origin Web Locks serialize mutations against the latest browser-local profile. Revision checks reject stale replacements/corrections; a new import/reset generation prevents stale history from returning. Ordinary remote updates retain the lesson; backups read the latest profile. Unsupported locking means explicit read-only saved-profile behavior. Older builds outside this protocol are not protected. No cross-device sync or server dependency. |
| Earlier forms and song editing | Forms close only after durable success. Song typing stays local while saves serialize/coalesce against the accepted song base. Failures retain exact fields, tempo text and selection across same-tab navigation/reload. Retry does not silently overwrite a remote conflict; using saved songs requires confirmation before discarding the draft. Import/reset synchronously invalidates old draft writers and queued retries. |
| Recovery and access | Unreadable saved data gets download/retry/backup recovery. Import/reset replaces history and clears drafts only after durable save. Skip-to-practice, visible focus and reduced-motion defaults support keyboard access. |
| Earlier tools | Piano repertoire, MIDI tools and exercise library stay accessible in Catalogue. Earlier guitar is optional retained scope, not a second guided v1 course. Older rotation settings are explicitly separate from the guided schedule. |

The source and arrangement limits are recorded in
[piano-curriculum-evidence.md](piano-curriculum-evidence.md); the
[topic checklist](piano-topic-coverage.md) establishes coverage only. Interval
choices, session duration and transfer eligibility are product defaults. No
teacher review or learner pilot is implied by having content and passing tests.
The [critical audit fixes](audit-fixes.md) records the concurrency boundary,
review-load design, corrected C-major preparation and verification limits.

Recommendation families are an explicit scheduling choice, not interchangeable
retention evidence. The 187 distinct scheduled exercises form 148 recommendation
families, including 18 multi-source groups. A comparable steady cold return may
pause related recommendations for three days; ordinary practice and failed or
narrower returns cannot. A passage seven days overdue bypasses the pause.
Technical key/form/range/hand setups remain independent. The illustrative
all-ready run still needs 152 visits/3,040 minutes and ends with overdue work;
there is no forty-practice-day completion or fully serviced-review guarantee.

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

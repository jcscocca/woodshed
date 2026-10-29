# v1 release readiness

**PASS** means the named check has evidence for the recorded application code and
environment. **PENDING** means it has not been demonstrated. Software checks do
not establish physical playing, teaching quality or learner outcomes.

## Current audit-fix release revision

This release revision retains **eight units, 80 authored twenty-minute course
visits and 1,600 planned course minutes**. Repeated or consolidation visits can
extend the actual practice schedule. The active inventory is **637 exercises:
196 course exercises and 441 optional reference setups**. All 637 existing scores
remain unchanged by the audit fixes. The 23 integrated visits and three focused
preparations remain in the existing course; the separate bridge units stay
removed.

There are **50 active understanding questions**, **15 historical definitions**,
and **200 bounded transfer studies across nine supported families**. The prior
176 transfer studies and 61 prior question definitions are unchanged; four new
questions and 24 new transfer studies support the three focused preparations.
See [audit fixes](audit-fixes.md) and [integrated lessons](integrated-lessons.md).

Current-build profile mutations use same-origin Web Locks against the latest
durable state. Revision/generation checks reject stale replacements and prevent
import/reset resurrection; ordinary remote reports retain the open lesson.
Unsupported locking refuses saved-profile writes with an explicit warning.
Older already-open builds that do not follow this protocol are outside its
guarantee. Responsive lesson ownership, exact draft resume and zero-minute
concept repair are part of the new verification scope.

Review recommendations rotate explicit related preparations/projects without
changing raw passage evidence. One new consolidation is recommended per day
after a saved check; unfinished plans can resume and core lessons stay available.
The raw backlog stays visible. The synthetic all-ready model needs 152 visits /
3,040 minutes to complete the 80 course visits and still has 98 raw passages due,
80 recommended checks due and an oldest overdue age of 18 days. This does not
establish a forty-practice-day completion or complete review-service guarantee.

| Gate | Current evidence / limit |
|---|---|
| Final Node suite | **PASS after the SongEditor reset-race guard:** complete `npm test` on Node 26.8.1 and actual Node 22.23.4, including musical, persistence, concept, scheduling and SongEditor regressions. |
| Production build | **PASS after the guard:** final production builds on Node 22.23.4 and Node 26.8.1, including service-worker generation. The Node-26 build generated an 18-entry precache. |
| Dependency audit | **PASS runtime: zero findings.** Full audit: zero high/moderate and four low entries caused by one unpatched deepmerge advisory in the Workbox build chain. No forced override, downgrade or audit exclusion was applied. |
| Final production browser suite | **PASS:** clean full run against the frozen post-guard source: 60 scheduled, 58 passed and two intentional project skips in 1.5 minutes. Twenty cases run in desktop Chromium, narrow Chromium and WebKit; the real PWA upgrade/offline case runs only in desktop Chromium, with the other two instances intentionally skipped. |
| Earlier forms and song editing | **PASS in final Node suites:** 15 focused SongEditor cases, seven draft-reset checks and 22 App checks cover ordered/coalesced saves, exact failure drafts, selection, raw tempo text, explicit retry and synchronous invalidation of stale draft writers. Earlier forms await durable success. |
| Current live preview | **PASS within observed IAB scope:** the earlier `127.0.0.1:51915` check covered corrected C4B restoration and playback. The follow-up walkthrough below used the isolated `127.0.0.1:51917` profile for complete C1A, concept repair, all-key scales, songs and compact controls. No physical piano performance was measured. |
| Hosted CI and deployment | **PENDING:** matching hosted checks and deployment must certify the published revision; local verification alone does not establish these gates. |
| Teacher, learner and physical-device gates | **PENDING:** independent teacher review, learner returns, native devices, real instruments and assistive-technology acceptance remain outstanding. |

The dependency update moves Vite to **6.4.5**, a branch still receiving security
patches, and retains the PWA configuration and runtime dependency versions.
Official evidence: [Vite support policy](https://vite.dev/releases),
[deepmerge advisory: no patched version](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
An isolated Node-22 `npm ci --ignore-scripts` checks lockfile consistency; actual
Node-22/26 builds check the installed toolchain. Workbox's glob-11 deprecation
warning remains upstream and is not represented as a clean full toolchain.

Local dependency evidence on the testing Mac:
`/private/tmp/woodshed-dependency-audit.json`,
`/private/tmp/woodshed-dependency-runtime-audit.json`,
`/private/tmp/woodshed-dependency-build.log`,
`/private/tmp/woodshed-dependency-node22-build.log`, and
`/private/tmp/woodshed-dependency-ci.log`.
Final frozen-source verification is also recorded at
`/private/tmp/woodshed-audit-final-browser.log` and
`/private/tmp/woodshed-audit-final-node26-build.log`.
These temporary local files are not published CI artifacts. The current IAB
screenshot is retained on the testing Mac at
`/private/tmp/woodshed-audit-fixes-proof/restored-integrated-lesson.png`.
The preceding audit verification was recorded before publication, with an empty
index and HEAD at `a59e3ca`. That is historical pre-commit evidence; publication
and subsequent hosted results are tracked in Git and the matching hosted checks.

### Follow-up live walkthrough · 2026-10-28

**PASS within the observed UI scope; no new confirmed bugs.** The isolated local
preview at `127.0.0.1:51917` completed all four C Day 1 A blocks after restoring
passage, loop and note edits through navigation and reload. A wrong written-note
answer produced a concept follow-up; its corrected answer saved separately.
Progress remained four reported piano minutes, one practice day and one of 80
course visits. These were UI fixture reports rather than measured playing.

The all-key reference showed D-flat, two octaves and both hands with its written
notation and explicit chunk scope; filter choices survived navigation. Two
independent songs survived reload with their titles, chords and tempo edits
(including tempo 82). Invalid `H` chord input produced an explanation, and a
corrected Dm/G7/C progression could be saved.

Changing the live viewport from 1,264 pixels wide to 900 and back retained the
active C-chord lesson and draft. Compact Tuner stopped the owned playback and
waited for an explicit **Start listening** action; no microphone was opened.
Runtime source was unchanged since the passing Node-22/26 suites, both production
builds and 58-case browser result above. This walkthrough does not establish
physical-piano, real-microphone or learner acceptance.

## Prior integration verification

Before the critical audit fixes, local `npm test` and the production build passed.
The expanded integration suite scheduled 39 browser cases: 34 passed, two duplicate
PWA cases were intentionally skipped, and three earlier-plan instances initially
failed because the test omitted opening the disclosure. After adding that user
action, the three targeted instances passed. Thus **37 applicable cases passed
across that run and rerun**. Those results do not certify the later persistence,
interface, concept-repair or review-scheduling changes.

The prior IAB walkthrough observed eight selectable units, readable removed-unit
history, Canon preparation playback, Mozart's fixed position and E7/A7/B7
preparation. It did not establish native-browser or physical-piano acceptance.
Its logs remain at `/private/tmp/woodshed-integrated-all-tests.log`,
`/private/tmp/woodshed-integrated-build.log`,
`/private/tmp/woodshed-integrated-browser-final.log` and
`/private/tmp/woodshed-integrated-progress-browser.log`.

## Historical candidate record — a59e3ca

The following release evidence is preserved from
[`a59e3ca`](https://github.com/jcscocca/woodshed/commit/a59e3ca). It describes the
earlier application-code candidate and its environments. Its inventory and PASS
entries do not certify the current working tree above.

Tested application-code commit:
[`74097c37f1d8d2db58441c6d7c2f4fdce3f8e1e0`](https://github.com/jcscocca/woodshed/commit/74097c37f1d8d2db58441c6d7c2f4fdce3f8e1e0).
Candidate changes: [PR #4](https://github.com/jcscocca/woodshed/pull/4).
A later documentation-only commit does not change the tested application code.
Candidate tag target: [`v1.0.0-rc.1`](https://github.com/jcscocca/woodshed/tree/v1.0.0-rc.1).
The tag is published only after the matching Pages deployment and its isolated
production smoke check pass; the tag reference identifies the published commit.
Final v1 tag: **HOLD — native/device and human gates remain pending**.

## Historical evidence matrix

| Gate | Status | Evidence / limits |
|---|---|---|
| Core inventory and scope | PASS | 8 units, 193 exercises including 3 placement checks, 80 sessions and 1,600 original planned minutes. Guided piano and retained optional tools are distinguished in the docs. |
| Node suite and production build | PASS | Full Node-22 suite and build in [release-check run 40805391869](https://github.com/jcscocca/woodshed/actions/runs/40805391869). Also passed locally on 2026-10-28, Node 26.8.1; seven targeted recovery checks pass. |
| Runtime dependency audit | PASS | Runtime audit passes in the same CI run; local `npm audit --omit=dev` reported zero runtime vulnerabilities. Full development-toolchain advisories remain a bounded follow-up below. |
| Production browser suite | PASS — engine coverage | 18 scheduled: **16 passed, 2 intentionally skipped**. Five application cases pass in desktop Chromium, narrow Chromium and desktop WebKit. The real service-worker upgrade case runs once in desktop Chromium and is intentionally skipped in the other two projects. |
| Live UI checks | PASS — observed IAB scope | Wide and compact in-app-browser checks confirm skip/main focus, enlarged-score keyboard scrolling without tempo changes or body overflow, and isolated corrupt-profile recovery. This is not native Safari/Chrome/Edge acceptance or an audible piano test. |
| Keyboard and automated accessibility | PASS — tested screens | Skip link, main focus, enlarged-score arrow keys and reduced-motion default pass in all three projects. Axe reports no WCAG 2 A/AA and 2.1 AA rule violations on the guided lesson and Settings. VoiceOver/manual accessibility and native 200% zoom remain pending. |
| Recovery/import/export | PASS — software scenarios | All three browser projects pass export→reset→durable import, original corrupt-byte download and a quota-rejected recovery replacement followed by successful retry. Component tests cover additional failure/reset/draft cases. |
| PWA offline/update | PASS — automated desktop Chromium | Two real builds change the hashed application entry and service-worker manifest. Settings/meta version identifiers update; offline saved history, draft restoration and a previously unopened score work. Installed native/mobile lifecycle acceptance remains pending. |
| Native browser/device acceptance | PENDING | Native Chrome/Edge/Safari, physical phones and real audio/MIDI are not established by engine tests or IAB. A native Safari control attempt was interrupted and is not a completed acceptance pass. |
| Teacher spot-check | PENDING | Complete all eight units using [teacher-review-pilot.md](teacher-review-pilot.md). Software/source checks are not an independent teaching review. |
| Learner pilot and delayed returns | PENDING | Seven-day usability pilot plus the genuine seven-day-gap follow-up around Day 10. Record actual dates, assistance and natural fresh-example eligibility. |
| Pull-request CI | PASS | [Run 40805391869](https://github.com/jcscocca/woodshed/actions/runs/40805391869) succeeded for the application-code candidate. Recheck any subsequent code change; documentation-only changes still follow the PR checks. |
| Production deployment | PASS — observed published code | [Main workflow 40806356185](https://github.com/jcscocca/woodshed/actions/runs/40806356185) published `640af30a4247`. Public HTML and the upgraded IAB Settings/meta match; the existing A-major selection and empty history remain intact. The tagged candidate additionally requires the new `verify-deployment` job described below. |
| Final v1 decision | PENDING / HOLD | Human/environment gates must be recorded before final v1 approval. |

CI runs on an ephemeral GitHub-hosted Linux runner with Node 22 and Playwright
1.64.1's Chromium/WebKit projects. The run retains the browser report and failure
artifacts. Exact runner/engine details belong to that run's logs/artifacts; these
projects do not certify branded browsers or physical devices.

Every Pages deployment now ends with `verify-deployment` on a fresh hosted
Chromium context. It polls the actual HTTPS release for up to 90 seconds, matches
Settings/meta version, saves an explicitly labeled one-minute fixture and checks
it after reload in Progress. It uploads `evidence.json` and a success/failure
screenshot as `deployed-smoke-<run>-<attempt>`. The context is discarded and never
touches a person's existing profile. The [Pages workflow history](https://github.com/jcscocca/woodshed/actions/workflows/pages.yml)
contains the matching run and evidence for each candidate commit; a deployment
is accepted only when this final job also passes.

The initial WebKit first-Tab failure was traced to the loading shell being
replaced during the focus check. The test now waits for the actual application
before pressing Tab and retains its focus assertions. Native form controls use
the dark color scheme consistently. These fixes are included in the passing run.

Known dependency follow-up: the full development-toolchain audit still reports
advisories. The runtime-only audit is clean; all dependencies are not claimed
clean. Review those build/test-tool advisories and a compatible toolchain upgrade
in a separate bounded change, then rerun Node, browser and PWA checks. Record the
full audit's disposition at release; avoid an unreviewed forced upgrade.

## Browser and device evidence

A responsive/emulated viewport checks layout, not real mobile touch, audio,
storage or installation. Proposed native v1 environments remain pending unless
the owner explicitly narrows the launch matrix and updates compatibility guidance.

| Environment | Core flows / data | Keyboard / layout | PWA lifecycle | Evidence / remaining human check |
|---|---|---|---|---|
| Playwright Chromium desktop, 1280×900 | PASS, five application cases | PASS, tested lesson/Settings axe checks | PASS, real A→B build/offline case | Linux CI engine; no physical instrument or installed desktop-window claim. |
| Playwright Chromium narrow, 390×844 with mobile/touch emulation | PASS, five application cases | PASS, tested lesson/Settings axe checks | Intentionally skipped | Emulation does not establish Android hardware support. |
| Playwright WebKit desktop, 1280×900 | PASS, five application cases | PASS, tested lesson/Settings axe checks | Intentionally skipped | WebKit engine is not a completed Safari-app acceptance pass. |
| Codex IAB on macOS, 1280 wide / 390 narrow | PASS, observed UI/recovery subset | PASS, skip/main/enlarged-score checks | Not assessed as native install | Narrow client width 375; score overflow stays inside its scroll region. |
| Native Chrome desktop on macOS or Windows | PENDING | PENDING | PENDING | Record browser/version/OS, native zoom and actual audio. |
| Native Edge desktop on Windows or macOS | PENDING | PENDING | PENDING | Do not infer from Chromium CI. |
| Native Safari on macOS | PENDING | PENDING | PENDING where available | Interrupted attempt supplies no completed acceptance evidence. |
| Safari on a physical iPhone/iPad | PENDING | PENDING | PENDING where available | Touch, orientation, safe areas, background/resume and actual audio. |
| Chrome on a physical Android phone | PENDING | PENDING | PENDING | Touch, background/resume, audio and installed launch. |

For each human result record: `commit/version | date | browser/version | OS/device
| viewport/zoom | scenario/profile | observed result | evidence | tester`.

## Software scenario coverage

All PASS entries below refer to the tests' assertions, not teacher judgments or
heard/performed music. The browser cases use explicit simulated practice notes.

| Scenario | Status and evidence | Limit |
|---|---|---|
| Placement, guided blocks, drafts, completion | PASS — first application case in all three projects: complete three placement checks and all four Session-A blocks, navigate/reload a draft, restore passage/loop/note, and reveal/focus the final next action. | Learner's actual piano skill is not measured. |
| Shared lesson/rail tempo and transport | PASS — desktop browser tempo assertion and component controller/audio tests, including 6/8 pulses and pickup downbeats. | Real speaker output, latency and physical MIDI remain human checks. |
| Passage, hands, count-in, loop and pickups | PASS — Node playback/passage/source suites plus restored browser passage/loop choices. | Not every lesson is manually played on every browser. |
| Integrated 3+17 review and first evidence | PASS — second application case preserves first-before-playback assessment through navigation/repair and resumes the saved 17-minute core allocation. Component tests cover assistance and immutable scope. | These are product scheduling defaults, not demonstrated retention gains. |
| Fresh-example eligibility and isolation | PASS — Node transfer/review/draft suites cover distinct returns, finite variants, setbacks, isolated reports and fallback. | No natural learner fresh-example result has been collected. |
| Cross-section credit / history correction | PASS — full Node progress/flow/storage suites cover matching blocks, correction/removal and recalculated queue/position. | Not a claim of native-browser manual coverage for every history edit. |
| Completion focus and navigation | PASS — placement/session completion focus and viewport visibility in all three browser projects; scroll logic also has component regressions. | Screen-reader experience still needs manual review. |
| Skip, enlarged score, reduced motion | PASS — fifth application case: first Tab reaches skip, Enter focuses main, 150% score scroll keeps lesson tempo unchanged, reduced-motion starts follow-score off. IAB live checks corroborate wide/narrow behavior. | Manual VoiceOver and native browser 200% zoom remain pending. |
| Guided lesson / Settings accessibility scan | PASS — axe checks with `wcag2a`, `wcag2aa`, `wcag21aa` tags in all three projects. | No claim of whole-app WCAG conformance; automated scans cover these screens/rules only. |
| Recording ownership and resource cleanup | PASS — Node recording/audio-ownership tests. | Real permission prompts, microphone/speaker performance and take download need physical-device checks. |

Local live evidence is retained at
`/private/tmp/woodshed-release-proof/recovery-preserves-original.jpg` and
`/private/tmp/woodshed-release-proof/narrow-enlarged-score.jpg` on the testing Mac;
these temporary paths are not published CI artifacts. The IAB narrow test used
a 470px score within a 313px scroll region, with no horizontal body overflow.
In isolated profile `127.0.0.1:51906`, the original corrupt demo bytes downloaded
exactly, Retry stayed in recovery, and a valid restored backup survived reload.

## Data and failure evidence

| Case | Status / evidence | Boundary |
|---|---|---|
| Existing C/current multi-unit saves | PASS — Node migration/storage tests preserve stable IDs, selected units, completion and first-check/review associations. | No cross-device sync promise. |
| Export/import after reset | PASS — third application case in all three projects verifies exported guided history after durable replacement and reload. | Audio and unfinished drafts are not included in export. |
| Unreadable profile and original-byte download | PASS — fourth application case preserves corrupt JSON, downloads exact bytes and remains in recovery after Retry. IAB live recovery corroborates. | Original raw download is available only when storage could be read. |
| Recovery quota failure / retry | PASS — fourth browser case refuses replacement under injected quota failure, preserves the original, then succeeds when writes resume. | Deliberate fault injection in a disposable profile. |
| Failed normal save/import/reset | PASS — targeted recovery, player and draft-reset component tests retain existing saved data, pending backup and unfinished work until successful persistence. | Every physical browser storage policy has not been exercised. |
| Invalid backup selection | PASS — recovery component tests reject/discard invalid file selection instead of restoring a previously selected file. | Backup validation is not a general-purpose corruption repair service. |
| Draft storage failure | PASS — draft tests retain newer in-memory work when session storage fails and clear all owned draft contexts after successful replacement. | Closing the tab can lose unfinished work; drafts are not durable history. |
| Correct/remove reports | PASS — Node progress/review suites recalculate from remaining history. | Imported completion-only history follows its documented compatibility rules. |
| Concurrent tabs | Not supported as synchronized editing | No conflict merge is promised; avoid concurrent edits and export important history. |

## PWA evidence and remaining native acceptance

The passing desktop Chromium case serves production bundles at `/woodshed/` on a
loopback origin eligible for service workers. It is a real service-worker cache
and update test, not an installed native app-window/HTTPS deployment test:

1. Build A exposes a version in Settings and the `woodshed-release` meta tag.
   Its worker controls the page; the test saves history and an unfinished draft.
2. A real Vite build B changes the release ID, hashed application entry and
   generated worker precache. The new controller activates, then reload shows
   B's Settings/meta version and a different hashed entry.
3. The saved draft survives the upgrade. Offline reload restores that draft;
   Progress shows saved history; opening a previously unopened chord lesson
   renders its score and enabled controls without network access.

This case runs once, in desktop Chromium; its other two project instances are
the **two intentional skips**. Native install/uninstall/relaunch, closing all
app windows, mobile background/resume, interrupted first load/update, actual
HTTPS deployment and the rest of the native browser matrix remain human
acceptance. First-ever offline navigation is not expected to have a cache.
Use a disposable profile and retain a backup; never fix a cache problem by
silently clearing practice history.

## Remaining actions and release decision

1. **Human environment checks:** finish native-browser/physical-device matrix,
   actual audio/MIDI/recording, VoiceOver and native 200% zoom. Record any explicit
   scope narrowing and optional limitations.
2. **Human learning checks:** complete the eight-unit teacher spot-check and
   learner pilot, including actual Day-3 and seven-day-gap returns and a naturally
   eligible fresh example. Keep unobserved outcomes pending.
3. **Decision:** resolve blocking findings, record the bounded development-tool
   audit follow-up/accepted limitations and explicitly approve or extend the
   candidate. Final v1 stays on hold until this record is complete.

- Tested application code / PR: **74097c3 / PR #4**, linked above.
- Passing PR checks: **run 40805391869**, linked above.
- Published application-code evidence: **run 40806356185 / 640af30a4247**, linked above.
- Candidate publication: **v1.0.0-rc.1**, gated by the matching green Pages run,
  including its `verify-deployment` evidence. Resolve the tag for its final SHA.
- Native/device/assistive-technology acceptance: **PENDING**.
- Teacher review and learner pilot: **PENDING**.
- Final v1 approval / tag / rollback record: **HOLD**.

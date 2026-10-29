# v1 release readiness

**PASS** means the named check has evidence for the recorded application code and
environment. **PENDING** means it has not been demonstrated. An automated or
simulated result is not physical-browser, instrument, teacher or learner evidence.

Tested application-code commit:
[`74097c37f1d8d2db58441c6d7c2f4fdce3f8e1e0`](https://github.com/jcscocca/woodshed/commit/74097c37f1d8d2db58441c6d7c2f4fdce3f8e1e0).
Candidate changes: [PR #4](https://github.com/jcscocca/woodshed/pull/4).
A later documentation-only commit does not change the tested application code.
Candidate tag: **PENDING — record after merge and deployment verification**.
Final v1 tag: **HOLD — native/device and human gates remain pending**.

## Current evidence

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
| Production deployment | PENDING | Merge, passing main acceptance/Pages workflow, deployed version/assets and deployed-origin save/reload verification still require evidence. |
| Final v1 decision | PENDING / HOLD | Human/environment gates and deployment must be recorded before final v1 approval. |

CI runs on an ephemeral GitHub-hosted Linux runner with Node 22 and Playwright
1.64.1's Chromium/WebKit projects. The run retains the browser report and failure
artifacts. Exact runner/engine details belong to that run's logs/artifacts; these
projects do not certify branded browsers or physical devices.

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

1. **Deployment:** merge the candidate after its checks, verify the passing main
   acceptance and Pages workflow, compare deployed Settings/meta version and
   assets, and perform a short deployed-origin save/reload check. Record the
   candidate tag only after it is actually published.
2. **Human environment checks:** finish native-browser/physical-device matrix,
   actual audio/MIDI/recording, VoiceOver and native 200% zoom. Record any explicit
   scope narrowing and optional limitations.
3. **Human learning checks:** complete the eight-unit teacher spot-check and
   learner pilot, including actual Day-3 and seven-day-gap returns and a naturally
   eligible fresh example. Keep unobserved outcomes pending.
4. **Decision:** resolve blocking findings, record the bounded development-tool
   audit follow-up/accepted limitations and explicitly approve or extend the
   candidate. Final v1 stays on hold until this record is complete.

- Tested application code / PR: **74097c3 / PR #4**, linked above.
- Passing PR checks: **run 40805391869**, linked above.
- Main deploy run / deployed version / live verification: **PENDING**.
- Candidate tag: **PENDING**.
- Native/device/assistive-technology acceptance: **PENDING**.
- Teacher review and learner pilot: **PENDING**.
- Final v1 approval / tag / rollback record: **HOLD**.

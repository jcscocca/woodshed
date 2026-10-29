# v1 release readiness

This is a release record, not a claim that the gates have passed. **PASS** means
the named check has evidence for the recorded candidate/environment. **PENDING**
means it has not been demonstrated. **BLOCKED** means a recorded finding prevents
acceptance. An automated or simulated result must not be relabeled as a physical
browser, instrument, teacher or learner result.

Release candidate commit: **PENDING — fill after committing the candidate**.
Final v1 tag: **HOLD — human and environment gates below are pending**.

## Current evidence

| Gate | Status | Evidence / remaining work |
|---|---|---|
| Core inventory and scope | PASS | Source inventory: 8 units, 193 exercises including 3 placement checks, 80 sessions, 1,600 original planned minutes. README and DIRECTION distinguish the guided core from retained tools. |
| Candidate Node suite and build | PASS — local worktree | `npm test` (including app recovery) and `npm run build` passed on 2026-10-28 local time, Node 26.8.1. Seven targeted recovery checks also passed. Candidate commit and Node-22 CI rerun remain pending. |
| Runtime dependency audit | PASS — local worktree | `npm audit --omit=dev` reported zero runtime vulnerabilities. This does not mean the full development dependency audit is clean; see known follow-up below. |
| Production browser suite | PENDING | `npm run test:browser` builds the app, then runs Playwright desktop Chromium, narrow Chromium and desktop WebKit. Record actual passes/skips and evidence; PWA upgrade coverage is intentionally limited to its supported test project. |
| Candidate live UI pass | PENDING | Complete the scenario pass below. Earlier testing used the Codex in-app browser and found tempo, draft, completion-scroll and settings issues; fixes require candidate evidence. |
| Desktop/compact keyboard access | PENDING | Record viewport, keyboard-only result and assistive-technology check, including focus after saves/errors. |
| Recovery/import/export | PENDING — real-browser acceptance | Seven targeted component-boundary recovery checks pass locally. Run the real-browser failure/round-trip scenarios below against a disposable profile. |
| PWA offline/update | PENDING | Test a built, installed HTTPS app across two versions. A Vite dev run does not exercise the production service worker. |
| Browser/device matrix | PENDING | No native Chrome, Edge, Safari or physical mobile-device acceptance is established by the in-app-browser run. |
| Teacher spot-check | PENDING | Complete the eight-unit review in [teacher-review-pilot.md](teacher-review-pilot.md). Source/notation tests are not an independent teaching review. |
| Learner pilot and delayed returns | PENDING | Seven-day usability pilot plus the Day-10 return follow-up; record actual elapsed days and eligibility. |
| CI and deployment | PENDING | Candidate push, successful Pages workflow, live asset/version check and a short deployed-origin save/reload pass. |
| Final release decision | PENDING | Resolve release blockers, record any explicitly deferred optional-tool issue, then approve/tag v1. |

Record each result as: `commit | date/time | browser/version | OS/device |
viewport | test/profile | observed result | evidence link | tester`.

Known dependency follow-up: the full development-toolchain audit still reports
advisories. The runtime-only audit is clean; do not describe all dependencies as
clean. Review the existing build/test-tool advisories and a compatible toolchain
upgrade in a separate bounded change, then rerun the Node, production-browser
and PWA acceptance checks. Record the full audit and explicit disposition at the
release decision; avoid an unreviewed forced dependency upgrade during this pass.

Pull-request release checks run on ephemeral GitHub-hosted runners. They install
Chromium/WebKit, run the runtime audit, Node suites and `npm run test:browser`,
and retain browser reports/traces/screenshots. Main's Pages workflow calls the
same checks before building/deploying. **CI/deployment status remains PENDING**
until the candidate's completed runs are linked here.

## Browser and device acceptance

These are proposed v1 acceptance environments, not a completed support claim.
Use the stable browser available on the test date and record its exact version.
A responsive desktop viewport checks layout only; it does not substitute for
mobile touch, audio, storage or installation behavior.

| Environment | Core lesson/playback/save | Draft + recovery | Install/offline/update | Current evidence |
|---|---|---|---|---|
| Codex in-app browser on macOS, wide and compact viewports | PENDING candidate retest | PENDING | Not a substitute for native install testing | Prior local UI playthrough only; no native-browser equivalence claimed. |
| Chrome desktop on macOS or Windows | PENDING | PENDING | PENDING | Record actual OS/version. |
| Edge desktop on Windows or macOS | PENDING | PENDING | PENDING | Record actual OS/version; do not infer from Chrome. |
| Safari on macOS | PENDING | PENDING | PENDING where available | Verify user-initiated audio and storage/permissions explicitly. |
| Safari on a physical iPhone/iPad | PENDING | PENDING | PENDING where available | Test touch, orientation, safe areas and return from background. |
| Chrome on a physical Android phone | PENDING | PENDING | PENDING | Test touch, background/resume and installed launch. |

Core acceptance must work with no connected keyboard and no microphone
permission. Test optional recording/MIDI separately where the browser offers
them. If the intended launch matrix is narrowed, record that decision and its
visible compatibility guidance before removing a required row.

## Core scenario pass

Use a disposable profile or exported test backup, never a learner's only history.
Separate simulated UI reports from actual piano attempts in notes.

- [ ] Fresh start: all three placement checks can be completed or skipped; their
  reports remain separate from practice minutes. Final feedback and the next
  action are visible and keyboard-focusable in both layouts.
- [ ] Complete a four-block guided visit, navigate away mid-block, resume and
  reload. The correct unfinished block opens; report fields, passage and checked
  understanding answers restore without gaining completion credit.
- [ ] Close/reopen a lesson, change units and resize across 1024px. Audio stops
  when leaving; the matching draft restores; another lesson/context is isolated.
  A fresh transfer variant must not inherit another variant's answer/report.
- [ ] Lesson tempo, rail tempo, arrows and tap agree. Rail Start/Stop controls
  the active lesson; metre reflects the score. Closing the lesson restores the
  standalone metronome. Recording/saving/playback locks prevent competing audio.
- [ ] Select hands and a small passage; count in, loop, follow score, stop and
  replay. Include a pickup/partial bar and a 6/8 example, not only 4/4.
- [ ] Final Save presents completion and the next session without leaving the
  user deep down the old lesson. Keyboard focus moves to meaningful feedback;
  focus remains visible after dialogs, failed saves and progress corrections.
- [ ] Skip to practice bypasses repeated navigation. Fit-width/125%/150% notation
  remains readable without page overflow; the enlarged score is keyboard
  scrollable. Reduced-motion preference starts follow-score off for a new
  lesson, suppresses decorative motion and still permits the learner's choice.
- [ ] Save a due review: 3 review + 17 core minutes stays within 20 after reload.
  It does not complete a core block or change the selected unit. Skipping review,
  an already-started session and a completed-session revisit keep their plan.
- [ ] First-return result retains its original tempo/hands/passage. Hearing the
  model first or reopening a playback-assisted draft cannot create a false
  before-playback report. Later repair does not overwrite the first result.
- [ ] Qualified fresh-example eligibility uses distinct delayed returns. Used
  variants are skipped; difficulty carries its repair note forward and does not
  inflate the original passage's progress. Exhaustion falls back to review.
- [ ] Chords/Scales matching credit, Catalogue alternatives, history correction
  and removal all recalculate the correct guided position and review queue.
- [ ] Settings identifies the fixed guided plan; earlier length/goal/instrument
  controls remain explicitly scoped to earlier tools/history.
- [ ] Recording denied/unavailable leaves the core usable. Optional recording
  stops/releases resources on navigation; the download/discard copy matches its
  in-memory lifetime. Test actual speaker output/recording on a physical device.

## Data and failure acceptance

These cases require deliberate fixtures/fault injection in an isolated test
profile. A pure storage test and a UI recovery pass are complementary evidence.

| Case | Required observation | Status / evidence |
|---|---|---|
| Existing C-only and current eight-unit profile | Stable IDs, completed blocks, selected unit, review association and first-check metadata survive migration/reload. | PENDING |
| Export/import round trip | Compare saved history/settings and calculated position; import confirmation is explicit; old drafts do not leak into the replacement profile. Drafts/audio are not claimed as backed up. | PENDING |
| Corrupt JSON / wrong-shaped saved profile | Visible recovery guidance; preserve the unreadable stored value until an explicit recovery choice. Do not silently overwrite it with a fresh profile. | PENDING |
| Corrupt or incompatible import | Show a useful error; existing valid history/settings remain intact and usable. | PENDING |
| Denied storage / quota failure | Failed Save does not show completion, advance the session or clear the report. The warning stays actionable; retry succeeds when storage becomes available. | PENDING |
| Draft storage failure | In-tab fallback retains edits during navigation; communicate limits without claiming durable history. Saving still requires durable profile persistence. | PENDING |
| Correct/remove reports | Recalculate review spacing and block completion from remaining history; no stale cached completion or first-check evidence. | PENDING |
| Reset / import replacement | Confirmation names the data being replaced; saved data and matching drafts clear only after the chosen operation succeeds. | PENDING |
| Separate tabs | Observe and document last-write behavior; do not promise conflict merging or sync. Export before concurrent edits in acceptance testing. | PENDING |

## Production PWA acceptance

Use two identifiable production builds on the same disposable HTTPS origin.
Record old/new commit, browser version, saved-profile export and service-worker
version evidence. Keep a rollback deployment available.

1. Install/open build A online. Visit a lesson whose score renderer has not yet
   been opened, save practice and an unfinished draft, then close/relaunch.
2. Go offline and relaunch. Open several units, a previously unopened score,
   understanding-check audio, Progress and export. Core cached assets must work;
   external resource links may require the network and must not block lessons.
3. Restore the network and deploy build B. Keep a lesson open during update,
   then exercise reload/relaunch and the platform's update lifecycle. Confirm
   the new version appears without mixed/chunk-missing assets, lost saved
   practice, phantom completion or stale draft data attached to changed music.
4. Repeat offline launch on B, including after closing all app windows and
   backgrounding/resuming on mobile. Test same-origin data across installed and
   normal-browser launches; record actual platform behavior.
5. Simulate an interrupted first load/update and an unavailable network. Show a
   recoverable outcome; never repair a cache problem by silently clearing
   practice history. A first-ever offline visit is not expected to have a cache.

Status: **PENDING**. Build output containing `sw.js` proves generation only.

## Release decision record

- Candidate commit / deployment run / live URL: **PENDING**
- Required matrix rows passed, with evidence: **PENDING**
- Teacher review sign-off and unresolved findings: **PENDING**
- Pilot actual sessions, Day-3 and Day-10 results: **PENDING**
- Release blockers fixed and retested: **PENDING**
- Optional limitations explicitly accepted by / date: **PENDING**
- Final v1 approval / tag / rollback commit: **PENDING — do not tag by inference**

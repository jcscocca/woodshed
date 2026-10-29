import assert from "node:assert/strict";
import { test } from "node:test";
import { EXERCISES, SESSIONS } from "../src/program/curriculum.js";
import { recordAttempt, sessionProgress } from "../src/program/progress.js";
import { reviewQueue } from "../src/program/review.js";
import { guidedSessionPlan } from "../src/program/sessionPlan.js";
import { reviewFamilyFor, representativeReviewQueue, consolidationPolicy } from "../src/program/reviewSchedule.js";
import { makeReviewVisit, reviewWorkload } from "../src/program/reviewVisits.js";
import { addDays, daysSince } from "../src/dateUtils.js";

const byId = new Map(EXERCISES.map(e => [e.id, e]));
const report = (exerciseId, patch = {}) => ({ exerciseId, section: "guided", date: "2026-01-01", minutes: 4,
  assessment: "ready", bpm: 48, hands: byId.get(exerciseId)?.hands || "both", fromBar: 1, toBar: 1, ...patch });
const logged = (...reports) => reports.reduce((p, attempt) => recordAttempt(p, attempt), {});
const scheduled = (p, today = "2026-01-05", exercises = EXERCISES) => representativeReviewQueue(p, exercises, { today, limit: exercises.length });
const returned = (exerciseId, date, patch = {}) => report(exerciseId, { section: "review", date,
  reviewCheck: { assessment: "ready", beforeDemo: true, bpm: 48, hands: byId.get(exerciseId)?.hands || "both", fromBar: 1, toBar: 1 }, ...patch });

test("related versions and exact preparations rotate while unrelated pieces and full-scale scopes stay independent", () => {
  for (const ids of [
    ["a6-mozart-key-shape", "a6-mozart-melody", "a6-mozart-held", "a6-mozart-two-pulse"],
    ["d-canon-blocks", "d-canon-bass-chords", "d-canon-minor-lh-prep"],
    ["e7-blues-riff", "e7-blues-bass", "e7-blues-sevenths", "e7-switchyard-blues"],
    ["f3-chord-ballad", "f3-music-paper-boats"],
    ["a6-coord-left-melody", "a6-two-rooms"],
    ["m8-cadence-transfer", "m8-bass-led-reading", "m8-form-ab"],
  ]) assert.equal(new Set(ids.map(id => reviewFamilyFor(byId.get(id)))).size, 1, ids.join("/"));
  for (const [a, b] of [["music-after-rain", "music-dawn-drive"], ["a6-mozart-held", "a6-two-rooms"], ["g-music-first-train", "g-music-homeward"], ["m8-form-ab", "m8-form-aba"], ["a6-scale-r", "a6-mozart-key-shape"]])
    assert.notEqual(reviewFamilyFor(byId.get(a)), reviewFamilyFor(byId.get(b)), `${a}/${b}`);
  const example = byId.get("g-read-f-sharp");
  for (const patch of [{ key: "F major" }, { unitId: "another-unit" }, { hands: "L" }]) assert.notEqual(reviewFamilyFor(example), reviewFamilyFor({ ...example, ...patch }));
  const techniques = EXERCISES.filter(e => e.technique && e.technique.tonic === "C");
  assert.equal(new Set(techniques.map(reviewFamilyFor)).size, techniques.length, "minor forms, hands, ranges and reference identities remain separate");
});

test("a representative does not create sibling reports, completion, new readiness or an extended raw interval", () => {
  const ids = ["a6-mozart-melody", "a6-mozart-held", "a6-mozart-two-pulse"];
  let p = logged(...ids.map(id => report(id))), before = JSON.stringify(p);
  const raw = reviewQueue(p, EXERCISES, { today: "2026-01-05", limit: EXERCISES.length });
  const result = representativeReviewQueue(p, EXERCISES, { today: "2026-01-05", limit: 20, candidates: raw });
  assert.equal(raw.length, 3); assert.equal(result.length, 1); assert.equal(result[0].familySize, 3);
  assert.deepEqual(new Set(result[0].representedExerciseIds), new Set(ids));
  assert.equal(JSON.stringify(p), before);
  const chosen = result[0].exercise.id;
  p = recordAttempt(p, returned(chosen, "2026-01-05"));
  const sibling = ids.find(id => id !== chosen), siblingRows = p.attempts.filter(a => a.exerciseId === sibling);
  assert.equal(siblingRows.length, 1); assert.equal(siblingRows[0].section, "guided");
  assert.deepEqual(p.completedBlocks, {});
  assert.equal(reviewQueue(p, EXERCISES, { today: "2026-01-06", limit: 20 }).find(r => r.exercise.id === sibling).dueDate, "2026-01-04");
  assert.equal(scheduled(p, "2026-01-06").length, 0, "a short family scheduling cooldown leaves the raw sibling backlog intact");
  const next = scheduled(p, "2026-01-08")[0];
  assert.notEqual(next.exercise.id, chosen, "a never-returned eligible sibling receives the next opportunity");
  assert.equal(next.previousAttempt.section, "guided", "its scope comes from its own report");
});

test("a difficult passage remains an individual repair despite a steady related version", () => {
  let p = logged(report("d-canon-blocks"), report("d-canon-bass-chords"));
  p = recordAttempt(p, returned("d-canon-bass-chords", "2026-01-04", { reviewCheck: { assessment: "practising", beforeDemo: true, bpm: 48, hands: "both", fromBar: 1, toBar: 1 } }));
  p = recordAttempt(p, report("d-canon-bass-chords", { date: "2026-01-04", assessment: "ready" }));
  p = recordAttempt(p, returned("d-canon-blocks", "2026-01-05"));
  const rows = scheduled(p, "2026-01-05");
  const repair = rows.find(item => item.exercise.id === "d-canon-bass-chords");
  assert.ok(repair); assert.equal(repair.repair, true); assert.equal(repair.familySize, 1);
  assert.deepEqual(repair.representedExerciseIds, ["d-canon-bass-chords"]);
  assert.equal(repair.previousAttempt.date, "2026-01-04");
  assert.equal(p.attempts[2].reviewCheck.assessment, "practising", "later repair and another texture cannot overwrite the original result");
});

test("ordinary practice, after-model returns and smaller-scope returns cannot postpone a related due passage", () => {
  const old = report("g-read-f-sharp", { date: "2026-10-22" });
  const sibling = report("g-read-registers", { date: "2026-10-22", toBar: 4 });
  const later = [
    report("g-read-registers", { date: "2026-10-27" }),
    returned("g-read-registers", "2026-10-27", { reviewCheck: { assessment: "ready", beforeDemo: false, bpm: 48, hands: "both", fromBar: 1, toBar: 4 } }),
    returned("g-read-registers", "2026-10-27", { reviewCheck: { assessment: "ready", beforeDemo: true, bpm: 48, hands: "both", fromBar: 1, toBar: 1 } }),
  ];
  for (const last of later) assert.ok(scheduled(logged(old, sibling, last), "2026-10-28").some(item => item.exercise.id === old.exerciseId));
  const qualified = returned("g-read-registers", "2026-10-27", { reviewCheck: { assessment: "ready", beforeDemo: true, bpm: 48, hands: "both", fromBar: 1, toBar: 4 } });
  assert.deepEqual(scheduled(logged(old, sibling, qualified), "2026-10-28"), [], "only an actual comparable before-model return supplies the short scheduling cooldown");
});

test("a passage overdue by seven days remains eligible despite repeated steady sibling checks", () => {
  let p = logged(report("g-read-f-sharp", { date: "2026-10-01" }), report("g-read-registers", { date: "2026-10-01" }));
  for (const date of ["2026-10-04", "2026-10-11", "2026-10-27"]) p = recordAttempt(p, returned("g-read-registers", date));
  const result = scheduled(p, "2026-10-28");
  assert.ok(result.some(item => item.exercise.id === "g-read-f-sharp"));
  assert.equal(result.find(item => item.exercise.id === "g-read-f-sharp").dueDate, "2026-10-04");
  assert.equal(p.attempts.filter(attempt => attempt.exerciseId === "g-read-f-sharp").length, 1);
});

test("representative selection respects actual history and malformed, future and knowledge-only records cannot establish practice", () => {
  const e = byId.get("read-family-c"), valid = logged(report(e.id));
  for (const p of [{}, { attempts: [report(e.id, { minutes: 0 })] }, { attempts: [report(e.id, { date: "2099-01-01" })] }, { attempts: [report(e.id, { date: "2026-02-30" })] }, { attempts: [report(e.id, { section: "knowledge" })] }]) assert.deepEqual(scheduled(p), []);
  assert.deepEqual(representativeReviewQueue(valid, EXERCISES, { today: "bad" }), []);
  assert.deepEqual(representativeReviewQueue(valid, EXERCISES, { today: "2026-01-05", limit: 0 }), []);
  assert.deepEqual(representativeReviewQueue(valid, EXERCISES, { today: "2026-01-05", candidates: [{ exercise: e, dueDate: "2026-01-04" }, null] }), []);
  const unseen = byId.get("read-ledger-transfer");
  assert.deepEqual(representativeReviewQueue(valid, EXERCISES, { today: "2026-01-05", candidates: [{ exercise: unseen, previousAttempt: report(unseen.id), dueDate: "2026-01-04" }] }), []);
});

test("one new recommended consolidation is available per actual practice day while saved checks retain their identities", () => {
  const today = "2026-01-05";
  assert.equal(consolidationPolicy({}, { today }).recommendedAvailable, true);
  const p = logged(returned("read-family-c", today, { reviewVisitId: "review-visit:2026-01-05:one", reviewVisitIndex: 0 }));
  const policy = consolidationPolicy(p, { today });
  assert.equal(policy.recommendedAvailable, false); assert.equal(policy.maxRecommendedPerDay, 1);
  assert.deepEqual(policy.startedVisitIds, ["review-visit:2026-01-05:one"]);
  assert.equal(consolidationPolicy(p, { today: "2026-01-06" }).recommendedAvailable, true);
  assert.equal(consolidationPolicy(p, { today: "bad" }).recommendedAvailable, false);
  assert.deepEqual(p.completedBlocks, {}, "consolidation reports never complete a guided lesson");
});

function simulate(mode, { assessment = "ready", maxVisits = 600 } = {}) {
  let p = {}, guided = 0, visits = 0, consolidations = 0, returns = 0, peakRaw = 0, peakScheduled = 0, day = "2026-01-05";
  const saveReturn = (item, minutes, date, extra = {}) => {
    const previous = item.previousAttempt, scope = { bpm: previous.bpm || 48, hands: previous.hands || "both", fromBar: previous.fromBar || 1, toBar: previous.toBar || 1 };
    p = recordAttempt(p, report(item.exercise.id, { section: "review", date, minutes, assessment, ...scope,
      reviewCheck: { assessment, beforeDemo: true, ...scope }, ...extra })); returns++;
  };
  for (; visits < maxVisits && guided < SESSIONS.length; visits++) {
    day = addDays("2026-01-05", Math.floor(visits / 10) * 7 + Math.floor(visits % 10 / 2));
    const raw = reviewQueue(p, EXERCISES, { today: day, limit: EXERCISES.length });
    const due = mode === "representative" ? representativeReviewQueue(p, EXERCISES, { today: day, limit: EXERCISES.length, candidates: raw }) : raw;
    peakRaw = Math.max(peakRaw, raw.length); peakScheduled = Math.max(peakScheduled, due.length);
    const shouldConsolidate = mode !== "integrated-only" && reviewWorkload(due, { today: day }).consolidationRecommended
      && (mode !== "representative" || consolidationPolicy(p, { today: day }).recommendedAvailable);
    if (shouldConsolidate) {
      const visit = makeReviewVisit(due, { today: day, id: `review-visit:${day}:simulation-${visits}` });
      visit.exerciseIds.forEach((id, index) => saveReturn(due.find(item => item.exercise.id === id), visit.minutes[index], day, { reviewVisitId: visit.id, reviewVisitIndex: index }));
      consolidations++; continue;
    }
    const session = SESSIONS[guided], plan = guidedSessionPlan(p, session, due.slice(0, 3), { today: day });
    if (plan.review) saveReturn(plan.review, 3, day, { reviewForSession: session.id });
    for (const [blockIndex, block] of plan.blocks.entries()) p = recordAttempt(p, report(block.exerciseId, { date: day, minutes: block.minutes, assessment,
      sessionId: session.id, blockIndex, hands: byId.get(block.exerciseId).hands || "both", fromBar: block.fromBar || 1, toBar: block.toBar || block.fromBar || 1 }));
    assert.equal(sessionProgress(p, session).done, true); guided++;
  }
  const today = addDays(day, 1), remaining = reviewQueue(p, EXERCISES, { today, limit: EXERCISES.length });
  const recommended = representativeReviewQueue(p, EXERCISES, { today, limit: EXERCISES.length, candidates: remaining });
  return { guided, visits, consolidations, returns, calendarDays: daysSince("2026-01-05", day) + 1,
    minutes: visits * 20, peakRaw, peakScheduled, rawRemaining: remaining.length, scheduledRemaining: recommended.length,
    rawOldest: reviewWorkload(remaining, { today }).oldestDaysOverdue };
}

test("representative scheduling and the daily recommendation cap keep new lessons moving with time and raw backlog reported honestly", t => {
  const integratedOnly = simulate("integrated-only"), unbounded = simulate("unbounded"), representative = simulate("representative");
  t.diagnostic(JSON.stringify({ integratedOnly, unbounded, representative }));
  assert.equal(integratedOnly.guided, 80); assert.equal(representative.guided, 80);
  assert.ok(representative.visits <= 160, "at two visits/day, at most one daily consolidation leaves at least one ordinary lesson slot");
  assert.ok(representative.visits < unbounded.visits, "rotation and a daily cap avoid repeatedly displacing core work");
  assert.ok(representative.minutes > integratedOnly.minutes, "additional review has an explicit time cost");
  assert.ok(representative.rawRemaining < integratedOnly.rawRemaining, "the actual per-passage backlog improves without hiding it behind family counts");
  assert.ok(representative.rawOldest < integratedOnly.rawOldest, "older individual passages receive earlier attention");
  assert.equal(representative.minutes, 20 * representative.visits);
  assert.ok(representative.rawRemaining >= representative.scheduledRemaining, "unsampled passages remain visible as raw available work");
});

test("persistent difficulty cannot monopolize both daily slots or synthesize successful reports for another passage", t => {
  const unbounded = simulate("unbounded", { assessment: "practising", maxVisits: 100 });
  const representative = simulate("representative", { assessment: "practising", maxVisits: 100 });
  t.diagnostic(JSON.stringify({ unbounded, representative }));
  assert.equal(representative.visits, 100); assert.ok(representative.guided >= 50);
  assert.ok(representative.guided > unbounded.guided);
  assert.ok(representative.rawRemaining > 0, "persistent repair needs remain explicit");
});

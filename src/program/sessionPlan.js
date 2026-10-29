import { todayStr } from "../dateUtils.js";
import { normalizeProgress, sessionProgress } from "./progress.js";

const REVIEW_MINUTES = 3;
const validDay = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === value;
};

// Allocate a shorter practice visit without dropping a learning goal or
// changing its saved block index. Equal remainders retain curriculum order.
function allocateMinutes(blocks, budget) {
  const total = blocks.reduce((sum, block) => sum + block.minutes, 0);
  const quotas = blocks.map((block) => budget * block.minutes / total);
  const allocations = quotas.map((quota) => Math.max(1, Math.floor(quota)));
  let remaining = budget - allocations.reduce((sum, minutes) => sum + minutes, 0);
  const order = quotas.map((quota, index) => ({ index, remainder: quota - Math.floor(quota) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  while (remaining > 0) {
    for (const { index } of order) {
      if (!remaining) break;
      allocations[index]++; remaining--;
    }
  }
  // Only unusually small custom budgets need this minimum-one correction.
  // Built-in sessions use three or four substantial blocks and twenty minutes.
  while (remaining < 0) {
    const donor = [...order].reverse().find(({ index }) => allocations[index] > 1);
    if (!donor) break;
    allocations[donor.index]--; remaining++;
  }
  return blocks.map((block, index) => ({ ...block, minutes: allocations[index] }));
}

export function guidedSessionPlan(progress, session, reviewItems = [], { today = todayStr() } = {}) {
  const blocks = (Array.isArray(session?.blocks) ? session.blocks : []).map((block, blockIndex) => ({ ...block, blockIndex }));
  const totalMinutes = blocks.reduce((sum, block) => sum + (Number.isFinite(block.minutes) && block.minutes > 0 ? block.minutes : 0), 0);
  const original = { review: null, reviewDone: false, blocks, reviewMinutes: 0, totalMinutes };
  if (!session?.id || !blocks.length || !validDay(today) || !Number.isInteger(totalMinutes)
      || blocks.some((block) => !Number.isInteger(block.minutes) || block.minutes < 1)
      || totalMinutes < blocks.length + REVIEW_MINUTES) return original;

  const p = normalizeProgress(progress), state = sessionProgress(p, session, { today });
  // A deliberate replay of a completed session is already a whole-session
  // review. Earlier review logs must not silently shorten that fresh visit.
  if (state.done) return original;
  const reviewDone = p.attempts.some((attempt) => (attempt.section === "review" || attempt.section === "transfer")
    && attempt.reviewForSession === session.id && attempt.minutes > 0
    && validDay(attempt.date) && attempt.date <= today);
  // Preserve partial sessions that were started before integrated review,
  // including completion-only imports with no individual reports.
  if (!reviewDone && (state.completed > 0 || state.attempts.length > 0)) return original;
  const review = reviewDone ? null : (Array.isArray(reviewItems) ? reviewItems : []).find((item) => item?.exercise?.id
    && item.exercise.section !== "placement"
    && (!item.dueDate || (validDay(item.dueDate) && item.dueDate <= today))) || null;
  if (!reviewDone && !review) return original;
  return {
    review,
    reviewDone,
    blocks: allocateMinutes(blocks, totalMinutes - REVIEW_MINUTES),
    reviewMinutes: REVIEW_MINUTES,
    totalMinutes,
  };
}

import { normalizeProgress } from "./progress.js";

// Version selection changes which written plan is displayed; it never moves a
// completion mark or report from one session/block identity to another.
const savedContext = (progress, session) => {
  const count = session.blocks?.length || 0;
  if (progress.completedBlocks[session.id]?.some((index) => index < count)) return true;
  return progress.attempts.some((attempt) => attempt.sessionId === session.id
    && Number.isInteger(attempt.blockIndex) && attempt.blockIndex < count
    || attempt.reviewForSession === session.id && attempt.minutes > 0);
};
const complete = (progress, session) => Array.isArray(session.blocks) && session.blocks.length > 0
  && session.blocks.every((_, index) => progress.completedBlocks[session.id]?.includes(index));

export function resolveSessionVersions(progress, currentSessions, legacySessions, { hasDraft = () => false } = {}) {
  const p = normalizeProgress(progress);
  const legacyById = new Map((Array.isArray(legacySessions) ? legacySessions : []).map((session) => [session.id, session]));
  return (Array.isArray(currentSessions) ? currentSessions : []).map((current) => {
    const legacy = legacyById.get(current.legacySessionId);
    if (!legacy || legacy.id === current.id || legacy.unitId !== current.unitId) return current;
    const saved = savedContext(p, legacy);
    let draft = false;
    // Storage can be disabled; a failure to inspect a draft cannot prevent the
    // durable saved-history path from loading.
    try { draft = hasDraft(legacy); } catch { /* Saved evidence still pins its plan. */ }
    if (!saved && !draft) return current;
    const retainedDraftBlockIndex = Number.isInteger(draft?.blockIndex) && draft.blockIndex >= 0 && draft.blockIndex < legacy.blocks.length ? draft.blockIndex : undefined;
    const retained = { ...legacy, planVersion: "original", retainedPlan: true, currentSessionId: current.id,
      retainedPlanReason: complete(p, legacy) ? "completed" : saved ? "saved-practice" : "unfinished-draft",
      ...(["lesson", "review"].includes(draft?.kind) ? { retainedDraftKind: draft.kind } : {}),
      ...(retainedDraftBlockIndex !== undefined ? { retainedDraftBlockIndex } : {}),
    };
    // An explicitly completed revised visit counts as that visit's completion.
    // Keep the earlier unfinished plan available separately, without unioning
    // its marks with the new plan or turning it into a completed old visit.
    if (!complete(p, legacy) && complete(p, current)) return { ...current, retainedEarlierPlan: retained };
    return retained;
  });
}

export const sessionVersionFor = (progress, current, legacySessions, options) => resolveSessionVersions(progress, current ? [current] : [], legacySessions, options)[0] || null;

// Unfinished work belongs to this browser tab, separately from saved practice.
// Keep an in-memory fallback when browser storage is unavailable.
const memory = new Map();
const prefix = "woodshed:lesson-draft:v1:";
let generation = 0;
// Replacement invalidates live draft owners synchronously, before React's
// eventual unmount cleanup can run or a pending save callback can settle.
export const practiceDraftGeneration = () => generation;

const validDraft = (value) => typeof value?.abc === "string" && value.abc.length > 0
  && value.draft && typeof value.draft === "object" && !Array.isArray(value.draft);

// A first block may have edits but no saved attempt yet. Preserve that exact
// session version just as we preserve a durably saved partial session. Reading
// this index never rewrites, clears, or promotes a draft into practice history.
export function findPracticeDraftForSession(session) {
  if (!session?.id || !Array.isArray(session.blocks)) return null;
  const keys = new Set(memory.keys());
  try {
    for (let index = 0; index < sessionStorage.length; index++) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) keys.add(key.slice(prefix.length));
    }
  } catch { /* In-memory edits remain available without browser storage. */ }
  for (const [blockIndex, block] of session.blocks.entries()) {
    const key = `${block.exerciseId}:lesson:${session.id}:${blockIndex}`;
    let value = memory.get(key);
    if (!memory.has(key)) {
      try { value = JSON.parse(sessionStorage.getItem(prefix + key)); } catch { /* Ignore unreadable drafts. */ }
    }
    if (validDraft(value)) return { blockIndex, kind: "lesson" };
  }
  // Integrated return/fresh checks have a source-specific middle segment and
  // an empty final block index. Their session association is the exact suffix.
  for (const key of keys) {
    if (!key.endsWith(`:${session.id}:`)) continue;
    let value = memory.get(key);
    if (!memory.has(key)) {
      try { value = JSON.parse(sessionStorage.getItem(prefix + key)); } catch { /* Ignore unreadable drafts. */ }
    }
    if (validDraft(value)) {
      const source = key.slice(0, -(`:${session.id}:`.length)), separator = source.indexOf(":");
      if (separator < 1) continue;
      const exerciseId = source.slice(0, separator), middle = source.slice(separator + 1);
      if (middle !== "review" && !middle.startsWith("transfer-v1:")) continue;
      return { kind: "review", exerciseId, abc: value.abc, draftKey: key,
        ...(middle === "review" ? {} : { transferId: middle }) };
    }
  }
  return null;
}

export const hasPracticeDraftForSession = (session) => !!findPracticeDraftForSession(session);

export function readPracticeDraft(key, abc) {
  let value = memory.get(key);
  if (!memory.has(key)) {
    try {
      const stored = sessionStorage.getItem(prefix + key);
      if (stored) value = JSON.parse(stored);
    } catch { /* Storage may be disabled or contain an incomplete draft. */ }
  }
  return value?.abc === abc && value?.draft && typeof value.draft === "object" ? value.draft : null;
}

export function writePracticeDraft(key, abc, draft) {
  const value = { abc, draft };
  memory.set(key, value);
  try { sessionStorage.setItem(prefix + key, JSON.stringify(value)); } catch { /* Retain the in-memory draft. */ }
}

export function clearPracticeDraft(key) {
  memory.delete(key);
  try { sessionStorage.removeItem(prefix + key); } catch { /* Storage may be disabled. */ }
}

export function clearAllPracticeDrafts() {
  generation++;
  memory.clear();
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch { /* The in-memory fallback is cleared even when storage is disabled. */ }
}

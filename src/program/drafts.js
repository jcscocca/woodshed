// Unfinished work belongs to this browser tab, separately from saved practice.
// Keep an in-memory fallback when browser storage is unavailable.
const memory = new Map();
const prefix = "woodshed:lesson-draft:v1:";

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
  memory.clear();
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(prefix)) sessionStorage.removeItem(key);
    }
  } catch { /* The in-memory fallback is cleared even when storage is disabled. */ }
}

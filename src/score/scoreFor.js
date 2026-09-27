import { chartToAbc } from "./chartToAbc.js";

// What a scored lesson plays: its ABC and practice settings (bpm, target, sections). A
// sight-reading drill or Your song gets its ABC from the panel instead (runStore.abc).
const written = new WeakMap();
export function scoreFor(lesson) {
  if (lesson.score) return lesson.score;
  if (lesson.chart) {
    if (!written.has(lesson)) written.set(lesson, { ...lesson.chart, abc: chartToAbc(lesson.chart) });
    return written.get(lesson);
  }
  return { abc: null, bpm: null, target: null, sections: [] };
}

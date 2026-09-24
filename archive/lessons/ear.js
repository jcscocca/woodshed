// Bass and accordion Echo configs, cut from src/lessons/ear.js. To restore,
// add each back to that file's default export as `intervals(line, range)` or
// `phrases(line, range)`, matching `mode`.
export default {
  "bs-ear-int":  { mode: "intervals", line: "Anywhere on the neck — low positions are fine.", range: [40, 59] },
  "bs-ear-phr":  { mode: "phrases", line: "Phrases sit above open E, in classic line territory.", range: [40, 59] },
  "acc-ear-int": { mode: "intervals", line: "Right hand only; keep the bellows gentle and steady.", range: [57, 81] },
  "acc-ear-phr": { mode: "phrases", line: "Right hand only, one key at a time. Steady bellows keeps detection clean.", range: [57, 81] },
};

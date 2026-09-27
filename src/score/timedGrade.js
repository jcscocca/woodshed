// Written music against the clock, pure. Each target's expected time is t0 plus
// its beat from the section start; the nearest same-pitch press within 180 ms
// matches it — within 60 ms "on", else "early"/"late". Matching is global and
// nearest-first (not per-target greedy), so overlapping windows can't let an
// earlier target steal a press meant for the next one. Every target has its
// own window, so a slip never shifts the notes after it.
export const ON_MS = 60, WINDOW_MS = 180;

export function gradeTimed(targets, events, { t0, bpm, beatsPerBar = 4, now = Infinity }) {
  const ms = 60000 / bpm;
  const start = targets.length ? Math.min(...targets.map((t) => t.beat)) : 0;
  const expected = targets.map((t) => t0 + (t.beat - start) * ms);
  const order = targets.map((_, i) => i).sort((a, b) => expected[a] - expected[b]);
  const statuses = targets.map(() => "pending"), offsets = targets.map(() => null);
  const pairs = [];
  targets.forEach((t, i) => {
    events.forEach((e, j) => {
      if (e.midi !== t.midi) return;
      const x = e.tStart - expected[i];
      if (Math.abs(x) <= WINDOW_MS) pairs.push({ i, j, x });
    });
  });
  pairs.sort((a, b) => Math.abs(a.x) - Math.abs(b.x) || a.i - b.i);
  const usedT = new Set(), usedE = new Set();
  for (const { i, j, x } of pairs) {
    if (usedT.has(i) || usedE.has(j)) continue;
    usedT.add(i); usedE.add(j);
    offsets[i] = x;
    statuses[i] = Math.abs(x) <= ON_MS ? "on" : x < 0 ? "early" : "late";
  }
  for (const i of order) if (statuses[i] === "pending" && now > expected[i] + WINDOW_MS) statuses[i] = "missed";
  const barAt = (t) => Math.floor(((t - t0) / ms + start) / beatsPerBar + 1e-9) + 1;
  const extras = events.filter((_, j) => !usedE.has(j)).map((e) => ({ midi: e.midi, bar: barAt(e.tStart) }));
  const hits = statuses.filter((s) => s === "on" || s === "early" || s === "late").length;
  const on = statuses.filter((s) => s === "on").length;
  const notesPct = targets.length ? Math.round((100 * hits) / targets.length) : 0;
  const rhythmPct = hits ? Math.round((100 * on) / hits) : 0;
  const revisitBars = [...new Set([...targets.filter((_, i) => statuses[i] !== "on" && statuses[i] !== "pending").map((t) => t.bar), ...extras.map((x) => x.bar)])].sort((a, b) => a - b);
  const cursor = order.find((i) => statuses[i] === "pending") ?? -1;
  return {
    statuses, offsets, extras, notesPct, rhythmPct, revisitBars,
    clean: notesPct >= 90 && rhythmPct >= 80,
    done: !targets.length || now > Math.max(...expected) + WINDOW_MS,
    cursor,
  };
}

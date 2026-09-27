// Written music against the clock, pure. Each target's expected time is t0 plus
// its beat from the section start; the nearest same-pitch press within 180 ms
// matches it — within 60 ms "on", else "early"/"late". Every target has its own
// window, so a slip never shifts the notes after it.
export const ON_MS = 60, WINDOW_MS = 180;

export function gradeTimed(targets, events, { t0, bpm, beatsPerBar = 4, now = Infinity }) {
  const ms = 60000 / bpm;
  const start = targets.length ? Math.min(...targets.map((t) => t.beat)) : 0;
  const expected = targets.map((t) => t0 + (t.beat - start) * ms);
  const order = targets.map((_, i) => i).sort((a, b) => expected[a] - expected[b]);
  const statuses = targets.map(() => "pending"), offsets = targets.map(() => null), used = new Set();
  for (const i of order) {
    let best = -1, d = Infinity;
    events.forEach((e, j) => {
      const x = e.tStart - expected[i];
      if (!used.has(j) && e.midi === targets[i].midi && Math.abs(x) <= WINDOW_MS && Math.abs(x) < Math.abs(d)) { best = j; d = x; }
    });
    if (best >= 0) { used.add(best); offsets[i] = d; statuses[i] = Math.abs(d) <= ON_MS ? "on" : d < 0 ? "early" : "late"; }
    else if (now > expected[i] + WINDOW_MS) statuses[i] = "missed";
  }
  const barAt = (t) => Math.floor(((t - t0) / ms + start) / beatsPerBar + 1e-9) + 1;
  const extras = events.filter((_, j) => !used.has(j)).map((e) => ({ midi: e.midi, bar: barAt(e.tStart) }));
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

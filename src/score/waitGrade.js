// Wait mode, pure: no clock. The current onset (every note starting together in
// the played hands) advances once each of its notes has been pressed since it
// became current, so rolled chords work; any other key is a wrong note that
// flashes but never advances.
export function createWaitRun(targets) {
  const groups = [];
  for (const t of [...targets].sort((a, b) => a.beat - b.beat)) {
    const g = groups[groups.length - 1];
    if (g && g.beat === t.beat) g.notes.push(t);
    else groups.push({ beat: t.beat, bar: t.bar, notes: [t] });
  }
  let cur = 0, pressed = new Set();
  const wrong = [];
  return {
    press(midi) {
      if (cur >= groups.length) return "done";
      const g = groups[cur];
      if (!g.notes.some((n) => n.midi === midi)) { wrong.push(g.bar); return "wrong"; }
      pressed.add(midi);
      if (!g.notes.every((n) => pressed.has(n.midi))) return "held";
      cur++; pressed = new Set();
      return cur >= groups.length ? "done" : "advance";
    },
    get cursor() { return cur; },
    get done() { return cur >= groups.length; },
    groups,
    result: () => ({
      found: groups.slice(0, cur).reduce((n, g) => n + g.notes.length, 0),
      total: targets.length,
      wrong: wrong.length,
      wrongBars: [...new Set(wrong)].sort((a, b) => a - b),
    }),
  };
}

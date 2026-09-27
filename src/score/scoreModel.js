// Written music, pure: an ABC score -> notes with beats (quarter notes), bars and
// hands. abcjs is passed in so the browser can lazy-load it and tests can import it.
const round = (x) => Math.round(x * 1000) / 1000;

export function parseScore(abc, abcjs) {
  const [tune] = abcjs.parseOnly(abc);
  const { num, den } = tune.getMeterFraction();
  const k = tune.getKeySignature();
  const beatsPerBar = (num * 4) / den;
  const clef = (tune.lines.find((l) => l.staff) || { staff: [{ clef: { type: "treble" } }] }).staff[0].clef.type;
  const tracks = tune.setUpAudio({}).tracks;
  const hand = (i) => (tracks.length > 1 ? (i === 0 ? "R" : "L") : clef === "bass" ? "L" : "R");
  const notes = [];
  tracks.forEach((tr, i) => {
    for (const e of tr) {
      if (e.cmd !== "note") continue;
      const beat = round(e.start * 4);
      notes.push({ midi: e.pitch, beat, dur: round(e.duration * 4), bar: Math.floor(beat / beatsPerBar + 1e-9) + 1, hand: hand(i) });
    }
  });
  notes.sort((a, b) => a.beat - b.beat || a.midi - b.midi);
  let onset = -1, last = null;
  for (const n of notes) { if (n.beat !== last) { onset++; last = n.beat; } n.onset = onset; }
  const end = notes.reduce((m, n) => Math.max(m, n.beat + n.dur), 0);
  const bars = Array.from({ length: Math.ceil(end / beatsPerBar - 1e-9) }, (_, i) => ({ n: i + 1, beat: i * beatsPerBar }));
  return { meter: [num, den], beatsPerBar, key: `${k.root}${k.acc}${k.mode || ""}`, bars, notes };
}

export const inSection = (notes, from, to) => notes.filter((n) => n.bar >= from && n.bar <= to);
export const forHands = (notes, hands) => (hands === "both" ? notes : notes.filter((n) => n.hand === hands));

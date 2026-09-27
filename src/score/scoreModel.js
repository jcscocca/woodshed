// Written music, pure: an ABC score -> notes with beats (quarter notes), bars and
// hands. abcjs is passed in so the browser can lazy-load it and tests can import it.
const round = (x) => Math.round(x * 1000) / 1000;

// The music in time as written (repeats once): every note and rest of every voice with
// its beat, hand (voice 1 right, voice 2 left; one voice by its clef) and bar. Tuplets
// scale their notes; spacers and grace notes take no time. The stage maps its drawn
// notes with this same walk. Returns the beat where the music ends.
export function walkTune(tune, visit) {
  const first = tune.lines.find((l) => l.staff);
  if (!first) return 0;
  const { num, den } = tune.getMeterFraction(), bpb = (num * 4) / den;
  const voices = first.staff.reduce((n, s) => n + s.voices.length, 0);
  const hand = (v) => (voices > 1 ? (v ? "L" : "R") : first.staff[0].clef.type === "bass" ? "L" : "R");
  const beats = [], tuplet = [];
  tune.lines.forEach((line, l) => {
    let v = 0;
    (line.staff || []).forEach((staff, s) => staff.voices.forEach((voice) => {
      let beat = beats[v] || 0, k = tuplet[v] || 1;
      for (const el of voice) {
        if (el.el_type !== "note" || !el.duration || (el.rest && el.rest.type === "spacer")) continue;
        if (el.startTriplet) k = el.tripletMultiplier;
        const b = round(beat);
        visit({ line: l, staff: s, voice: v, el, beat: b, hand: hand(v), bar: Math.floor(b / bpb + 1e-9) + 1 });
        beat += el.duration * 4 * k;
        if (el.endTriplet) k = 1;
      }
      beats[v] = beat;
      tuplet[v++] = k;
    }));
  });
  return round(Math.max(0, ...beats));
}

// One target per sounding pitch. setUpAudio() annotates each note element with its
// midiPitches: a tied-to note gets none (the first note's duration covers the tie), and
// a graced note's is halved to make room for the graces.
export function parseScore(abc, abcjs) {
  const [tune] = abcjs.parseOnly(abc);
  const { num, den } = tune.getMeterFraction();
  const k = tune.getKeySignature();
  const beatsPerBar = (num * 4) / den;
  tune.setUpAudio({});
  const notes = [];
  const end = walkTune(tune, ({ el, beat, bar, hand }) => {
    for (const p of el.midiPitches || []) notes.push({ midi: p.pitch, beat, dur: round(p.duration * 4 * (el.gracenotes ? 2 : 1)), bar, hand });
  });
  notes.sort((a, b) => a.beat - b.beat || a.midi - b.midi);
  let onset = -1, last = null;
  for (const n of notes) { if (n.beat !== last) { onset++; last = n.beat; } n.onset = onset; }
  const bars = Array.from({ length: Math.ceil(end / beatsPerBar - 1e-9) }, (_, i) => ({ n: i + 1, beat: i * beatsPerBar }));
  return { meter: [num, den], beatsPerBar, key: `${k.root}${k.acc}${k.mode || ""}`, bars, notes };
}

export const inSection = (notes, from, to) => notes.filter((n) => n.bar >= from && n.bar <= to);
export const forHands = (notes, hands) => (hands === "both" ? notes : notes.filter((n) => n.hand === hands));

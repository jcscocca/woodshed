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
  const beats = [];
  tune.lines.forEach((line, l) => {
    let v = 0;
    (line.staff || []).forEach((staff, s) => staff.voices.forEach((voice) => {
      // abcjs (parse and audio) closes a tuplet left open at the end of its line
      let beat = beats[v] || 0, k = 1;
      for (const el of voice) {
        if (el.el_type !== "note" || !el.duration || (el.rest && el.rest.type === "spacer")) continue;
        if (el.startTriplet) k = el.tripletMultiplier;
        const b = round(beat);
        visit({ line: l, staff: s, voice: v, el, beat: b, hand: hand(v), bar: Math.floor(b / bpb + 1e-9) + 1 });
        beat += el.duration * 4 * k;
        if (el.endTriplet) k = 1;
      }
      beats[v++] = beat;
    }));
  });
  return round(Math.max(0, ...beats));
}

// abcjs places each note under the clef in effect as it parses (a source line starts in the
// voice's declared clef, then each inline [K:clef=…] holds until the next), but draws each line
// from its staff's clef, and a line re-broken by `wrap` gets the first line's. renderAbc's
// afterParsing: draw every line, and every clef change in it, where its notes were placed, and
// drop clef changes that change nothing. Key signatures are left as parsed.
export function keepClefs(tune) {
  const staves = tune.lines.flatMap((l) => l.staff || []), inEffect = [];
  const clefs = new Map([...staves.map((st) => st.clef), ...staves.flatMap((st) => st.voices.flat()).filter((el) => el.el_type === "clef")].reverse().map((c) => [c.verticalPos, c]));
  const placed = (el) => { const p = el.el_type === "note" && ((el.pitches || el.gracenotes || [])[0]); return p ? clefs.get(p.pitch - p.verticalPos) : null; };
  for (const line of tune.lines) (line.staff || []).forEach((staff, s) => staff.voices.forEach((voice, v) => {
    const first = voice.find((el) => el.el_type === "clef" || placed(el));
    let shown = !first ? inEffect[s] || staff.clef : first.el_type === "clef" ? voice.splice(voice.indexOf(first), 1)[0] : placed(first);
    if (v === 0) staff.clef = { ...staff.clef, type: shown.type, verticalPos: shown.verticalPos, clefPos: shown.clefPos };
    for (let i = 0; i < voice.length; i++) {
      const el = voice[i], c = el.el_type === "clef" ? el : placed(el);
      if (!c || c.verticalPos === shown.verticalPos) { if (el.el_type === "clef") voice.splice(i--, 1); continue; }
      if (c !== el) voice.splice(i++, 0, { type: c.type, verticalPos: c.verticalPos, clefPos: c.clefPos, el_type: "clef", startChar: -1, endChar: -1 });
      shown = c;
    }
    inEffect[s] = shown;
  }));
  return tune;
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

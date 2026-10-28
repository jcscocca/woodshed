// Score beats are quarter-note beats, just as in score/scoreModel.js. Planning is
// pure so reference audio, the metronome and the visual cursor share one clock.
export function planPlayback(score, { bpm = 60, hands = "both", soundNotes = true, metronome = false, countIn = true, from = 1, to = score.bars?.length || Infinity } = {}) {
  if (!Number.isFinite(bpm) || bpm < 20 || bpm > 240) throw new Error("Choose a tempo between 20 and 240 BPM.");
  const secondsPerBeat = 60 / bpm;
  const beatsPerBar = score.beatsPerBar || 4;
  const allNotes = (score.notes || []).filter((n) => Number.isFinite(n.midi) && Number.isFinite(n.beat) && Number.isFinite(n.dur) && n.dur > 0);
  // endBeat comes from walkTune and includes leading/trailing rests and pickups.
  const scoreEnd = Math.max(score.endBeat ?? (score.bars?.length || 0) * beatsPerBar, ...allNotes.map((n) => n.beat + n.dur), 0);
  if (!(scoreEnd > 0)) throw new Error("This exercise has no timed music to play.");
  const writtenBars = score.bars?.length ? score.bars : Array.from({ length: Math.ceil(scoreEnd / beatsPerBar) }, (_, i) => ({ n: i + 1, beat: i * beatsPerBar }));
  const selectedBars = writtenBars.filter((bar) => bar.n >= from && bar.n <= to);
  if (!selectedBars.length) throw new Error("Choose at least one written bar.");
  const startBeat = selectedBars[0].beat;
  const endBeat = writtenBars.find((bar) => bar.n > selectedBars.at(-1).n)?.beat ?? scoreEnd;
  const musicBeats = endBeat - startBeat;
  if (!(musicBeats > 0)) throw new Error("This exercise has no timed music to play.");
  // Include a note tied into the selection, and stop a held note at its end.
  const notes = allNotes.filter((n) => (hands === "both" || n.hand === hands) && n.beat < endBeat && n.beat + n.dur > startBeat)
    .map((n) => ({ ...n, beat: Math.max(n.beat, startBeat), dur: Math.min(n.beat + n.dur, endBeat) - Math.max(n.beat, startBeat) }));
  const visualNotes = (score.visualNotes || allNotes).filter((n) => (hands === "both" || n.hand === hands) && n.beat < endBeat && n.beat + n.dur > startBeat)
    .map((n) => ({ ...n, beat: Math.max(n.beat, startBeat), dur: Math.min(n.beat + n.dur, endBeat) - Math.max(n.beat, startBeat) }));
  const firstBarLength = (writtenBars.find((bar) => bar.n > selectedBars[0].n)?.beat ?? scoreEnd) - startBeat;
  const pickup = selectedBars[0].n === 1 && firstBarLength < beatsPerBar - 0.0001;
  // Count the missing part of a pickup bar, so its notes enter on the last beat
  // instead of placing a false downbeat on the first note of an anacrusis.
  const countInBeats = countIn ? (pickup ? beatsPerBar - firstBarLength : beatsPerBar) : 0;
  const countInDuration = countInBeats * secondsPerBeat;
  const musicDuration = musicBeats * secondsPerBeat;
  const events = [];
  if (soundNotes) {
    const polyphony = new Map();
    for (const n of notes) polyphony.set(n.beat, (polyphony.get(n.beat) || 0) + 1);
    for (const n of notes) events.push({ type: "note", at: countInDuration + (n.beat - startBeat) * secondsPerBeat, duration: n.dur * secondsPerBeat, midi: n.midi, hand: n.hand, gain: 0.16 / Math.sqrt(polyphony.get(n.beat)) });
  }
  // In compound metres use the dotted-quarter pulse; all BPM controls remain
  // explicitly quarter-note BPM. A 6/8 bar therefore has two count-in pulses.
  const [num, den] = score.meter || [4, 4];
  const pulse = den === 8 && num > 3 && num % 3 === 0 ? 1.5 : 4 / den;
  if (countIn) for (let b = 0, i = 1; b < countInBeats - 0.0001; b += pulse, i++) events.push({ type: "click", at: b * secondsPerBeat, accent: b === 0, count: i });
  if (metronome) for (const bar of selectedBars) {
    const length = Math.min(writtenBars.find((candidate) => candidate.n > bar.n)?.beat ?? scoreEnd, endBeat) - bar.beat;
    for (let b = 0; b < length - 0.0001; b += pulse) events.push({ type: "click", at: countInDuration + (bar.beat - startBeat + b) * secondsPerBeat, accent: b === 0 && !(pickup && bar.n === 1) });
  }
  events.sort((a, b) => a.at - b.at || (a.type === "click" ? -1 : 1));
  const onsets = [...new Set(notes.map((n) => n.beat))].sort((a, b) => a - b);
  return { events, onsets, noteSpans: visualNotes.map(({ beat, dur, hand }) => ({ beat, dur, hand })), bpm, hands, beatsPerBar, pulse, startBeat, endBeat, musicBeats, bars: selectedBars, pickup, countInBeats, countInDuration, musicDuration, duration: countInDuration + musicDuration, secondsPerBeat };
}

export function playbackPosition(plan, elapsed, { loop = false } = {}) {
  elapsed = Math.max(0, elapsed);
  const counting = elapsed < plan.countInDuration;
  const musicElapsed = Math.max(0, elapsed - plan.countInDuration);
  const relativeBeat = (loop ? musicElapsed % plan.musicDuration : musicElapsed) / plan.secondsPerBeat;
  const beat = plan.startBeat + relativeBeat;
  let onset = -1;
  if (!counting) for (let i = 0; i < plan.onsets.length && plan.onsets[i] <= beat + 0.0001; i++) onset = i;
  // Sounding notes, not merely the last onset: a released note must stop glowing
  // during a rest, while an earlier LH note can remain held under moving RH.
  const activeKeys = counting ? [] : [...new Set(plan.noteSpans.filter((n) => n.beat <= beat + 0.0001 && n.beat + n.dur > beat + 0.0001).map((n) => `${n.hand}:${n.beat}`))].sort();
  const bar = [...plan.bars].reverse().find((candidate) => candidate.beat <= beat + 0.0001)?.n ?? plan.bars[0].n;
  return { phase: counting ? "countin" : "playing", beat, onsetBeat: onset >= 0 ? plan.onsets[onset] : null, activeKeys, activeSignature: activeKeys.join(","), count: Math.floor(elapsed / (plan.secondsPerBeat * plan.pulse)) + 1, countTotal: Math.ceil(plan.countInBeats / plan.pulse), bar, pass: loop ? Math.floor(musicElapsed / plan.musicDuration) + 1 : 1, progress: Math.min(1, relativeBeat / plan.musicBeats) };
}

// One player owns one context and its scheduled nodes. The look-ahead scheduler
// uses AudioContext time; requestAnimationFrame only paints the current position.
// Nothing opens a microphone or MIDI connection.
export function createLessonPlayback({ AudioContextClass } = {}) {
  let context = null, timer = null, animation = null, revision = 0;
  const nodes = new Set();
  const stop = () => {
    revision++;
    clearInterval(timer); timer = null;
    if (animation != null) cancelAnimationFrame(animation);
    animation = null;
    for (const node of nodes) {
      try { node.osc.stop(); } catch { /* a completed oscillator cannot stop again */ }
      node.osc.disconnect(); node.gain.disconnect();
      if (node.filter) node.filter.disconnect();
    }
    nodes.clear();
  };
  const sound = (event, at) => {
    const osc = context.createOscillator(), gain = context.createGain();
    const click = event.type === "click";
    const filter = click ? null : context.createBiquadFilter();
    const duration = click ? 0.045 : event.duration;
    osc.type = click ? "sine" : "triangle";
    osc.frequency.value = click ? (event.accent ? 1450 : 1000) : 440 * 2 ** ((event.midi - 69) / 12);
    if (filter) { filter.type = "lowpass"; filter.frequency.value = Math.min(5500, osc.frequency.value * 7); osc.connect(filter); filter.connect(gain); }
    else osc.connect(gain);
    gain.connect(context.destination);
    const peak = click ? 0.22 : event.gain;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(peak, at + Math.min(0.006, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    const node = { osc, gain, filter };
    nodes.add(node);
    osc.onended = () => { nodes.delete(node); osc.disconnect(); gain.disconnect(); if (filter) filter.disconnect(); };
    osc.start(at); osc.stop(at + duration + 0.01);
  };
  const start = async (plan, { loop = false, onFrame = () => {}, onEnd = () => {} } = {}) => {
    stop();
    const token = revision;
    const Context = AudioContextClass || globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Context) throw new Error("Audio playback is not available in this browser.");
    if (!context || context.state === "closed") context = new Context();
    await context.resume();
    if (token !== revision) return;
    const anchor = context.currentTime + 0.08;
    // Loop only the music: a count-in is heard once, before the first pass.
    const loopEvents = plan.events.filter((e) => e.at >= plan.countInDuration).map((e) => ({ ...e, at: e.at - plan.countInDuration }));
    let cycle = 0, eventIndex = 0;
    const schedule = () => {
      if (token !== revision) return;
      const horizon = context.currentTime + 0.12;
      while (true) {
        const events = cycle === 0 ? plan.events : loopEvents;
        const cycleStart = cycle === 0 ? anchor : anchor + plan.duration + (cycle - 1) * plan.musicDuration;
        if (eventIndex >= events.length) {
          if (!loop || cycleStart + (cycle === 0 ? plan.duration : plan.musicDuration) >= horizon) break;
          cycle++; eventIndex = 0;
          continue;
        }
        const event = events[eventIndex], at = cycleStart + event.at;
        if (at >= horizon) break;
        // A throttled tab can wake after its scheduled window. Skip stale events
        // instead of playing a burst of late notes or passing past times to Audio.
        if (at >= context.currentTime - 0.02) sound(event, Math.max(at, context.currentTime));
        eventIndex++;
      }
    };
    const draw = () => {
      if (token !== revision) return;
      const elapsed = Math.max(0, context.currentTime - anchor);
      if (!loop && elapsed >= plan.duration) { stop(); onEnd(); return; }
      onFrame(playbackPosition(plan, elapsed, { loop }));
      animation = requestAnimationFrame(draw);
    };
    schedule();
    timer = setInterval(schedule, 25);
    animation = requestAnimationFrame(draw);
  };
  const close = () => {
    stop();
    const old = context; context = null;
    if (old && old.state !== "closed") old.close().catch(() => {});
  };
  return { start, stop, close };
}

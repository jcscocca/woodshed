import React from "react";
import { SCALE_EXERCISES } from "./scales.js";
import { exerciseProgress } from "./progress.js";
import { techniqueCheckpoint } from "./techniqueProgress.js";

const STATUS = { new: "New", ready: "Self-reported ready", practising: "Still practising", unsure: "Revisit with the demo" };
const PATTERN_NAMES = { major: "Major scales", "natural-minor": "Natural minor scales", "harmonic-minor": "Harmonic minor scales", "melodic-minor": "Classical melodic minor scales", arpeggio: "Arpeggios", contrary: "Contrary-motion scales", chromatic: "Chromatic scales" };
const PATTERN_ORDER = Object.keys(PATTERN_NAMES);
const patternId = (technique) => technique.pattern + ":" + technique.octaves + (technique.pattern === "arpeggio" ? ":" + technique.quality : "");
const PATTERNS = [...new Map(SCALE_EXERCISES.map((exercise) => [patternId(exercise.technique), exercise.technique])).entries()]
  .map(([id, technique]) => ({ id, ...technique }))
  .sort((a, b) => PATTERN_ORDER.indexOf(a.pattern) - PATTERN_ORDER.indexOf(b.pattern) || (a.quality === "minor" ? 1 : 0) - (b.quality === "minor" ? 1 : 0) || a.octaves - b.octaves);
const patternLabel = (pattern) => (pattern.pattern === "arpeggio" ? pattern.quality === "minor" ? "Minor arpeggios" : "Major arpeggios" : PATTERN_NAMES[pattern.pattern]) + " · " + (pattern.octaves === 1 ? "one octave" : "two octaves");
const TONICS = ["C", "G", "F", "D", "A", "E", "Bb", "Eb", "B", "Ab", "Db", "Gb", "F#", "C#", "G#"];
const display = (text) => text.replaceAll("b", "♭").replaceAll("#", "♯");

// The all-key bank is a reference, not a second course. Only the chosen key
// and pattern are displayed; assignment and musical purpose live in the unit.
export default function ScalePath({ progress, stageId, onStageChange, keyFilter, onKeyChange, preferredKey, onOpen, reviews, onOpenReview }) {
  const pattern = PATTERNS.find((item) => item.id === stageId) || PATTERNS[0];
  const candidates = SCALE_EXERCISES.filter((exercise) => patternId(exercise.technique) === pattern.id);
  const keys = [...new Set(candidates.map((exercise) => exercise.key))].sort((a, b) => {
    const tonic = (key) => candidates.find((exercise) => exercise.key === key)?.technique.tonic;
    return TONICS.indexOf(tonic(a)) - TONICS.indexOf(tonic(b));
  });
  const selectedKey = keys.includes(keyFilter) ? keyFilter : keys.find((key) => display(key) === display(preferredKey || "")) || keys[0];
  const exercises = candidates.filter((exercise) => exercise.key === selectedKey);
  const due = reviews.slice(0, 3);
  return <section className="pg-scale-path" aria-label="All-key reference">
    <h2>All-key reference</h2>
    <p className="pg-muted">Choose a key and pattern when you need it for music you are playing. Guided Practice introduces preparation within the regular lessons; this reference stays available for exploration and extra practice.</p>
    {due.length > 0 && <section className="pg-cumulative-review" aria-label="Scale return checks">
      <h3>Earlier scale practice</h3><p className="pg-muted">These optional returns use your previous passage and setup. Try before playback when you want a fresh self-check.</p>
      <ul className="pg-review-list">{due.map((item) => <li key={item.exercise.id}><div><h3>{item.exercise.title}</h3><p>{item.reason} · last practised {item.previousAttempt.date}</p>{item.previousAttempt.note && <p className="pg-review-note">Your next step: {item.previousAttempt.note}</p>}</div><button className="ws-btn ghost sm" onClick={() => onOpenReview(item)}>Start return check</button></li>)}</ul>
    </section>}
    <div className="pg-scale-filters">
      <label>Pattern and range<select aria-label="Pattern and range" value={pattern.id} onChange={(event) => { onStageChange(event.target.value); onKeyChange("first"); }}>{PATTERNS.map((item) => <option key={item.id} value={item.id}>{patternLabel(item)}</option>)}</select></label>
      <label>Key<select aria-label="Scale key" value={selectedKey} onChange={(event) => onKeyChange(event.target.value)}>{keys.map((key) => <option key={key} value={key}>{display(key)}</option>)}</select></label>
    </div>
    <div className="pg-exercises">{exercises.map((exercise) => {
      const state = exerciseProgress(progress, exercise.id), checkpoint = techniqueCheckpoint(progress, exercise);
      return <article className="pg-card" key={exercise.id}><div className="pg-eyebrow">{display(exercise.key)} · {exercise.minutes} min</div><h3>{exercise.title}</h3><p>{exercise.summary}</p>{state.practiceCount > 0 && <p className="pg-technique-scope">{checkpoint.label}</p>}<div className="pg-card-footer"><span className={"pg-status " + state.status}>{STATUS[state.status]}{state.practiceCount ? " · " + state.practiceCount + (state.practiceCount === 1 ? " visit" : " visits") : ""}</span><button className="ws-btn ghost sm" onClick={() => onOpen(exercise.id)}>Open lesson</button></div></article>;
    })}</div>
  </section>;
}

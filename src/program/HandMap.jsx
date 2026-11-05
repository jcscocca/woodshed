import React, { useEffect, useMemo, useState } from "react";
import { PianoKeys } from "../diagrams.jsx";
import { midiToNote } from "../audio/notes.js";
import { handShapes } from "./handMap.js";

const MANY = 8;
const keyName = (k) => { const n = midiToNote(k.midi); return `${n.name}${n.octave}${k.fingers.length ? ` finger ${k.fingers.join(" or ")}` : ""}`; };
const describe = (step) => [step.label, ...["R", "L"].map((hand) => {
  const keys = step.keys.filter((k) => k.hand === hand);
  return keys.length ? `${hand === "R" ? "right" : "left"} hand ${keys.map(keyName).join(", ")}` : null;
})].filter(Boolean).join(": ");

// The selected passage on a keyboard. While the score plays, the shape follows it.
export default function HandMap({ score, exerciseId, hands, from, to, beat }) {
  const map = useMemo(() => handShapes(score, { exerciseId, hands, from, to }), [score, exerciseId, hands, from, to]);
  const [picked, setPicked] = useState(0);
  const followed = beat == null ? -1 : map.steps.findLastIndex((s) => s.beat <= beat + 0.0001);
  useEffect(() => { if (followed >= 0) setPicked(followed); }, [followed]);
  if (!map.steps.length) return null;
  const index = followed >= 0 ? followed : Math.min(picked, map.steps.length - 1), step = map.steps[index];
  const handsShown = new Set(map.steps.flatMap((s) => s.keys.map((k) => k.hand)));
  return (
    <section className="ws-hand-map" aria-label="Keys and fingers">
      {(map.steps.length > 1 || handsShown.size > 1) && <div className="ws-hand-map-head">
        {map.steps.length > MANY ? <div className="ws-hand-steps" role="group" aria-label="Hand shapes">
          <button type="button" aria-label="Previous shape" disabled={index === 0} onClick={() => setPicked(index - 1)}>‹</button>
          <span aria-live="polite">{step.label} · {index + 1}/{map.steps.length}</span>
          <button type="button" aria-label="Next shape" disabled={index === map.steps.length - 1} onClick={() => setPicked(index + 1)}>›</button>
        </div> : map.steps.length > 1 && <div className="ws-hand-steps" role="group" aria-label="Hand shapes">
          {map.steps.map((s, i) => <button key={i} type="button" aria-pressed={i === index} onClick={() => setPicked(i)}>{s.label}</button>)}
        </div>}
        {handsShown.size > 1 && <div className="ws-hand-legend" aria-hidden="true"><span className="r">RH</span><span className="l">LH</span></div>}
      </div>}
      <PianoKeys low={map.low} high={map.high} keys={step.keys} label={describe(step) || "Keyboard"} />
    </section>
  );
}

import React, { useEffect, useId, useRef, useState } from "react";
import { normalizeKnowledge } from "./knowledge.js";
import "./knowledge.css";

function WrittenExample({ abc, label }) {
  const paper = useRef(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    import("abcjs").then((module) => {
      if (!live || !paper.current) return;
      try {
        const abcjs = module.default || module;
        abcjs.renderAbc(paper.current, abc, { responsive: "resize", staffwidth: 300, foregroundColor: "#f3eee5", selectTypes: false, paddingtop: 8, paddingbottom: 8 });
        for (const svg of paper.current.querySelectorAll("svg")) { svg.setAttribute("role", "img"); svg.setAttribute("aria-label", label); }
      } catch { setError(true); }
    }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [abc, label]);
  return <><div className="pg-knowledge-score" ref={paper} />{error && <p role="alert">This written example could not load. Continue your lesson and revisit this check later.</p>}</>;
}

export default function KnowledgeChecks({ questions, onResultsChange, onEdited, onHear, disabled }) {
  const id = useId(), [answers, setAnswers] = useState({}), [results, setResults] = useState([]);
  if (!questions?.length) return null;
  const select = (questionId, choice) => {
    setAnswers((previous) => ({ ...previous, [questionId]: choice }));
    const next = results.filter((result) => result.questionId !== questionId);
    setResults(next); onResultsChange(next); onEdited?.();
  };
  const check = () => {
    const next = normalizeKnowledge(questions.filter((q) => Number.isInteger(answers[q.id])).map((q) => ({ questionId: q.id, version: q.version, choice: answers[q.id] })));
    setResults(next); onResultsChange(next); onEdited?.();
  };
  return <section className="pg-knowledge" aria-labelledby={`${id}-heading`}>
    <h3 id={`${id}-heading`}>Check your understanding</h3>
    <p className="ws-player-caption">Apply the idea before reading the explanation. These written and listening answers are separate from your piano performance and never lock a lesson.</p>
    {questions.map((q) => {
      const result = results.find((item) => item.questionId === q.id);
      return <fieldset key={q.id} disabled={disabled}>
        <legend>{q.prompt}</legend>
        {q.teach && <p className="pg-knowledge-teach">{q.teach}</p>}
        {q.abc && <WrittenExample abc={q.abc} label={q.prompt} />}
        {q.audio && <button type="button" className="ws-player-button" onClick={() => onHear?.(q)}>Listen to this example</button>}
        <div className="pg-knowledge-options">{q.options.map((option, index) => <label key={option}><input type="radio" name={`${id}-${q.id}`} checked={answers[q.id] === index} onChange={() => select(q.id, index)} />{option}</label>)}</div>
        {result && <p className={`pg-knowledge-feedback ${result.correct ? "correct" : "revisit"}`} role="status"><strong>{result.correct ? "Correct. " : "Compare and try again. "}</strong>{q.explanation}</p>}
      </fieldset>;
    })}
    <button type="button" className="ws-player-button" disabled={disabled || !Object.keys(answers).length} onClick={check}>Check selected answers</button>
    {results.length > 0 && <p className="ws-player-caption">These answers will be included when you save this practice. Change an answer and check again to record your correction.</p>}
  </section>;
}

import { useState } from "react";
import { UNITS, EXERCISES } from "./curriculum.js";
import { SHELF, SHELF_GROUPS, LEVELS, unitHeading } from "./shelf.js";

const VIEW_KEY = "woodshed:catalogue:view:v1";
const viewPreference = () => { try { return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid"; } catch { return "grid"; } };
const rememberView = (view) => { try { localStorage.setItem(VIEW_KEY, view); } catch { /* The choice still applies until reload. */ } };
const UNIT_OF = Object.fromEntries(EXERCISES.map((e) => [e.id, e.unitId]));

function Choices({ label, value, options, onChange }) {
  return <div className="pg-shelf-choices" role="group" aria-label={label}><span>{label}</span>{options.map(([id, text]) => <button key={id} className={`ws-btn ${value === id ? "primary" : "ghost"} sm`} aria-pressed={value === id} onClick={() => onChange(id)}>{text}</button>)}</div>;
}

export default function Shelf({ unitId, onOpen, onOpenPiece, substituteBlock, onUseInSession, onLegacyView }) {
  const [view, setView] = useState(viewPreference);
  const [filterOpen, setFilterOpen] = useState(false);
  const [level, setLevel] = useState("all");
  const [group, setGroup] = useState("all");
  const shown = SHELF.filter((e) => (level === "all" || e.level === level) && (group === "all" || e.group === group));
  const changeView = (next) => { setView(next); rememberView(next); };

  const item = (entry) => {
    const label = <><span className="pg-shelf-title">{entry.title}</span> <span className="pg-shelf-who">{entry.who}</span></>;
    const block = view === "grid" && entry.substitutesFor ? substituteBlock(entry) : -1;
    return <li key={entry.id} className={`pg-shelf-item${entry.group === "course" && UNIT_OF[entry.exerciseId] === unitId ? " is-here" : ""}${entry.group === "outside" ? " is-outside" : ""}`}>
      {entry.group === "outside"
        ? <a className="pg-shelf-open" href={entry.url} target="_blank" rel="noreferrer">{label}<span className="pg-shelf-mark" aria-hidden="true">↗</span><span className="ws-sr-only"> (opens in a new tab)</span></a>
        : <button className="pg-shelf-open" onClick={() => entry.group === "course" ? onOpen(entry.exerciseId) : onOpenPiece(entry.lessonId)}>{label}{view === "list" && <span className="pg-shelf-mark" aria-hidden="true">›</span>}</button>}
      {block >= 0 && <button className="ws-btn ghost sm" onClick={() => onUseInSession(entry.exerciseId, block)}>Use in current guided session</button>}
    </li>;
  };
  const list = (entries) => <ul className={`pg-shelf-${view}`}>{entries.map(item)}</ul>;

  return <>
    <header className="pg-hero pg-shelf-head"><h1>Catalogue</h1>
      <div className="pg-actions">
        <div className="pg-shelf-choices" role="group" aria-label="Layout">{[["grid", "Grid"], ["list", "List"]].map(([id, text]) => <button key={id} className={`ws-btn ${view === id ? "primary" : "ghost"} sm`} aria-pressed={view === id} onClick={() => changeView(id)}>{text}</button>)}</div>
        <button className={`ws-btn ${filterOpen ? "primary" : "ghost"} sm`} aria-expanded={filterOpen} aria-controls="pg-shelf-filter" onClick={() => setFilterOpen(!filterOpen)}>Filter</button>
      </div>
    </header>
    {filterOpen && <div id="pg-shelf-filter" className="pg-shelf-filter">
      <Choices label="Difficulty" value={level} onChange={setLevel} options={[["all", "All"], ...LEVELS.map((l) => [l, l])]} />
      <Choices label="Shelf" value={group} onChange={setGroup} options={[["all", "All"], ...SHELF_GROUPS.map((g) => [g.id, g.label])]} />
    </div>}
    {!shown.length && <p className="pg-muted">No pieces match.</p>}
    {SHELF_GROUPS.map((g) => {
      const entries = shown.filter((e) => e.group === g.id);
      if (!entries.length) return null;
      return <section key={g.id} className="pg-shelf-group" aria-labelledby={`pg-shelf-${g.id}`}><h2 id={`pg-shelf-${g.id}`}>{g.label}</h2>
        {g.id === "course" ? UNITS.map((u) => {
          const pieces = entries.filter((e) => UNIT_OF[e.exerciseId] === u.id);
          return pieces.length > 0 && <div key={u.id} className="pg-shelf-unit"><h3 className="pg-eyebrow">{unitHeading(u, u.id === unitId)}</h3>{list(pieces)}</div>;
        }) : list(entries)}
      </section>;
    })}
    <section className="pg-placement"><div><h2>Older practice tools</h2><p>These tools need a MIDI keyboard.</p></div><div className="pg-actions"><button className="ws-btn ghost sm" onClick={() => onLegacyView("tracks")}>Browse repertoire tracks</button><button className="ws-btn ghost sm" onClick={() => onLegacyView("library")}>Open exercise library</button></div></section>
  </>;
}

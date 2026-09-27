import React from "react";

export const VIEWS = [["today", "Today", "◐"], ["tracks", "Tracks", "◆"], ["library", "Library", "▤"], ["progress", "Progress", "◈"]];

export default function Sidebar({ view, onView, scoreOpen, onScore, onSettings, onHelp, children }) {
  return (
    <aside className="ws-side" aria-label="Navigation">
      <div className="ws-brand"><span className="ws-logo">◐</span> Woodshed</div>
      {children}
      <nav className="ws-side-nav" aria-label="Views">
        {VIEWS.map(([k, label, icon], i) => (
          <button key={k} className={`ws-side-tab ${view === k && !scoreOpen ? "on" : ""}`} aria-current={view === k && !scoreOpen ? "page" : undefined} onClick={() => onView(k)}>
            <span className="ws-tab-icon" aria-hidden="true">{icon}</span>{label}<kbd className="ws-kbd" aria-hidden="true">{i + 1}</kbd>
          </button>
        ))}
        {onScore && (
          <button className={`ws-side-tab ${scoreOpen ? "on" : ""}`} aria-current={scoreOpen ? "page" : undefined} onClick={onScore}>
            <span className="ws-tab-icon" aria-hidden="true">♪</span>Score<kbd className="ws-kbd" aria-hidden="true">5</kbd>
          </button>
        )}
      </nav>
      <button className="ws-side-tab ws-side-settings" onClick={onSettings}>
        <span className="ws-tab-icon" aria-hidden="true">⚙</span>Settings
      </button>
      <button className="ws-side-keys" onClick={onHelp}>Keyboard shortcuts <kbd className="ws-kbd">?</kbd></button>
    </aside>
  );
}

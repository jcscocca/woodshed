import React from "react";

export const VIEWS = [["today", "Today", "◐"], ["tracks", "Tracks", "◆"], ["library", "Library", "▤"], ["progress", "Progress", "◈"]];

export default function Sidebar({ view, onView, onSettings, children }) {
  return (
    <aside className="ws-side">
      <div className="ws-brand"><span className="ws-logo">◐</span> Woodshed</div>
      {children}
      <nav className="ws-side-nav" aria-label="Views">
        {VIEWS.map(([k, label, icon]) => (
          <button key={k} className={`ws-side-tab ${view === k ? "on" : ""}`} aria-current={view === k ? "page" : undefined} onClick={() => onView(k)}>
            <span className="ws-tab-icon" aria-hidden="true">{icon}</span>{label}
          </button>
        ))}
      </nav>
      <button className="ws-side-tab ws-side-settings" onClick={onSettings}>
        <span className="ws-tab-icon" aria-hidden="true">⚙</span>Settings
      </button>
    </aside>
  );
}

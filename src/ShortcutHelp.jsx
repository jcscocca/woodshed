import React from "react";
import { useDialog } from "./useDialog.js";
import { KEY_HELP } from "./shortcuts.js";

export default function ShortcutHelp({ onClose }) {
  const dlgRef = useDialog(onClose);
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" tabIndex={-1}>
        <h2 className="ws-sheet-title">Keyboard shortcuts</h2>
        <dl className="ws-keys">
          {KEY_HELP.map(([k, what]) => (
            <React.Fragment key={k}><dt><kbd className="ws-kbd">{k}</kbd></dt><dd>{what}</dd></React.Fragment>
          ))}
        </dl>
        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

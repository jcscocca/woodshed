import React from "react";
import { PATTERNS } from "./patterns.js";
import { SONG_KEYS, newSong, songError } from "./songs.js";

// Pick or add a song, and edit its chart. Every edit is saved; the stage redraws once the chords parse.
export default function SongEditor({ songs, songId, onSelect, onSongs, disabled }) {
  const song = songs.find((s) => s.id === songId);
  const edit = (patch) => onSongs(songs.map((s) => (s.id === songId ? { ...s, ...patch } : s)));
  const add = () => { const s = newSong(`s${Date.now()}`); onSongs([...songs, s]); onSelect(s.id); };
  const remove = () => {
    if (!window.confirm(`Delete “${song.title}”?`)) return;
    const rest = songs.filter((s) => s.id !== songId);
    onSongs(rest); onSelect(rest[0]?.id ?? null);
  };
  const beats = song ? Number(song.meter.split("/")[0]) : 4;
  const err = song && songError(song);
  const fits = Object.entries(PATTERNS).filter(([, p]) => p.metres.includes(beats));
  const commitBpm = (e) => {
    const v = Math.max(30, Math.min(200, Math.round(Number(e.target.value)) || song.bpm));
    e.target.value = v;
    if (v !== song.bpm) edit({ bpm: v });
  };
  return (
    <div className="ws-song">
      <div className="ws-score-row">
        <span className="ws-lesson-label">Song</span>
        {songs.length > 0 && (
          <select className="ws-score-level" aria-label="Song" value={songId ?? ""} disabled={disabled} onChange={(e) => onSelect(e.target.value)}>
            {songs.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        )}
        <button className="ws-btn ghost sm" disabled={disabled} onClick={add}>New song</button>
      </div>
      {song && (
        <>
          <input className="ws-song-title" aria-label="Title" value={song.title} disabled={disabled} onChange={(e) => edit({ title: e.target.value })} />
          <div className="ws-score-row">
            <select className="ws-score-level" aria-label="Key" value={song.key} disabled={disabled} onChange={(e) => edit({ key: e.target.value })}>{SONG_KEYS.map((k) => <option key={k}>{k}</option>)}</select>
            <select className="ws-score-level" aria-label="Metre" value={song.meter} disabled={disabled}
              onChange={(e) => { const m = e.target.value, b = Number(m[0]); edit({ meter: m, ...(!PATTERNS[song.pattern].metres.includes(b) && { pattern: "block" }) }); }}>
              <option>4/4</option><option>3/4</option>
            </select>
            <select className="ws-score-level ws-song-pattern" aria-label="Pattern" value={song.pattern} disabled={disabled} onChange={(e) => edit({ pattern: e.target.value })}>
              {fits.map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
            </select>
            <input key={`${songId}${song.bpm}`} className="ws-score-num mono" type="number" min={30} max={200} aria-label="Tempo" defaultValue={song.bpm} disabled={disabled}
              onBlur={commitBpm} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
          </div>
          <textarea className="ws-song-chords mono" aria-label="Chords, bars split by |" rows={3} value={song.chords} disabled={disabled}
            spellCheck={false} onChange={(e) => edit({ chords: e.target.value })} />
          {err && <p className="ws-song-err" role="status">{err.message}</p>}
          <button className="ws-btn ghost sm" disabled={disabled} onClick={remove}>Delete song</button>
        </>
      )}
    </div>
  );
}

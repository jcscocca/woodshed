import React, { useEffect, useRef, useState } from "react";
import { PATTERNS } from "./patterns.js";
import { SONG_KEYS, newSong, songError } from "./songs.js";
import { clearPracticeDraft, readPracticeDraft, writePracticeDraft, practiceDraftGeneration } from "../program/drafts.js";

const sameSongs = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const DRAFT_KEY = "song-editor", DRAFT_VERSION = "song-editor:v1";
const validSongs = (songs) => Array.isArray(songs) && songs.every((s) => s && typeof s.id === "string"
  && typeof s.title === "string" && SONG_KEYS.includes(s.key) && ["4/4", "3/4"].includes(s.meter)
  && typeof s.chords === "string" && !!PATTERNS[s.pattern] && Number.isFinite(s.bpm));
const tempoChanged = (tempos, songs) => Object.entries(tempos).some(([id, value]) => value !== String(songs.find((s) => s.id === id)?.bpm));
const validTempos = (tempos, songs) => Object.fromEntries(Object.entries(tempos && typeof tempos === "object" ? tempos : {})
  .filter(([id, value]) => typeof value === "string" && songs.some((s) => s.id === id)));
const tempoValue = (text, previous) => Math.max(30, Math.min(200, Math.round(Number(text)) || previous));
const failureText = (kind) => kind === "conflict"
  ? "Saved songs changed in another tab. Your draft is still here. Review the saved songs before replacing any changes."
  : kind === "resume" ? "Your unsaved song draft has been restored. Review it, then retry saving."
    : "Song changes could not be saved. Your draft is still here. Try saving again.";

// Typing stays local while durable saves run in order. A failed save keeps its
// original comparison base: retrying must never overwrite another tab's work.
export default function SongEditor({ songs, songId, onSelect, onSongs, disabled }) {
  const state = useRef(null);
  if (!state.current) {
    let restored = readPracticeDraft(DRAFT_KEY, DRAFT_VERSION);
    let restoredSelection;
    if (!validSongs(restored?.draft) || !validSongs(restored?.accepted)) restored = null;
    if (restored?.action && validSongs(restored.action.songs) && sameSongs(songs, restored.action.songs)) {
      restoredSelection = restored.action.select;
      clearPracticeDraft(DRAFT_KEY); restored = null;
    }
    if (restored && !restored.action && sameSongs(songs, restored.draft) && !tempoChanged(validTempos(restored.tempos, songs), songs)) {
      restoredSelection = restored.selected;
      clearPracticeDraft(DRAFT_KEY); restored = null;
    }
    const action = restored?.action && validSongs(restored.action.songs) && validSongs(restored.action.base) ? restored.action : null;
    state.current = { accepted: restored?.accepted ?? songs, draft: restored?.draft ?? songs,
      tempos: validTempos(restored?.tempos, restored?.draft ?? songs),
      selected: restored?.selected ?? restoredSelection ?? songId, restored: !!restored || restoredSelection !== undefined, revision: 0, pending: !!restored && !sameSongs(restored.draft, restored.accepted),
      running: null, inflight: null, failure: restored ? sameSongs(songs, restored.accepted) ? "resume" : "conflict" : null,
      action, actionSaving: false, mounted: true, owner: `${Date.now()}:${Math.random()}`, generation: practiceDraftGeneration() };
  }
  const st = state.current;
  const [draftSongs, setDraftSongs] = useState(st.draft);
  const [saving, setSaving] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [saveError, setSaveError] = useState(st.failure ? failureText(st.failure) : null);
  const [tempos, setTempos] = useState(st.tempos);
  const callbacks = useRef({ onSongs, onSelect, disabled, songs, songId });
  callbacks.current = { onSongs, onSelect, disabled, songs, songId };
  const currentOwner = () => st.generation === practiceDraftGeneration();
  const persistDraft = () => {
    if (!currentOwner()) return;
    if (st.pending || st.failure || st.action || tempoChanged(st.tempos, st.draft) || !sameSongs(st.draft, st.accepted)) {
      if (st.mounted) writePracticeDraft(DRAFT_KEY, DRAFT_VERSION, { owner: st.owner, draft: st.draft, accepted: st.accepted, tempos: st.tempos, selected: st.selected, action: st.action });
    } else if (readPracticeDraft(DRAFT_KEY, DRAFT_VERSION)?.owner === st.owner) clearPracticeDraft(DRAFT_KEY);
  };
  const setTempo = (id, value) => { if (!currentOwner()) return; st.tempos = { ...st.tempos, [id]: value }; setTempos(st.tempos); persistDraft(); };
  const showDraft = (next) => { st.draft = next; if (st.mounted) setDraftSongs(next); };
  const fail = (kind = "edit") => {
    st.failure = kind;
    if (st.mounted) setSaveError(failureText(kind));
    persistDraft();
  };
  const clearFailure = () => { st.failure = null; if (st.mounted) setSaveError(null); };

  useEffect(() => {
    st.mounted = true;
    if (st.restored && st.draft.some((s) => s.id === st.selected)) callbacks.current.onSelect(st.selected);
    persistDraft();
    return () => { st.mounted = false; };
  }, []);
  useEffect(() => { st.selected = songId; persistDraft(); }, [songId]);
  useEffect(() => {
    if (sameSongs(songs, st.accepted) || sameSongs(songs, st.inflight)) return;
    if (st.pending || st.running || st.action || st.failure || tempoChanged(st.tempos, st.draft)) { fail("conflict"); return; }
    st.accepted = songs;
    showDraft(songs);
    st.tempos = {}; setTempos({});
    if (!songs.some((s) => s.id === callbacks.current.songId)) callbacks.current.onSelect(songs[0]?.id ?? null);
  }, [songs]);

  const drain = () => {
    if (!currentOwner()) return Promise.resolve(false);
    if (st.running) return st.running;
    if (!st.pending || st.failure || st.action) return Promise.resolve(!st.failure);
    const run = async () => {
      if (st.mounted) setSaving(true);
      try {
        while (st.pending && !st.failure && currentOwner()) {
          st.pending = false;
          const next = st.draft, revision = st.revision;
          st.inflight = next;
          let saved;
          try { saved = await callbacks.current.onSongs(next, st.accepted); } catch { /* Keep the draft and comparison base. */ }
          st.inflight = null;
          if (!currentOwner()) { st.pending = false; return false; }
          if (!Array.isArray(saved?.songs)) { st.pending = true; fail(st.failure || "edit"); break; }
          st.accepted = saved.songs;
          if (st.revision === revision && !st.failure) showDraft(saved.songs);
          persistDraft();
        }
        return currentOwner() && !st.failure;
      } finally {
        st.running = null;
        if (st.mounted) setSaving(false);
      }
    };
    // Set ownership before invoking a callback which may throw synchronously.
    // Its catch/finally may finish before run() returns its settled promise.
    const starting = Promise.resolve(false);
    st.running = starting;
    const running = run();
    if (st.running === starting) st.running = running;
    return running;
  };
  const edit = (id, patch) => {
    if (!currentOwner() || callbacks.current.disabled || st.action) return;
    const next = st.draft.map((s) => s.id === id ? { ...s, ...patch } : s);
    if (sameSongs(next, st.draft)) return;
    st.revision++;
    showDraft(next);
    st.pending = true;
    persistDraft();
    void drain();
  };

  const persistAction = async (job) => {
    if (!currentOwner() || callbacks.current.disabled || st.running || st.actionSaving || (st.action && st.action !== job)) return;
    st.action = job; st.actionSaving = true;
    clearFailure();
    persistDraft();
    st.inflight = job.songs;
    if (st.mounted) setActionBusy(true);
    try {
      let saved;
      try { saved = await callbacks.current.onSongs(job.songs, job.base); } catch { /* The old song and selection remain available. */ }
      st.inflight = null;
      if (!currentOwner()) { st.action = null; return; }
      if (!Array.isArray(saved?.songs)) { fail(st.failure || "action"); return; }
      st.accepted = saved.songs;
      st.action = null;
      // A later external change is visible, but cannot silently replace a draft.
      if (st.failure) return;
      showDraft(saved.songs);
      st.tempos = {};
      persistDraft();
      if (st.mounted) {
        setTempos({});
        callbacks.current.onSelect(saved.songs.some((s) => s.id === job.select) ? job.select : saved.songs[0]?.id ?? null);
      }
    } finally { st.actionSaving = false; if (st.mounted) setActionBusy(false); }
  };
  const add = () => {
    if (!currentOwner() || callbacks.current.disabled || st.running || st.action || st.failure) return;
    let id = `s${Date.now()}`;
    while (st.draft.some((s) => s.id === id)) id += "-new";
    const song = newSong(id);
    void persistAction({ songs: [...st.draft, song], base: st.accepted, select: song.id });
  };
  const remove = () => {
    if (!currentOwner() || callbacks.current.disabled || st.running || st.action || st.failure) return;
    const current = st.draft.find((s) => s.id === songId);
    if (!current || !window.confirm(`Delete “${current.title}”?`)) return;
    const rest = st.draft.filter((s) => s.id !== current.id);
    void persistAction({ songs: rest, base: st.accepted, select: rest[0]?.id ?? null });
  };
  const retry = () => {
    if (!currentOwner() || callbacks.current.disabled || st.running || st.actionSaving) return;
    if (st.action) { void persistAction(st.action); return; }
    const next = st.draft.map((song) => {
      if (!(song.id in st.tempos)) return song;
      const bpm = tempoValue(st.tempos[song.id], song.bpm);
      st.tempos[song.id] = String(bpm);
      return bpm === song.bpm ? song : { ...song, bpm };
    });
    if (!sameSongs(next, st.draft)) { st.revision++; showDraft(next); }
    setTempos({ ...st.tempos });
    clearFailure();
    st.pending = true;
    persistDraft();
    void drain();
  };
  const useSaved = () => {
    if (!currentOwner() || callbacks.current.disabled || st.running || st.actionSaving || !window.confirm("Discard your unsaved song changes and use the saved songs?")) return;
    const saved = callbacks.current.songs;
    st.action = null; st.pending = false; st.accepted = saved; st.revision++;
    clearFailure(); showDraft(saved); st.tempos = {}; setTempos({}); clearPracticeDraft(DRAFT_KEY);
    if (!saved.some((s) => s.id === songId)) callbacks.current.onSelect(saved[0]?.id ?? null);
  };
  const cancelAction = () => { if (!currentOwner() || st.actionSaving) return; st.action = null; clearFailure(); persistDraft(); };
  const song = draftSongs.find((s) => s.id === songId);
  const beats = song ? Number(song.meter.split("/")[0]) : 4;
  const err = song && songError(song);
  const fits = Object.entries(PATTERNS).filter(([, p]) => p.metres.includes(beats));
  const locked = disabled || actionBusy || !!st.action || !currentOwner();
  const commitBpm = (e) => {
    if (!song) return;
    const value = tempoValue(e.target.value, st.draft.find((s) => s.id === song.id)?.bpm ?? song.bpm);
    setTempo(song.id, String(value));
    edit(song.id, { bpm: value });
  };
  return (
    <div className="ws-song">
      <div className="ws-score-row">
        <span className="ws-lesson-label">Song</span>
        {draftSongs.length > 0 && (
          <select className="ws-score-level" aria-label="Song" value={songId ?? ""} disabled={locked} onChange={(e) => { st.selected = e.target.value; persistDraft(); onSelect(e.target.value); }}>
            {draftSongs.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        )}
        <button className="ws-btn ghost sm" disabled={locked || saving || !!saveError} onClick={add}>New song</button>
      </div>
      {song && (
        <>
          <input className="ws-song-title" aria-label="Title" value={song.title} disabled={locked} onChange={(e) => edit(song.id, { title: e.target.value })} />
          <div className="ws-score-row">
            <select className="ws-score-level" aria-label="Key" value={song.key} disabled={locked} onChange={(e) => edit(song.id, { key: e.target.value })}>{SONG_KEYS.map((k) => <option key={k}>{k}</option>)}</select>
            <select className="ws-score-level" aria-label="Metre" value={song.meter} disabled={locked}
              onChange={(e) => { const meter = e.target.value, beats = Number(meter[0]), pattern = st.draft.find((s) => s.id === song.id)?.pattern; edit(song.id, { meter, ...(!PATTERNS[pattern].metres.includes(beats) && { pattern: "block" }) }); }}>
              <option>4/4</option><option>3/4</option>
            </select>
            <select className="ws-score-level ws-song-pattern" aria-label="Pattern" value={song.pattern} disabled={locked} onChange={(e) => edit(song.id, { pattern: e.target.value })}>
              {fits.map(([k, p]) => <option key={k} value={k}>{p.name}</option>)}
            </select>
            <input className="ws-score-num mono" type="number" min={30} max={200} aria-label="Start tempo" title="Start tempo" value={tempos[song.id] ?? String(song.bpm)} disabled={locked}
              onChange={(e) => setTempo(song.id, e.target.value)}
              onBlur={commitBpm} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
          </div>
          <textarea className="ws-song-chords mono" aria-label="Chords, bars split by |" rows={3} value={song.chords} disabled={locked}
            spellCheck={false} onChange={(e) => edit(song.id, { chords: e.target.value })} />
          {err && <p className="ws-song-err" role="status">{err.message}</p>}
          <button className="ws-btn ghost sm" disabled={locked || saving || !!saveError} onClick={remove}>Delete song</button>
        </>
      )}
      {(saving || actionBusy) && <p className="ws-dim" role="status">Saving song changes…</p>}
      {saveError && <div className="ws-song-err" role="alert">
        <p>{saveError}</p>
        <button className="ws-btn ghost sm" disabled={disabled || saving || actionBusy} onClick={retry}>Retry save</button>
        {st.action && <button className="ws-btn ghost sm" disabled={disabled || actionBusy} onClick={cancelAction}>Cancel change</button>}
        <button className="ws-btn ghost sm" disabled={disabled || saving || actionBusy} onClick={useSaved}>Use saved songs</button>
      </div>}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { INSTRUMENTS, TYPE_LABEL, FELT, TRACKS } from "./seed.js";
import { getLesson } from "./lessons/index.js";
import LessonSheet, { LessonBody } from "./LessonSheet.jsx";
import { todayStr, addDays, prettyAgo } from "./dateUtils.js";
import {
  generateSession, swapInSession, streakInfo, weekCount, lastByInstrument,
  minutesByInst, minutesInLastDays, freshData, withDerivedStats, progressionProposals,
  trackStatus, mergeContent,
} from "./engine.js";
import { loadState, saveState, migrate } from "./storage.js";
import { useDialog } from "./useDialog.js";
import { PracticeProvider } from "./PracticeProvider.jsx";
import { PracticeSheet, ListenSheet } from "./PracticeSheet.jsx";
import { useIsDesktop } from "./useIsDesktop.js";
import Sidebar, { VIEWS } from "./Sidebar.jsx";
import PracticeRail from "./PracticeRail.jsx";
import { ShortcutBridge } from "./useShortcuts.js";
import ShortcutHelp from "./ShortcutHelp.jsx";

// Resource links are user-entered and ride along in exported/imported backups,
// so treat them as untrusted. Only http(s) URLs ever reach an href — a
// javascript:/data: link from a hand-edited backup is dropped, not rendered.
const safeHref = (url) => {
  const u = (url || "").trim();
  return /^https?:\/\//i.test(u) ? u : undefined;
};
// Normalize a link the user typed: a bare domain gets https://; anything with a
// non-http(s) scheme (javascript:, data:, …) is rejected to "".
const normalizeUrl = (raw) => {
  const u = (raw || "").trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (/^[a-z][\w+.-]*:/i.test(u)) return ""; // some other scheme -> reject
  return "https://" + u;
};

/* ============================================================
   WOODSHED — piano and guitar practice
   ============================================================ */
export default function Woodshed() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("today");
  const [logging, setLogging] = useState(false);    // true = today's set, or { items } for one coached item
  const [showSettings, setShowSettings] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [listenOpen, setListenOpen] = useState(false);
  const [itemForm, setItemForm] = useState(null);   // { item } edit, { item: null } add
  const [editSession, setEditSession] = useState(null);
  const [lessonFor, setLessonFor] = useState(null);
  const [showProposals, setShowProposals] = useState(false);
  const [lastTempo, setLastTempo] = useState(null);
  const [coachResults, setCoachResults] = useState({}); // itemId -> { accuracy, missed }
  const [saveError, setSaveError] = useState(false);
  const [tunerOpen, setTunerOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const desktop = useIsDesktop();
  const loaded = useRef(false);

  // load once
  useEffect(() => {
    (async () => {
      let d = await loadState();
      if (!d) d = freshData();
      if (d.items) d.items = mergeContent(d.items); // pick up newly added tracks/seeds
      if (!d.currentSession || d.currentSession.date !== todayStr()) d.currentSession = gen(d);
      setData(d);
      loaded.current = true;
    })();
  }, []);

  // persist on change; surface failures instead of losing data quietly
  useEffect(() => {
    if (!loaded.current || !data) return;
    saveState(data).then((ok) => setSaveError(!ok));
  }, [data]);

  // An installed app can stay open across midnight; build the new day's set when it comes back.
  useEffect(() => {
    const roll = () => setData((d) => (d && d.currentSession?.date !== todayStr() ? { ...d, currentSession: gen(d) } : d));
    const onVisible = () => { if (document.visibilityState === "visible") roll(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", roll);
    const id = setInterval(roll, 60000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", roll);
      clearInterval(id);
    };
  }, []);

  if (!data) return <Shell><div className="ws-loading">Opening the woodshed…</div></Shell>;

  // item stats (last practiced, count, latest rating) are derived from the log
  const live = { ...data, items: withDerivedStats(data.items, data.sessions) };
  const itemById = (id) => live.items.find((it) => it.id === id);
  const session = data.currentSession;
  const proposals = progressionProposals(data.items, data.sessions, (data.progress && data.progress.acked) || {});

  /* engine helpers always run on derived data */
  function derive(d) { return withDerivedStats(d.items, d.sessions); }
  function gen(d) { return generateSession({ ...d, items: derive(d) }); }

  /* actions */
  const regenerate = () => setData((d) => ({ ...d, currentSession: gen(d) }));
  const swap = (id) => setData((d) => ({ ...d, currentSession: swapInSession(d.currentSession, id, { ...d, items: derive(d) }) }));
  const addAnother = () => setData((d) => ({ ...d, currentSession: gen(d) }));

  const commitLog = (entries, note) => {
    setData((d) => {
      const today = todayStr();
      const sessions = [...d.sessions];
      for (const e of entries) {
        if (!e.done) continue;
        const it = d.items.find((x) => x.id === e.itemId);
        sessions.push({
          id: `${today}-${e.itemId}-${Math.random().toString(36).slice(2, 7)}`,
          date: today, itemId: e.itemId, inst: it ? it.inst : "piano",
          minutes: e.minutes, rating: e.rating, bpm: e.bpm ?? null, note: note || "",
          accuracy: e.accuracy ?? null, coached: e.accuracy != null, missed: e.missed ?? [],
        });
      }
      return { ...d, sessions, currentSession: logging === true ? { ...d.currentSession, completed: true } : d.currentSession };
    });
    setCoachResults((m) => {
      const next = { ...m };
      for (const e of entries) if (e.done) delete next[e.itemId];
      return next;
    });
    setLogging(false);
  };

  const recordCoachResult = (itemId, res) => setCoachResults((m) => ({ ...m, [itemId]: res }));

  // session length and instruments shape today's set, so rebuild it unless it's already been logged
  const rebuildIfOpen = (d) => (d.currentSession.completed ? d : { ...d, currentSession: gen(d) });
  const updateSettings = (patch) => setData((d) => {
    const next = { ...d, settings: { ...d.settings, ...patch } };
    return "target" in patch && patch.target !== d.settings.target ? rebuildIfOpen(next) : next;
  });
  const toggleInstrument = (inst) =>
    setData((d) => rebuildIfOpen({ ...d, settings: { ...d.settings, enabled: { ...d.settings.enabled, [inst]: !d.settings.enabled[inst] } } }));

  const addCustom = (fields) =>
    setData((d) => ({ ...d, items: [...d.items, { ...fields, id: `custom-${Date.now()}`, hidden: false, custom: true }] }));
  const saveItem = (id, fields) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...fields } : it)) }));
  const deleteItem = (id) =>
    setData((d) => ({
      ...d,
      items: d.items.filter((it) => it.id !== id),
      currentSession: { ...d.currentSession, items: d.currentSession.items.filter((x) => x.itemId !== id) },
    }));
  const toggleHidden = (id) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, hidden: !it.hidden, mastered: it.hidden ? false : it.mastered } : it)) }));

  const editSessionSave = (id, patch) =>
    setData((d) => ({ ...d, sessions: d.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const deleteSession = (id) =>
    setData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));

  // record that a suggestion was handled (at the current practice count) so it
  // doesn't reappear until the exercise is practiced more
  const ackProposal = (d, p) => {
    const progress = d.progress || { acked: {} };
    const times = withDerivedStats(d.items, d.sessions).find((x) => x.id === p.itemId)?.times || 0;
    return { ...progress, acked: { ...progress.acked, [p.itemId]: times } };
  };
  const applyProposal = (p) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it) => (it.id === p.itemId ? { ...it, mastered: true, hidden: true } : it)),
      progress: ackProposal(d, p),
    }));
  const dismissProposal = (p) => setData((d) => ({ ...d, progress: ackProposal(d, p) }));

  // mark a track stage complete from the Tracks view (unlocks the next stage)
  const completeStage = (id) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, mastered: true, hidden: true } : it)) }));
  const reopenStage = (id) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, mastered: false, hidden: false } : it)) }));

  const resetAll = () => { const d = freshData(); d.currentSession = gen(d); setData(d); setShowSettings(false); };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `woodshed-backup-${todayStr()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 40000);
  };
  const importData = (raw) => {
    try {
      const parsed = migrate(raw);
      parsed.items = mergeContent(parsed.items);
      if (!parsed.currentSession || parsed.currentSession.date !== todayStr()) parsed.currentSession = gen(parsed);
      setData(parsed);
      return true;
    } catch { return false; }
  };

  const streak = streakInfo(data.sessions);
  const openLesson = (it) => { setTunerOpen(false); setLessonFor(it); };
  const onShortcut = (a) => {
    if (a.type === "view") setView(a.view);
    else if (a.type === "log") { if (!session.completed && session.items.length) setLogging(true); }
    else if (a.type === "close") { setLessonFor(null); setTunerOpen(false); }
    else if (a.type === "help") setShowKeys(true);
  };
  const requestLog = () => {
    const inSet = !session.completed && session.items.some((x) => x.itemId === lessonFor.id);
    setLessonFor(null);
    setLogging(inSet ? true : { items: [{ itemId: lessonFor.id, minutes: lessonFor.min }] });
  };
  const lessonProps = lessonFor && {
    item: lessonFor, href: safeHref(lessonFor.link?.url),
    sessions: data.sessions.filter((s) => s.itemId === lessonFor.id),
    onCoachResult: recordCoachResult, onRequestLog: requestLog,
  };
  const selectedId = desktop && lessonFor ? lessonFor.id : null;

  const saveErr = saveError && <div className="ws-saveerr">Couldn't save your latest change to this browser — your history may not persist.</div>;
  const views = (
    <main className="ws-main">
      {view === "today" && proposals.length > 0 && (
        <button className="ws-prop-banner" onClick={() => setShowProposals(true)}>
          <span className="ws-prop-spark">✦</span>
          <span className="ws-prop-banner-text">{proposals.length} suggestion{proposals.length > 1 ? "s" : ""} from your practice</span>
          <span className="ws-prop-chev">›</span>
        </button>
      )}
      {view === "today" && (
        <Today
          session={session} itemById={itemById} onSwap={swap} onRegenerate={regenerate}
          onStartLog={() => setLogging(true)} onAddAnother={addAnother}
          settings={data.settings} sessions={data.sessions} onLearn={openLesson} selectedId={selectedId}
        />
      )}
      {view === "tracks" && <Tracks live={live} onComplete={completeStage} onReopen={reopenStage} onLearn={openLesson} selectedId={selectedId} />}
      {view === "library" && (
        <Library items={live.items} onOpen={(it) => setItemForm({ item: it })} onAdd={() => setItemForm({ item: null })} onLearn={openLesson} selectedId={selectedId} />
      )}
      {view === "progress" && <Progress data={data} live={live} streak={streak} onEditSession={setEditSession} />}
    </main>
  );
  const dialogs = (
    <>
      {logging && <LogSheet session={logging === true ? session : logging} itemById={itemById} lastTempo={lastTempo} coachResults={coachResults} onCancel={() => setLogging(false)} onCommit={commitLog} />}
      {showProposals && (
        <ProposalSheet proposals={proposals} onAccept={applyProposal} onDismiss={dismissProposal} onClose={() => setShowProposals(false)} />
      )}
      {showSettings && (
        <Settings
          settings={data.settings} onChange={updateSettings} onToggle={toggleInstrument}
          onReset={resetAll} onClose={() => setShowSettings(false)} onExport={exportData} onImport={importData}
        />
      )}
      {itemForm && (
        <ItemForm
          initial={itemForm.item}
          sessions={data.sessions}
          hidden={itemForm.item ? !!data.items.find((i) => i.id === itemForm.item.id)?.hidden : false}
          onSave={(fields) => (itemForm.item ? saveItem(itemForm.item.id, fields) : addCustom(fields))}
          onDelete={itemForm.item && itemForm.item.custom ? () => { deleteItem(itemForm.item.id); setItemForm(null); } : null}
          onToggleHidden={itemForm.item ? () => toggleHidden(itemForm.item.id) : null}
          onClose={() => setItemForm(null)}
          onLearn={(it) => { setItemForm(null); openLesson(it); }}
        />
      )}
      {editSession && (
        <SessionEdit
          session={editSession} itemById={itemById}
          onSave={editSessionSave} onDelete={deleteSession} onClose={() => setEditSession(null)}
        />
      )}
    </>
  );

  return (
    <PracticeProvider onTempo={setLastTempo}>
      {desktop ? (
        <div className="ws-desk">
          <Sidebar view={view} onView={setView} onSettings={() => setShowSettings(true)} onHelp={() => setShowKeys(true)}><Streak streak={streak} /></Sidebar>
          <div className="ws-desk-main">{saveErr}{views}</div>
          <PracticeRail
            lesson={lessonProps && <LessonBody key={lessonFor.id} {...lessonProps} />}
            tunerOpen={tunerOpen}
            onOpenTuner={() => { setLessonFor(null); setTunerOpen(true); }}
            onCloseSlot={() => { setLessonFor(null); setTunerOpen(false); }}
          />
          {showKeys && <ShortcutHelp onClose={() => setShowKeys(false)} />}
          <ShortcutBridge onAction={onShortcut} />
        </div>
      ) : (
        <Shell>
          {saveErr}
          <header className="ws-head">
            <div className="ws-head-row">
              <div className="ws-brand"><span className="ws-logo">◐</span> Woodshed</div>
              <div className="ws-head-actions">
                <button className="ws-gear" onClick={() => setPracticeOpen(true)} aria-label="Metronome and timer" title="Metronome & timer">♩</button>
                <button className="ws-gear" onClick={() => setShowSettings(true)} aria-label="Settings">⚙</button>
              </div>
            </div>
            <Streak streak={streak} />
          </header>
          {views}
          <nav className="ws-nav">
            {VIEWS.map(([k, label, icon]) => (
              <button key={k} className={`ws-tab ${view === k ? "on" : ""}`} aria-current={view === k ? "page" : undefined} onClick={() => setView(k)}>
                <span className="ws-tab-icon" aria-hidden="true">{icon}</span>{label}
              </button>
            ))}
          </nav>
          {practiceOpen && <PracticeSheet onClose={() => setPracticeOpen(false)} onOpenListen={() => { setPracticeOpen(false); setListenOpen(true); }} />}
          {listenOpen && <ListenSheet onClose={() => setListenOpen(false)} />}
          {lessonProps && <LessonSheet {...lessonProps} onClose={() => setLessonFor(null)} />}
        </Shell>
      )}
      {dialogs}
    </PracticeProvider>
  );
}

/* ----------------------- shell ----------------------- */
function Shell({ children }) {
  return <div className="ws-root"><div className="ws-col">{children}</div></div>;
}

/* ----------------------- streak (beats) ----------------------- */
function Streak({ streak }) {
  const cur = streak.current, best = streak.longest;
  const beats = 7;
  const lit = ((cur - 1) % beats) + (cur > 0 ? 1 : 0);
  return (
    <div className="ws-streak">
      <div className="ws-beats" role="img" aria-label={`Current streak ${cur} day${cur === 1 ? "" : "s"}, best ${best}`}>
        {Array.from({ length: beats }).map((_, i) => <span key={i} className={`ws-beat ${i < lit ? "lit" : ""}`} />)}
      </div>
      <div className="ws-streak-label">
        {cur > 0
          ? <><span className="mono ws-streak-num">{cur}</span> day{cur === 1 ? "" : "s"} running{best > cur && <span className="ws-streak-best"> · best {best}</span>}</>
          : best > 0 ? <>Streak reset — your best was <span className="mono">{best}</span></> : "Start your first day"}
      </div>
    </div>
  );
}

/* ----------------------- today ----------------------- */
function Today({ session, itemById, onSwap, onRegenerate, onStartLog, onAddAnother, settings, sessions, onLearn, selectedId }) {
  const anyEnabled = Object.values(settings.enabled).some(Boolean);
  if (!anyEnabled)
    return <Empty title="No instruments selected" body="Turn at least one instrument back on in settings to get a session." />;
  if (!session || !session.items.length)
    return <Empty title="Nothing queued" body="Tap shuffle to build today's set." action={<button className="ws-btn ghost" onClick={onRegenerate}>Shuffle</button>} />;

  const items = session.items.map((x) => ({ ...itemById(x.itemId), minutes: x.minutes })).filter((x) => x.id);
  const total = items.reduce((t, x) => t + x.minutes, 0);
  const insts = [...new Set(items.map((x) => x.inst))];
  const practicedToday = minutesInLastDays(sessions, 1);

  if (session.completed) {
    return (
      <div className="ws-done">
        <div className="ws-done-mark">✓</div>
        <h2 className="ws-done-title">Logged. Nice work.</h2>
        <p className="ws-done-sub">
          <span className="mono">{practicedToday}</span> min in the shed today.
          {practicedToday > 0 && " Everything you played feeds tomorrow's set."}
        </p>
        <button className="ws-btn ghost" onClick={onAddAnother}>Run another set</button>
      </div>
    );
  }

  return (
    <>
      <div className="ws-today-head">
        <div className="ws-today-eyebrow"><span className="ws-pulse" /> Today's set</div>
        <div className="ws-today-meta mono">{insts.map((i) => INSTRUMENTS[i]?.name || i).join(" + ")} · {total} min</div>
      </div>

      <div className="ws-cards">
        {items.map((it) => <SessionItem key={it.id} item={it} onSwap={() => onSwap(it.id)} onLearn={onLearn} selected={it.id === selectedId} />)}
      </div>

      <div className="ws-today-actions">
        <button className="ws-btn primary" onClick={onStartLog}>Done — log it</button>
        <button className="ws-btn ghost" onClick={onRegenerate}>Shuffle set</button>
      </div>
      <p className="ws-hint">One or two instruments a day, on purpose — depth is what makes progress feel real.</p>
    </>
  );
}

function SessionItem({ item, onSwap, onLearn, selected }) {
  const inst = INSTRUMENTS[item.inst];
  const href = safeHref(item.link && item.link.url);
  return (
    <div className={`ws-card ${selected ? "sel" : ""}`} style={{ "--accent": inst ? inst.color : "var(--gold)" }}>
      <div className="ws-card-rail" />
      <div className="ws-card-body">
        <div className="ws-card-top">
          <span className="ws-inst-tag">{inst ? inst.name : item.inst}</span>
          <span className="ws-type-tag">{TYPE_LABEL[item.type]}</span>
          {item.trackName && <span className="ws-track-tag">{item.trackName}</span>}
          <Dots n={item.diff} />
          <span className="ws-card-min mono">{item.minutes}m</span>
        </div>
        <h3 className="ws-card-title">{item.title}</h3>
        <p className="ws-card-desc">{item.desc}</p>
        <div className="ws-card-foot">
          {getLesson(item.id) && <button className="ws-learn" onClick={() => onLearn(item)} aria-label={`Learn: ${item.title}`}>◐ Learn</button>}
          {item.link && href && <a className="ws-card-link" href={href} target="_blank" rel="noreferrer">↗ {item.link.label}</a>}
          <button className="ws-swap" onClick={onSwap} aria-label={`Swap ${item.title} for another exercise`}>↺ swap</button>
        </div>
      </div>
    </div>
  );
}

function Dots({ n }) {
  return (
    <span className="ws-dots" title={`difficulty ${n}/5`}>
      {Array.from({ length: 5 }).map((_, i) => <span key={i} className={`ws-dot ${i < n ? "on" : ""}`} />)}
    </span>
  );
}

/* ----------------------- log sheet ----------------------- */
function LogSheet({ session, itemById, lastTempo, coachResults = {}, onCancel, onCommit }) {
  const init = session.items.filter((x) => itemById(x.itemId)).map((x) => {
    const it = itemById(x.itemId);
    const c = coachResults[x.itemId];
    return { itemId: x.itemId, title: it?.title || "", inst: it?.inst || "piano", done: true, minutes: x.minutes, rating: "good", bpm: it?.lastBpm ?? null, accuracy: c?.accuracy ?? null, missed: c?.missed ?? [] };
  });
  const [entries, setEntries] = useState(init);
  const [note, setNote] = useState("");
  const dlgRef = useDialog(onCancel);

  const patch = (i, p) => setEntries((e) => e.map((row, idx) => (idx === i ? { ...row, ...p } : row)));
  const anyDone = entries.some((e) => e.done);

  return (
    <div className="ws-sheet-wrap" onClick={onCancel}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Log your session" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <h2 className="ws-sheet-title">How'd it go?</h2>
        <p className="ws-sheet-sub">Marking things <em>too easy</em> or <em>tough</em> tunes what comes next.</p>

        <div className="ws-log-list">
          {entries.map((e, i) => (
            <div key={e.itemId} className={`ws-log-row ${e.done ? "" : "skipped"}`} style={{ "--accent": INSTRUMENTS[e.inst].color }}>
              <div className="ws-log-head">
                <label className="ws-check">
                  <input type="checkbox" checked={e.done} onChange={() => patch(i, { done: !e.done })} />
                  <span className="ws-check-box" />
                  <span className="ws-log-name">{e.title}</span>
                </label>
              </div>
              {e.done && (
                <div className="ws-log-controls">
                  <div className="ws-felt">
                    {FELT.map((f) => (
                      <button key={f.key} className={`ws-felt-btn ${e.rating === f.key ? "on" : ""}`} aria-pressed={e.rating === f.key} onClick={() => patch(i, { rating: f.key })}>{f.label}</button>
                    ))}
                  </div>
                  <div className="ws-min-step">
                    <button onClick={() => patch(i, { minutes: Math.max(1, e.minutes - 5) })}>−</button>
                    <span className="mono">{e.minutes}m</span>
                    <button onClick={() => patch(i, { minutes: e.minutes + 5 })}>+</button>
                  </div>
                  <div className="ws-bpm-log">
                    {e.bpm == null ? (
                      <button className="ws-bpm-add" onClick={() => patch(i, { bpm: lastTempo || 80 })}>+ tempo</button>
                    ) : (
                      <span className="ws-bpm-field">
                        <button onClick={() => patch(i, { bpm: Math.max(40, e.bpm - 5) })}>−</button>
                        <span className="mono">♩{e.bpm}</span>
                        <button onClick={() => patch(i, { bpm: Math.min(300, e.bpm + 5) })}>+</button>
                        <button className="ws-bpm-clear" onClick={() => patch(i, { bpm: null })} aria-label="Clear tempo">×</button>
                      </span>
                    )}
                  </div>
                  {e.accuracy != null && (
                    <div className="ws-log-acc mono" title="Measured by the coach">◉ {e.accuracy}% clean{e.missed.length ? ` · revisit ${e.missed.join(", ")}` : ""}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <textarea className="ws-note" placeholder="Note to yourself (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />

        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onCancel}>Cancel</button>
          <button className="ws-btn primary" disabled={!anyDone} onClick={() => onCommit(entries, note)}>Save session</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- progression proposals ----------------------- */
function ProposalSheet({ proposals, onAccept, onDismiss, onClose }) {
  const dlgRef = useDialog(onClose);
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Practice suggestions" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <h2 className="ws-sheet-title">From your practice</h2>
        <p className="ws-sheet-sub">Suggestions based on what you've logged. Nothing changes unless you say so.</p>

        {proposals.length === 0 ? (
          <div className="ws-prop-empty">All caught up — nothing to review right now.</div>
        ) : (
          proposals.map((p) => (
            <div key={p.itemId + p.kind} className="ws-prop-card" style={{ "--accent": INSTRUMENTS[p.inst]?.color || "var(--gold)" }}>
              <div className="ws-prop-head">
                <span className="ws-prop-title">{p.title}</span>
                <span className="ws-prop-change">Next stage →</span>
              </div>
              <p className="ws-prop-reason">{p.reason}</p>
              <div className="ws-prop-actions">
                <button className="ws-btn ghost sm" onClick={() => onDismiss(p)}>Not yet</button>
                <button className="ws-btn primary sm" onClick={() => onAccept(p)}>Advance</button>
              </div>
            </div>
          ))
        )}

        <button className="ws-btn ghost full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ----------------------- skill tracks ----------------------- */
function Tracks({ live, onComplete, onReopen, onLearn, selectedId }) {
  const status = trackStatus(live.items);
  return (
    <>
      <h2 className="ws-h2">Skill tracks</h2>
      <p className="ws-track-intro">Ordered progressions. Only your current stage rotates into daily practice — clear it to unlock the next.</p>
      {TRACKS.map((t) => {
        const stages = status[t.id] || [];
        const done = stages.filter((s) => s.status === "done").length;
        return (
          <div key={t.id} className="ws-track" style={{ "--accent": INSTRUMENTS[t.inst].color }}>
            <div className="ws-track-head">
              <span className="ws-track-swatch" />
              <div className="ws-track-titles">
                <div className="ws-track-name">{t.name}</div>
                <div className="ws-track-blurb">{t.blurb}</div>
              </div>
              <div className="ws-track-count mono">{done}/{stages.length}</div>
            </div>
            <div className="ws-track-bar"><div className="ws-track-fill" style={{ width: `${stages.length ? (done / stages.length) * 100 : 0}%` }} /></div>
            <div className="ws-stages">
              {stages.map((st) => (
                <div key={st.id} className={`ws-stage ${st.status} ${st.id === selectedId ? "sel" : ""}`}>
                  <div className="ws-stage-marker">{st.status === "done" ? "✓" : st.order + 1}</div>
                  <div className="ws-stage-body">
                    <div className="ws-stage-title">{st.title}<Dots n={st.diff} /></div>
                    {st.status === "current" && (
                      <>
                        <p className="ws-stage-desc">{st.desc}</p>
                        {st.link && safeHref(st.link.url) && <a className="ws-stage-link" href={safeHref(st.link.url)} target="_blank" rel="noreferrer">↗ {st.link.label}</a>}
                        <div className="ws-stage-actions">
                          {getLesson(st.id) && <button className="ws-btn ghost sm ws-stage-learn" onClick={() => onLearn({ ...st, inst: t.inst })}>◐ Learn</button>}
                          <button className="ws-btn primary sm ws-stage-btn" onClick={() => onComplete(st.id)}>Mark complete →</button>
                        </div>
                      </>
                    )}
                    {st.status === "done" && (
                      <div className="ws-stage-actions">
                        {getLesson(st.id) && <button className="ws-stage-learn-link" onClick={() => onLearn({ ...st, inst: t.inst })}>◐ Lesson</button>}
                        <button className="ws-stage-reopen" onClick={() => onReopen(st.id)}>Reopen</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ----------------------- library ----------------------- */
function Library({ items, onOpen, onAdd, onLearn, selectedId }) {
  const today = todayStr();
  const order = ["piano", "guitar"];
  return (
    <>
      <div className="ws-section-head">
        <h2 className="ws-h2">Library</h2>
        <button className="ws-btn ghost sm" onClick={onAdd}>+ Add</button>
      </div>
      {order.map((inst) => {
        const list = items.filter((it) => it.inst === inst);
        if (!list.length) return null;
        return (
          <div key={inst} className="ws-lib-group" style={{ "--accent": INSTRUMENTS[inst].color }}>
            <div className="ws-lib-group-head">
              <span className="ws-lib-swatch" />
              <span className="ws-lib-inst">{INSTRUMENTS[inst].name}</span>
              <span className="ws-lib-count mono">{list.filter((i) => !i.hidden).length} active</span>
            </div>
            {list.map((it) => (
              <div key={it.id} className={`ws-lib-item ${it.hidden ? "is-hidden" : ""} ${it.id === selectedId ? "sel" : ""}`}>
                <button className="ws-lib-tap" onClick={() => onOpen(it)} aria-label={`Edit ${it.title}`}>
                  <div className="ws-lib-main">
                    <div className="ws-lib-title">{it.title}{it.mastered ? <span className="ws-hidden-tag mastered">Mastered</span> : it.hidden && <span className="ws-hidden-tag">Hidden</span>}</div>
                    <div className="ws-lib-meta">
                      <span className="ws-type-tag sm">{TYPE_LABEL[it.type]}</span>
                      <Dots n={it.diff} />
                      <span className="mono ws-lib-sub">{it.min}m · {prettyAgo(it.last, today)} · {it.times}×{it.lastBpm ? ` · ♩${it.lastBpm}` : ""}</span>
                    </div>
                  </div>
                  <span className="ws-lib-chev" aria-hidden="true">›</span>
                </button>
                {getLesson(it.id) && <button className="ws-lib-learn" onClick={() => onLearn(it)} aria-label={`Lesson: ${it.title}`}>◐</button>}
              </div>
            ))}
          </div>
        );
      })}
      <p className="ws-hint">Tap any exercise to edit, hide, or rename it. "Your current piece" is the one to rename to whatever you're learning.</p>
    </>
  );
}

/* ----------------------- progress ----------------------- */
function Progress({ data, live, streak, onEditSession }) {
  const today = todayStr();
  const mins = minutesByInst(data.sessions);
  const totalMin = Object.values(mins).reduce((a, b) => a + b, 0);
  const week = minutesInLastDays(data.sessions, 7);
  const weekDays = weekCount(data.sessions);
  const weeklyGoal = data.settings.weeklyGoal || 4;
  const maxMin = Math.max(1, ...Object.values(mins));
  const order = ["piano", "guitar"].filter((i) => data.settings.enabled[i] || mins[i] > 0);
  const lastBy = lastByInstrument(data.sessions);

  const last14 = Array.from({ length: 14 }).map((_, k) => {
    const d = addDays(today, -(13 - k));
    const day = data.sessions.filter((s) => s.date === d);
    return { d, mins: day.reduce((t, s) => t + s.minutes, 0), insts: [...new Set(day.map((s) => s.inst))] };
  });
  const maxDay = Math.max(1, ...last14.map((day) => day.mins));

  if (!data.sessions.length)
    return <Empty title="No sessions yet" body="Your first practice will show up here — streak, minutes, and where each instrument stands." />;

  return (
    <div className="ws-progress">
      <h2 className="ws-h2">Progress</h2>

      <div className="ws-stat-row">
        <Stat value={streak.current} unit={`day${streak.current === 1 ? "" : "s"}`} label="Current streak" />
        <Stat value={week} unit="min" label="Last 7 days" />
        <Stat value={totalMin} unit="min" label="All time" />
      </div>

      <div className="ws-weekgoal">
        <div className="ws-weekgoal-top">
          <span>Weekly goal</span>
          <span className="mono">{weekDays} / {weeklyGoal} days{weekDays >= weeklyGoal ? " ✓" : ""}</span>
        </div>
        <div className="ws-weekgoal-bar" role="img" aria-label={`${weekDays} of ${weeklyGoal} days practiced this week`}>
          {Array.from({ length: weeklyGoal }).map((_, i) => (
            <span key={i} className={`ws-weekgoal-pip ${i < weekDays ? "on" : ""}`} />
          ))}
          {weekDays > weeklyGoal && <span className="ws-weekgoal-extra mono">+{weekDays - weeklyGoal}</span>}
        </div>
      </div>

      <div className="ws-block">
        <div className="ws-block-label">Last 14 days</div>
        <div className="ws-strip">
          {last14.map((day, i) => (
            <div key={i} className="ws-strip-col" title={`${day.d}: ${day.mins}m`}>
              <div className="ws-strip-bar" style={{
                height: `${Math.min(100, (day.mins / maxDay) * 100)}%`,
                background: day.insts[0] ? INSTRUMENTS[day.insts[0]].color : "transparent",
                opacity: day.mins ? 1 : 0.12,
              }} />
            </div>
          ))}
        </div>
      </div>

      <div className="ws-block">
        <div className="ws-block-label">By instrument</div>
        {order.map((inst) => (
          <div key={inst} className="ws-bar-row">
            <div className="ws-bar-head">
              <span className="ws-bar-name"><span className="ws-bar-swatch" style={{ background: INSTRUMENTS[inst].color }} />{INSTRUMENTS[inst].name}</span>
              <span className="mono ws-bar-meta">{prettyAgo(lastBy[inst], today)}</span>
            </div>
            <div className="ws-bar-track">
              <div className="ws-bar-fill" style={{ width: `${(mins[inst] / maxMin) * 100}%`, background: INSTRUMENTS[inst].color }} />
            </div>
            <div className="ws-bar-val mono">{mins[inst]}m</div>
          </div>
        ))}
      </div>

      <RecentSessions sessions={data.sessions} itemById={(id) => live.items.find((i) => i.id === id)} onEdit={onEditSession} />

      <Heatmap sessions={data.sessions} />
      <TempoTrends sessions={data.sessions} items={live.items} />
      <AccuracyTrends sessions={data.sessions} items={live.items} />
    </div>
  );
}

/* consistency heatmap — last 12 weeks, colored by minutes per day */
function Heatmap({ sessions }) {
  const today = todayStr();
  const weeks = 12;
  const byDate = {};
  for (const s of sessions) byDate[s.date] = (byDate[s.date] || 0) + s.minutes;
  const dow = new Date(today + "T00:00:00").getDay();
  const start = addDays(addDays(today, -dow), -(weeks - 1) * 7);
  const level = (m) => (m === 0 ? 0 : m <= 10 ? 1 : m <= 25 ? 2 : 3);
  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      col.push({ date, mins: byDate[date] || 0, future: date > today });
    }
    cols.push(col);
  }
  return (
    <div className="ws-block">
      <div className="ws-block-label">Consistency</div>
      <div className="ws-heat">
        {cols.map((col, i) => (
          <div key={i} className="ws-heat-col">
            {col.map((c) => (
              <span key={c.date} className={`ws-heat-cell L${c.future ? "x" : level(c.mins)}`} title={c.future ? "" : `${c.date}: ${c.mins}m`} />
            ))}
          </div>
        ))}
      </div>
      <div className="ws-heat-legend"><span>Less</span><span className="ws-heat-cell L0" /><span className="ws-heat-cell L1" /><span className="ws-heat-cell L2" /><span className="ws-heat-cell L3" /><span>More</span></div>
    </div>
  );
}

function Sparkline({ series }) {
  const w = 104, h = 28, pad = 3;
  const min = Math.min(...series), max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (w - 2 * pad);
    const y = h - pad - ((v - min) / span) * (h - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="ws-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* tempo trends — bpm over time per exercise that has tempo logged */
function TempoTrends({ sessions, items }) {
  const byItem = {};
  for (const s of sessions) if (s.bpm != null) (byItem[s.itemId] = byItem[s.itemId] || []).push(s.bpm);
  const rows = Object.keys(byItem)
    .filter((id) => byItem[id].length >= 2)
    .map((id) => ({ id, title: items.find((i) => i.id === id)?.title || "Deleted exercise", series: byItem[id] }))
    .sort((a, b) => b.series.length - a.series.length)
    .slice(0, 6);
  if (!rows.length) return null;
  return (
    <div className="ws-block">
      <div className="ws-block-label">Tempo progress</div>
      {rows.map((r) => {
        const first = r.series[0], last = r.series[r.series.length - 1];
        const delta = last - first;
        return (
          <div key={r.id} className="ws-tempo-row">
            <div className="ws-tempo-info">
              <div className="ws-tempo-title">{r.title}</div>
              <div className="ws-tempo-meta mono">♩{last}{delta !== 0 && <span className={delta > 0 ? "ws-up" : "ws-down"}> {delta > 0 ? "+" : ""}{delta}</span>}</div>
            </div>
            <Sparkline series={r.series} />
          </div>
        );
      })}
    </div>
  );
}

/* accuracy trends — coached % over time per exercise */
function AccuracyTrends({ sessions, items }) {
  const byItem = {};
  for (const s of sessions) if (s.coached && s.accuracy != null) (byItem[s.itemId] = byItem[s.itemId] || []).push(s.accuracy);
  const rows = Object.keys(byItem)
    .filter((id) => byItem[id].length >= 2)
    .map((id) => ({ id, title: items.find((i) => i.id === id)?.title || "Deleted exercise", series: byItem[id] }))
    .sort((a, b) => b.series.length - a.series.length)
    .slice(0, 6);
  if (!rows.length) return null;
  return (
    <div className="ws-block">
      <div className="ws-block-label">Accuracy progress</div>
      {rows.map((r) => {
        const last = r.series[r.series.length - 1];
        const delta = last - r.series[0];
        return (
          <div key={r.id} className="ws-tempo-row">
            <div className="ws-tempo-info">
              <div className="ws-tempo-title">{r.title}</div>
              <div className="ws-tempo-meta mono">{last}%{delta !== 0 && <span className={delta > 0 ? "ws-up" : "ws-down"}> {delta > 0 ? "+" : ""}{delta}</span>}</div>
            </div>
            <Sparkline series={r.series} />
          </div>
        );
      })}
    </div>
  );
}

function Stat({ value, unit, label }) {
  return (
    <div className="ws-stat">
      <div className="ws-stat-val mono">{value}<span className="ws-stat-unit">{unit}</span></div>
      <div className="ws-stat-label">{label}</div>
    </div>
  );
}

function RecentSessions({ sessions, itemById, onEdit }) {
  const today = todayStr();
  const recent = [...sessions].slice(-14).reverse();
  return (
    <div className="ws-block">
      <div className="ws-block-label">Recent sessions — tap to fix or remove</div>
      {recent.map((s) => {
        const it = itemById(s.itemId);
        return (
          <button key={s.id} className="ws-rec" onClick={() => onEdit(s)}>
            <span className="ws-rec-dot" style={{ background: INSTRUMENTS[s.inst]?.color || "var(--muted2)" }} />
            <span className="ws-rec-title">{it ? it.title : "Deleted exercise"}</span>
            <span className="mono ws-rec-meta">{s.minutes}m · {prettyAgo(s.date, today)}</span>
            <span className="ws-rec-chev">›</span>
          </button>
        );
      })}
    </div>
  );
}

function SessionEdit({ session, itemById, onSave, onDelete, onClose }) {
  const it = itemById(session.itemId);
  const [minutes, setMinutes] = useState(session.minutes);
  const [rating, setRating] = useState(session.rating);
  const dlgRef = useDialog(onClose);
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Edit session" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <h2 className="ws-sheet-title">Edit session</h2>
        <p className="ws-sheet-sub">{it ? it.title : "Deleted exercise"} · {prettyAgo(session.date, todayStr())}</p>

        <div className="ws-field">
          <label>How it felt</label>
          <div className="ws-felt">
            {FELT.map((f) => <button key={f.key} className={`ws-felt-btn ${rating === f.key ? "on" : ""}`} aria-pressed={rating === f.key} onClick={() => setRating(f.key)}>{f.label}</button>)}
          </div>
        </div>
        <div className="ws-field">
          <label>Minutes</label>
          <div className="ws-min-step solo">
            <button onClick={() => setMinutes((m) => Math.max(1, m - 5))}>−</button>
            <span className="mono">{minutes}m</span>
            <button onClick={() => setMinutes((m) => m + 5)}>+</button>
          </div>
        </div>

        <div className="ws-data-row ws-edit-actions">
          <button className="ws-btn danger sm" onClick={() => { onDelete(session.id); onClose(); }}>Delete</button>
          <button className="ws-btn primary" onClick={() => { onSave(session.id, { minutes, rating }); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- settings ----------------------- */
function Settings({ settings, onChange, onToggle, onReset, onClose, onExport, onImport }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(null); // parsed backup awaiting confirmation
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const dlgRef = useDialog(onClose);
  const lengths = [10, 15, 20, 30, 45];
  const goals = [3, 4, 5, 6, 7];

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let raw = null;
      try { raw = JSON.parse(String(reader.result)); } catch { /* not JSON */ }
      if (Array.isArray(raw?.items) && Array.isArray(raw?.sessions)) { setPending(raw); setMsg(""); }
      else setMsg("Couldn't read that file.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const restore = () => {
    const n = pending.sessions.length;
    setMsg(onImport(pending) ? `Backup restored — ${n} session${n === 1 ? "" : "s"}.` : "Couldn't read that file.");
    setPending(null);
  };

  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Settings" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <h2 className="ws-sheet-title">Settings</h2>

        <div className="ws-set-block">
          <div className="ws-set-label">Session length</div>
          <div className="ws-seg" role="group" aria-label="Session length in minutes">
            {lengths.map((l) => (
              <button key={l} className={`ws-seg-btn ${settings.target === l ? "on" : ""}`} aria-pressed={settings.target === l} onClick={() => onChange({ target: l })}>
                <span className="mono">{l}</span>m
              </button>
            ))}
          </div>
        </div>

        <div className="ws-set-block">
          <div className="ws-set-label">Weekly goal</div>
          <div className="ws-seg" role="group" aria-label="Practice days per week goal">
            {goals.map((g) => (
              <button key={g} className={`ws-seg-btn ${(settings.weeklyGoal || 4) === g ? "on" : ""}`} aria-pressed={(settings.weeklyGoal || 4) === g} onClick={() => onChange({ weeklyGoal: g })}>
                <span className="mono">{g}</span>×
              </button>
            ))}
          </div>
          <p className="ws-set-note">Days per week you're aiming for. A single missed day won't break your streak.</p>
        </div>

        <div className="ws-set-block">
          <div className="ws-set-label">Instruments in rotation</div>
          {Object.keys(INSTRUMENTS).map((inst) => (
            <label key={inst} className="ws-toggle-row" style={{ "--accent": INSTRUMENTS[inst].color }}>
              <span className="ws-toggle-name"><span className="ws-toggle-swatch" />{INSTRUMENTS[inst].name}</span>
              <button role="switch" aria-checked={!!settings.enabled[inst]} aria-label={`${INSTRUMENTS[inst].name} in rotation`} className={`ws-switch ${settings.enabled[inst] ? "on" : ""}`} onClick={() => onToggle(inst)}>
                <span className="ws-switch-knob" />
              </button>
            </label>
          ))}
        </div>

        <div className="ws-set-block">
          <div className="ws-set-label">Your data</div>
          <p className="ws-set-note">Saved on this device. Export to move it to another machine or keep a backup.</p>
          <div className="ws-data-row">
            <button className="ws-btn ghost sm" onClick={onExport}>Export backup</button>
            <button className="ws-btn ghost sm" onClick={() => fileRef.current.click()}>Import</button>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleFile} hidden />
          </div>
          {pending ? (
            <div className="ws-confirm" style={{ marginTop: 10 }}>
              <span>Replace everything on this device with this backup ({pending.sessions.length} session{pending.sessions.length === 1 ? "" : "s"})?</span>
              <div>
                <button className="ws-btn ghost sm" onClick={() => setPending(null)}>Keep</button>
                <button className="ws-btn danger sm" onClick={restore}>Replace</button>
              </div>
            </div>
          ) : msg && <p className="ws-data-msg">{msg}</p>}
        </div>

        <div className="ws-set-block">
          {!confirm ? (
            <button className="ws-btn danger-ghost" onClick={() => setConfirm(true)}>Reset everything</button>
          ) : (
            <div className="ws-confirm">
              <span>Erase everything — logs, custom exercises, edits and settings? This can't be undone.</span>
              <div>
                <button className="ws-btn ghost sm" onClick={() => setConfirm(false)}>Keep</button>
                <button className="ws-btn danger sm" onClick={onReset}>Erase</button>
              </div>
            </div>
          )}
        </div>

        <button className="ws-btn ghost full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ----------------------- add / edit exercise ----------------------- */
function ItemForm({ initial, sessions = [], hidden, onSave, onDelete, onToggleHidden, onClose, onLearn }) {
  const editing = !!initial;
  const [f, setF] = useState(
    initial
      ? { inst: initial.inst, title: initial.title, type: initial.type, diff: initial.diff, min: initial.min, desc: initial.desc, linkLabel: initial.link?.label || "", linkUrl: initial.link?.url || "" }
      : { inst: "guitar", title: "", type: "technique", diff: 1, min: 8, desc: "", linkLabel: "", linkUrl: "" }
  );
  const set = (p) => setF((s) => ({ ...s, ...p }));
  const valid = f.title.trim().length > 0;
  const dlgRef = useDialog(onClose);
  const buildSave = () => {
    const url = normalizeUrl(f.linkUrl);
    return {
      inst: f.inst, title: f.title, type: f.type, diff: f.diff, min: f.min,
      desc: f.desc || "Your own exercise.",
      link: url ? { label: f.linkLabel.trim() || url, url } : null,
    };
  };

  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()} ref={dlgRef} role="dialog" aria-modal="true" aria-label="Exercise editor" tabIndex={-1}>
        <div className="ws-sheet-grip" />
        <h2 className="ws-sheet-title">{editing ? "Edit exercise" : "Add to library"}</h2>
        {editing && getLesson(initial.id) && (
          <button className="ws-btn ghost sm ws-lesson-open" onClick={() => onLearn(initial)}>◐ Show lesson</button>
        )}

        <div className="ws-field">
          <label>Instrument</label>
          <div className="ws-seg" role="group" aria-label="Instrument">
            {Object.keys(INSTRUMENTS).map((i) => (
              <button key={i} className={`ws-seg-btn ${f.inst === i ? "on" : ""}`} aria-pressed={f.inst === i} onClick={() => set({ inst: i })}>{INSTRUMENTS[i].name}</button>
            ))}
          </div>
        </div>

        <div className="ws-field">
          <label>What to practice</label>
          <input className="ws-input" value={f.title} placeholder="e.g. Drop-D riff" onChange={(e) => set({ title: e.target.value })} />
        </div>

        <div className="ws-field">
          <label>Type</label>
          <div className="ws-seg" role="group" aria-label="Exercise type">
            {Object.keys(TYPE_LABEL).map((t) => (
              <button key={t} className={`ws-seg-btn ${f.type === t ? "on" : ""}`} aria-pressed={f.type === t} onClick={() => set({ type: t })}>{TYPE_LABEL[t]}</button>
            ))}
          </div>
        </div>

        <div className="ws-field-row">
          <div className="ws-field">
            <label>Difficulty</label>
            <div className="ws-seg" role="group" aria-label="Difficulty 1 to 5">
              {[1, 2, 3, 4, 5].map((d) => (
                <button key={d} className={`ws-seg-btn ${f.diff === d ? "on" : ""}`} aria-pressed={f.diff === d} aria-label={`Difficulty ${d}`} onClick={() => set({ diff: d })}><span className="mono">{d}</span></button>
              ))}
            </div>
          </div>
          <div className="ws-field ws-field-min">
            <label>Minutes</label>
            <div className="ws-min-step solo">
              <button onClick={() => set({ min: Math.max(2, f.min - 2) })}>−</button>
              <span className="mono">{f.min}</span>
              <button onClick={() => set({ min: f.min + 2 })}>+</button>
            </div>
          </div>
        </div>

        <div className="ws-field">
          <label>Notes (optional)</label>
          <textarea className="ws-input" rows={2} value={f.desc} placeholder="How to approach it" onChange={(e) => set({ desc: e.target.value })} />
        </div>

        <div className="ws-field">
          <label>Resource link (optional)</label>
          <input className="ws-input ws-input-link" value={f.linkLabel} placeholder="Label, e.g. JustinGuitar lesson" onChange={(e) => set({ linkLabel: e.target.value })} />
          <input className="ws-input" type="url" value={f.linkUrl} placeholder="https://…" onChange={(e) => set({ linkUrl: e.target.value })} />
        </div>

        {editing && (() => {
          const mine = sessions.filter((s) => s.itemId === initial.id).slice(-8).reverse();
          if (!mine.length) return null;
          return (
            <div className="ws-field">
              <label>Recent activity</label>
              <div className="ws-hist">
                {mine.map((s) => (
                  <div key={s.id} className="ws-hist-row">
                    <span className="ws-hist-date mono">{prettyAgo(s.date, todayStr())}</span>
                    <span className="ws-hist-felt">{FELT.find((ff) => ff.key === s.rating)?.label || s.rating}</span>
                    <span className="ws-hist-num mono">{s.minutes}m{s.bpm ? ` · ♩${s.bpm}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {editing && (
          <div className="ws-data-row ws-manage-row">
            <button className="ws-btn ghost sm" onClick={onToggleHidden}>{hidden ? "Unhide" : "Hide from rotation"}</button>
            {onDelete && <button className="ws-btn danger sm" onClick={onDelete}>Delete</button>}
          </div>
        )}

        <div className="ws-sheet-actions">
          <button className="ws-btn ghost" onClick={onClose}>Cancel</button>
          <button className="ws-btn primary" disabled={!valid} onClick={() => { onSave(buildSave()); onClose(); }}>{editing ? "Save" : "Add"}</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- empty ----------------------- */
function Empty({ title, body, action }) {
  return (
    <div className="ws-empty">
      <h2 className="ws-empty-title">{title}</h2>
      <p className="ws-empty-body">{body}</p>
      {action}
    </div>
  );
}

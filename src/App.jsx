import React, { useState, useEffect, useRef } from "react";
import { INSTRUMENTS, TYPE_LABEL, FELT, TRACKS } from "./seed.js";
import { getLesson } from "./lessons/index.js";
import LessonSheet from "./LessonSheet.jsx";
import { todayStr, addDays, prettyAgo } from "./dateUtils.js";
import {
  generateSession, swapInSession, streakInfo, weekCount, levelFor, lastByInstrument,
  minutesByInst, minutesInLastDays, freshData, withDerivedStats, progressionProposals,
  trackStatus, mergeContent,
} from "./engine.js";
import { loadState, saveState, migrate } from "./storage.js";
import { useMetronome } from "./useMetronome.js";
import { useListener } from "./useListener.js";

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
   WOODSHED — adaptive multi-instrument practice
   ============================================================ */
export default function Woodshed() {
  const [data, setData] = useState(null);
  const [view, setView] = useState("today");
  const [logging, setLogging] = useState(false);
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
  const loaded = useRef(false);
  const remindedRef = useRef(null);

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

  // Daily reminder. Fires a browser notification while Woodshed is open (a tab
  // or installed app) if you haven't practiced by your chosen time. Reliable
  // reminders when the app is fully closed would need a push backend — see README.
  useEffect(() => {
    const r = data && data.settings && data.settings.reminder;
    if (!r || !r.enabled) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const check = () => {
      const today = todayStr();
      if (remindedRef.current === today) return;
      const [hh, mm] = String(r.time || "18:00").split(":").map(Number);
      const now = new Date();
      const due = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
      const practiced = data.sessions.some((s) => s.date === today);
      if (due && !practiced) {
        remindedRef.current = today;
        try { new Notification("Woodshed", { body: "Time to practice — today's set is ready." }); } catch (e) { /* ignore */ }
      }
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [data && data.settings && data.settings.reminder, data && data.sessions]);

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
      return { ...d, sessions, currentSession: { ...d.currentSession, completed: true } };
    });
    setCoachResults((m) => {
      const next = { ...m };
      for (const e of entries) if (e.done) delete next[e.itemId];
      return next;
    });
    setLogging(false);
  };

  const recordCoachResult = (itemId, res) => setCoachResults((m) => ({ ...m, [itemId]: res }));

  const updateSettings = (patch) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const toggleInstrument = (inst) =>
    setData((d) => ({ ...d, settings: { ...d.settings, enabled: { ...d.settings.enabled, [inst]: !d.settings.enabled[inst] } } }));

  const addCustom = (fields) =>
    setData((d) => ({ ...d, items: [...d.items, { ...fields, id: `custom-${Date.now()}`, hidden: false, custom: true }] }));
  const saveItem = (id, fields) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...fields } : it)) }));
  const deleteItem = (id) =>
    setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));
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
      items: d.items.map((it) => {
        if (it.id !== p.itemId) return it;
        if (p.kind === "level-up") return { ...it, diff: Math.min(5, p.to) };
        if (p.kind === "ease") return { ...it, diff: Math.max(1, p.to) };
        if (p.kind === "graduate" || p.kind === "advance") return { ...it, mastered: true, hidden: true };
        return it;
      }),
      progress: ackProposal(d, p),
    }));
  const dismissProposal = (p) => setData((d) => ({ ...d, progress: ackProposal(d, p) }));

  // mark a track stage complete from the Tracks view (unlocks the next stage)
  const completeStage = (id) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, mastered: true, hidden: true } : it)) }));
  const reopenStage = (id) =>
    setData((d) => ({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, mastered: false, hidden: false } : it)) }));

  const resetAll = () => { setData(freshData()); setShowSettings(false); };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `woodshed-backup-${todayStr()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  const importData = (text) => {
    try {
      const parsed = migrate(JSON.parse(text));
      if (!parsed || !parsed.items || !parsed.settings) return false;
      if (!parsed.currentSession || parsed.currentSession.date !== todayStr()) parsed.currentSession = gen(parsed);
      setData(parsed);
      return true;
    } catch { return false; }
  };

  const streak = streakInfo(data.sessions);

  return (
    <Shell>
      {saveError && <div className="ws-saveerr">Couldn't save your latest change to this browser — your history may not persist.</div>}

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
            settings={data.settings} sessions={data.sessions} onLearn={setLessonFor}
          />
        )}
        {view === "tracks" && <Tracks live={live} onComplete={completeStage} onReopen={reopenStage} onLearn={setLessonFor} />}
        {view === "library" && (
          <Library items={live.items} onOpen={(it) => setItemForm({ item: it })} onAdd={() => setItemForm({ item: null })} onLearn={setLessonFor} />
        )}
        {view === "progress" && <Progress data={data} live={live} streak={streak} onEditSession={setEditSession} />}
      </main>

      <nav className="ws-nav">
        {[["today", "Today", "◐"], ["tracks", "Tracks", "◆"], ["library", "Library", "▤"], ["progress", "Progress", "◈"]].map(([k, label, icon]) => (
          <button key={k} className={`ws-tab ${view === k ? "on" : ""}`} aria-current={view === k ? "page" : undefined} onClick={() => setView(k)}>
            <span className="ws-tab-icon" aria-hidden="true">{icon}</span>{label}
          </button>
        ))}
      </nav>

      {logging && <LogSheet session={session} itemById={itemById} lastTempo={lastTempo} coachResults={coachResults} onCancel={() => setLogging(false)} onCommit={commitLog} />}
      {practiceOpen && <PracticeSheet onClose={() => setPracticeOpen(false)} onTempo={setLastTempo} onOpenListen={() => { setPracticeOpen(false); setListenOpen(true); }} />}
      {listenOpen && <ListenSheet onClose={() => setListenOpen(false)} onTempo={setLastTempo} />}
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
          onLearn={(it) => { setItemForm(null); setLessonFor(it); }}
        />
      )}
      {editSession && (
        <SessionEdit
          session={editSession} itemById={itemById}
          onSave={editSessionSave} onDelete={deleteSession} onClose={() => setEditSession(null)}
        />
      )}
      {lessonFor && (
        <LessonSheet
          item={lessonFor} href={safeHref(lessonFor.link?.url)}
          onClose={() => setLessonFor(null)}
          onCoachResult={recordCoachResult}
          onRequestLog={() => { setLessonFor(null); setLogging(true); }}
        />
      )}
    </Shell>
  );
}

/* ----------------------- shell ----------------------- */
function useEscape(onClose) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
}

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
function Today({ session, itemById, onSwap, onRegenerate, onStartLog, onAddAnother, settings, sessions, onLearn }) {
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
        {items.map((it) => <SessionItem key={it.id} item={it} onSwap={() => onSwap(it.id)} onLearn={onLearn} />)}
      </div>

      <div className="ws-today-actions">
        <button className="ws-btn primary" onClick={onStartLog}>Done — log it</button>
        <button className="ws-btn ghost" onClick={onRegenerate}>Shuffle set</button>
      </div>
      <p className="ws-hint">One or two instruments a day, on purpose — depth is what makes progress feel real.</p>
    </>
  );
}

function SessionItem({ item, onSwap, onLearn }) {
  const inst = INSTRUMENTS[item.inst];
  const href = safeHref(item.link && item.link.url);
  return (
    <div className="ws-card" style={{ "--accent": inst ? inst.color : "var(--gold)" }}>
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

/* ----------------------- practice tools (metronome + timer) ----------------------- */
function PracticeSheet({ onClose, onTempo, onOpenListen }) {
  const m = useMetronome(90, 4);
  const [sec, setSec] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // remember the tempo while the metronome is running, to prefill the log
  useEffect(() => { if (m.playing && onTempo) onTempo(m.bpm); }, [m.playing, m.bpm, onTempo]);

  const close = () => { m.stop(); onClose(); };
  useEscape(close);
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <div className="ws-sheet-wrap ws-practice-wrap">
      <div className="ws-sheet ws-practice" onClick={(e) => e.stopPropagation()}>
        <div className="ws-sheet-grip" />
        <div className="ws-practice-head">
          <h2 className="ws-sheet-title" style={{ margin: 0 }}>Practice</h2>
          <button className="ws-x" onClick={close} aria-label="Close">✕</button>
        </div>

        <div className="ws-metro">
          <div className="ws-beatdots">
            {Array.from({ length: m.beatsPer }).map((_, i) => (
              <span key={i} className={`ws-beatdot ${i === 0 ? "accent" : ""} ${m.beat === i ? "on" : ""}`} />
            ))}
          </div>
          <div className="ws-bpm"><span className="mono ws-bpm-num">{m.bpm}</span><span className="ws-bpm-label">bpm</span></div>
          <input className="ws-bpm-range" type="range" min="40" max="240" value={m.bpm}
            onChange={(e) => m.setBpm(Number(e.target.value))} aria-label="Tempo" />
          <div className="ws-metro-row">
            <button className="ws-round" onClick={() => m.setBpm(Math.max(40, m.bpm - 1))} aria-label="Slower">−</button>
            <button className={`ws-btn ${m.playing ? "ghost" : "primary"} ws-metro-go`} onClick={m.playing ? m.stop : m.start}>
              {m.playing ? "Stop" : "Start"}
            </button>
            <button className="ws-round" onClick={() => m.setBpm(Math.min(240, m.bpm + 1))} aria-label="Faster">+</button>
          </div>
          <div className="ws-metro-row2">
            <button className="ws-chip" onClick={m.tap}>Tap tempo</button>
            <div className="ws-sig">
              {[2, 3, 4].map((n) => (
                <button key={n} className={`ws-sig-btn ${m.beatsPer === n ? "on" : ""}`} aria-pressed={m.beatsPer === n} aria-label={`${n} beats per bar`} onClick={() => m.setBeatsPer(n)}>{n}/4</button>
              ))}
            </div>
          </div>
        </div>

        <div className="ws-stop">
          <div className="ws-stop-time mono">{mm}:{ss}</div>
          <div className="ws-stop-row">
            <button className="ws-btn ghost sm" onClick={() => setRunning((r) => !r)}>{running ? "Pause" : sec > 0 ? "Resume" : "Start"}</button>
            <button className="ws-btn ghost sm" onClick={() => { setRunning(false); setSec(0); }}>Reset</button>
          </div>
          <p className="ws-stop-note">Time your session here, then enter the minutes when you log.</p>
        </div>

        <button className="ws-listen-open" onClick={() => { m.stop(); onOpenListen(); }}>
          <span className="ws-listen-dot" /> Tuner &amp; listener <span className="ws-beta">beta</span>
        </button>
      </div>
    </div>
  );
}

/* ----------------------- tuner & mic listener (beta) ----------------------- */
function ListenSheet({ onClose, onTempo }) {
  const l = useListener();
  const close = () => { l.stop(); onClose(); };
  useEscape(close);
  const cents = l.note?.cents ?? 0;
  const clamped = Math.max(-50, Math.min(50, cents));
  const inTune = l.note && Math.abs(cents) <= 5;

  return (
    <div className="ws-sheet-wrap ws-practice-wrap">
      <div className="ws-sheet ws-practice" onClick={(e) => e.stopPropagation()}>
        <div className="ws-sheet-grip" />
        <div className="ws-practice-head">
          <h2 className="ws-sheet-title" style={{ margin: 0 }}>Tuner &amp; listener <span className="ws-beta">beta</span></h2>
          <button className="ws-x" onClick={close} aria-label="Close">✕</button>
        </div>

        {l.error ? (
          <div className="ws-listen-err">{l.error}</div>
        ) : !l.listening ? (
          <div className="ws-listen-intro">
            <p>Uses your microphone to show pitch and estimate tempo. It works best on single, clearly-sounding notes — tuning a string, or a monophonic line. Chords and accordion reeds are unreliable.</p>
            <button className="ws-btn primary" onClick={l.start}>Start listening</button>
          </div>
        ) : (
          <>
            <div className="ws-tuner">
              <div className={`ws-tuner-note ${inTune ? "in" : ""}`} aria-live="polite" aria-label={l.note ? `${l.note.name}${l.note.octave}, ${cents > 0 ? "+" : ""}${cents} cents${inTune ? ", in tune" : ""}` : "no note detected"}>
                {l.note ? <>{l.note.name}<span className="ws-tuner-oct">{l.note.octave}</span></> : <span className="ws-tuner-idle">—</span>}
              </div>
              <div className="ws-tuner-meter" role="img" aria-label={l.note ? (inTune ? "In tune" : cents > 0 ? "Sharp" : "Flat") : "Tuning meter"}>
                <div className="ws-tuner-center" />
                {l.note && <div className={`ws-tuner-needle ${inTune ? "in" : ""}`} style={{ left: `${50 + clamped}%` }} />}
              </div>
              <div className="ws-tuner-cents mono">{l.note ? `${cents > 0 ? "+" : ""}${cents}¢ · ${Math.round(l.freq)} Hz` : "play a note…"}</div>
            </div>

            <div className="ws-listen-tempo">
              {l.bpm ? (
                <>
                  <div className="ws-listen-bpm"><span className="mono ws-bpm-num">{l.bpm}</span><span className="ws-bpm-label">bpm detected</span></div>
                  <button className="ws-btn ghost sm" onClick={() => { onTempo(l.bpm); close(); }}>Use this tempo</button>
                </>
              ) : (
                <div className="ws-listen-hint">Play a steady pulse to estimate tempo…</div>
              )}
            </div>

            <button className="ws-btn ghost full" onClick={l.stop}>Stop listening</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ----------------------- log sheet ----------------------- */
function LogSheet({ session, itemById, lastTempo, coachResults = {}, onCancel, onCommit }) {
  const init = session.items.map((x) => {
    const it = itemById(x.itemId);
    const c = coachResults[x.itemId];
    return { itemId: x.itemId, title: it?.title || "", inst: it?.inst || "piano", done: true, minutes: x.minutes, rating: "good", bpm: it?.lastBpm ?? null, accuracy: c?.accuracy ?? null, missed: c?.missed ?? [] };
  });
  const [entries, setEntries] = useState(init);
  const [note, setNote] = useState("");
  useEscape(onCancel);

  const patch = (i, p) => setEntries((e) => e.map((row, idx) => (idx === i ? { ...row, ...p } : row)));
  const anyDone = entries.some((e) => e.done);

  return (
    <div className="ws-sheet-wrap" onClick={onCancel}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()}>
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
  useEscape(onClose);
  const changeLabel = (p) =>
    p.kind === "level-up" ? `Level ${p.from} → ${p.to}`
    : p.kind === "ease" ? `Ease to level ${p.to}`
    : p.kind === "advance" ? "Next stage →"
    : "Rotate out";
  const btnLabel = (p) => (p.kind === "graduate" ? "Rotate out" : p.kind === "advance" ? "Advance" : "Apply");
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()}>
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
                <span className="ws-prop-change">{changeLabel(p)}</span>
              </div>
              <p className="ws-prop-reason">{p.reason}</p>
              <div className="ws-prop-actions">
                <button className="ws-btn ghost sm" onClick={() => onDismiss(p)}>Not yet</button>
                <button className="ws-btn primary sm" onClick={() => onAccept(p)}>{btnLabel(p)}</button>
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
function Tracks({ live, onComplete, onReopen, onLearn }) {
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
                <div key={st.id} className={`ws-stage ${st.status}`}>
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
                        <button className="ws-stage-reopen" onClick={() => onReopen(st.id)}>reopen</button>
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
function Library({ items, onOpen, onAdd, onLearn }) {
  const today = todayStr();
  const order = ["piano", "guitar", "bass", "accordion"];
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
              <div key={it.id} className={`ws-lib-item ${it.hidden ? "is-hidden" : ""}`}>
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
  const order = ["piano", "guitar", "bass", "accordion"].filter((i) => data.settings.enabled[i] || mins[i] > 0);
  const lastBy = lastByInstrument(data.sessions);

  const last14 = Array.from({ length: 14 }).map((_, k) => {
    const d = addDays(today, -(13 - k));
    const day = data.sessions.filter((s) => s.date === d);
    return { d, mins: day.reduce((t, s) => t + s.minutes, 0), insts: [...new Set(day.map((s) => s.inst))] };
  });

  if (!data.sessions.length)
    return <Empty title="No sessions yet" body="Your first practice will show up here — streak, minutes, and where each instrument stands." />;

  return (
    <>
      <h2 className="ws-h2">Progress</h2>

      <div className="ws-stat-row">
        <Stat value={streak.current} unit={`day${streak.current === 1 ? "" : "s"}`} label="Current streak" />
        <Stat value={week} unit="min" label="This week" />
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
                height: `${Math.min(100, (day.mins / Math.max(1, maxMin)) * 100)}%`,
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
              <span className="mono ws-bar-meta">lvl {levelFor(inst, data.sessions)} · {prettyAgo(lastBy[inst], today)}</span>
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
    </>
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
  useEscape(onClose);
  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()}>
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
  const [msg, setMsg] = useState("");
  const [, force] = useState(0);
  useEscape(onClose);
  const lengths = [10, 15, 20, 30, 45];
  const goals = [3, 4, 5, 6, 7];
  const rem = settings.reminder || { enabled: false, time: "18:00" };
  const notifyState = typeof Notification !== "undefined" ? Notification.permission : "unsupported";

  const setReminder = async (patch) => {
    const next = { ...rem, ...patch };
    if (next.enabled && typeof Notification !== "undefined" && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch (e) { /* ignore */ }
      force((n) => n + 1); // reflect the new permission state
    }
    onChange({ reminder: next });
  };

  const reminderNote = () => {
    if (rem.enabled && notifyState === "denied") return "Notifications are blocked for this site — allow them in your browser settings to get reminders.";
    if (rem.enabled && notifyState === "unsupported") return "This browser doesn't support notifications.";
    return "Fires while Woodshed is open in a tab or installed as an app. Reminders when it's fully closed would need a server, which this version doesn't use — the surest nudge is just opening the app.";
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMsg(onImport(String(reader.result)) ? "Data restored." : "Couldn't read that file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="ws-sheet-wrap" onClick={onClose}>
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()}>
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
          <div className="ws-set-label">Daily reminder</div>
          <label className="ws-toggle-row">
            <span className="ws-toggle-name">Remind me to practice</span>
            <button role="switch" aria-checked={!!rem.enabled} aria-label="Daily reminder" className={`ws-switch ${rem.enabled ? "on" : ""}`} onClick={() => setReminder({ enabled: !rem.enabled })}>
              <span className="ws-switch-knob" />
            </button>
          </label>
          {rem.enabled && (
            <div className="ws-reminder-time">
              <label htmlFor="ws-rem-time">Remind at</label>
              <input id="ws-rem-time" type="time" className="ws-input ws-time-input" value={rem.time || "18:00"} onChange={(e) => setReminder({ time: e.target.value })} />
            </div>
          )}
          <p className="ws-set-note">{reminderNote()}</p>
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
            <label className="ws-btn ghost sm ws-file-btn">Import<input type="file" accept="application/json" onChange={handleFile} hidden /></label>
          </div>
          {msg && <p className="ws-data-msg">{msg}</p>}
        </div>

        <div className="ws-set-block">
          {!confirm ? (
            <button className="ws-btn danger-ghost" onClick={() => setConfirm(true)}>Reset everything</button>
          ) : (
            <div className="ws-confirm">
              <span>Erase all logs and custom items?</span>
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
  useEscape(onClose);
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
      <div className="ws-sheet" onClick={(e) => e.stopPropagation()}>
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

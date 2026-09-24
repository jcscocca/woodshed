import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createMidiConnection } from "./connection.js";
import { parseMidi, createTakeBuffer } from "./midiModel.js";
import { overlay } from "./overlay.js";
import { playTake } from "../lessonAudio.js";

const MidiContext = createContext(null);
export const useMidi = () => useContext(MidiContext);
export const useOverlay = () => useSyncExternalStore(overlay.subscribe, overlay.get);

function browserAccess() {
  if (import.meta.env.DEV && new URLSearchParams(location.search).has("fakemidi"))
    return { requestAccess: async () => (await import("./fakeMidi.js")).installFakeMidi(), queryPermission: async () => "granted" };
  return {
    requestAccess: navigator.requestMIDIAccess ? () => navigator.requestMIDIAccess() : null,
    queryPermission: navigator.permissions ? async () => (await navigator.permissions.query({ name: "midi" })).state : null,
  };
}

// The one MIDI connection (piano, desktop). The context value changes only with
// the connection status or band state; played notes reach subscribers directly.
export function MidiProvider({ enabled, children }) {
  const conn = useMemo(() => (enabled ? createMidiConnection(browserAccess()) : null), [enabled]);
  const [state, setState] = useState({ status: conn ? conn.status : "off", deviceName: "" });
  const [stateConn, setStateConn] = useState(conn);
  if (stateConn !== conn) { setStateConn(conn); setState({ status: conn ? conn.status : "off", deviceName: "" }); }
  const [bandOpen, setBandOpen] = useState(true);
  const subs = useRef(new Set());
  const take = useRef(createTakeBuffer());

  useEffect(() => {
    if (!conn) return;
    setState({ status: conn.status, deviceName: conn.deviceName });
    const offStatus = conn.onStatus(setState);
    const offMsg = conn.onMessage((data, t, id) => {
      const m = parseMidi(data, t, id);
      if (!m) return;
      take.current.push(m);
      for (const f of subs.current) f(m);
    });
    conn.autoConnect();
    return () => { offStatus(); offMsg(); conn.close(); };
  }, [conn]);

  const connect = useCallback(() => conn.connect(), [conn]);
  const subscribe = useCallback((f) => { subs.current.add(f); return () => subs.current.delete(f); }, []);
  const playLastTake = useCallback(() => { if (!overlay.get().busy) playTake(take.current.lastTake()); }, []);
  const value = useMemo(() => conn && {
    ...state,
    connect, subscribe, playLastTake,
    bandOpen, setBandOpen,
  }, [conn, state, bandOpen, connect, subscribe, playLastTake]);

  return <MidiContext.Provider value={value}>{children}</MidiContext.Provider>;
}

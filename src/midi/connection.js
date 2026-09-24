// The one MIDI connection, pure: works against any MIDIAccess-shaped object
// (the browser's, or a fake in tests and dev). Listens on every input.
export function createMidiConnection({ requestAccess, queryPermission }) {
  let access = null, status = requestAccess ? "idle" : "unsupported", deviceName = "";
  const msgFns = new Set(), statusFns = new Set();
  const set = (s) => { status = s; for (const f of statusFns) f({ status, deviceName }); };
  const onMidi = (e) => { for (const f of msgFns) f(e.data, e.timeStamp, e.target && e.target.id); };
  const refresh = () => {
    const inputs = [...access.inputs.values()].filter((i) => i.state !== "disconnected");
    for (const i of inputs) i.onmidimessage = onMidi;
    deviceName = inputs.map((i) => i.name).filter(Boolean).join(" + ");
    set(inputs.length ? "connected" : "disconnected");
  };
  const attach = (a) => { access = a; access.onstatechange = refresh; refresh(); };
  return {
    get status() { return status; },
    get deviceName() { return deviceName; },
    async connect() {
      if (!requestAccess) return;
      try { attach(await requestAccess()); } catch { set("denied"); }
    },
    async autoConnect() {
      if (!requestAccess || !queryPermission) return;
      try { if ((await queryPermission()) === "granted") attach(await requestAccess()); } catch { /* stay idle: the button still works */ }
    },
    onMessage(fn) { msgFns.add(fn); return () => msgFns.delete(fn); },
    onStatus(fn) { statusFns.add(fn); return () => statusFns.delete(fn); },
    close() {
      if (!access) return;
      for (const i of access.inputs.values()) i.onmidimessage = null;
      access.onstatechange = null;
      access = null;
    },
  };
}

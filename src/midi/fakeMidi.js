// Dev only (?fakemidi): a fake MIDIAccess you can play from the console or
// browser automation, e.g. window.__fakeMidi.press(60, 90). One per page.
let access = null;
export function installFakeMidi() {
  if (access) return access;
  const input = { id: "fake", name: "Fake keyboard", state: "connected", onmidimessage: null };
  access = { inputs: new Map([["fake", input]]), onstatechange: null };
  const send = (data) => input.onmidimessage && input.onmidimessage({ data: Uint8Array.from(data), timeStamp: performance.now(), target: input });
  window.__fakeMidi = {
    press: (note, velocity = 90) => send([0x90, note, velocity]),
    release: (note) => send([0x80, note, 0]),
    pedal: (down) => send([0xb0, 64, down ? 127 : 0]),
    unplug: () => { input.state = "disconnected"; access.onstatechange && access.onstatechange({}); },
    plug: () => { input.state = "connected"; access.onstatechange && access.onstatechange({}); },
  };
  return access;
}

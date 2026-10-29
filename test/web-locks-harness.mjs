// One lock service shared by isolated tab/module instances, like the browser's
// same-origin Web Locks manager. The callback owns the complete transaction.
export function createWebLocks() {
  const queues = new Map();
  return { request(name, _options, action) {
    const pending = (queues.get(name) || Promise.resolve()).then(action);
    queues.set(name, pending.catch(() => {}));
    return pending;
  } };
}

export function installWebLocks() {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { locks: createWebLocks() } });
  return () => { if (previous) Object.defineProperty(globalThis, "navigator", previous); else delete globalThis.navigator; };
}

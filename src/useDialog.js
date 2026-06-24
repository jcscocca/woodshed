import { useEffect, useRef } from "react";

// Dialog a11y for a sheet: returns a ref for the sheet panel. On mount it moves
// focus into the panel and remembers what was focused; while open it traps
// Tab/Shift+Tab inside and closes on Escape; on unmount it restores focus.
// onClose is read through a ref so the effect runs once (focus isn't yanked on
// every parent re-render).
export function useDialog(onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const node = ref.current;
    const prev = document.activeElement;
    // Focus the panel container (tabIndex -1). The Tab-trap below engages once focus
    // is on an interactive child; the first Tab moves from the container to it.
    if (node) node.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab" || !node) return;
      const f = node.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); if (prev && prev !== document.body && prev.focus) prev.focus(); };
  }, []);
  return ref;
}

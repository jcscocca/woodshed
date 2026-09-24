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
    // Focus the panel container (tabIndex -1). From the container (or anywhere outside
    // the panel), Tab goes to the first control and Shift+Tab to the last.
    if (node) node.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab" || !node) return;
      const f = [...node.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.getClientRects().length); // skip display:none / hidden controls
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      const active = document.activeElement;
      const outside = active === node || !node.contains(active);
      if (e.shiftKey && (active === first || outside)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || outside)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => { document.removeEventListener("keydown", onKey, true); if (prev && prev !== document.body && prev.focus) prev.focus(); };
  }, []);
  return ref;
}

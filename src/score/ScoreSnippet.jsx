import React, { useEffect, useRef } from "react";

// A lesson's short written example (a scale, a pattern): small and static — no
// cursor, no grading, no clicks.
export default function ScoreSnippet({ abc }) {
  const ref = useRef(null);
  useEffect(() => {
    let live = true;
    import("abcjs").then((mod) => {
      const el = ref.current;
      if (!live || !el) return;
      const abcjs = mod.default ?? mod, w = el.clientWidth;
      abcjs.renderAbc(el, abc, { scale: 0.9, staffwidth: w - 30, foregroundColor: getComputedStyle(el).getPropertyValue("--text").trim() });
      // bake the measured (scaled) box into the SVG so it lays out at the size it draws
      const svg = el.querySelector("svg"), r = svg.getBoundingClientRect(), k = Math.min(1, w / r.width);
      svg.setAttribute("viewBox", `0 0 ${svg.getAttribute("width")} ${svg.getAttribute("height")}`);
      svg.removeAttribute("style");
      el.removeAttribute("style");
      svg.setAttribute("width", r.width * k);
      svg.setAttribute("height", r.height * k);
    });
    return () => { live = false; };
  }, [abc]);
  return <div className="ws-score-snippet" ref={ref} />;
}

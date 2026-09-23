import { useCallback, useRef } from "react";
import type { MouseEvent } from "react";
import { prefersReduced } from "../lib/motion";

// Returns a ref + handlers that tilt an element in 3D toward the cursor and
// publish the cursor position as --mx/--my CSS vars (used by the spotlight).
export function useTilt(maxDeg = 7) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current;
      if (!el || prefersReduced()) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0..1 across
      const py = (e.clientY - r.top) / r.height; // 0..1 down
      const rotateX = (0.5 - py) * maxDeg * 2;
      const rotateY = (px - 0.5) * maxDeg * 2;
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
    },
    [maxDeg],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

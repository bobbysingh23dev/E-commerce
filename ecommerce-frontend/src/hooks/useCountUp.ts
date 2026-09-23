import { useEffect, useRef, useState } from "react";
import { prefersReduced } from "../lib/motion";

// Animates a number from its previous value to `target` with an ease-out curve.
// On rapid changes (e.g. cart quantity spam) it continues from wherever it was.
export function useCountUp(target: number, duration = 550): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(0); // first mount counts up from 0
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prefersReduced()) {
      setValue(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      setValue(current);
      fromRef.current = current; // so an interrupt continues smoothly
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

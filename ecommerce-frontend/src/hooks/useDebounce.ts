import { useEffect, useState } from "react";

// Returns a "delayed" copy of `value` that only updates after the value has
// stopped changing for `delayMs`. Great for search boxes: the input updates
// instantly, but the value we actually SEARCH with lags behind, so we fire
// one request when typing pauses instead of one per keystroke.
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Schedule an update...
    const id = setTimeout(() => setDebounced(value), delayMs);
    // ...but if `value` changes again before the timer fires, this cleanup
    // cancels the pending update and the timer restarts. That "keep resetting
    // the timer while the user types" behaviour IS the debounce.
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a CSS media query currently matches, live (updates on
 * resize/rotation via matchMedia's change event, not just on mount).
 *
 * Defaults to `false` until the effect runs on the client, since window
 * isn't available during SSR — callers gating a genuinely large subtree
 * (e.g. desktop-only vs. mobile-only layout branches) should treat that
 * initial tick as "unknown" rather than "mobile confirmed".
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handleChange = (e) => setMatches(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

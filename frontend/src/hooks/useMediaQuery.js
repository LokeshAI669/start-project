import { useState, useEffect } from 'react';

/**
 * useMediaQuery — returns true while the given CSS media query matches.
 *
 * - Uses window.matchMedia so it only fires when the breakpoint crosses,
 *   not on every pixel (unlike window.innerWidth in state).
 * - SSR-safe: returns false on the server where window is undefined.
 *
 * @param {string} query  A CSS media query string, e.g. '(max-width: 1024px)'
 * @returns {boolean}
 *
 * @example
 *   const isMobile = useMediaQuery('(max-width: 1024px)');
 */
export function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Safari < 14 fallback
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

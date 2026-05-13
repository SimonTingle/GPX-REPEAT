import { useEffect, useState } from 'react';

/**
 * React hook for responsive design using media queries.
 * Returns true/false based on whether the media query matches.
 * Automatically updates when viewport changes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is available (avoid SSR issues)
    if (typeof window === 'undefined') return;

    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook: returns true if viewport is mobile (<768px, md breakpoint)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Convenience hook: returns true if viewport is tablet/desktop (≥768px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

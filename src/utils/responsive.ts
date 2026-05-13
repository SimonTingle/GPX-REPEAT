/**
 * Responsive design breakpoints (Tailwind CSS standard)
 * Used for mobile detection and responsive layouts
 */
export const BREAKPOINTS = {
  xs: 0,       // Extra small
  sm: 640,     // Small (landscape phone)
  md: 768,     // Medium (tablet)
  lg: 1024,    // Large (desktop)
  xl: 1280,    // Extra large (widescreen)
  '2xl': 1536, // 2x extra large
} as const;

/**
 * Mobile detection threshold: <768px (Tailwind md breakpoint)
 * Below this width, render mobile layout
 * At or above this width, render desktop layout
 */
export const MOBILE_BREAKPOINT = BREAKPOINTS.md; // 768px

/**
 * Get media query string for a breakpoint
 * @param breakpoint - key from BREAKPOINTS
 * @returns media query string
 */
export function getBreakpointQuery(breakpoint: keyof typeof BREAKPOINTS): string {
  const width = BREAKPOINTS[breakpoint];
  return `(min-width: ${width}px)`;
}

/**
 * Get media query string for maximum width
 * @param breakpoint - key from BREAKPOINTS
 * @returns media query string for max-width
 */
export function getMaxBreakpointQuery(breakpoint: keyof typeof BREAKPOINTS): string {
  const width = BREAKPOINTS[breakpoint];
  return `(max-width: ${width - 1}px)`;
}

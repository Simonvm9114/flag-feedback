/**
 * Shared constants used across the feedback widget.
 */

/** Spacing for floating elements in pixels. */
export const LAYOUT_MARGIN = 16;

/** Gap between button and panel in pixels. */
export const LAYOUT_GAP = 8;

/** Default button/accent colour when not overridden by attribute. */
export const DEFAULT_BUTTON_COLOR = '#6366F1';

/** Maximum number of screenshots submitted per feedback. */
export const MAX_SUBMIT_SCREENSHOTS = 5;

/** Timeout in ms for feedback submission fetch requests. */
export const FETCH_TIMEOUT_MS = 30_000;

/** Annotation stroke color (e.g. rect, circle highlights). */
export const ANNOTATION_STROKE_COLOR = '#ef4444';

export const ICONS = {
  /** Chat bubble icon for the floating button. */
  chat: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  /** Checkmark icon for success state. */
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  /** Camera icon for screenshot button. */
  camera: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  /** Play icon for record button. */
  play: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
};

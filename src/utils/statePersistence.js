/**
 * State persistence for the feedback widget. Handles sessionStorage read/write
 * and validation of restored data.
 */

import { devWarn } from './devLogger.js';

const STORAGE_KEY = 'flag-feedback-state';
const LOG_PREFIX = '[flag-feedback]';

/** Regex for valid screenshot data URLs (PNG/JPEG/WebP base64). */
const DATA_URL_REGEX = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

/**
 * Checks if a value is a valid screenshot data URL.
 * @param {unknown} value
 * @returns {value is string}
 */
export function isValidDataUrl(value) {
  return typeof value === 'string' && DATA_URL_REGEX.test(value);
}

/**
 * Validates and sanitises restored state from sessionStorage.
 * @param {unknown} data - Parsed JSON data.
 * @returns {{ text: string, screenshots: Array<{ dataUrl: string, shapes: Array }>, isRecording: boolean, recorderEvents: Array, recorderStartTime: number|null }|null}
 */
export function validateRestoredState(data) {
  if (!data || typeof data !== 'object') return null;
  const obj = /** @type {Record<string, unknown>} */ (data);
  const text = typeof obj.text === 'string' ? obj.text : '';
  const screenshots = Array.isArray(obj.screenshots)
    ? obj.screenshots
        .filter((s) => s && typeof s === 'object' && isValidDataUrl(/** @type {Record<string, unknown>} */ (s).dataUrl))
        .map((s) => {
          const item = /** @type {Record<string, unknown>} */ (s);
          const shapes = Array.isArray(item.shapes) ? item.shapes : [];
          return { dataUrl: /** @type {string} */ (item.dataUrl), shapes };
        })
    : [];
  const isRecording = Boolean(obj.isRecording);
  const recorderEvents = Array.isArray(obj.recorderEvents) ? obj.recorderEvents : [];
  const recorderStartTime =
    typeof obj.recorderStartTime === 'number' && !Number.isNaN(obj.recorderStartTime) ? obj.recorderStartTime : null;
  return { text, screenshots, isRecording, recorderEvents, recorderStartTime };
}

/**
 * Persists widget state to sessionStorage.
 * @param {Object} state - State to persist.
 * @param {string} state.text
 * @param {Array<{ dataUrl: string, shapes: Array }>} state.screenshots
 * @param {boolean} state.isRecording
 * @param {Array} state.recorderEvents
 * @param {number|null} state.recorderStartTime
 */
export function persist(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    devWarn(LOG_PREFIX, 'Could not persist state:', e);
  }
}

/**
 * Restores and validates state from sessionStorage. Removes the key after reading.
 * @returns {{ text: string, screenshots: Array<{ dataUrl: string, shapes: Array }>, isRecording: boolean, recorderEvents: Array, recorderStartTime: number|null }|null}
 */
export function restore() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return validateRestoredState(parsed);
  } catch (e) {
    devWarn(LOG_PREFIX, 'Could not restore state:', e);
    return null;
  }
}

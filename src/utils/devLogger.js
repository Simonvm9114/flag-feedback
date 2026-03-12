/**
 * Development-only logging. Silent in production to avoid affecting the host page.
 */

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;

/**
 * Logs a warning only in development mode.
 * @param {string} prefix - Log prefix (e.g. '[flag-feedback]').
 * @param {string} message - Warning message.
 * @param {unknown} [err] - Optional error object.
 */
export function devWarn(prefix, message, err) {
  if (IS_DEV) {
    if (err !== undefined) {
      console.warn(prefix, message, err);
    } else {
      console.warn(prefix, message);
    }
  }
}

/**
 * Logs an error only in development mode.
 * @param {string} prefix - Log prefix (e.g. '[flag-feedback]').
 * @param {string} message - Error message.
 */
export function devError(prefix, message) {
  if (IS_DEV) {
    console.error(prefix, message);
  }
}

/** Prefix for developer-facing console messages. */
export const LOG_PREFIX = 'flag-feedback:';

/** Logs a developer-facing initialization error. */
export function logInitError(message: string): void {
  console.error(`${LOG_PREFIX} ${message}`);
}

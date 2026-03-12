/**
 * Submits the feedback package to the endpoint. Handles fetch, timeout, and error mapping.
 */

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Submits feedback to the configured endpoint.
 * @param {string} endpoint - Validated endpoint URL.
 * @param {Object} pkg - The feedback package (from buildPackage).
 * @param {{ timeoutMs?: number }} [options]
 * @returns {Promise<void>} Resolves on success. Throws with user-friendly message on failure.
 */
export async function submit(endpoint, pkg, options = {}) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const msg =
        res.status >= 500
          ? 'Server error. Please try again later.'
          : `Request failed (${res.status}). Please try again.`;
      throw new Error(msg);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    const isNetwork = err.name === 'AbortError' || err instanceof TypeError;
    const msg = isNetwork
      ? 'Network error or request timed out. Please check your connection and try again.'
      : err.message || 'Submission failed. Please try again.';
    throw new Error(msg, { cause: err });
  }
}

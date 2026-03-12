/**
 * Validates endpoint URLs for safe fetch usage (https or http for localhost only).
 */

/**
 * Validates that a URL is safe for fetch (https or http for localhost only).
 * @param {string} url - The endpoint URL to validate.
 * @returns {boolean} True if valid.
 */
export function validateEndpoint(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    const protocol = u.protocol.toLowerCase();
    if (protocol === 'javascript:' || protocol === 'data:' || protocol === 'blob:' || protocol === 'file:') {
      return false;
    }
    if (protocol === 'https:') return true;
    if (protocol === 'http:') {
      const host = u.hostname.toLowerCase();
      return host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.');
    }
    return false;
  } catch {
    return false;
  }
}

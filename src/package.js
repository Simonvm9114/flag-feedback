import { nanoid } from 'nanoid';

const MAX_TEXT_LENGTH = 10_000;
const MAX_SCREENSHOTS = 5;

/**
 * @typedef {Object} BuildPackageOptions
 * @property {string|null} [appId]
 * @property {string|null} [gitCommit]
 * @property {string|null} [gitRepo]
 * @property {string} [text]
 * @property {string[]} [screenshots]
 * @property {Array} [interactions]
 * @property {number|null} [recordingStart]
 */

/**
 * Assembles the feedback package that is POSTed to the configured endpoint.
 * Enforces payload limits: text truncated to 10k chars, max 5 screenshots.
 * @param {BuildPackageOptions} opts
 * @returns {{ id: string, timestamp: string, app: Object, device: Object, feedback: Object, screenshots: string[], interactions: Array, recordingStart: number|null }}
 */
export function buildPackage({ appId, gitCommit, gitRepo, text, screenshots, interactions, recordingStart }) {
  const trimmedText = typeof text === 'string' ? text.slice(0, MAX_TEXT_LENGTH) : '';
  const screenshotList = Array.isArray(screenshots)
    ? screenshots.filter(Boolean).slice(0, MAX_SCREENSHOTS)
    : [];
  return {
    id: `fb_${nanoid()}`,
    timestamp: new Date().toISOString(),
    app: {
      id:        appId     || null,
      gitCommit: gitCommit || null,
      gitRepo:   gitRepo   || null,
      url:       window.location.href,
      route:     window.location.pathname + window.location.hash,
    },
    device: {
      userAgent:  navigator.userAgent,
      viewport:   { w: window.innerWidth, h: window.innerHeight },
      pixelRatio: window.devicePixelRatio || 1,
    },
    feedback: {
      text: trimmedText,
    },
    screenshots:    screenshotList,
    interactions:   interactions   || [],
    recordingStart: recordingStart || null,
  };
}

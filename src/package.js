import { nanoid } from 'nanoid';

/**
 * Assembles the feedback package that is POSTed to the configured endpoint.
 */
export function buildPackage({ appId, gitCommit, gitRepo, text, screenshots, interactions, recordingStart }) {
  const screenshotList = Array.isArray(screenshots) ? screenshots.filter(Boolean) : [];
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
      text: text || '',
    },
    screenshots:    screenshotList,
    interactions:   interactions   || [],
    recordingStart: recordingStart || null,
  };
}

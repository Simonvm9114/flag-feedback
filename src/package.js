import { nanoid } from 'nanoid';

/**
 * Assembles the feedback package that is POSTed to the configured endpoint.
 */
export function buildPackage({ appId, gitCommit, gitRepo, text, screenshot, interactions, recordingStart }) {
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
    screenshot:     screenshot     || null,
    interactions:   interactions   || [],
    recordingStart: recordingStart || null,
  };
}

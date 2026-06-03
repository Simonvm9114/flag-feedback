import { describe, expect, it } from 'vitest';
import type { InitFeedbackConfig } from '../config/types';
import { buildPackage } from './build-package';

const emptySession = {
  comment: '',
  category: null,
  elementTargets: [],
  interactions: [],
  recordingStart: null,
};

const baseConfig: InitFeedbackConfig = {
  activator: document.createElement('button'),
  endpoint: 'https://example.com/api/feedback',
};

describe('buildPackage app metadata (US-05)', () => {
  it('includes all three app fields when all are supplied', () => {
    const pkg = buildPackage(emptySession, {
      ...baseConfig,
      appId: 'my-app',
      gitCommit: 'a3f9c12',
      gitRepo: 'https://github.com/Simonvm9114/flag-feedback.git',
    });

    expect(pkg.app.id).toBe('my-app');
    expect(pkg.app.gitCommit).toBe('a3f9c12');
    expect(pkg.app.gitRepo).toBe('https://github.com/Simonvm9114/flag-feedback.git');
    expect(pkg.app.url).toBe(window.location.href);
    expect(pkg.app.route).toBe(`${window.location.pathname}${window.location.hash}`);
  });

  it('sets app metadata fields to null when none are supplied', () => {
    const pkg = buildPackage(emptySession, baseConfig);

    expect(pkg.app.id).toBeNull();
    expect(pkg.app.gitCommit).toBeNull();
    expect(pkg.app.gitRepo).toBeNull();
  });

  it('includes only supplied app metadata fields for a subset', () => {
    const pkg = buildPackage(emptySession, {
      ...baseConfig,
      appId: 'my-app',
    });

    expect(pkg.app.id).toBe('my-app');
    expect(pkg.app).not.toHaveProperty('gitCommit');
    expect(pkg.app).not.toHaveProperty('gitRepo');
  });
});

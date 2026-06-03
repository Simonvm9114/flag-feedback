import { describe, expect, it } from 'vitest';
import { initFeedback } from './index';

describe('package entry (US-01)', () => {
  it('exports initFeedback as a callable function', () => {
    expect(typeof initFeedback).toBe('function');
  });

  it('returns a widget instance with destroy', () => {
    const el = document.createElement('button');
    const instance = initFeedback({ activator: el, endpoint: 'https://example.com/api' });
    expect(typeof instance.destroy).toBe('function');
    instance.destroy();
  });
});

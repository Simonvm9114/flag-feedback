import { describe, expect, it } from 'vitest';
import { initFeedback } from './index';

/** Minimal smoke test — confirms Vitest + happy-dom; replaced in Phase 6. */
describe('initFeedback (scaffold)', () => {
  it('returns a widget instance with destroy', () => {
    const el = document.createElement('button');
    const instance = initFeedback({ activator: el, endpoint: 'https://example.com/api' });
    expect(typeof instance.destroy).toBe('function');
    instance.destroy();
  });
});

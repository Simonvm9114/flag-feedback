import { afterEach, describe, expect, it, vi } from 'vitest';
import { LOG_PREFIX } from '../logging';
import { initFeedback } from './init-feedback';

const VALID_ENDPOINT = 'https://example.com/api/feedback';

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('initFeedback (US-02, US-03, US-04)', () => {
  it('returns a widget instance with destroy on valid config', () => {
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    const instance = initFeedback({ activator, endpoint: VALID_ENDPOINT });
    expect(typeof instance.destroy).toBe('function');

    instance.destroy();
  });

  it('keeps the activator at its host-chosen DOM position', () => {
    const nav = document.createElement('nav');
    const activator = document.createElement('button');
    nav.appendChild(activator);
    document.body.appendChild(nav);

    const instance = initFeedback({ activator, endpoint: VALID_ENDPOINT });

    expect(activator.parentElement).toBe(nav);
    expect(document.body.contains(nav)).toBe(true);

    instance.destroy();
  });

  it('allows placing the activator inside standard HTML containers', () => {
    for (const tag of ['nav', 'header', 'aside', 'div'] as const) {
      document.body.innerHTML = '';
      const container = document.createElement(tag);
      const activator = document.createElement('button');
      container.appendChild(activator);
      document.body.appendChild(container);

      expect(() =>
        initFeedback({ activator, endpoint: VALID_ENDPOINT }).destroy(),
      ).not.toThrow();
    }
  });

  it('does not apply inline styles to the activator', () => {
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    const instance = initFeedback({ activator, endpoint: VALID_ENDPOINT });
    expect(activator.getAttribute('style')).toBeNull();

    instance.destroy();
  });

  it('supports two activator instances simultaneously without errors', () => {
    const activatorA = document.createElement('button');
    const activatorB = document.createElement('button');
    document.body.append(activatorA, activatorB);

    expect(() => {
      const instanceA = initFeedback({ activator: activatorA, endpoint: VALID_ENDPOINT });
      const instanceB = initFeedback({ activator: activatorB, endpoint: VALID_ENDPOINT });
      instanceA.destroy();
      instanceB.destroy();
    }).not.toThrow();
  });

  it('does not make HTTP requests during the widget lifecycle', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    const instance = initFeedback({ activator, endpoint: VALID_ENDPOINT });
    activator.click();
    instance.destroy();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not initialize when endpoint is missing and logs a developer error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    const instance = initFeedback({ activator, endpoint: '' });

    expect(errorSpy).toHaveBeenCalledWith(`${LOG_PREFIX} endpoint is required`);
    expect(document.querySelector('[data-flag-feedback-portal]')).toBeNull();

    instance.destroy();
  });

  it('does not initialize for a relative endpoint URL', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    initFeedback({ activator, endpoint: '/api/feedback' }).destroy();

    expect(errorSpy).toHaveBeenCalledWith(`${LOG_PREFIX} endpoint must be an absolute URL`);
    expect(document.querySelector('[data-flag-feedback-portal]')).toBeNull();
  });

  it('does not initialize for a non-local http:// endpoint', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    initFeedback({ activator, endpoint: 'http://example.com/api/feedback' }).destroy();

    expect(errorSpy).toHaveBeenCalledWith(
      `${LOG_PREFIX} endpoint must use HTTPS (http:// is only allowed for localhost and 127.x.x.x)`,
    );
    expect(document.querySelector('[data-flag-feedback-portal]')).toBeNull();
  });

  it('accepts https:// and local http:// endpoints', () => {
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    initFeedback({ activator, endpoint: VALID_ENDPOINT }).destroy();

    document.body.innerHTML = '';
    document.body.appendChild(activator);
    initFeedback({
      activator,
      endpoint: 'http://127.0.0.1:3000/api/feedback',
    }).destroy();

    expect(document.querySelectorAll('[data-flag-feedback-portal]').length).toBe(0);
  });

  it('initializes without error when app metadata is omitted (US-05)', () => {
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    expect(() =>
      initFeedback({ activator, endpoint: VALID_ENDPOINT }).destroy(),
    ).not.toThrow();
  });

  it('initializes without error when only a subset of app metadata is supplied (US-05)', () => {
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    expect(() =>
      initFeedback({
        activator,
        endpoint: VALID_ENDPOINT,
        appId: 'my-app',
      }).destroy(),
    ).not.toThrow();
  });

  it('removes the portal on destroy', () => {
    const activator = document.createElement('button');
    document.body.appendChild(activator);

    const instance = initFeedback({ activator, endpoint: VALID_ENDPOINT });
    expect(document.querySelector('[data-flag-feedback-portal]')).not.toBeNull();

    instance.destroy();
    expect(document.querySelector('[data-flag-feedback-portal]')).toBeNull();
  });
});

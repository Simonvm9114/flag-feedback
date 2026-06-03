import { describe, expect, it } from 'vitest';
import { validateEndpoint } from './validate-endpoint';

describe('validateEndpoint (US-04)', () => {
  it('accepts https:// URLs', () => {
    expect(validateEndpoint('https://example.com/api/feedback')).toEqual({ valid: true });
  });

  it('accepts http://localhost URLs', () => {
    expect(validateEndpoint('http://localhost/api/feedback')).toEqual({ valid: true });
  });

  it('accepts http://127.0.0.1 URLs', () => {
    expect(validateEndpoint('http://127.0.0.1:3000/api/feedback')).toEqual({ valid: true });
  });

  it('accepts http://127.x.x.x URLs', () => {
    expect(validateEndpoint('http://127.1.2.3/api/feedback')).toEqual({ valid: true });
  });

  it('rejects absent or empty endpoint', () => {
    expect(validateEndpoint('')).toEqual({ valid: false, message: 'endpoint is required' });
    expect(validateEndpoint('   ')).toEqual({ valid: false, message: 'endpoint is required' });
  });

  it('rejects relative URLs', () => {
    const result = validateEndpoint('/api/feedback');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toBe('endpoint must be an absolute URL');
    }
  });

  it('rejects http:// URLs that are not localhost or 127.x.x.x', () => {
    const result = validateEndpoint('http://example.com/api/feedback');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain('HTTPS');
    }
  });
});

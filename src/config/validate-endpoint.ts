/** Result of endpoint URL validation at init time. */
export type EndpointValidationResult = { valid: true } | { valid: false; message: string };

/** Returns whether a hostname is allowed for plain HTTP endpoint URLs. */
function isLocalHttpHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname.startsWith('127.');
}

/** Validates the configured submission endpoint per US-04 rules. */
export function validateEndpoint(endpoint: string): EndpointValidationResult {
  if (!endpoint || endpoint.trim() === '') {
    return { valid: false, message: 'endpoint is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return { valid: false, message: 'endpoint must be an absolute URL' };
  }

  if (parsed.protocol === 'https:') {
    return { valid: true };
  }

  if (parsed.protocol === 'http:' && isLocalHttpHost(parsed.hostname)) {
    return { valid: true };
  }

  if (parsed.protocol === 'http:') {
    return {
      valid: false,
      message: 'endpoint must use HTTPS (http:// is only allowed for localhost and 127.x.x.x)',
    };
  }

  return {
    valid: false,
    message: 'endpoint must use HTTPS or http://localhost / http://127.x.x.x',
  };
}

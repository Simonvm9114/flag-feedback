import type { InitFeedbackConfig } from './types';
import { validateEndpoint } from './validate-endpoint';

/** Result of full init configuration validation. */
export type ConfigValidationResult =
  | { valid: true; config: InitFeedbackConfig }
  | { valid: false; message: string };

/** Validates activator and endpoint before the widget initializes. */
export function validateConfig(config: InitFeedbackConfig): ConfigValidationResult {
  if (!(config.activator instanceof HTMLElement)) {
    return { valid: false, message: 'activator must be an HTMLElement' };
  }

  const endpointResult = validateEndpoint(config.endpoint);
  if (!endpointResult.valid) {
    return { valid: false, message: endpointResult.message };
  }

  return { valid: true, config };
}

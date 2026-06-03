import { validateConfig } from '../config/validate-config';
import type { InitFeedbackConfig, WidgetInstance } from '../config/types';
import { logInitError } from '../logging';
import { createPortal, destroyPortal, type Portal } from './portal';

/** No-op widget instance returned when initialization fails validation. */
const FAILED_INSTANCE: WidgetInstance = {
  destroy() {},
};

/** Binds the activator click listener without modifying host DOM layout or styles. */
function bindActivator(activator: HTMLElement, portal: Portal): () => void {
  const onActivatorClick = (): void => {
    void portal;
  };

  activator.addEventListener('click', onActivatorClick);
  return () => activator.removeEventListener('click', onActivatorClick);
}

/** Initializes the feedback widget on a host-owned activator element. */
export function initFeedback(config: InitFeedbackConfig): WidgetInstance {
  const validation = validateConfig(config);
  if (!validation.valid) {
    logInitError(validation.message);
    return FAILED_INSTANCE;
  }

  const portal = createPortal();
  const unbindActivator = bindActivator(config.activator, portal);

  return {
    destroy() {
      unbindActivator();
      destroyPortal(portal);
    },
  };
}

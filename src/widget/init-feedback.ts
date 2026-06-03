import { validateConfig } from '../config/validate-config';
import type { InitFeedbackConfig, WidgetInstance } from '../config/types';
import { logInitError } from '../logging';
import { createPortal, destroyPortal, type Portal } from './portal';
import { createSession } from '../session/session';
import { createFeedbackPanel, type FeedbackPanel } from './feedback-panel';
import { buildPackage } from '../payload/build-package';

/** No-op widget instance returned when initialization fails validation. */
const FAILED_INSTANCE: WidgetInstance = {
  destroy() {},
};

/** Binds the activator click listener; opens the panel when idle. */
function bindActivator(
  activator: HTMLElement,
  getIsIdle: () => boolean,
  onActivate: () => void,
): () => void {
  const onClick = (): void => {
    if (!getIsIdle()) return;
    onActivate();
  };
  activator.addEventListener('click', onClick);
  return () => activator.removeEventListener('click', onClick);
}

/** Initializes the feedback widget on a host-owned activator element. */
export function initFeedback(config: InitFeedbackConfig): WidgetInstance {
  const validation = validateConfig(config);
  if (!validation.valid) {
    logInitError(validation.message);
    return FAILED_INSTANCE;
  }

  const portal: Portal = createPortal();
  const session = createSession();

  let panel: FeedbackPanel | null = null;

  const getPanel = (): FeedbackPanel => {
    if (!panel) {
      panel = createFeedbackPanel({
        shadowRoot: portal.shadowRoot,
        getState() {
          return {
            comment: session.getSnapshot().comment,
            category: session.getSnapshot().category,
          };
        },
        onCommentChange(text) {
          session.setComment(text);
        },
        onCategoryChange(category) {
          session.setCategory(category);
        },
        onClose() {
          session.closePanel();
          panel?.hide();
        },
        async onSubmit({ comment, category }) {
          session.setComment(comment);
          session.setCategory(category);
          const pkg = buildPackage(session.getSnapshot(), config);
          await fetch(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pkg),
          });
          // Clear draft only on successful submission (data.md: "When cleared: successful submission only")
          session.reset();
          panel?.hide();
        },
      });
    }
    return panel;
  };

  const unbindActivator = bindActivator(
    config.activator,
    () => session.getMode() === 'idle',
    () => {
      // Do NOT reset session here — draft is preserved between open/close cycles.
      // Session is only cleared after a successful submit.
      session.openPanel();
      getPanel().show();
    },
  );

  return {
    destroy() {
      unbindActivator();
      panel?.destroy();
      destroyPortal(portal);
    },
  };
}

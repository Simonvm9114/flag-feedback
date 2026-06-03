import { validateConfig } from '../config/validate-config';
import type { InitFeedbackConfig, WidgetInstance } from '../config/types';
import { logInitError } from '../logging';
import { createPortal, destroyPortal, type Portal } from './portal';
import { createSession } from '../session/session';
import { createFeedbackPanel, type FeedbackPanel } from './feedback-panel';
import { createTargeting, type TargetingController } from '../targeting/targeting';
import { createRecorder, type RecorderController } from '../recorder/recorder';
import { createRecordingIndicator, type RecordingIndicator } from './recording-indicator';
import { buildPackage } from '../payload/build-package';

/** No-op widget instance returned when initialization fails validation. */
const FAILED_INSTANCE: WidgetInstance = {
  destroy() {},
};

/** Appends a transient ✓ child node to the activator for ~2 seconds. No styles applied. */
function showActivatorSuccess(activator: HTMLElement): void {
  const indicator = document.createElement('span');
  indicator.setAttribute('data-ff-success', '');
  indicator.textContent = ' ✓';
  activator.appendChild(indicator);
  setTimeout(() => indicator.remove(), 2000);
}

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

  const recorder: RecorderController = createRecorder({
    portalContainer: portal.container,
    activator: config.activator,
    onInteraction(event) {
      session.appendInteraction(event);
    },
  });

  const recordingIndicator: RecordingIndicator = createRecordingIndicator({
    shadowRoot: portal.shadowRoot,
    onStop() {
      recorder.stop();
      session.exitRecording();
      recordingIndicator.hide();
      getPanel().show();
    },
  });

  const targeting: TargetingController = createTargeting({
    shadowRoot: portal.shadowRoot,
    portalContainer: portal.container,
    activator: config.activator,
    onDone() {
      targeting.exit();
      session.exitTargeting();
      getPanel().show();
    },
    onTargetAdded(target) {
      session.addElementTarget(target);
    },
    getTargetCount() {
      return session.getSnapshot().elementTargets.length;
    },
  });

  const getPanel = (): FeedbackPanel => {
    if (!panel) {
      panel = createFeedbackPanel({
        shadowRoot: portal.shadowRoot,
        getState() {
          const snap = session.getSnapshot();
          return {
            comment: snap.comment,
            category: snap.category,
            elementTargets: snap.elementTargets,
          };
        },
        onCommentChange(text) {
          session.setComment(text);
        },
        onCategoryChange(category) {
          session.setCategory(category);
        },
        onEnterTargeting() {
          session.enterTargeting();
          panel?.hide();
          targeting.enter();
        },
        onRemoveTarget(index) {
          session.removeElementTarget(index);
        },
        onEnterRecording() {
          session.enterRecording();
          panel?.hide();
          recorder.start();
          recordingIndicator.show();
        },
        onDiscardRecording() {
          session.discardRecording();
        },
        getInteractionCount() {
          return session.getSnapshot().interactions.length;
        },
        onClose() {
          session.closePanel();
          panel?.hide();
        },
        async onSubmit({ comment, category }) {
          session.setComment(comment);
          session.setCategory(category);
          const pkg = buildPackage(session.getSnapshot(), config);
          let response: Response;
          try {
            response = await fetch(config.endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pkg),
            });
          } catch {
            throw new Error('network');
          }
          if (!response.ok) {
            throw new Error('server');
          }
          // Clear draft only on successful submission (data.md: "When cleared: successful submission only")
          session.reset();
          panel?.hide();
          showActivatorSuccess(config.activator);
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
      recorder.destroy();
      recordingIndicator.destroy();
      targeting.destroy();
      panel?.destroy();
      destroyPortal(portal);
    },
  };
}

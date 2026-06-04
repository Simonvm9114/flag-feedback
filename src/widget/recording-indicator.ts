import { createModeIndicator } from '../components/ModeIndicator';

export type RecordingIndicatorOptions = {
  shadowRoot: ShadowRoot;
  onStop(): void;
};

export type RecordingIndicator = {
  show(): void;
  hide(): void;
  destroy(): void;
};

export function createRecordingIndicator(options: RecordingIndicatorOptions): RecordingIndicator {
  const { shadowRoot } = options;
  const { el: indicator } = createModeIndicator({
    className: 'ff-recording-indicator',
    ariaLabel: 'Recording in progress',
    label: 'Recording',
    pulse: true,
    buttonClassName: 'ff-recording-stop',
    buttonLabel: 'Stop',
    buttonAriaLabel: 'Stop recording',
    onAction: () => options.onStop(),
  });

  return {
    show() {
      if (!shadowRoot.contains(indicator)) {
        shadowRoot.appendChild(indicator);
      }
    },
    hide() {
      indicator.remove();
    },
    destroy() {
      indicator.remove();
    },
  };
}

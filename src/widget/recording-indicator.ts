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

  const indicator = document.createElement('div');
  indicator.className = 'ff-recording-indicator ff-root';
  indicator.setAttribute('role', 'status');
  indicator.setAttribute('aria-label', 'Recording in progress');

  const dot = document.createElement('span');
  dot.className = 'ff-pill-dot ff-pill-dot--pulse';
  dot.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.textContent = 'Recording';

  const stopBtn = document.createElement('button');
  stopBtn.type = 'button';
  stopBtn.className = 'ff-recording-stop';
  stopBtn.textContent = 'Stop';
  stopBtn.setAttribute('aria-label', 'Stop recording');

  stopBtn.addEventListener('click', () => {
    options.onStop();
  });

  indicator.append(dot, label, stopBtn);

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

import { getRecorder } from './recorder.js';
import { buildWidgetDOM } from './utils/widgetDOM.js';
import { bindWidgetEvents } from './utils/widgetEvents.js';
import { validateEndpoint } from './utils/endpointValidator.js';
import { executeSubmitFlow } from './utils/feedbackSubmitFlow.js';
import { applyPosition } from './utils/positionManager.js';
import {
  persistWidgetState,
  restoreWidgetState,
  applyRestoredState,
  hasUnsavedState,
} from './utils/widgetState.js';
import {
  renderScreenshots,
  showScreenshot,
  clearScreenshots,
  saveActiveScreenshotAnnotations,
  takeScreenshot,
} from './utils/screenshotController.js';
import { devError } from './utils/devLogger.js';
import { LAYOUT_MARGIN, LAYOUT_GAP, DEFAULT_BUTTON_COLOR, ICONS } from './constants.js';

const LOG_PREFIX = '[flag-feedback]';

/**
 * FlagFeedback web component for collecting structured user feedback.
 */
class FlagFeedback extends HTMLElement {
  static get observedAttributes() {
    return ['endpoint', 'app-id', 'git-commit', 'git-repo', 'position', 'button-color', 'button-label'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._recorder = getRecorder();
    this._annotator = null;
    this._screenshots = [];
    this._activeScreenshotIdx = -1;
    this._isOpen = false;
    this._isRecording = false;
  }

  connectedCallback() {
    const endpoint = this.getAttribute('endpoint');
    if (!validateEndpoint(endpoint)) {
      devError(LOG_PREFIX, 'Missing or invalid endpoint attribute (must be https or http for localhost). Widget will not render.');
      return;
    }
    this._build();
    this._restoreState();
  }

  disconnectedCallback() {
    if (hasUnsavedState(this)) {
      setTimeout(() => persistWidgetState(this), 0);
    }
    if (!this._isRecording) {
      this._recorder.reset();
    }
  }

  attributeChangedCallback(name) {
    if (!this._btn) return;
    if (name === 'position') this._applyPositions();
    if (name === 'button-color') this._applyColor();
    if (name === 'button-label') {
      this._btn.setAttribute('aria-label', this.getAttribute('button-label') || 'Give feedback');
    }
  }

  _build() {
    buildWidgetDOM(this);
    this._applyPositions();
    this._applyColor();
    bindWidgetEvents(this);
  }

  _openPanel() {
    this._isOpen = true;
    this._panel.classList.add('open');
    this._updateInteractionsCount();
    setTimeout(() => this._textarea?.focus(), 220);
  }

  _resetRecording() {
    this._recorder.reset();
    this._updateInteractionsCount();
  }

  _updateInteractionsCount() {
    const row = this._interactionsRow;
    const countEl = this._interactionsCount;
    if (!row || !countEl) return;
    const count = this._recorder.getInteractionCount();
    if (count > 0) {
      countEl.textContent = count === 1 ? '1 interaction recorded' : `${count} interactions recorded`;
      row.removeAttribute('hidden');
    } else {
      countEl.textContent = '';
      row.setAttribute('hidden', '');
    }
  }

  _closePanel() {
    this._isOpen = false;
    this._panel.classList.remove('open');
  }

  _startRecording() {
    this._isRecording = true;
    this._recorder.start();
    this._panel.classList.remove('open');
    this._btn.classList.add('recording-hidden');
    this._pill.classList.add('visible');
  }

  _stopRecording() {
    this._recorder.stop();
    this._isRecording = false;
    this._btn.classList.remove('recording-hidden');
    this._pill.classList.remove('visible');
    this._openPanel();
  }

  _saveActiveScreenshotAnnotations() {
    saveActiveScreenshotAnnotations(this);
  }

  _renderScreenshots() {
    renderScreenshots(this);
  }

  _showLastScreenshot() {
    if (this._screenshots.length > 0) showScreenshot(this, this._screenshots.length - 1);
  }

  async _takeScreenshot() {
    await takeScreenshot(this);
  }

  async _submit() {
    await executeSubmitFlow(this, {
      setSubmitting: (active) => this._setSubmitting(active),
      clearScreenshots: () => clearScreenshots(this),
      onSuccess: () => this._onSuccess(),
      showError: (msg) => this._showError(msg),
      hideError: () => this._hideError(),
      saveActiveScreenshotAnnotations: () => this._saveActiveScreenshotAnnotations(),
    });
  }

  _setSubmitting(active) {
    this._submitBtn.disabled = active;
    this._submitBtn.textContent = active ? 'Sending\u2026' : 'Submit';
    if (!active) this._hideError();
  }

  _onSuccess() {
    this._closePanel();
    this._recorder.reset();
    this._textarea.value = '';
    clearScreenshots(this);
    this._hideError();

    this._btn.classList.add('success');
    this._btn.innerHTML = ICONS.check;
    setTimeout(() => {
      this._btn.classList.remove('success');
      this._btn.innerHTML = ICONS.chat;
    }, 2000);
  }

  _showError(msg) {
    this._errorEl.textContent = msg;
    this._errorEl.classList.add('visible');
  }

  _hideError() {
    this._errorEl.textContent = '';
    this._errorEl.classList.remove('visible');
  }

  _applyPositions() {
    applyPosition(
      { btn: this._btn, panel: this._panel, pill: this._pill },
      this.getAttribute('position') || 'bottom-right',
      { margin: LAYOUT_MARGIN, gap: LAYOUT_GAP }
    );
  }

  _applyColor() {
    const color = this.getAttribute('button-color') || DEFAULT_BUTTON_COLOR;
    this.style.setProperty('--fw-color', color);
  }

  _restoreState() {
    const data = restoreWidgetState();
    if (!data) return;
    applyRestoredState(this, data);
  }

  _qs(selector) {
    return this._root.querySelector(selector);
  }
}

if (!customElements.get('flag-feedback')) {
  customElements.define('flag-feedback', FlagFeedback);
}

/** Sync persist on full page unload (MPA navigation). disconnectedCallback is unreliable then. */
function _persistOnUnload() {
  const widget = document.querySelector('flag-feedback');
  persistWidgetState(widget);
}
window.addEventListener('pagehide', _persistOnUnload);
window.addEventListener('beforeunload', _persistOnUnload);

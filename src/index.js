import { getRecorder } from './recorder.js';
import { buildWidgetDOM } from './utils/widgetDOM.js';
import { bindWidgetEvents } from './utils/widgetEvents.js';
import { captureScreenshot } from './screenshot.js';
import { validateEndpoint } from './utils/endpointValidator.js';
import { executeSubmitFlow } from './utils/feedbackSubmitFlow.js';
import { applyPosition } from './utils/positionManager.js';
import {
  persistWidgetState,
  restoreWidgetState,
  applyRestoredState,
  hasUnsavedState,
} from './utils/widgetState.js';
import { renderScreenshotList } from './utils/screenshotListView.js';
import { devWarn, devError } from './utils/devLogger.js';
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
    setTimeout(() => this._textarea?.focus(), 220);
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
    if (this._activeScreenshotIdx >= 0 && this._activeScreenshotIdx < this._screenshots.length) {
      this._screenshots[this._activeScreenshotIdx].shapes = this._annotator.getShapes();
    }
  }

  _renderScreenshots() {
    renderScreenshotList(this._screenshotsList, this._screenshots, this._activeScreenshotIdx, {
      onSelect: (i) => this._showScreenshot(i),
      onRemove: (i) => this._removeScreenshot(i),
    });
  }

  _showScreenshot(idx) {
    if (idx < 0 || idx >= this._screenshots.length) return;
    this._saveActiveScreenshotAnnotations();
    this._activeScreenshotIdx = idx;
    const s = this._screenshots[idx];
    this._annotator.load(s.dataUrl).then(() => {
      this._annotator.setShapes(s.shapes);
    }).catch((err) => {
      devWarn(LOG_PREFIX, 'Could not load screenshot for display:', err);
    });
    this._screenshotsList.querySelectorAll('.screenshot-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === idx);
    });
  }

  _showLastScreenshot() {
    if (this._screenshots.length > 0) {
      this._showScreenshot(this._screenshots.length - 1);
    }
  }

  _removeScreenshot(idx) {
    this._saveActiveScreenshotAnnotations();
    this._screenshots.splice(idx, 1);
    if (this._activeScreenshotIdx === idx) {
      this._activeScreenshotIdx = this._screenshots.length - 1;
      if (this._activeScreenshotIdx >= 0) {
        const s = this._screenshots[this._activeScreenshotIdx];
        this._annotator.load(s.dataUrl).then(() => {
          this._annotator.setShapes(s.shapes);
        }).catch((err) => {
          devWarn(LOG_PREFIX, 'Could not load screenshot after remove:', err);
        });
        this._annCanvas.removeAttribute('hidden');
        this._annToolbar.removeAttribute('hidden');
      } else {
        this._annCanvas.setAttribute('hidden', '');
        this._annToolbar.setAttribute('hidden', '');
      }
    } else if (this._activeScreenshotIdx > idx) {
      this._activeScreenshotIdx -= 1;
    }
    this._renderScreenshots();
    this._updateScreenshotBtnLabel();
    if (this._screenshots.length === 0) {
      this._annCanvas.setAttribute('hidden', '');
      this._annToolbar.setAttribute('hidden', '');
    }
  }

  _updateScreenshotBtnLabel() {
    const label = this._qs('.screenshot-btn-label');
    if (label) label.textContent = this._screenshots.length > 0 ? 'Add another screenshot' : 'Add screenshot';
  }

  async _takeScreenshot() {
    this._saveActiveScreenshotAnnotations();

    this._panel.classList.add('capture-hidden');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const dataUrl = await captureScreenshot();
      this._screenshots.push({ dataUrl, shapes: [] });

      await this._annotator.load(dataUrl);
      this._activeScreenshotIdx = this._screenshots.length - 1;

      this._renderScreenshots();
      this._annCanvas.removeAttribute('hidden');
      this._annToolbar.removeAttribute('hidden');
      this._updateScreenshotBtnLabel();
    } catch (err) {
      devWarn(LOG_PREFIX, 'Screenshot failed, continuing without it:', err);
    } finally {
      this._panel.classList.remove('capture-hidden');
    }
  }

  async _submit() {
    await executeSubmitFlow(this, {
      setSubmitting: (active) => this._setSubmitting(active),
      clearScreenshots: () => this._clearScreenshots(),
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

  _clearScreenshots() {
    this._screenshots = [];
    this._activeScreenshotIdx = -1;
    this._annCanvas.setAttribute('hidden', '');
    this._annToolbar.setAttribute('hidden', '');
    this._screenshotsList.setAttribute('hidden', '');
    this._screenshotsList.innerHTML = '';
    this._updateScreenshotBtnLabel();
    this._annToolbar.querySelectorAll('.tool-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    this._annotator.setTool('rect');
  }

  _onSuccess() {
    this._closePanel();
    this._recorder.reset();
    this._textarea.value = '';
    this._clearScreenshots();
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

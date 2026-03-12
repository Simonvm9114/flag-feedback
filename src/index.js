import { STYLES } from './styles.js';
import { getRecorder } from './recorder.js';
import { Annotator } from './annotator.js';
import { captureScreenshot } from './screenshot.js';
import { buildPackage } from './package.js';
import { loadImage } from './utils/imageLoader.js';
import { drawShapesOnContext } from './utils/shapeRenderer.js';
import { persist as persistState, restore as restoreState, isValidDataUrl } from './utils/statePersistence.js';
import { submit as submitFeedback } from './utils/feedbackSubmitter.js';
import { applyPosition } from './utils/positionManager.js';

const MARGIN = 16;
const GAP = 8;

/**
 * Validates that a URL is safe for fetch (https or http for localhost only).
 * @param {string} url - The endpoint URL to validate.
 * @returns {boolean} True if valid.
 */
function _validateEndpoint(url) {
  if (!url || typeof url !== 'string' || !url.trim()) return false;
  try {
    const u = new URL(url.trim());
    const protocol = u.protocol.toLowerCase();
    if (protocol === 'javascript:' || protocol === 'data:' || protocol === 'blob:' || protocol === 'file:') {
      return false;
    }
    if (protocol === 'https:') return true;
    if (protocol === 'http:') {
      const host = u.hostname.toLowerCase();
      return host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.');
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Persists the given widget's state to sessionStorage.
 * Used by disconnectedCallback (deferred) and pagehide/beforeunload (sync).
 */
function _persistWidgetState(widget) {
  if (!widget || !widget._hasUnsavedState?.()) return;
  widget._saveActiveScreenshotAnnotations?.();
  const state = {
    text: widget._textarea?.value ?? '',
    screenshots: (widget._screenshots ?? []).map((s) => ({ dataUrl: s.dataUrl, shapes: s.shapes ?? [] })),
    isRecording: widget._isRecording ?? false,
    recorderEvents: widget._isRecording ? widget._recorder?.events ?? [] : [],
    recorderStartTime: widget._isRecording ? widget._recorder?.startTime ?? null : null,
  };
  persistState(state);
}

const ICON_CHAT = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_CAMERA = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
const ICON_PLAY = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
class FlagFeedback extends HTMLElement {
  static get observedAttributes() {
    return ['endpoint', 'app-id', 'git-commit', 'git-repo', 'position', 'button-color', 'button-label'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._recorder = getRecorder();
    this._annotator = null;
    this._screenshots = []; // [{ dataUrl, shapes }] per screenshot
    this._activeScreenshotIdx = -1;
    this._isOpen = false;
    this._isRecording = false;
  }

  // ── Lifecycle ─────────────────────────────────────────

  connectedCallback() {
    const endpoint = this.getAttribute('endpoint');
    if (!_validateEndpoint(endpoint)) {
      console.error('[flag-feedback] Missing or invalid endpoint attribute (must be https or http for localhost). Widget will not render.');
      return;
    }
    this._build();
    this._restoreState();
  }

  disconnectedCallback() {
    if (this._hasUnsavedState()) {
      setTimeout(() => _persistWidgetState(this), 0);
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

  // ── Build shadow DOM ──────────────────────────────────

  _build() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    this._root.appendChild(style);

    // Floating button
    this._btn = document.createElement('button');
    this._btn.className = 'fb-btn';
    this._btn.innerHTML = ICON_CHAT;
    this._btn.setAttribute('aria-label', this.getAttribute('button-label') || 'Give feedback');
    this._root.appendChild(this._btn);

    // Recording pill
    this._pill = document.createElement('button');
    this._pill.className = 'fb-pill';
    this._pill.innerHTML = `<span class="rec-dot"></span><span>Recording\u2026 tap to finish</span>`;
    this._pill.setAttribute('aria-label', 'Stop recording');
    this._root.appendChild(this._pill);

    // Panel
    this._panel = document.createElement('div');
    this._panel.className = 'fb-panel';
    this._panel.setAttribute('role', 'dialog');
    this._panel.setAttribute('aria-modal', 'false');
    this._panel.setAttribute('aria-label', 'Feedback');
    this._panel.innerHTML = this._panelTemplate();
    this._root.appendChild(this._panel);

    // Cache interactive elements
    this._textarea       = this._qs('.fb-textarea');
    this._recordPlayBtn  = this._qs('.record-play-btn');
    this._screenshotBtn  = this._qs('.screenshot-btn');
    this._screenshotsList = this._qs('.screenshots-list');
    this._annToolbar     = this._qs('.ann-toolbar');
    this._annCanvas      = this._qs('.screenshot-canvas');
    this._submitBtn      = this._qs('.submit-btn');
    this._errorEl        = this._qs('.fb-error');
    this._closeBtn       = this._qs('.panel-close');

    // Annotator — canvas element passed in; no-op until load() is called
    this._annotator = new Annotator(this._annCanvas);

    this._applyPositions();
    this._applyColor();
    this._bindEvents();
  }

  _panelTemplate() {
    return `
      <div class="panel-header">
        <p class="panel-title">Feedback</p>
        <button class="panel-close" type="button" aria-label="Close feedback panel">\u2715</button>
      </div>
      <div class="panel-body">
        <textarea
          class="fb-textarea"
          rows="4"
          placeholder="What happened? (Use Wispr Flow to dictate)"
          aria-label="Describe the issue or feedback"
        ></textarea>

        <button class="record-play-btn" type="button" aria-label="Start recording my interactions">
          <span class="record-play-icon">${ICON_PLAY}</span>
          <span class="record-play-info">
            <strong>Start recording</strong>
            <small>Captures clicks &amp; navigation from this point</small>
          </span>
        </button>

        <button class="screenshot-btn" type="button">
          ${ICON_CAMERA}
          <span class="screenshot-btn-label">Add screenshot</span>
        </button>

        <div class="screenshots-list" hidden></div>

        <div class="ann-toolbar" hidden>
          <span class="ann-hint">Draw to highlight the problem area</span>
          <div class="ann-tools">
            <button type="button" class="tool-btn active" data-tool="rect">&#9645; Rect</button>
            <button type="button" class="tool-btn" data-tool="circle">&#9711; Circle</button>
            <button type="button" class="clear-ann-btn">Clear</button>
          </div>
        </div>

        <canvas class="screenshot-canvas" hidden></canvas>

        <button class="submit-btn" type="button">Submit</button>

        <p class="fb-error" role="alert"></p>
      </div>
    `;
  }

  // ── Event binding ─────────────────────────────────────

  _bindEvents() {
    this._btn.addEventListener('click', () => {
      if (this._isRecording) return;
      this._isOpen ? this._closePanel() : this._openPanel();
    });

    this._pill.addEventListener('click', () => this._stopRecording());

    this._closeBtn.addEventListener('click', () => this._closePanel());

    this._recordPlayBtn.addEventListener('click', () => this._startRecording());

    this._screenshotBtn.addEventListener('click', () => this._takeScreenshot());

    // Annotation tool buttons
    this._annToolbar.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._annToolbar.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._annotator.setTool(btn.dataset.tool);
      });
    });

    this._qs('.clear-ann-btn').addEventListener('click', () => this._annotator.clear());

    this._submitBtn.addEventListener('click', () => this._submit());
  }

  // ── Panel state ───────────────────────────────────────

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

  async _renderScreenshotToDataUrl({ dataUrl, shapes }) {
    const img = await loadImage(dataUrl);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    drawShapesOnContext(ctx, shapes || [], c.width);
    return c.toDataURL('image/png');
  }

  _renderScreenshots() {
    if (this._screenshots.length === 0) {
      this._screenshotsList.setAttribute('hidden', '');
      this._screenshotsList.innerHTML = '';
      return;
    }
    this._screenshotsList.removeAttribute('hidden');
    this._screenshotsList.innerHTML = '';

    this._screenshots.forEach((s, i) => {
      if (!isValidDataUrl(s.dataUrl)) return;
      const thumb = document.createElement('div');
      thumb.className = `screenshot-thumb${i === this._activeScreenshotIdx ? ' active' : ''}`;
      thumb.dataset.idx = String(i);
      thumb.title = `Screenshot ${i + 1}`;

      const img = document.createElement('img');
      img.src = s.dataUrl;
      img.alt = `Screenshot ${i + 1}`;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'screenshot-remove';
      removeBtn.setAttribute('aria-label', 'Remove screenshot');
      removeBtn.textContent = '\u2715';

      thumb.appendChild(img);
      thumb.appendChild(removeBtn);
      this._screenshotsList.appendChild(thumb);

      img.addEventListener('click', () => this._showScreenshot(i));
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._removeScreenshot(i);
      });
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
      console.warn('[flag-feedback] Could not load screenshot for display:', err);
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
          console.warn('[flag-feedback] Could not load screenshot after remove:', err);
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

  // ── Screenshot + annotation ───────────────────────────

  async _takeScreenshot() {
    this._saveActiveScreenshotAnnotations();

    this._panel.classList.add('capture-hidden');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const dataUrl = await captureScreenshot();
      this._screenshots.push({ dataUrl, shapes: [] });

      // Load into annotator and show
      await this._annotator.load(dataUrl);
      this._activeScreenshotIdx = this._screenshots.length - 1;

      this._renderScreenshots();
      this._annCanvas.removeAttribute('hidden');
      this._annToolbar.removeAttribute('hidden');
      this._updateScreenshotBtnLabel();
    } catch (err) {
      console.warn('[flag-feedback] Screenshot failed, continuing without it:', err);
    } finally {
      this._panel.classList.remove('capture-hidden');
    }
  }

  // ── Submit ────────────────────────────────────────────

  async _submit() {
    const endpoint = this.getAttribute('endpoint');
    if (!_validateEndpoint(endpoint)) return;

    this._setSubmitting(true);

    this._saveActiveScreenshotAnnotations();
    const screenshotsToSubmit = this._screenshots.slice(0, 5);
    if (this._screenshots.length > 5) {
      console.warn('[flag-feedback] Only the first 5 screenshots will be submitted.');
    }
    const screenshotPromises = screenshotsToSubmit.map((s) => {
      const realIdx = this._screenshots.indexOf(s);
      if (realIdx === this._activeScreenshotIdx) {
        return Promise.resolve(this._annotator.export());
      }
      return this._renderScreenshotToDataUrl(s);
    });
    const screenshots = await Promise.all(screenshotPromises);
    this._clearScreenshots();

    const pkg = buildPackage({
      appId:          this.getAttribute('app-id')    || null,
      gitCommit:      this.getAttribute('git-commit') || null,
      gitRepo:        this.getAttribute('git-repo')   || null,
      text:           this._textarea.value,
      screenshots,
      interactions:   this._recorder.events,
      recordingStart: this._recorder.startTime,
    });

    try {
      await submitFeedback(endpoint, pkg);
      this._onSuccess();
    } catch (err) {
      this._showError(err.message);
    } finally {
      this._setSubmitting(false);
    }
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

    // Brief success indicator on floating button
    this._btn.classList.add('success');
    this._btn.innerHTML = ICON_CHECK;
    setTimeout(() => {
      this._btn.classList.remove('success');
      this._btn.innerHTML = ICON_CHAT;
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

  // ── Positioning & colour ──────────────────────────────

  _applyPositions() {
    applyPosition(
      { btn: this._btn, panel: this._panel, pill: this._pill },
      this.getAttribute('position') || 'bottom-right',
      { margin: MARGIN, gap: GAP }
    );
  }

  _applyColor() {
    const color = this.getAttribute('button-color') || '#6366F1';
    this.style.setProperty('--fw-color', color);
  }

  // ── State persistence (SPA navigation) ─────────────────

  _hasUnsavedState() {
    return (
      this._isRecording ||
      (this._textarea && this._textarea.value.trim()) ||
      this._screenshots.length > 0
    );
  }

  _persistState() {
    _persistWidgetState(this);
  }

  _restoreState() {
    const data = restoreState();
    if (!data) return;

    if (data.text && this._textarea) this._textarea.value = data.text;
    if (data.screenshots.length > 0) {
      this._screenshots = data.screenshots;
      this._renderScreenshots();
      this._showLastScreenshot();
    }
    if (data.isRecording) {
      const hadRecorderData = data.recorderEvents.length > 0 && data.recorderStartTime != null;
      const resumed = hadRecorderData
        ? this._recorder.hydrate(data.recorderEvents, data.recorderStartTime)
        : this._recorder.isActive;
      if (resumed) {
        this._isRecording = true;
        this._btn?.classList.add('recording-hidden');
        this._pill?.classList.add('visible');
      }
    }
  }

  // ── Utility ───────────────────────────────────────────

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
  _persistWidgetState(widget);
}
window.addEventListener('pagehide', _persistOnUnload);
window.addEventListener('beforeunload', _persistOnUnload);

import { STYLES } from './styles.js';
import { Recorder } from './recorder.js';
import { Annotator } from './annotator.js';
import { captureScreenshot } from './screenshot.js';
import { buildPackage } from './package.js';

const VALID_POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const MARGIN = 16;
const GAP = 8;

const ICON_CHAT = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_CAMERA = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

class FlagFeedback extends HTMLElement {
  static get observedAttributes() {
    return ['endpoint', 'app-id', 'git-commit', 'git-repo', 'position', 'button-color', 'button-label'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._recorder = new Recorder();
    this._annotator = null;
    this._screenshot = null; // raw data URL, set after capture
    this._isOpen = false;
    this._isRecording = false;
  }

  // ── Lifecycle ─────────────────────────────────────────

  connectedCallback() {
    if (!this.getAttribute('endpoint')) {
      console.error('[flag-feedback] Missing required attribute: endpoint. Widget will not render.');
      return;
    }
    this._build();
  }

  disconnectedCallback() {
    this._recorder.reset();
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
    this._textarea      = this._qs('.fb-textarea');
    this._recordToggle  = this._qs('.record-toggle');
    this._screenshotBtn = this._qs('.screenshot-btn');
    this._annToolbar    = this._qs('.ann-toolbar');
    this._annCanvas     = this._qs('.screenshot-canvas');
    this._submitBtn     = this._qs('.submit-btn');
    this._errorEl       = this._qs('.fb-error');
    this._closeBtn      = this._qs('.panel-close');

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

        <label class="toggle-row">
          <span class="switch">
            <input type="checkbox" class="record-toggle" aria-label="Record my interactions">
            <span class="track"></span>
          </span>
          <span class="toggle-info">
            <strong>Record my interactions</strong>
            <small>Captures clicks &amp; navigation from this point</small>
          </span>
        </label>

        <button class="screenshot-btn" type="button">
          ${ICON_CAMERA}
          <span class="screenshot-btn-label">Take screenshot</span>
        </button>

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

    this._recordToggle.addEventListener('change', () => {
      this._recordToggle.checked ? this._startRecording() : this._stopRecording();
    });

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
    this._pill.classList.add('visible');
  }

  _stopRecording() {
    this._recorder.stop();
    this._isRecording = false;
    this._pill.classList.remove('visible');
    if (this._recordToggle) this._recordToggle.checked = false;
    this._openPanel();
  }

  // ── Screenshot + annotation ───────────────────────────

  async _takeScreenshot() {
    this._panel.classList.add('capture-hidden');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const dataUrl = await captureScreenshot();
      this._screenshot = dataUrl;

      // Load into annotator (sizes canvas, draws image)
      await this._annotator.load(dataUrl);

      // Show canvas and toolbar, update button label
      this._annCanvas.removeAttribute('hidden');
      this._annToolbar.removeAttribute('hidden');
      this._qs('.screenshot-btn-label').textContent = 'Retake screenshot';
    } catch (err) {
      console.warn('[flag-feedback] Screenshot failed, continuing without it:', err);
      this._screenshot = null;
    } finally {
      this._panel.classList.remove('capture-hidden');
    }
  }

  // ── Submit ────────────────────────────────────────────

  async _submit() {
    const endpoint = this.getAttribute('endpoint');
    if (!endpoint) return;

    this._setSubmitting(true);

    // If a screenshot was taken, export the (possibly annotated) canvas, then clear it immediately
    const screenshot = this._screenshot ? this._annotator.export() : null;
    this._clearScreenshot();

    const pkg = buildPackage({
      appId:          this.getAttribute('app-id')    || null,
      gitCommit:      this.getAttribute('git-commit') || null,
      gitRepo:        this.getAttribute('git-repo')   || null,
      text:           this._textarea.value,
      screenshot,
      interactions:   this._recorder.events,
      recordingStart: this._recorder.startTime,
    });

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pkg),
      });

      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      this._onSuccess();
    } catch (err) {
      this._showError(`Submission failed: ${err.message}. Please try again.`);
    } finally {
      this._setSubmitting(false);
    }
  }

  _setSubmitting(active) {
    this._submitBtn.disabled = active;
    this._submitBtn.textContent = active ? 'Sending\u2026' : 'Submit';
    if (!active) this._hideError();
  }

  _clearScreenshot() {
    this._screenshot = null;
    this._annCanvas.setAttribute('hidden', '');
    this._annToolbar.setAttribute('hidden', '');
    this._qs('.screenshot-btn-label').textContent = 'Take screenshot';
    this._annToolbar.querySelectorAll('.tool-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    this._annotator.setTool('rect');
  }

  _onSuccess() {
    this._closePanel();
    this._recorder.reset();
    this._textarea.value = '';
    this._clearScreenshot();
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
    const pos = VALID_POSITIONS.includes(this.getAttribute('position'))
      ? this.getAttribute('position')
      : 'bottom-right';

    const [v, h] = pos.split('-');
    const oppV = v === 'top' ? 'bottom' : 'top';
    const oppH = h === 'left' ? 'right' : 'left';

    const btnSize = window.innerWidth <= 500 ? 56 : 48;
    const m = `${MARGIN}px`;
    const panelOffset = `${btnSize + MARGIN + GAP}px`;

    Object.assign(this._btn.style,   { [v]: m,           [oppV]: '', [h]: m, [oppH]: '' });
    Object.assign(this._panel.style, { [v]: panelOffset, [oppV]: '', [h]: m, [oppH]: '',
      transformOrigin: `${v} ${h}` });
    Object.assign(this._pill.style,  { [v]: m,           [oppV]: '', [h]: m, [oppH]: '' });
  }

  _applyColor() {
    const color = this.getAttribute('button-color') || '#6366F1';
    this.style.setProperty('--fw-color', color);
  }

  // ── Utility ───────────────────────────────────────────

  _qs(selector) {
    return this._root.querySelector(selector);
  }
}

if (!customElements.get('flag-feedback')) {
  customElements.define('flag-feedback', FlagFeedback);
}

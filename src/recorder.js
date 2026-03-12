/**
 * Recorder — captures interaction events from the document.
 * Uses a singleton so recording persists across widget unmounts (e.g. SPA navigation).
 *
 * Event schema (all events):
 *   { t: <unix ms>, type: <string>, path: <css path | undefined>, count: <n> }
 *
 * Privacy guarantees:
 *  - Input values are never captured
 *  - password fields are always skipped
 *  - Elements (or their ancestors) with data-flag-feedback-ignore are skipped
 *
 * Deduplication:
 *  - Consecutive events of the same type + path are folded into one entry
 *    with an incrementing `count` field.
 */
let _recorderInstance = null;

/** Returns the shared Recorder instance used across widget lifecycle and navigation. */
export function getRecorder() {
  if (!_recorderInstance) _recorderInstance = new Recorder();
  return _recorderInstance;
}

export class Recorder {
  constructor() {
    this._events = [];
    this._docHandlers = new Map();
    this._winHandlers = new Map();
    this._active = false;
    this._startTime = null;
  }

  /** Starts a fresh recording. Clears any existing events. */
  start() {
    if (this._active) return;
    this._active = true;
    this._events = [];
    this._startTime = Date.now();
    this._attachListeners();
  }

  /**
   * Restores events and startTime from a previous page, then starts capturing.
   * Used when the user navigated during recording (full page load).
   */
  hydrate(events, startTime) {
    if (!Array.isArray(events)) return false;
    if (this._active) return false;
    this._active = true;
    this._events = events.slice();
    this._startTime = startTime ?? (events[0]?.t ?? null) ?? Date.now();
    this._attachListeners();
    return true;
  }

  /** Attaches document and window listeners for event capture. */
  _attachListeners() {
    this._doc('click', (e) => {
      if (this._ignore(e.target)) return;
      this._push({ t: Date.now(), type: 'click', path: this._path(e.target) });
    });

    this._doc('input', (e) => {
      if (this._ignore(e.target)) return;
      this._push({ t: Date.now(), type: 'input', path: this._path(e.target) });
    });

    this._doc('change', (e) => {
      if (this._ignore(e.target)) return;
      this._push({ t: Date.now(), type: 'change', path: this._path(e.target) });
    });

    this._doc('submit', (e) => {
      this._push({ t: Date.now(), type: 'submit', path: this._path(e.target) });
    });

    this._doc('scroll', (e) => {
      const el =
        e.target === document || e.target === document.documentElement
          ? document.documentElement
          : e.target;
      const scrollable = el.scrollHeight - el.clientHeight;
      const pct = scrollable > 0 ? Math.round((el.scrollTop / scrollable) * 100) : 0;
      this._push({ t: Date.now(), type: 'scroll', positionPct: pct });
    });

    this._win('popstate', () => {
      this._push({ t: Date.now(), type: 'popstate', path: location.href });
    });

    this._win('hashchange', () => {
      this._push({ t: Date.now(), type: 'hashchange', path: location.href });
    });

    this._win('unhandledrejection', (e) => {
      this._push({
        t: Date.now(),
        type: 'unhandledrejection',
        message: String(e.reason?.message ?? e.reason ?? '').slice(0, 200),
      });
    });

    this._win('error', (e) => {
      this._push({
        t: Date.now(),
        type: 'error',
        message: String(e.message ?? '').slice(0, 200),
      });
    });
  }

  stop() {
    if (!this._active) return;
    this._active = false;
    for (const [type, fn] of this._docHandlers) {
      document.removeEventListener(type, fn, true);
    }
    for (const [type, fn] of this._winHandlers) {
      window.removeEventListener(type, fn);
    }
    this._docHandlers.clear();
    this._winHandlers.clear();
  }

  reset() {
    this.stop();
    this._events = [];
    this._startTime = null;
  }

  get events() { return this._events.slice(); }
  get startTime() { return this._startTime; }
  get isActive() { return this._active; }

  // ── Private ────────────────────────────────────────────

  _doc(type, fn) {
    const h = (e) => { try { fn(e); } catch { /* skip */ } };
    document.addEventListener(type, h, true);
    this._docHandlers.set(type, h);
  }

  _win(type, fn) {
    const h = (e) => { try { fn(e); } catch { /* skip */ } };
    window.addEventListener(type, h);
    this._winHandlers.set(type, h);
  }

  /** Fold consecutive duplicate events; increment count instead of appending. */
  _push(event) {
    const last = this._events[this._events.length - 1];
    const key = (e) => `${e.type}::${e.path ?? ''}`;
    if (last && key(last) === key(event)) {
      last.count += 1;
      last.t = event.t; // advance timestamp to the most recent occurrence
    } else {
      this._events.push({ ...event, count: 1 });
    }
  }

  _ignore(el) {
    if (!el) return false;
    if (el.type === 'password') return true;
    let node = el;
    while (node) {
      if (typeof node.getAttribute === 'function' && node.getAttribute('data-flag-feedback-ignore') !== null) {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  }

  _path(el) {
    if (!el || !el.tagName) return '';
    const parts = [];
    let node = el;
    while (node && node.tagName && parts.length < 5) {
      let sel = node.tagName.toLowerCase();
      if (node.id) {
        sel += `#${node.id}`;
      } else if (typeof node.className === 'string' && node.className.trim()) {
        sel += `.${node.className.trim().split(/\s+/).slice(0, 2).join('.')}`;
      }
      parts.unshift(sel);
      node = node.parentElement;
    }
    return parts.join(' > ');
  }
}

/**
 * Annotator — loads a screenshot into a <canvas> and lets the user draw
 * rectangle or circle annotations on top of it.
 *
 * Usage:
 *   const ann = new Annotator(canvasEl);
 *   await ann.load(dataUrl);      // draws screenshot onto canvas
 *   ann.setTool('rect');          // 'rect' | 'circle'
 *   ann.clear();                  // remove all annotations
 *   const png = ann.export();     // returns annotated data URL
 */
export class Annotator {
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._img = null;
    this._shapes = [];
    this._tool = 'rect';
    this._drawing = false;
    this._start = null;
    this._live = null; // in-progress endpoint while dragging

    // Mouse
    canvas.addEventListener('mousedown', (e) => this._down(e));
    canvas.addEventListener('mousemove', (e) => this._move(e));
    canvas.addEventListener('mouseup',   (e) => this._up(e));
    canvas.addEventListener('mouseleave',(e) => this._cancel());

    // Touch (passive: false so we can preventDefault and block scroll)
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this._down(e.touches[0]); },      { passive: false });
    canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); this._move(e.touches[0]); },      { passive: false });
    canvas.addEventListener('touchend',   (e) => { e.preventDefault(); this._up(e.changedTouches[0]); }, { passive: false });
  }

  /**
   * Load a screenshot data URL into the canvas.
   * Sets canvas intrinsic size to match the image so exports are full-res.
   */
  load(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this._img = img;
        this._shapes = [];
        this._canvas.width  = img.naturalWidth;
        this._canvas.height = img.naturalHeight;
        this._redraw();
        resolve();
      };
      img.src = dataUrl;
    });
  }

  setTool(tool) { this._tool = tool; }

  clear() {
    this._shapes = [];
    this._redraw();
  }

  /** Returns a data URL of the canvas with annotations burned in. */
  export() {
    return this._canvas.toDataURL('image/png');
  }

  get hasAnnotations() { return this._shapes.length > 0; }

  /** Returns a copy of shapes for persistence. */
  getShapes() {
    return this._shapes.map((s) => ({ ...s, start: { ...s.start }, end: { ...s.end } }));
  }

  /** Restores shapes from persistence and redraws. */
  setShapes(shapes) {
    this._shapes = Array.isArray(shapes) ? shapes.map((s) => ({ ...s, start: { ...s.start }, end: { ...s.end } })) : [];
    this._redraw(false);
  }

  // ── Pointer handlers ───────────────────────────────────

  _down(e) {
    this._drawing = true;
    this._start = this._pt(e);
    this._live  = this._start;
  }

  _move(e) {
    if (!this._drawing) return;
    this._live = this._pt(e);
    this._redraw(true);
  }

  _up(e) {
    if (!this._drawing) return;
    this._drawing = false;
    const end = this._pt(e);
    const dx = Math.abs(end.x - this._start.x);
    const dy = Math.abs(end.y - this._start.y);
    // Ignore accidental taps with no meaningful drag
    if (dx > 4 || dy > 4) {
      this._shapes.push({ tool: this._tool, start: this._start, end });
    }
    this._live = null;
    this._redraw(false);
  }

  _cancel() {
    this._drawing = false;
    this._live = null;
    this._redraw(false);
  }

  // ── Rendering ──────────────────────────────────────────

  _redraw(withLive = false) {
    const ctx = this._ctx;
    const { width, height } = this._canvas;

    ctx.clearRect(0, 0, width, height);
    if (this._img) ctx.drawImage(this._img, 0, 0);

    // Line style — scale thickness relative to image width so it looks right
    // at any capture resolution
    const lw = Math.max(2, width / 400);
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth   = lw;
    ctx.lineJoin    = 'round';

    for (const s of this._shapes) {
      ctx.setLineDash([]);
      this._drawShape(s.tool, s.start, s.end);
    }

    if (withLive && this._start && this._live) {
      ctx.setLineDash([Math.round(lw * 4), Math.round(lw * 2)]);
      this._drawShape(this._tool, this._start, this._live);
    }

    ctx.restore();
  }

  _drawShape(tool, start, end) {
    const ctx = this._ctx;
    if (tool === 'rect') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const rx = Math.max(1, Math.abs(end.x - start.x) / 2);
      const ry = Math.max(1, Math.abs(end.y - start.y) / 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // ── Coordinate helper ──────────────────────────────────

  /** Convert a pointer/touch event client position to canvas pixel coords. */
  _pt(e) {
    const rect = this._canvas.getBoundingClientRect();
    const sx   = this._canvas.width  / rect.width;
    const sy   = this._canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top)  * sy,
    };
  }
}

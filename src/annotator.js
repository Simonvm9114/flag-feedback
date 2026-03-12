import { loadImage } from './utils/imageLoader.js';
import { drawShapesOnContext, strokeLineWidth } from './utils/shapeRenderer.js';

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
    canvas.addEventListener('mouseleave', () => this._cancel());

    // Touch (passive: false so we can preventDefault and block scroll)
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this._down(e.touches[0]); },      { passive: false });
    canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); this._move(e.touches[0]); },      { passive: false });
    canvas.addEventListener('touchend',   (e) => { e.preventDefault(); this._up(e.changedTouches[0]); }, { passive: false });
  }

  /**
   * Load a screenshot data URL into the canvas.
   * Sets canvas intrinsic size to match the image so exports are full-res.
   * @param {string} dataUrl - Data URL (e.g. data:image/png;base64,...).
   * @returns {Promise<void>}
   */
  load(dataUrl) {
    return loadImage(dataUrl).then((img) => {
      this._img = img;
      this._shapes = [];
      this._canvas.width  = img.naturalWidth;
      this._canvas.height = img.naturalHeight;
      this._redraw();
    });
  }

  setTool(tool) { this._tool = tool; }

  clear() {
    this._shapes = [];
    this._redraw();
  }

  /**
   * Returns a data URL of the canvas with annotations burned in.
   * @returns {string}
   */
  export() {
    return this._canvas.toDataURL('image/png');
  }

  get hasAnnotations() { return this._shapes.length > 0; }

  /** Returns a copy of shapes for persistence. */
  getShapes() {
    return this._shapes.map((s) => ({ ...s, start: { ...s.start }, end: { ...s.end } }));
  }

  /**
   * Restores shapes from persistence and redraws.
   * @param {Array<{ tool: string, start: { x: number, y: number }, end: { x: number, y: number } }>} shapes
   */
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

    const lw = strokeLineWidth(width);
    drawShapesOnContext(ctx, this._shapes, width);

    if (withLive && this._start && this._live) {
      const liveShape = { tool: this._tool, start: this._start, end: this._live };
      drawShapesOnContext(ctx, [liveShape], width, {
        lineDash: [Math.round(lw * 4), Math.round(lw * 2)],
      });
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

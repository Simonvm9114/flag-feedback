/**
 * Shared shape rendering for canvas annotation (rect, circle).
 * Used by Annotator and _renderScreenshotToDataUrl.
 */

const STROKE_COLOR = '#ef4444';

/**
 * Computes stroke line width from image width for consistent appearance at any resolution.
 * @param {number} width - Image/canvas width in pixels.
 * @returns {number}
 */
export function strokeLineWidth(width) {
  return Math.max(2, width / 400);
}

/**
 * Draws annotation shapes (rect or circle) onto a 2D canvas context.
 * @param {CanvasRenderingContext2D} ctx - The 2D context to draw on.
 * @param {Array<{ tool: string, start: { x: number, y: number }, end: { x: number, y: number } }>} shapes - Shapes to draw.
 * @param {number} width - Image width (used for line thickness).
 * @param {{ lineDash?: number[] }} [options] - Optional line dash for live preview.
 */
export function drawShapesOnContext(ctx, shapes, width, options = {}) {
  if (!shapes || shapes.length === 0) return;
  const lw = strokeLineWidth(width);
  ctx.save();
  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineWidth = lw;
  ctx.lineJoin = 'round';
  if (Array.isArray(options.lineDash)) ctx.setLineDash(options.lineDash);

  for (const s of shapes) {
    if (!s || !s.start || !s.end) continue;
    if (s.tool === 'rect') {
      ctx.strokeRect(s.start.x, s.start.y, s.end.x - s.start.x, s.end.y - s.start.y);
    } else {
      const cx = (s.start.x + s.end.x) / 2;
      const cy = (s.start.y + s.end.y) / 2;
      const rx = Math.max(1, Math.abs(s.end.x - s.start.x) / 2);
      const ry = Math.max(1, Math.abs(s.end.y - s.start.y) / 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

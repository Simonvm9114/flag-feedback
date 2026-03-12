/**
 * Renders a screenshot (data URL + shapes) to a new data URL with annotations burned in.
 */

import { loadImage } from './imageLoader.js';
import { drawShapesOnContext } from './shapeRenderer.js';

/**
 * Renders a screenshot with shapes onto a canvas and returns the result as a data URL.
 * @param {Object} screenshot - Object with dataUrl and shapes.
 * @param {string} screenshot.dataUrl - Source image data URL.
 * @param {Array} [screenshot.shapes] - Annotation shapes to draw.
 * @returns {Promise<string>} Data URL of the rendered image.
 */
export async function renderScreenshotToDataUrl({ dataUrl, shapes }) {
  const img = await loadImage(dataUrl);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  drawShapesOnContext(ctx, shapes || [], c.width);
  return c.toDataURL('image/png');
}

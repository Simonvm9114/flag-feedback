/**
 * Loads an image from a data URL. Rejects on load failure.
 * @param {string} dataUrl - Data URL (e.g. data:image/png;base64,...).
 * @returns {Promise<HTMLImageElement>} The loaded image element.
 */
export function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

import html2canvas from 'html2canvas';

/**
 * Captures the current viewport as a base64-encoded PNG.
 * The caller is responsible for hiding any UI (e.g. the feedback panel)
 * before calling this function so it does not appear in the capture.
 *
 * @returns {Promise<string>} data URL (data:image/png;base64,…)
 */
export async function captureScreenshot() {
  const canvas = await html2canvas(document.documentElement, {
    useCORS: true,
    allowTaint: true,
    scale: Math.min(window.devicePixelRatio || 1, 2),
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    scrollX: 0,
    scrollY: 0,
  });
  return canvas.toDataURL('image/png');
}

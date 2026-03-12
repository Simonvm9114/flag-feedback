/**
 * Screenshot management for the feedback widget. Handles display, selection, removal, and capture.
 */

import { renderScreenshotList } from './screenshotListView.js';
import { captureScreenshot } from '../screenshot.js';
import { devWarn } from './devLogger.js';

const LOG_PREFIX = '[flag-feedback]';

/**
 * Renders screenshot thumbnails into the widget's list with select/remove handlers.
 * @param {Object} widget - Widget with _screenshotsList, _screenshots, _activeScreenshotIdx.
 */
export function renderScreenshots(widget) {
  renderScreenshotList(widget._screenshotsList, widget._screenshots, widget._activeScreenshotIdx, {
    onSelect: (i) => showScreenshot(widget, i),
    onRemove: (i) => removeScreenshot(widget, i),
  });
}

/**
 * Shows a screenshot in the annotator canvas and updates thumb active state.
 * @param {Object} widget - Widget with screenshots, annotator, screenshotsList.
 * @param {number} idx - Screenshot index to show.
 */
export function showScreenshot(widget, idx) {
  if (idx < 0 || idx >= widget._screenshots.length) return;
  saveActiveScreenshotAnnotations(widget);
  widget._activeScreenshotIdx = idx;
  const s = widget._screenshots[idx];
  widget._annotator.load(s.dataUrl).then(() => {
    widget._annotator.setShapes(s.shapes);
  }).catch((err) => {
    devWarn(LOG_PREFIX, 'Could not load screenshot for display:', err);
  });
  widget._screenshotsList.querySelectorAll('.screenshot-thumb').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === idx);
  });
}

/**
 * Removes a screenshot and updates the annotator/UI state.
 * @param {Object} widget - Widget with screenshots, annotator, annCanvas, annToolbar, screenshotsList.
 * @param {number} idx - Screenshot index to remove.
 */
export function removeScreenshot(widget, idx) {
  saveActiveScreenshotAnnotations(widget);
  widget._screenshots.splice(idx, 1);
  if (widget._activeScreenshotIdx === idx) {
    widget._activeScreenshotIdx = widget._screenshots.length - 1;
    if (widget._activeScreenshotIdx >= 0) {
      const s = widget._screenshots[widget._activeScreenshotIdx];
      widget._annotator.load(s.dataUrl).then(() => {
        widget._annotator.setShapes(s.shapes);
      }).catch((err) => {
        devWarn(LOG_PREFIX, 'Could not load screenshot after remove:', err);
      });
      widget._annCanvas.removeAttribute('hidden');
      widget._annToolbar.removeAttribute('hidden');
    } else {
      widget._annCanvas.setAttribute('hidden', '');
      widget._annToolbar.setAttribute('hidden', '');
    }
  } else if (widget._activeScreenshotIdx > idx) {
    widget._activeScreenshotIdx -= 1;
  }
  renderScreenshots(widget);
  updateScreenshotBtnLabel(widget);
  if (widget._screenshots.length === 0) {
    widget._annCanvas.setAttribute('hidden', '');
    widget._annToolbar.setAttribute('hidden', '');
  }
}

/**
 * Updates the screenshot button label based on count.
 * @param {Object} widget - Widget with _screenshots and _root (for querySelector).
 */
export function updateScreenshotBtnLabel(widget) {
  const label = widget._root.querySelector('.screenshot-btn-label');
  if (label) {
    label.textContent = widget._screenshots.length > 0 ? 'Add another screenshot' : 'Add screenshot';
  }
}

/**
 * Clears all screenshots and resets annotator state.
 * @param {Object} widget - Widget with screenshots, annotator, annCanvas, annToolbar, screenshotsList.
 */
export function clearScreenshots(widget) {
  widget._screenshots = [];
  widget._activeScreenshotIdx = -1;
  widget._annCanvas.setAttribute('hidden', '');
  widget._annToolbar.setAttribute('hidden', '');
  widget._screenshotsList.setAttribute('hidden', '');
  widget._screenshotsList.innerHTML = '';
  updateScreenshotBtnLabel(widget);
  widget._annToolbar.querySelectorAll('.tool-btn').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  widget._annotator.setTool('rect');
}

/**
 * Saves the current annotator shapes into the active screenshot.
 * @param {Object} widget - Widget with _activeScreenshotIdx, _screenshots, _annotator.
 */
export function saveActiveScreenshotAnnotations(widget) {
  if (widget._activeScreenshotIdx >= 0 && widget._activeScreenshotIdx < widget._screenshots.length) {
    widget._screenshots[widget._activeScreenshotIdx].shapes = widget._annotator.getShapes();
  }
}

/**
 * Captures a viewport screenshot, adds it to the widget, and shows it in the annotator.
 * Caller must hide panel (capture-hidden) before calling.
 * @param {Object} widget - Widget with _panel, _screenshots, _annotator, annCanvas, annToolbar.
 * @returns {Promise<void>}
 */
export async function takeScreenshot(widget) {
  saveActiveScreenshotAnnotations(widget);

  widget._panel.classList.add('capture-hidden');
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    const dataUrl = await captureScreenshot();
    widget._screenshots.push({ dataUrl, shapes: [] });

    await widget._annotator.load(dataUrl);
    widget._activeScreenshotIdx = widget._screenshots.length - 1;

    renderScreenshots(widget);
    widget._annCanvas.removeAttribute('hidden');
    widget._annToolbar.removeAttribute('hidden');
    updateScreenshotBtnLabel(widget);
  } catch (err) {
    devWarn(LOG_PREFIX, 'Screenshot failed, continuing without it:', err);
  } finally {
    widget._panel.classList.remove('capture-hidden');
  }
}

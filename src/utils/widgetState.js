/**
 * Widget state building and restoration for persistence. Bridges widget DOM/state to statePersistence.
 */

import { persist as persistState, restore as restoreState } from './statePersistence.js';

/**
 * Checks if the widget has unsaved state worth persisting.
 * @param {Object} widget - The FlagFeedback widget instance.
 * @returns {boolean}
 */
export function hasUnsavedState(widget) {
  if (!widget) return false;
  return (
    widget._isRecording ||
    (widget._textarea && widget._textarea.value.trim()) ||
    (widget._screenshots?.length ?? 0) > 0
  );
}

/**
 * Builds a persistable state object from the widget.
 * @param {Object} widget - The FlagFeedback widget instance.
 * @returns {Object} State suitable for persist().
 */
export function buildPersistableState(widget) {
  if (!widget) return null;
  widget._saveActiveScreenshotAnnotations?.();
  return {
    text: widget._textarea?.value ?? '',
    screenshots: (widget._screenshots ?? []).map((s) => ({ dataUrl: s.dataUrl, shapes: s.shapes ?? [] })),
    isRecording: widget._isRecording ?? false,
    recorderEvents: widget._isRecording ? widget._recorder?.events ?? [] : [],
    recorderStartTime: widget._isRecording ? widget._recorder?.startTime ?? null : null,
  };
}

/**
 * Persists widget state to sessionStorage if it has unsaved content.
 * @param {Object} widget - The FlagFeedback widget instance.
 */
export function persistWidgetState(widget) {
  if (!widget || !hasUnsavedState(widget)) return;
  const state = buildPersistableState(widget);
  if (!state) return;
  persistState(state);
}

/**
 * Restores state from sessionStorage.
 * @returns {Object|null} Restored and validated state, or null.
 */
export function restoreWidgetState() {
  return restoreState();
}

/**
 * Applies restored state to the widget (textarea, screenshots, recording).
 * @param {Object} widget - The FlagFeedback widget instance.
 * @param {Object} data - Validated state from restoreWidgetState().
 */
export function applyRestoredState(widget, data) {
  if (!widget || !data) return;
  if (data.text && widget._textarea) widget._textarea.value = data.text;
  if (data.screenshots?.length > 0) {
    widget._screenshots = data.screenshots;
    widget._renderScreenshots();
    widget._showLastScreenshot();
  }
  if (data.isRecording) {
    const hadRecorderData = data.recorderEvents?.length > 0 && data.recorderStartTime != null;
    const resumed = hadRecorderData
      ? widget._recorder.hydrate(data.recorderEvents, data.recorderStartTime)
      : widget._recorder.isActive;
    if (resumed) {
      widget._isRecording = true;
      widget._btn?.classList.add('recording-hidden');
      widget._pill?.classList.add('visible');
    }
  }
}

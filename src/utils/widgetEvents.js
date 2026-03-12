/**
 * Binds DOM event handlers for the FlagFeedback widget.
 */

/**
 * Attaches all event listeners to the widget's DOM elements.
 * @param {Object} widget - The FlagFeedback instance with DOM refs and methods.
 */
export function bindWidgetEvents(widget) {
  widget._btn.addEventListener('click', () => {
    if (widget._isRecording) return;
    widget._isOpen ? widget._closePanel() : widget._openPanel();
  });

  widget._pill.addEventListener('click', () => widget._stopRecording());
  widget._closeBtn.addEventListener('click', () => widget._closePanel());
  widget._recordPlayBtn.addEventListener('click', () => widget._startRecording());
  widget._resetRecordingBtn?.addEventListener('click', () => widget._resetRecording());
  widget._screenshotBtn.addEventListener('click', () => widget._takeScreenshot());

  widget._annToolbar.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      widget._annToolbar.querySelectorAll('.tool-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      widget._annotator.setTool(btn.dataset.tool);
    });
  });

  widget._qs('.clear-ann-btn').addEventListener('click', () => widget._annotator.clear());
  widget._submitBtn.addEventListener('click', () => widget._submit());
}

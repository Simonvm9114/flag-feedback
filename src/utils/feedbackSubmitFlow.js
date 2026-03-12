/**
 * Handles the feedback submission flow: build package, submit, handle success/error.
 */

import { validateEndpoint } from './endpointValidator.js';
import { submit as submitFeedback } from './feedbackSubmitter.js';
import { buildPackage } from '../package.js';
import { renderScreenshotToDataUrl } from './screenshotRenderer.js';
import { devWarn } from './devLogger.js';
import { MAX_SUBMIT_SCREENSHOTS } from '../constants.js';

const LOG_PREFIX = '[flag-feedback]';

/**
 * Executes the full submit flow: build screenshots, package, POST, then call onSuccess or onError.
 * Handles rejection from screenshot rendering and network submission.
 * @param {Object} widget - Widget with _screenshots, _activeScreenshotIdx, _annotator, _recorder, _textarea, getAttribute.
 * @param {{ setSubmitting: (boolean) => void, clearScreenshots: () => void, onSuccess: () => void, showError: (string) => void, hideError: () => void, saveActiveScreenshotAnnotations: () => void }} callbacks - Widget callbacks.
 * @returns {Promise<void>}
 */
export async function executeSubmitFlow(widget, callbacks) {
  const endpoint = widget.getAttribute('endpoint');
  if (!validateEndpoint(endpoint)) return;

  callbacks.setSubmitting(true);
  callbacks.saveActiveScreenshotAnnotations();

  try {
    const screenshotsToSubmit = widget._screenshots.slice(0, MAX_SUBMIT_SCREENSHOTS);
    if (widget._screenshots.length > MAX_SUBMIT_SCREENSHOTS) {
      devWarn(LOG_PREFIX, 'Only the first 5 screenshots will be submitted.');
    }
    const screenshotPromises = screenshotsToSubmit.map((s) => {
      const realIdx = widget._screenshots.indexOf(s);
      if (realIdx === widget._activeScreenshotIdx) {
        return Promise.resolve(widget._annotator.export());
      }
      return renderScreenshotToDataUrl(s);
    });
    const screenshots = await Promise.all(screenshotPromises);
    callbacks.clearScreenshots();

    const pkg = buildPackage({
      appId: widget.getAttribute('app-id') || null,
      gitCommit: widget.getAttribute('git-commit') || null,
      gitRepo: widget.getAttribute('git-repo') || null,
      text: widget._textarea.value,
      screenshots,
      interactions: widget._recorder.events,
      recordingStart: widget._recorder.startTime,
    });

    await submitFeedback(endpoint, pkg);
    callbacks.onSuccess();
  } catch (err) {
    callbacks.showError(err.message || 'Submission failed. Please try again.');
  } finally {
    callbacks.setSubmitting(false);
  }
}

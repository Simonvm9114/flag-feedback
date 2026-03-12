/**
 * Builds the shadow DOM for the FlagFeedback widget.
 */

import { STYLES } from '../styles.js';
import { getPanelTemplate } from '../panelTemplate.js';
import { Annotator } from '../annotator.js';
import { ICONS } from '../constants.js';

/**
 * Creates and appends all DOM elements for the widget. Assigns refs to the widget.
 * @param {Object} widget - The FlagFeedback instance.
 */
export function buildWidgetDOM(widget) {
  const root = widget._root;

  const style = document.createElement('style');
  style.textContent = STYLES;
  root.appendChild(style);

  widget._btn = document.createElement('button');
  widget._btn.className = 'fb-btn';
  widget._btn.innerHTML = ICONS.chat;
  widget._btn.setAttribute('aria-label', widget.getAttribute('button-label') || 'Give feedback');
  root.appendChild(widget._btn);

  widget._pill = document.createElement('button');
  widget._pill.className = 'fb-pill';
  widget._pill.innerHTML = `<span class="rec-dot"></span><span>Recording\u2026 tap to finish</span>`;
  widget._pill.setAttribute('aria-label', 'Stop recording');
  root.appendChild(widget._pill);

  widget._panel = document.createElement('div');
  widget._panel.className = 'fb-panel';
  widget._panel.setAttribute('role', 'dialog');
  widget._panel.setAttribute('aria-modal', 'false');
  widget._panel.setAttribute('aria-label', 'Feedback');
  widget._panel.innerHTML = getPanelTemplate({ play: ICONS.play, camera: ICONS.camera });
  root.appendChild(widget._panel);

  widget._textarea = root.querySelector('.fb-textarea');
  widget._recordPlayBtn = root.querySelector('.record-play-btn');
  widget._screenshotBtn = root.querySelector('.screenshot-btn');
  widget._screenshotsList = root.querySelector('.screenshots-list');
  widget._annToolbar = root.querySelector('.ann-toolbar');
  widget._annCanvas = root.querySelector('.screenshot-canvas');
  widget._submitBtn = root.querySelector('.submit-btn');
  widget._errorEl = root.querySelector('.fb-error');
  widget._closeBtn = root.querySelector('.panel-close');

  widget._annotator = new Annotator(widget._annCanvas);
}

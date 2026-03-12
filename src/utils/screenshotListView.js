/**
 * Renders screenshot thumbnails into a container with select/remove callbacks.
 */

import { isValidDataUrl } from './statePersistence.js';

/**
 * Renders screenshot thumbnails and wires up select/remove handlers.
 * @param {HTMLElement} container - The screenshots-list element.
 * @param {Array<{ dataUrl: string, shapes: Array }>} screenshots - Screenshot data.
 * @param {number} activeIdx - Index of the currently selected screenshot.
 * @param {{ onSelect: (idx: number) => void, onRemove: (idx: number) => void }} handlers - Callbacks.
 */
export function renderScreenshotList(container, screenshots, activeIdx, { onSelect, onRemove }) {
  if (!screenshots || screenshots.length === 0) {
    container.setAttribute('hidden', '');
    container.innerHTML = '';
    return;
  }
  container.removeAttribute('hidden');
  container.innerHTML = '';

  screenshots.forEach((s, i) => {
    if (!isValidDataUrl(s.dataUrl)) return;
    const thumb = document.createElement('div');
    thumb.className = `screenshot-thumb${i === activeIdx ? ' active' : ''}`;
    thumb.dataset.idx = String(i);
    thumb.title = `Screenshot ${i + 1}`;

    const img = document.createElement('img');
    img.src = s.dataUrl;
    img.alt = `Screenshot ${i + 1}`;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'screenshot-remove';
    removeBtn.setAttribute('aria-label', 'Remove screenshot');
    removeBtn.textContent = '\u2715';

    thumb.appendChild(img);
    thumb.appendChild(removeBtn);
    container.appendChild(thumb);

    img.addEventListener('click', () => onSelect(i));
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(i);
    });
  });
}

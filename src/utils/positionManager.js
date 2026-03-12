/**
 * Applies position styles to floating button, panel, and recording pill.
 * @param {Object} elements - DOM elements to position.
 * @param {HTMLElement} elements.btn
 * @param {HTMLElement} elements.panel
 * @param {HTMLElement} elements.pill
 * @param {string} position - One of 'bottom-right', 'bottom-left', 'top-right', 'top-left'.
 * @param {{ margin?: number, gap?: number }} [config]
 */
export function applyPosition(elements, position, config = {}) {
  const margin = config.margin ?? 16;
  const gap = config.gap ?? 8;
  const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
  const pos = validPositions.includes(position) ? position : 'bottom-right';

  const [v, h] = pos.split('-');
  const oppV = v === 'top' ? 'bottom' : 'top';
  const oppH = h === 'left' ? 'right' : 'left';

  const btnSize = window.innerWidth <= 500 ? 56 : 48;
  const m = `${margin}px`;
  const panelOffset = `${btnSize + margin + gap}px`;

  Object.assign(elements.btn.style, { [v]: m, [oppV]: '', [h]: m, [oppH]: '' });
  Object.assign(elements.panel.style, {
    [v]: panelOffset,
    [oppV]: '',
    [h]: m,
    [oppH]: '',
    transformOrigin: `${v} ${h}`,
  });
  Object.assign(elements.pill.style, { [v]: m, [oppV]: '', [h]: m, [oppH]: '' });
}

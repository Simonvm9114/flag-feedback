/** Creates a mode-indicator pill preview (recording / targeting). */
export function createModePill(label: string): HTMLDivElement {
  const pill = document.createElement('div');
  pill.className = 'ff-pill-preview';
  pill.setAttribute('role', 'status');

  const dot = document.createElement('span');
  dot.className = 'ff-pill-dot';
  dot.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = label;

  pill.append(dot, text);
  return pill;
}

export type TextTone = 'default' | 'secondary';

export type TextSize = 'base' | 'sm';

export type TextOptions = {
  content: string;
  tone?: TextTone;
  size?: TextSize;
};

/** Creates a body text paragraph. */
export function createText(options: TextOptions): HTMLParagraphElement {
  const text = document.createElement('p');
  text.className = 'ff-text';
  if (options.tone === 'secondary') text.classList.add('ff-text--secondary');
  if (options.size === 'sm') text.classList.add('ff-text--sm');
  text.textContent = options.content;
  return text;
}

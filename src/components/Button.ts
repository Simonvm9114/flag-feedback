export type ButtonVariant = 'primary' | 'secondary';

export type ButtonOptions = {
  label: string;
  variant?: ButtonVariant;
  size?: 'sm';
  type?: 'button' | 'submit';
};

/** Creates a kit button element (primary or secondary). */
export function createButton(options: ButtonOptions): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = options.type ?? 'button';
  button.className = `ff-btn ff-btn--${options.variant ?? 'primary'}`;
  if (options.size === 'sm') button.classList.add('ff-btn--sm');
  button.textContent = options.label;
  return button;
}

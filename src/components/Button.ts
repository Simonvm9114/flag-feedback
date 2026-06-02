export type ButtonVariant = 'primary' | 'secondary';

export type ButtonOptions = {
  label: string;
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
};

/** Creates a kit button element (primary or secondary). */
export function createButton(options: ButtonOptions): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = options.type ?? 'button';
  button.className = `ff-btn ff-btn--${options.variant ?? 'primary'}`;
  button.textContent = options.label;
  return button;
}

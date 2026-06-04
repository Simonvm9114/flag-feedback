export type ModeIndicatorOptions = {
  className: string;
  ariaLabel?: string;
  label: string;
  pulse?: boolean;
  buttonClassName: string;
  buttonLabel: string;
  buttonAriaLabel: string;
  onAction(): void;
};

export type ModeIndicatorElements = {
  el: HTMLDivElement;
  labelEl: HTMLSpanElement;
};

export function createModeIndicator(options: ModeIndicatorOptions): ModeIndicatorElements {
  const el = document.createElement('div');
  el.className = `${options.className} ff-root`;
  el.setAttribute('role', 'status');
  if (options.ariaLabel) el.setAttribute('aria-label', options.ariaLabel);

  const dot = document.createElement('span');
  dot.className = options.pulse ? 'ff-pill-dot ff-pill-dot--pulse' : 'ff-pill-dot';
  dot.setAttribute('aria-hidden', 'true');

  const labelEl = document.createElement('span');
  labelEl.textContent = options.label;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = options.buttonClassName;
  btn.textContent = options.buttonLabel;
  btn.setAttribute('aria-label', options.buttonAriaLabel);
  btn.addEventListener('click', () => options.onAction());

  el.append(dot, labelEl, btn);
  return { el, labelEl };
}

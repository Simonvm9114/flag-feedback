export type InputOptions = {
  label: string;
  placeholder?: string;
  error?: string;
  value?: string;
};

/** Creates a labeled text input with optional error message. */
export function createInput(options: InputOptions): HTMLDivElement {
  const field = document.createElement('div');
  field.className = 'ff-field';

  const label = document.createElement('label');
  label.className = 'ff-label';
  label.textContent = options.label;

  const input = document.createElement('input');
  input.className = 'ff-input';
  input.type = 'text';
  if (options.placeholder) input.placeholder = options.placeholder;
  if (options.value) input.value = options.value;
  if (options.error) input.classList.add('ff-input--error');
  label.htmlFor = input.id = `ff-input-${Math.random().toString(36).slice(2, 9)}`;

  field.append(label, input);

  if (options.error) {
    const error = document.createElement('span');
    error.className = 'ff-field-error';
    error.textContent = options.error;
    field.append(error);
  }

  return field;
}

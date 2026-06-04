import { generateId } from '../ui/utils';

export type TextareaOptions = {
  label: string;
  placeholder?: string;
  rows?: number;
};

export type TextareaField = {
  field: HTMLDivElement;
  textarea: HTMLTextAreaElement;
};

/** Creates a labeled textarea field for multi-line text input. */
export function createTextarea(options: TextareaOptions): TextareaField {
  const field = document.createElement('div');
  field.className = 'ff-field';

  const label = document.createElement('label');
  label.className = 'ff-label';
  label.textContent = options.label;

  const textarea = document.createElement('textarea');
  textarea.className = 'ff-input ff-textarea';
  textarea.rows = options.rows ?? 4;
  if (options.placeholder) textarea.placeholder = options.placeholder;
  label.htmlFor = textarea.id = `ff-textarea-${generateId()}`;

  field.append(label, textarea);
  return { field, textarea };
}

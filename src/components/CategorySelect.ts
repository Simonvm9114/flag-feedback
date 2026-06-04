import type { FeedbackCategory } from '../config/types';

const CATEGORY_OPTIONS: ReadonlyArray<{ value: FeedbackCategory; label: string }> = [
  { value: 'design-request', label: 'Design request' },
  { value: 'feature-request', label: 'Feature request' },
  { value: 'bug-fix', label: 'Bug fix' },
];

export type CategorySelectField = {
  fieldset: HTMLFieldSetElement;
  getValue(): FeedbackCategory | null;
  setError(message: string | null): void;
};

/** Creates a radio group for selecting a feedback category. No option is pre-checked. */
export function createCategorySelect(groupName: string): CategorySelectField {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'ff-category-group';

  const legend = document.createElement('legend');
  legend.className = 'ff-label';
  legend.textContent = 'Category';
  fieldset.append(legend);

  const inputs: HTMLInputElement[] = [];
  for (const opt of CATEGORY_OPTIONS) {
    const lbl = document.createElement('label');
    lbl.className = 'ff-category-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = groupName;
    input.value = opt.value;
    input.className = 'ff-category-radio';
    inputs.push(input);

    const span = document.createElement('span');
    span.textContent = opt.label;

    lbl.append(input, span);
    fieldset.append(lbl);
  }

  let errorEl: HTMLSpanElement | null = null;

  return {
    fieldset,
    getValue() {
      const checked = inputs.find((i) => i.checked);
      return checked ? (checked.value as FeedbackCategory) : null;
    },
    setError(message: string | null) {
      if (errorEl) {
        errorEl.remove();
        errorEl = null;
      }
      if (message) {
        errorEl = document.createElement('span');
        errorEl.className = 'ff-field-error';
        errorEl.textContent = message;
        fieldset.append(errorEl);
      }
    },
  };
}

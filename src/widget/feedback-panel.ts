import { createButton } from '../components/Button';
import { createCard } from '../components/Card';
import { createHeading } from '../components/Heading';
import { createTextarea } from '../components/Textarea';
import { createCategorySelect } from '../components/CategorySelect';
import { UI_KIT_STYLES } from '../ui/kit-styles';
import type { FeedbackCategory } from '../config/types';

export type FeedbackPanelOptions = {
  shadowRoot: ShadowRoot;
  /** Returns the current session draft so the form can be restored on open. */
  getState(): { comment: string; category: FeedbackCategory | null };
  /** Called on every textarea input so the session stays in sync. */
  onCommentChange(text: string): void;
  /** Called on every category change so the session stays in sync. */
  onCategoryChange(category: FeedbackCategory | null): void;
  onClose(): void;
  onSubmit(data: { comment: string; category: FeedbackCategory }): Promise<void>;
};

export type FeedbackPanel = {
  show(): void;
  hide(): void;
  destroy(): void;
};

export function createFeedbackPanel(options: FeedbackPanelOptions): FeedbackPanel {
  // Inject kit styles once into the shadow root
  const styleEl = document.createElement('style');
  styleEl.textContent = UI_KIT_STYLES;
  options.shadowRoot.appendChild(styleEl);

  // ── Overlay container ──────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.className = 'ff-panel-overlay ff-root';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'false');
  overlay.setAttribute('aria-label', 'Feedback panel');

  // ── Card ───────────────────────────────────────────────────────────────────
  const card = createCard();
  card.classList.add('ff-card--stack');

  // ── Header ─────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  header.className = 'ff-panel-header';

  const heading = createHeading({ content: 'Feedback', level: 'md', as: 'h2' });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'ff-panel-close';
  closeBtn.setAttribute('aria-label', 'Close feedback panel');
  closeBtn.textContent = '×';

  header.append(heading, closeBtn);

  // ── Comment textarea ───────────────────────────────────────────────────────
  const commentField = createTextarea({
    label: 'Comment',
    placeholder: 'Describe your feedback…',
    rows: 4,
  });

  // Keep session in sync as the user types
  commentField.textarea.addEventListener('input', () => {
    options.onCommentChange(commentField.textarea.value);
  });

  // ── Category selector ──────────────────────────────────────────────────────
  const groupName = `ff-cat-${Math.random().toString(36).slice(2, 9)}`;
  const categorySelect = createCategorySelect(groupName);

  categorySelect.fieldset.addEventListener('change', () => {
    categorySelect.setError(null);
    options.onCategoryChange(categorySelect.getValue());
  });

  // ── Mode controls ──────────────────────────────────────────────────────────
  const controlsRow = document.createElement('div');
  controlsRow.className = 'ff-panel-controls';

  const targetBtn = createButton({ label: 'Target element', variant: 'secondary' });
  targetBtn.classList.add('ff-btn--sm');
  targetBtn.setAttribute('aria-label', 'Activate element-targeting mode');

  const recordBtn = createButton({ label: 'Start recording', variant: 'secondary' });
  recordBtn.classList.add('ff-btn--sm');
  recordBtn.setAttribute('aria-label', 'Start a recording session');

  controlsRow.append(targetBtn, recordBtn);

  // ── Submit button ──────────────────────────────────────────────────────────
  const submitBtn = createButton({ label: 'Submit feedback', variant: 'primary', type: 'submit' });

  card.append(header, commentField.field, categorySelect.fieldset, controlsRow, submitBtn);
  overlay.append(card);
  options.shadowRoot.appendChild(overlay);

  // ── Event handlers ─────────────────────────────────────────────────────────
  closeBtn.addEventListener('click', () => {
    options.onClose();
  });

  submitBtn.addEventListener('click', () => {
    const category = categorySelect.getValue();
    if (!category) {
      categorySelect.setError('Please select a category.');
      return;
    }
    const comment = commentField.textarea.value;
    submitBtn.disabled = true;
    void options.onSubmit({ comment, category }).finally(() => {
      submitBtn.disabled = false;
    });
  });

  // ── Show / hide ────────────────────────────────────────────────────────────
  return {
    show() {
      // Restore form from session state — preserves draft between open/close cycles.
      // Session is only reset on successful submit, not on close (per data.md).
      const state = options.getState();
      commentField.textarea.value = state.comment;
      const radios =
        categorySelect.fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      radios.forEach((r) => {
        r.checked = r.value === state.category;
      });
      categorySelect.setError(null);
      overlay.classList.add('ff-panel-overlay--visible');
      commentField.textarea.focus();
    },
    hide() {
      overlay.classList.remove('ff-panel-overlay--visible');
    },
    destroy() {
      styleEl.remove();
      overlay.remove();
    },
  };
}

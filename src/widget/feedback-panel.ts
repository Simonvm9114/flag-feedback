import { createButton } from '../components/Button';
import { createCard } from '../components/Card';
import { generateId } from '../ui/utils';
import { createHeading } from '../components/Heading';
import { createTextarea } from '../components/Textarea';
import { createCategorySelect } from '../components/CategorySelect';
import { UI_KIT_STYLES } from '../ui/kit-styles';
import type { FeedbackCategory, ElementTarget } from '../config/types';

export type FeedbackPanelOptions = {
  shadowRoot: ShadowRoot;
  /** Returns the current session draft so the form can be restored on open. */
  getState(): {
    comment: string;
    category: FeedbackCategory | null;
    elementTargets: ElementTarget[];
  };
  /** Called on every textarea input so the session stays in sync. */
  onCommentChange(text: string): void;
  /** Called on every category change so the session stays in sync. */
  onCategoryChange(category: FeedbackCategory | null): void;
  onClose(): void;
  onSubmit(data: { comment: string; category: FeedbackCategory }): Promise<void>;
  onEnterTargeting(): void;
  onRemoveTarget(index: number): void;
  onEnterRecording(): void;
  onDiscardRecording(): void;
  /** Returns the current recorded interaction count. */
  getInteractionCount(): number;
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
  const card = createCard({ stack: true });

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
  const groupName = `ff-cat-${generateId()}`;
  const categorySelect = createCategorySelect(groupName);

  categorySelect.fieldset.addEventListener('change', () => {
    categorySelect.setError(null);
    options.onCategoryChange(categorySelect.getValue());
  });

  // ── Mode controls ──────────────────────────────────────────────────────────
  const controlsRow = document.createElement('div');
  controlsRow.className = 'ff-panel-controls';

  const targetBtn = createButton({ label: 'Target element', variant: 'secondary', size: 'sm' });
  targetBtn.setAttribute('aria-label', 'Activate element-targeting mode');

  const recordBtn = createButton({ label: 'Start recording', variant: 'secondary', size: 'sm' });
  recordBtn.setAttribute('aria-label', 'Start a recording session');

  controlsRow.append(targetBtn, recordBtn);

  // ── Interaction summary (shown after recording) ────────────────────────────
  const interactionsSummary = document.createElement('div');
  interactionsSummary.className = 'ff-interactions-summary';
  interactionsSummary.hidden = true;

  const interactionsCount = document.createElement('span');
  interactionsCount.className = 'ff-interactions-count';

  const discardBtn = document.createElement('button');
  discardBtn.type = 'button';
  discardBtn.className = 'ff-interactions-discard';
  discardBtn.textContent = 'Discard';
  discardBtn.setAttribute('aria-label', 'Discard recorded interactions');

  interactionsSummary.append(interactionsCount, discardBtn);

  discardBtn.addEventListener('click', () => {
    options.onDiscardRecording();
    interactionsSummary.hidden = true;
  });

  function renderInteractionsSummary(): void {
    const count = options.getInteractionCount();
    if (count > 0) {
      interactionsCount.textContent = `${count} interaction${count === 1 ? '' : 's'} recorded`;
      interactionsSummary.hidden = false;
    } else {
      interactionsSummary.hidden = true;
    }
  }

  // ── Element targets list ───────────────────────────────────────────────────
  const targetsSection = document.createElement('div');
  targetsSection.className = 'ff-targets-section';
  targetsSection.hidden = true;

  // Collapsible toggle header
  const targetsToggle = document.createElement('button');
  targetsToggle.type = 'button';
  targetsToggle.className = 'ff-targets-toggle';
  targetsToggle.setAttribute('aria-expanded', 'true');

  const targetsLabelText = document.createElement('span');
  targetsLabelText.className = 'ff-targets-label-text';

  const targetsChevron = document.createElement('span');
  targetsChevron.className = 'ff-targets-chevron';
  targetsChevron.setAttribute('aria-hidden', 'true');
  targetsChevron.textContent = '▾';

  targetsToggle.append(targetsLabelText, targetsChevron);

  const targetsList = document.createElement('ul');
  targetsList.className = 'ff-targets-list';
  targetsList.setAttribute('aria-label', 'Targeted elements');

  targetsSection.append(targetsToggle, targetsList);

  // Track collapse state across show() cycles
  let targetsCollapsed = false;

  targetsToggle.addEventListener('click', () => {
    targetsCollapsed = !targetsCollapsed;
    targetsToggle.setAttribute('aria-expanded', String(!targetsCollapsed));
    targetsList.hidden = targetsCollapsed;
  });

  function renderTargets(): void {
    const { elementTargets } = options.getState();
    targetsList.innerHTML = '';

    if (elementTargets.length > 0) {
      targetsLabelText.textContent = `Element targets (${elementTargets.length.toString()})`;
      elementTargets.forEach((target, index) => {
        const item = document.createElement('li');
        item.className = 'ff-target-item';

        const content = document.createElement('div');
        content.className = 'ff-target-item-content';

        const path = document.createElement('span');
        path.className = 'ff-target-path';
        path.textContent = target.path;
        path.title = target.path;

        const comment = document.createElement('span');
        comment.className = 'ff-target-comment';
        comment.textContent = target.comment;

        content.append(path, comment);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'ff-target-remove';
        removeBtn.setAttribute('aria-label', 'Remove this target');
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
          options.onRemoveTarget(index);
          renderTargets();
        });

        item.append(content, removeBtn);
        targetsList.appendChild(item);
      });
      targetsList.hidden = targetsCollapsed;
      targetsSection.hidden = false;
    } else {
      targetsSection.hidden = true;
    }
  }

  // ── Submit button ──────────────────────────────────────────────────────────
  const submitBtn = createButton({ label: 'Submit feedback', variant: 'primary', type: 'submit' });

  // ── Submit error area ──────────────────────────────────────────────────────
  const errorArea = document.createElement('div');
  errorArea.className = 'ff-submit-error';
  errorArea.hidden = true;
  errorArea.setAttribute('role', 'alert');

  const errorMsg = document.createElement('span');
  errorMsg.className = 'ff-submit-error-msg';

  const retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'ff-submit-retry';
  retryBtn.textContent = 'Try again';

  errorArea.append(errorMsg, retryBtn);

  card.append(
    header,
    commentField.field,
    categorySelect.fieldset,
    controlsRow,
    interactionsSummary,
    targetsSection,
    submitBtn,
    errorArea,
  );
  overlay.append(card);
  options.shadowRoot.appendChild(overlay);

  // ── Shared submit logic ────────────────────────────────────────────────────
  function doSubmit(): void {
    const category = categorySelect.getValue();
    if (!category) {
      categorySelect.setError('Please select a category.');
      return;
    }
    const comment = commentField.textarea.value;
    errorArea.hidden = true;
    submitBtn.disabled = true;
    retryBtn.disabled = true;
    options
      .onSubmit({ comment, category })
      .catch(() => {
        errorMsg.textContent = 'Could not send feedback.';
        errorArea.hidden = false;
      })
      .finally(() => {
        submitBtn.disabled = false;
        retryBtn.disabled = false;
      });
  }

  // ── Event handlers ─────────────────────────────────────────────────────────
  targetBtn.addEventListener('click', () => {
    options.onEnterTargeting();
  });

  recordBtn.addEventListener('click', () => {
    options.onEnterRecording();
  });

  closeBtn.addEventListener('click', () => {
    options.onClose();
  });

  submitBtn.addEventListener('click', doSubmit);
  retryBtn.addEventListener('click', doSubmit);

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
      errorArea.hidden = true;

      // Rebuild targets list from current session snapshot — handles both
      // returning from targeting mode and re-opening a draft with existing targets.
      renderTargets();
      renderInteractionsSummary();

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

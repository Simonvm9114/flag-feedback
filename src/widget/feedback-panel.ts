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
  // Using <dialog> puts the panel in the CSS top layer, making it immune to
  // host-app stacking contexts (transform, will-change, etc.) that would otherwise
  // cause position:fixed overlays to scroll out of view.
  const overlay = document.createElement('dialog');
  overlay.className = 'ff-panel-overlay ff-root';
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

  // Intercept the browser's built-in Escape-key close so our session logic runs.
  overlay.addEventListener('cancel', (e) => {
    e.preventDefault();
    options.onClose();
  });

  // Close when clicking the backdrop area (outside the card) on any viewport.
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      options.onClose();
    }
  });

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

  // ── Mobile scroll lock ─────────────────────────────────────────────────────
  // Prevents the host page from scrolling while the bottom sheet is open.
  // Only applied on viewports ≤480px (the bottom-sheet breakpoint) to avoid
  // locking desktop scroll where the panel is a small corner widget.
  let scrollLocked = false;
  let savedScrollY = 0;

  function lockScroll(): void {
    if (scrollLocked || !window.matchMedia('(max-width: 480px)').matches) return;
    // iOS Safari ignores `overflow:hidden` on <body> for touch scrolling, so the
    // host page scrolls through the open panel. Pinning the body with
    // position:fixed (and restoring scrollY on unlock) is the only reliable lock.
    savedScrollY = window.scrollY;
    const body = document.body.style;
    body.position = 'fixed';
    body.top = `-${savedScrollY}px`;
    body.left = '0';
    body.right = '0';
    body.width = '100%';
    scrollLocked = true;
  }

  function unlockScroll(): void {
    if (!scrollLocked) return;
    const body = document.body.style;
    body.position = '';
    body.top = '';
    body.left = '';
    body.right = '';
    body.width = '';
    window.scrollTo(0, savedScrollY);
    scrollLocked = false;
  }

  // ── Visual-viewport tracking ───────────────────────────────────────────────
  // iOS keeps fixed / top-layer (<dialog>) elements anchored to the LAYOUT
  // viewport, which does not shrink when the virtual keyboard opens. Left alone
  // the dialog extends behind the keyboard and the user can pan it out of view.
  // We sync the visual-viewport height and offset onto the overlay so the mobile
  // stylesheet can size and pin the dialog to the visible area — a single source
  // of truth (the dialog), so no doubled keyboard offset on the card.
  let vvpCleanup: (() => void) | null = null;

  function trackViewport(): void {
    const vvp = window.visualViewport;
    if (!vvp) return;
    const sync = () => {
      overlay.style.setProperty('--ff-panel-vvp-height', `${vvp.height}px`);
      overlay.style.setProperty('--ff-panel-vvp-top', `${vvp.offsetTop}px`);
    };
    vvp.addEventListener('resize', sync);
    vvp.addEventListener('scroll', sync);
    sync();
    vvpCleanup = () => {
      vvp.removeEventListener('resize', sync);
      vvp.removeEventListener('scroll', sync);
    };
  }

  function untrackViewport(): void {
    overlay.style.removeProperty('--ff-panel-vvp-height');
    overlay.style.removeProperty('--ff-panel-vvp-top');
    vvpCleanup?.();
    vvpCleanup = null;
  }

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

      lockScroll();
      trackViewport();
      if (!overlay.open) overlay.showModal();
    },
    hide() {
      if (overlay.open) overlay.close();
      unlockScroll();
      untrackViewport();
    },
    destroy() {
      if (overlay.open) overlay.close();
      unlockScroll();
      untrackViewport();
      styleEl.remove();
      overlay.remove();
    },
  };
}

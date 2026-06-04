import { buildSelectorPath } from './selector';
import { createButton } from '../components/Button';
import { createCard } from '../components/Card';
import { createModeIndicator } from '../components/ModeIndicator';
import { createHeading } from '../components/Heading';
import { createTextarea } from '../components/Textarea';
import { createText } from '../components/Text';
import type { ElementTarget } from '../config/types';

export type TargetingOptions = {
  shadowRoot: ShadowRoot;
  portalContainer: HTMLElement;
  activator: HTMLElement;
  onDone(): void;
  onTargetAdded(target: ElementTarget): void;
  getTargetCount(): number;
};

export type TargetingController = {
  enter(): void;
  exit(): void;
  destroy(): void;
};

export function createTargeting(options: TargetingOptions): TargetingController {
  const { shadowRoot, portalContainer, activator } = options;

  let active = false;
  let indicatorEl: HTMLDivElement | null = null;
  let highlightEl: HTMLDivElement | null = null;
  let promptEl: HTMLDivElement | null = null;
  let countTextEl: HTMLSpanElement | null = null;
  let vvpCleanup: (() => void) | null = null;

  function updateCount(): void {
    if (countTextEl) {
      const n = options.getTargetCount();
      countTextEl.textContent = n === 0 ? 'Targeting' : `Targeting · ${n} selected`;
    }
  }

  function clearHighlight(): void {
    highlightEl?.remove();
    highlightEl = null;
  }

  function clearPrompt(): void {
    vvpCleanup?.();
    vvpCleanup = null;
    promptEl?.remove();
    promptEl = null;
  }

  function trackViewportForPrompt(el: HTMLDivElement): void {
    const vvp = window.visualViewport;
    if (!vvp) return;
    const sync = () => {
      const keyboardOffset = Math.max(0, window.innerHeight - vvp.height);
      el.style.setProperty('--ff-panel-keyboard-offset', `${keyboardOffset}px`);
      el.style.setProperty('--ff-panel-vvp-height', `${vvp.height}px`);
    };
    vvp.addEventListener('resize', sync);
    sync();
    vvpCleanup = () => vvp.removeEventListener('resize', sync);
  }

  function showHighlight(el: Element): void {
    clearHighlight();
    const rect = el.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = 'ff-highlight-overlay ff-root';
    div.style.top = `${rect.top}px`;
    div.style.left = `${rect.left}px`;
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    shadowRoot.appendChild(div);
    highlightEl = div;
  }

  function showPrompt(targetEl: Element): void {
    clearPrompt();

    const path = buildSelectorPath(targetEl);

    const wrapper = document.createElement('div');
    wrapper.className = 'ff-element-prompt ff-root';

    const card = createCard({ stack: true });

    const heading = createHeading({ content: 'Comment on element', level: 'md', as: 'h3' });

    const pathText = createText({
      content: path,
      size: 'sm',
      tone: 'secondary',
    });
    pathText.style.cssText = 'word-break: break-all; font-family: ui-monospace, monospace;';

    const commentField = createTextarea({
      label: 'Your comment',
      placeholder: 'What about this element?',
      rows: 2,
    });

    const btnRow = document.createElement('div');
    btnRow.className = 'ff-element-prompt-btns';

    const cancelBtn = createButton({ label: 'Cancel', variant: 'secondary', size: 'sm' });
    const confirmBtn = createButton({ label: 'Add target', variant: 'primary', size: 'sm' });

    btnRow.append(cancelBtn, confirmBtn);
    card.append(heading, pathText, commentField.field, btnRow);
    wrapper.appendChild(card);
    shadowRoot.appendChild(wrapper);
    promptEl = wrapper;
    trackViewportForPrompt(wrapper);

    commentField.textarea.focus();

    cancelBtn.addEventListener('click', () => {
      clearHighlight();
      clearPrompt();
    });

    confirmBtn.addEventListener('click', () => {
      const comment = commentField.textarea.value.trim();
      clearHighlight();
      clearPrompt();
      options.onTargetAdded({ path, comment });
      updateCount();
    });

    commentField.textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        confirmBtn.click();
      }
      if (e.key === 'Escape') {
        cancelBtn.click();
      }
    });
  }

  const handleClick = (event: Event): void => {
    if (!active) return;

    const target = event.target as Element | null;
    if (!target) return;

    // Skip clicks from inside the portal (shadow root host) or the activator
    if (portalContainer.contains(target)) return;
    if (activator.contains(target)) return;

    event.preventDefault();
    event.stopPropagation();

    showHighlight(target);
    showPrompt(target);
  };

  return {
    enter() {
      if (active) return;
      active = true;
      document.addEventListener('click', handleClick, { capture: true });
      const { el, labelEl } = createModeIndicator({
        className: 'ff-targeting-indicator',
        label: 'Targeting',
        buttonClassName: 'ff-targeting-done',
        buttonLabel: 'Done',
        buttonAriaLabel: 'Exit element-targeting mode',
        onAction: () => options.onDone(),
      });
      countTextEl = labelEl;
      indicatorEl = el;
      shadowRoot.appendChild(indicatorEl);
      updateCount();
    },

    exit() {
      if (!active) return;
      active = false;
      document.removeEventListener('click', handleClick, { capture: true });
      clearHighlight();
      clearPrompt();
      indicatorEl?.remove();
      indicatorEl = null;
      countTextEl = null;
    },

    destroy() {
      active = false;
      document.removeEventListener('click', handleClick, { capture: true });
      clearHighlight();
      clearPrompt();
      indicatorEl?.remove();
      indicatorEl = null;
      countTextEl = null;
    },
  };
}

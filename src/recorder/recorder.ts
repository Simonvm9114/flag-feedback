import { buildSelectorPath } from '../targeting/selector';
import type { InteractionEvent } from '../config/types';

export type RecorderOptions = {
  portalContainer: HTMLElement;
  activator: HTMLElement;
  onInteraction(event: InteractionEvent): void;
};

export type RecorderController = {
  start(): void;
  stop(): void;
  destroy(): void;
};

/** Returns true if the target is inside the package portal or activator (must not be recorded). */
function isHostTarget(
  target: EventTarget | null,
  portalContainer: HTMLElement,
  activator: HTMLElement,
): target is Element {
  if (!(target instanceof Element)) return false;
  if (portalContainer.contains(target)) return false;
  if (activator.contains(target)) return false;
  return true;
}

/** Returns true if the element should be excluded from recording. */
function isExcluded(el: Element): boolean {
  if (el instanceof HTMLInputElement && el.type === 'password') return true;
  if (el.closest('[data-flag-feedback-ignore]')) return true;
  return false;
}

/** Truncates a string to maxLen characters. */
function truncate(s: string, maxLen: number): string {
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

/** Computes scroll position as percentage of scrollable height (0–100). */
function scrollPct(): number {
  const el = document.documentElement;
  const scrollable = el.scrollHeight - el.clientHeight;
  if (scrollable <= 0) return 0;
  return Math.round((window.scrollY / scrollable) * 100);
}

export function createRecorder(options: RecorderOptions): RecorderController {
  const { portalContainer, activator } = options;
  const onInteraction = (event: InteractionEvent): void => options.onInteraction(event);

  let active = false;

  // Scroll debounce state
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;

  // Input coalescing: track pending input events per element path
  // We keep a per-path timer; firing the timer commits the coalesced entry.
  const pendingInput = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; t: number; count: number }
  >();

  function emit(event: InteractionEvent): void {
    onInteraction(event);
  }

  function handleClick(e: Event): void {
    if (!active) return;
    const target = e.target;
    if (!isHostTarget(target, portalContainer, activator)) return;
    if (isExcluded(target)) return;
    emit({ t: Date.now(), type: 'click', path: buildSelectorPath(target), count: 1 });
  }

  function handleScroll(): void {
    if (!active) return;
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
      scrollTimer = null;
      emit({ t: Date.now(), type: 'scroll', positionPct: scrollPct(), count: 1 });
    }, 250);
  }

  function handleInput(e: Event): void {
    if (!active) return;
    const target = e.target;
    if (!isHostTarget(target, portalContainer, activator)) return;
    if (isExcluded(target)) return;
    const path = buildSelectorPath(target);
    const now = Date.now();
    const pending = pendingInput.get(path);
    if (pending) {
      clearTimeout(pending.timer);
      pending.t = now;
      pending.count += 1;
    }
    const count = pending ? pending.count : 1;
    const timer = setTimeout(() => {
      pendingInput.delete(path);
      emit({ t: now, type: 'input', path, count });
    }, 600);
    pendingInput.set(path, { timer, t: now, count });
  }

  function handleChange(e: Event): void {
    if (!active) return;
    const target = e.target;
    if (!isHostTarget(target, portalContainer, activator)) return;
    if (isExcluded(target)) return;
    // Flush any pending input coalesce for this element so change follows correctly
    const path = buildSelectorPath(target);
    const pending = pendingInput.get(path);
    if (pending) {
      clearTimeout(pending.timer);
      pendingInput.delete(path);
      emit({ t: pending.t, type: 'input', path, count: pending.count });
    }
    emit({ t: Date.now(), type: 'change', path, count: 1 });
  }

  function handleSubmit(e: Event): void {
    if (!active) return;
    const target = e.target;
    if (!isHostTarget(target, portalContainer, activator)) return;
    emit({ t: Date.now(), type: 'submit', path: buildSelectorPath(target), count: 1 });
  }

  function handlePopstate(): void {
    if (!active) return;
    emit({ t: Date.now(), type: 'popstate', count: 1 });
  }

  function handleHashchange(): void {
    if (!active) return;
    emit({ t: Date.now(), type: 'hashchange', count: 1 });
  }

  function handleError(e: ErrorEvent): void {
    if (!active) return;
    const message = truncate(e.message ?? 'Unknown error', 200);
    emit({ t: Date.now(), type: 'error', message, count: 1 });
  }

  function handleUnhandledRejection(e: PromiseRejectionEvent): void {
    if (!active) return;
    const raw =
      e.reason instanceof Error
        ? e.reason.message
        : typeof e.reason === 'string'
          ? e.reason
          : 'Unhandled promise rejection';
    const message = truncate(raw, 200);
    emit({ t: Date.now(), type: 'unhandledrejection', message, count: 1 });
  }

  function attachListeners(): void {
    document.addEventListener('click', handleClick, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('input', handleInput, { capture: true, passive: true });
    document.addEventListener('change', handleChange, { capture: true, passive: true });
    document.addEventListener('submit', handleSubmit, { capture: true, passive: true });
    window.addEventListener('popstate', handlePopstate, { passive: true });
    window.addEventListener('hashchange', handleHashchange, { passive: true });
    window.addEventListener('error', handleError as EventListener);
    window.addEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
  }

  function detachListeners(): void {
    document.removeEventListener('click', handleClick, { capture: true });
    document.removeEventListener('scroll', handleScroll, { capture: true });
    document.removeEventListener('input', handleInput, { capture: true });
    document.removeEventListener('change', handleChange, { capture: true });
    document.removeEventListener('submit', handleSubmit, { capture: true });
    window.removeEventListener('popstate', handlePopstate);
    window.removeEventListener('hashchange', handleHashchange);
    window.removeEventListener('error', handleError as EventListener);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection as EventListener);
  }

  function flushPending(): void {
    for (const [path, pending] of pendingInput) {
      clearTimeout(pending.timer);
      emit({ t: pending.t, type: 'input', path, count: pending.count });
    }
    pendingInput.clear();
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
  }

  return {
    start() {
      if (active) return;
      active = true;
      attachListeners();
    },

    stop() {
      if (!active) return;
      active = false;
      flushPending();
      detachListeners();
    },

    destroy() {
      if (active) {
        active = false;
        flushPending();
        detachListeners();
      }
    },
  };
}

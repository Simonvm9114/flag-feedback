import type { FeedbackCategory, ElementTarget, InteractionEvent } from '../config/types';
import type { SessionMode } from '../session/session';

export type DraftData = {
  mode: SessionMode;
  comment: string;
  category: FeedbackCategory | null;
  elementTargets: ElementTarget[];
  interactions: InteractionEvent[];
  recordingStart: number | null;
};

export type PersistenceController = {
  save(draft: DraftData): void;
  load(): DraftData | null;
  clear(): void;
};

function storageKey(sessionKey?: string): string {
  return sessionKey ? `flag-feedback:draft:${sessionKey}` : 'flag-feedback:draft';
}

export function createPersistence(sessionKey?: string): PersistenceController {
  const key = storageKey(sessionKey);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    save(draft: DraftData): void {
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        try {
          sessionStorage.setItem(key, JSON.stringify(draft));
        } catch {
          console.warn('flag-feedback: draft save failed; draft not persisted');
        }
      }, 300);
    },

    load(): DraftData | null {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return null;
        return parsed as DraftData;
      } catch {
        return null;
      }
    },

    clear(): void {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Storage unavailable — draft already absent from memory, nothing to do.
      }
    },
  };
}

import type {
  FeedbackCategory,
  FeedbackSession,
  ElementTarget,
  InteractionEvent,
} from '../config/types';

export type SessionMode = 'idle' | 'panel' | 'targeting' | 'recording' | 'submitting';

export type Session = {
  getMode(): SessionMode;
  getSnapshot(): FeedbackSession;
  openPanel(): void;
  closePanel(): void;
  setComment(text: string): void;
  setCategory(category: FeedbackCategory | null): void;
  enterTargeting(): void;
  exitTargeting(): void;
  addElementTarget(target: ElementTarget): void;
  removeElementTarget(index: number): void;
  enterRecording(): void;
  exitRecording(): void;
  appendInteraction(event: InteractionEvent): void;
  discardRecording(): void;
  reset(): void;
  /** Restores all fields directly, bypassing state-machine guards. Used by the persistence layer on init. */
  restoreFrom(draft: {
    mode: SessionMode;
    comment: string;
    category: FeedbackCategory | null;
    elementTargets: ElementTarget[];
    interactions: InteractionEvent[];
    recordingStart: number | null;
  }): void;
};

export function createSession(): Session {
  let mode: SessionMode = 'idle';
  let comment = '';
  let category: FeedbackCategory | null = null;
  let elementTargets: ElementTarget[] = [];
  let interactions: InteractionEvent[] = [];
  let recordingStart: number | null = null;

  return {
    getMode: () => mode,
    getSnapshot: () => ({
      comment,
      category,
      elementTargets: [...elementTargets],
      interactions: [...interactions],
      recordingStart,
    }),
    openPanel() {
      if (mode === 'idle') mode = 'panel';
    },
    closePanel() {
      if (mode === 'panel') mode = 'idle';
    },
    setComment(text) {
      comment = text;
    },
    setCategory(cat) {
      category = cat;
    },
    enterTargeting() {
      if (mode === 'panel') mode = 'targeting';
    },
    exitTargeting() {
      if (mode === 'targeting') mode = 'panel';
    },
    addElementTarget(target) {
      elementTargets = [...elementTargets, target];
    },
    removeElementTarget(index) {
      elementTargets = elementTargets.filter((_, i) => i !== index);
    },
    enterRecording() {
      if (mode === 'panel') {
        mode = 'recording';
        recordingStart = Date.now();
      }
    },
    exitRecording() {
      if (mode === 'recording') mode = 'panel';
    },
    appendInteraction(event) {
      const last = interactions[interactions.length - 1];
      if (last && last.type === event.type && last.path === event.path) {
        last.t = event.t;
        last.count += 1;
      } else {
        interactions.push(event);
      }
    },
    discardRecording() {
      interactions = [];
      recordingStart = null;
    },
    reset() {
      mode = 'idle';
      comment = '';
      category = null;
      elementTargets = [];
      interactions = [];
      recordingStart = null;
    },
    restoreFrom(draft) {
      mode = draft.mode;
      comment = draft.comment;
      category = draft.category;
      elementTargets = [...draft.elementTargets];
      interactions = [...draft.interactions];
      recordingStart = draft.recordingStart;
    },
  };
}

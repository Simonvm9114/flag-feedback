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
  reset(): void;
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
    reset() {
      mode = 'idle';
      comment = '';
      category = null;
      elementTargets = [];
      interactions = [];
      recordingStart = null;
    },
  };
}

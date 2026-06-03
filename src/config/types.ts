/** Configuration for `initFeedback`. */
export type InitFeedbackConfig = {
  activator: HTMLElement;
  endpoint: string;
  appId?: string;
  gitCommit?: string;
  gitRepo?: string;
  sessionKey?: string;
};

/** Widget instance returned by `initFeedback`. */
export type WidgetInstance = {
  destroy(): void;
};

/** Feedback category values in the submission payload. */
export type FeedbackCategory = 'design-request' | 'feature-request' | 'bug-fix';

/** A deliberately targeted element with a user comment. */
export type ElementTarget = {
  path: string;
  comment: string;
};

/** One interaction log entry from recording mode. */
export type InteractionEvent = {
  t: number;
  type: string;
  path?: string;
  positionPct?: number;
  count: number;
  message?: string;
};

/** In-memory session snapshot used when assembling the feedback package. */
export type FeedbackSession = {
  comment: string;
  category: FeedbackCategory | null;
  elementTargets: ElementTarget[];
  interactions: InteractionEvent[];
  recordingStart: number | null;
};

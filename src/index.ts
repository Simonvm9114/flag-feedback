/** Configuration for `initFeedback`. */
export type InitFeedbackConfig = {
  activator: HTMLElement;
  endpoint: string;
  appId?: string;
  gitCommit?: string;
  gitRepo?: string;
};

/** Widget instance returned by `initFeedback`. */
export type WidgetInstance = {
  destroy(): void;
};

/** Scaffold stub — implementation added in Phase 6. */
export function initFeedback(config: InitFeedbackConfig): WidgetInstance {
  void config;
  return {
    destroy() {},
  };
}

import type { FeedbackSession, InitFeedbackConfig } from '../config/types';

/** Top-level feedback package shape posted to the configured endpoint. */
export type FeedbackPackage = {
  id: string;
  timestamp: string;
  app: Record<string, string | null>;
  device: {
    userAgent: string;
    viewport: { w: number; h: number };
    pixelRatio: number;
  };
  feedback: {
    text: string;
    category: string;
  };
  elementTargets: FeedbackSession['elementTargets'];
  interactions: FeedbackSession['interactions'];
  recordingStart: number | null;
};

/** Builds the `app` object from init config and current page location. */
function buildAppMetadata(config: InitFeedbackConfig): Record<string, string | null> {
  const app: Record<string, string | null> = {
    url: window.location.href,
    route: `${window.location.pathname}${window.location.hash}`,
  };

  const hasAppId = config.appId !== undefined && config.appId !== '';
  const hasGitCommit = config.gitCommit !== undefined && config.gitCommit !== '';
  const hasGitRepo = config.gitRepo !== undefined && config.gitRepo !== '';

  if (!hasAppId && !hasGitCommit && !hasGitRepo) {
    app.id = null;
    app.gitCommit = null;
    app.gitRepo = null;
    return app;
  }

  if (hasAppId) {
    app.id = config.appId ?? null;
  }
  if (hasGitCommit) {
    app.gitCommit = config.gitCommit ?? null;
  }
  if (hasGitRepo) {
    app.gitRepo = config.gitRepo ?? null;
  }

  return app;
}

/** Assembles a schema-compliant feedback package from session state and init config. */
export function buildPackage(
  session: FeedbackSession,
  config: InitFeedbackConfig,
): FeedbackPackage {
  return {
    id: `fb_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    app: buildAppMetadata(config),
    device: {
      userAgent: navigator.userAgent,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      pixelRatio: window.devicePixelRatio,
    },
    feedback: {
      text: session.comment.slice(0, 10_000),
      category: session.category ?? '',
    },
    elementTargets: session.elementTargets,
    interactions: session.interactions,
    recordingStart: session.recordingStart,
  };
}

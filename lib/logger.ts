type LogContext = Record<string, unknown>;

/**
 * Small browser-safe logger abstraction. It keeps logging calls centralized so the
 * implementation can later be replaced with Sentry, Logtail, or Firebase Analytics.
 */
export const LOGGER = {
  info(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[Tattvam Niramaya Academy] ${message}`, context ?? {});
    }
  },
  error(message: string, context?: LogContext): void {
    console.error(`[Tattvam Niramaya Academy] ${message}`, context ?? {});
  }
};
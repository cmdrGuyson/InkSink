import * as Sentry from "@sentry/nextjs";

export interface LogContext {
  [key: string]: string | number | boolean | null | undefined | object;
}

class Logger {
  static debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
    Sentry.addBreadcrumb({
      message,
      level: "debug",
      data: { ...context },
    });
  }

  static info(message: string, context?: LogContext) {
    console.info(`[INFO] ${message}`, context || "");
    Sentry.addBreadcrumb({
      message,
      level: "info",
      data: { ...context },
    });
  }

  static warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || "");
    Sentry.addBreadcrumb({
      message,
      level: "warning",
      data: { ...context },
    });
  }

  static error(message: string, error?: Error | unknown, context?: LogContext) {
    // Normalize error to Error instance
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));

    console.error(`[ERROR] ${message}`, normalizedError, context || "");

    if (error) {
      Sentry.captureException(normalizedError, {
        data: { ...context },
      });
    } else {
      Sentry.addBreadcrumb({
        message,
        level: "error",
        data: { ...context },
      });
    }
  }
}

export default Logger;

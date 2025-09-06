import { useAuth } from "@/providers/auth.provider";
import * as Sentry from "@sentry/nextjs";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  [key: string]: string | number | boolean | null | undefined | object;
}

export const useLogger = () => {
  const { user } = useAuth();

  const logDebug = (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, context || "");
    }
    Sentry.addBreadcrumb({
      message,
      level: "debug",
      data: { ...context, userId: user?.id },
    });
  };

  const logInfo = (message: string, context?: LogContext) => {
    console.info(`[INFO] ${message}`, context || "");
    Sentry.addBreadcrumb({
      message,
      level: "info",
      data: { ...context, userId: user?.id },
    });
  };

  const logWarn = (message: string, context?: LogContext) => {
    console.warn(`[WARN] ${message}`, context || "");
    Sentry.addBreadcrumb({
      message,
      level: "warning",
      data: { ...context, userId: user?.id },
    });
  };

  const logError = (
    message: string,
    error?: Error | unknown,
    context?: LogContext
  ) => {
    // Normalize error to Error instance
    const normalizedError =
      error instanceof Error ? error : new Error(String(error));

    console.error(`[ERROR] ${message}`, normalizedError, context || "");

    if (error) {
      Sentry.captureException(normalizedError, {
        tags: { ...context, userId: user?.id },
        extra: { message, ...context },
      });
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        tags: { ...context, userId: user?.id },
        extra: context,
      });
    }
  };

  const logUserAction = (action: string, context?: LogContext) => {
    const logContext = { log_source: "user_action", action, ...context };
    logInfo(`User triggered ${action}`, logContext);
  };

  const logTest = (message: string, context?: LogContext) => {
    const logContext = { log_source: "sentry_test", ...context };
    logInfo(message, logContext);
  };

  return {
    logDebug,
    logInfo,
    logWarn,
    logError,
    logUserAction,
    logTest,
  };
};

import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "inksink" });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  }
}

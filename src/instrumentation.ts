import * as Sentry from "@sentry/nextjs";
import {
  SentrySpanProcessor,
  SentryPropagator,
  SentrySampler,
} from "@sentry/opentelemetry";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerOTel } from "@vercel/otel";

export function register() {
  // Initialize Sentry first with skipOpenTelemetrySetup
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const sentryClient = Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      skipOpenTelemetrySetup: true,
    });

    // Create custom OpenTelemetry setup with Sentry components
    const provider = new NodeTracerProvider({
      sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
      spanProcessors: [new SentrySpanProcessor()],
    });

    // Register the provider with Sentry components
    provider.register({
      propagator: new SentryPropagator(),
      contextManager: new Sentry.SentryContextManager(),
    });

    // Register Vercel OTel (it will use our already registered provider)
    registerOTel({
      serviceName: "inksink",
    });

    // Validate the OpenTelemetry setup
    Sentry.validateOpenTelemetrySetup();
  }
}

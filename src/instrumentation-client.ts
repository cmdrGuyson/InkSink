// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ff380df6555bd45ecc81302f490f25ba@o4509972108410880.ingest.us.sentry.io/4509972109262848",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({
      levels: ["log", "warn", "error", "info"],
    }),
  ],

  // Enable logs to be sent to Sentry
  enableLogs: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

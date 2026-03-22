/**
 * Sentry client-side initialization.
 * audit-14: Added missing client config (server + edge existed, client was absent).
 *
 * This file runs in the browser. Keep it lightweight . no Node.js imports.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0"),
  // Avoid capturing PII (e.g., form values, URLs with tokens)
  sendDefaultPii: false,
  // Ignore noisy browser extensions and script errors we can't control
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    /^Script error\.?$/,
  ],
});

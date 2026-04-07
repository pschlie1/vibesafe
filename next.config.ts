import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// CORS is handled at the route level via src/lib/cors.ts (CORS_HEADERS_API / CORS_HEADERS_PUBLIC).
// Route-level headers are more precise — /api/v1/** and /api/public/** use open CORS (*)
// for developer/CI access, while all other API routes remain restricted to the app origin.
// Do NOT add Access-Control-* headers here; they would conflict with route-level headers.

const nextConfig: NextConfig = {
  // Prevent Next.js / Turbopack from bundling Prisma's native query engine.
  // The `.so.node` binary must be required by Node.js at runtime . if it gets
  // bundled into a single JS file the native module loader can't find it and
  // every API route that imports `@prisma/client` returns HTTP 500.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],

  async headers() {
    return [
      {
        // These headers cover static file responses (/_next/static, /public assets).
        // Dynamic route responses also get these headers via middleware.ts applySecurityHeaders().
        // The duplication is intentional — Next.js config headers apply before middleware for static assets.
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Note: No Access-Control-* headers here. CORS is handled per-route via src/lib/cors.ts.
      // See comment at top of file.
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/.prisma/client/**/*"],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: false,
  sourcemaps: {
    disable: true,
  },
});

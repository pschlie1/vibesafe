import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Rate Limiting: How to Implement It and Why Skipping It Costs You | Scantient Blog",
  description:
    "API rate limiting prevents abuse, protects your infrastructure, and reduces costs. How to implement sliding window, token bucket, and fixed window rate limits . and what attackers do when you skip it.",
  keywords: "API rate limiting, how to implement rate limiting, API rate limit guide, rate limiting strategies, sliding window rate limit, protect API abuse",
  openGraph: {
    title: "API Rate Limiting: How to Implement It and Why Skipping It Costs You",
    description:
      "No rate limiting on your API = open season for brute force, scraping, and credential stuffing. Here's how to implement it properly and why it matters.",
    url: "https://scantient.com/blog/api-rate-limiting-guide",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2025-12-18T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Rate Limiting: How to Implement It and Why Skipping It Costs You",
    description:
      "Rate limiting is one of the most impactful API security controls. How to implement it . and why skipping it is expensive.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "API Rate Limiting: How to Implement It and Why Skipping It Costs You",
  description:
    "API rate limiting prevents abuse, protects your infrastructure, and reduces costs. How to implement sliding window, token bucket, and fixed window rate limits . and what attackers do when you skip it.",
  datePublished: "2025-12-18T00:00:00Z",
  dateModified: "2025-12-18T00:00:00Z",
  author: { "@type": "Person", "name": "Peter Schliesmann", "url": "https://scantient.com/about", "jobTitle": "Founder", "sameAs": ["https://www.linkedin.com/in/peterschliesmann"] },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/api-rate-limiting-guide",
  mainEntityOfPage: "https://scantient.com/blog/api-rate-limiting-guide",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".article-lede"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://scantient.com" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://scantient.com/blog" },
    {
      "@type": "ListItem",
      position: 3,
      name: "API Rate Limiting: How to Implement It and Why Skipping It Costs You",
      item: "https://scantient.com/blog/api-rate-limiting-guide",
    },
  ],
};

export default function ApiRateLimitingGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is API rate limiting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "API rate limiting controls how many requests a client can make in a given time window. It protects your API from abuse, prevents denial-of-service attacks, and ensures fair resource allocation across all users."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if an API has no rate limiting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Without rate limiting, a single client can send unlimited requests and exhaust your server resources, cause outages for other users, or scrape your entire dataset. Rate limiting is a baseline security and reliability requirement."
      }
    },
    {
      "@type": "Question",
      "name": "How do I test if my API has proper rate limiting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scantient checks for rate limiting headers and behavior as part of its 20-point security scan. You can also test manually by sending rapid requests and verifying that 429 responses are returned after the threshold is hit."
      }
    }
  ]
}) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Link
              href="/blog"
              className="text-sm text-dusty-denim-600 hover:text-prussian-blue-600 transition-colors"
            >
              ← Blog
            </Link>
            <span className="text-sm text-dusty-denim-400">/</span>
            <span className="rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error border border-error/20">
              API Security
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            API Rate Limiting: How to Implement It and Why Skipping It Costs You
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400 article-lede">
            APIs without rate limiting are open doors for brute force attacks, credential stuffing,
            expensive scraping, and denial-of-service. It&apos;s one of the OWASP API Top 10 for a
            reason . and one of the easiest controls to implement correctly.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2025-12-18">December 18, 2025</time>
            <span>·</span>
            <span>8 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            Rate limiting is OWASP API Security Top 10 item #4: Unrestricted Resource and Rate
            Limiting. It appears on the list because APIs without rate limits are routinely abused
            in ways that cost money, degrade performance, and enable downstream attacks. Despite
            being well-understood, a significant percentage of APIs in production have no rate
            limiting on critical endpoints.
          </p>
          <p>
            This guide explains what rate limiting is, the strategies for implementing it, what
            attackers do when it&apos;s absent, and the practical implementation for the most common
            API frameworks. For a broader look at the API security landscape,{" "}
            <Link href="/blog/api-security-complete-guide" className="text-prussian-blue-600 hover:underline">
              the complete API security guide
            </Link>{" "}
            covers the full set of controls.
          </p>

          <h2>What Rate Limiting Is (And What It Isn&apos;t)</h2>
          <p>
            Rate limiting controls how many requests a client can make to your API within a
            defined time window. A rate limit of 100 requests per minute means that after the
            100th request in any 60-second window, subsequent requests receive a <code>429 Too Many Requests</code>
            response until the window resets.
          </p>
          <p>
            Rate limiting is different from:
          </p>
          <ul>
            <li>
              <strong>Authentication</strong> . Rate limiting doesn&apos;t verify who the requester is.
              It limits frequency regardless of identity.
            </li>
            <li>
              <strong>Authorization</strong> . Rate limiting doesn&apos;t control what a requester can
              access. It controls how often they can access it.
            </li>
            <li>
              <strong>Throttling</strong> . Throttling typically slows responses rather than
              rejecting them. Rate limiting returns an error response.
            </li>
          </ul>
          <p>
            The client identifier for rate limiting is usually IP address (for unauthenticated
            endpoints) or API key / user ID (for authenticated endpoints). Using both in combination
            . per-IP and per-user . provides the best coverage.
          </p>

          <h2>What Attackers Do Without Rate Limiting</h2>
          <p>
            Understanding the threat model makes the control easier to justify and correctly scope.
          </p>

          <h3>Credential stuffing on auth endpoints</h3>
          <p>
            Credential stuffing is the automated testing of username/password combinations from
            breached credential lists against your login endpoint. Tools like Snipr can test
            millions of combinations per hour against unprotected endpoints. Without rate limiting
            on <code>/api/auth/login</code> or <code>/api/users/login</code>, attackers can
            trivially attempt a large fraction of your user base&apos;s credentials.
          </p>
          <p>
            Even with strong hashed passwords, credential stuffing works because many users
            reuse passwords from other services that have been breached. Rate limiting doesn&apos;t
            need to be aggressive . 5 failed attempts per IP per minute is enough to make
            automated stuffing impractical.
          </p>

          <h3>Enumeration and scraping</h3>
          <p>
            Without rate limiting, competitors and data aggregators can systematically scrape
            your entire product catalog, user directory, or pricing data in minutes. If your API
            has endpoints like <code>/api/products/{`{id}`}</code> or <code>/api/users/{`{id}`}</code>,
            a bot can iterate through IDs and collect every record you have.
          </p>
          <p>
            Rate limiting adds friction that makes bulk scraping economically unattractive .
            especially when combined with API key authentication requirements.
          </p>

          <h3>Resource exhaustion and cost amplification</h3>
          <p>
            Expensive operations (AI inference, PDF generation, email sending, database-heavy
            queries) have a per-request cost. Without rate limiting, a single malicious actor .
            or a buggy client in an infinite loop . can generate thousands of expensive requests,
            driving up your infrastructure and third-party API costs. This is especially relevant
            for{" "}
            <Link href="/blog/7-api-security-mistakes" className="text-prussian-blue-600 hover:underline">
              common API security mistakes
            </Link>{" "}
            in AI-integrated applications.
          </p>

          {/* Inline CTA */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Is rate limiting actually enforced on your live API?
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Configuration and reality often diverge. Scantient tests your live endpoints to
              verify rate limiting is in effect . not just in code. Free scan, no signup.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

          <h2>Rate Limiting Strategies</h2>
          <p>
            There are three main algorithms. Each has tradeoffs around burstiness, accuracy, and
            implementation complexity.
          </p>

          <h3>Fixed Window</h3>
          <p>
            The simplest approach: count requests in fixed time buckets (e.g., every 60 seconds).
            When the count exceeds the limit, reject requests until the window resets.
          </p>
          <p>
            <strong>Pros:</strong> Simple to implement, predictable reset time for clients.
          </p>
          <p>
            <strong>Cons:</strong> Vulnerable to burst attacks. A client can make 100 requests at
            the end of one window and 100 more at the start of the next . 200 requests in two
            seconds against a &quot;100 requests per minute&quot; limit.
          </p>

          <h3>Sliding Window</h3>
          <p>
            Counts requests in a rolling window rather than fixed buckets. Each request is stamped
            with its timestamp; the rate limiter counts requests in the last N seconds.
          </p>
          <p>
            <strong>Pros:</strong> Eliminates the boundary burst problem. More accurate rate
            enforcement.
          </p>
          <p>
            <strong>Cons:</strong> More storage required (must track individual request timestamps).
            Slightly more complex to implement.
          </p>
          <p>
            Sliding window is the recommended approach for most APIs. Redis sorted sets make
            it straightforward to implement at scale.
          </p>

          <h3>Token Bucket</h3>
          <p>
            Each client has a &quot;bucket&quot; of tokens. Each request consumes one token. Tokens refill
            at a constant rate. When the bucket is empty, requests are rejected.
          </p>
          <p>
            <strong>Pros:</strong> Allows controlled bursting (clients can accumulate tokens
            during quiet periods and use them in bursts). Good for APIs where bursting is
            legitimate.
          </p>
          <p>
            <strong>Cons:</strong> More complex state to maintain. Bursting may be undesirable
            for some endpoints.
          </p>
          <p>
            Token bucket is well-suited for APIs where you want to allow short bursts (e.g., a
            user rapidly paging through results) while still enforcing sustained limits.
          </p>

          <h2>Implementation Examples</h2>

          <h3>Next.js API Routes (with Upstash Redis)</h3>
          <p>
            Upstash provides a serverless Redis-compatible store with a rate-limiting SDK designed
            for edge and serverless environments:
          </p>
          <pre><code>{`import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Handle the request
}`}</code></pre>

          <h3>Express.js (with express-rate-limit)</h3>
          <pre><code>{`const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 min per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
  // For distributed systems, use Redis store:
  // store: new RedisStore({ ... })
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/reset-password', authLimiter);`}</code></pre>

          <h2>Applying Different Limits by Endpoint</h2>
          <p>
            Not all endpoints deserve the same rate limit. A blanket 100 requests/minute applied
            globally will be too strict for some endpoints and too lenient for others. Apply limits
            based on the risk profile of each endpoint type:
          </p>

          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-ink-black-950 dark:text-alabaster-grey-50">Endpoint type</th>
                  <th className="text-left py-2 pr-4 font-semibold text-ink-black-950 dark:text-alabaster-grey-50">Suggested limit</th>
                  <th className="text-left py-2 font-semibold text-ink-black-950 dark:text-alabaster-grey-50">Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">Auth (login, register)</td>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">5–10 / 15 min per IP</td>
                  <td className="py-2 text-dusty-denim-700 dark:text-dusty-denim-300">Prevent brute force / stuffing</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">Password reset</td>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">3 / hour per IP</td>
                  <td className="py-2 text-dusty-denim-700 dark:text-dusty-denim-300">Prevent email bombing</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">AI / expensive compute</td>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">10–20 / min per user</td>
                  <td className="py-2 text-dusty-denim-700 dark:text-dusty-denim-300">Control compute cost</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">Read endpoints (data)</td>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">100–500 / min per user</td>
                  <td className="py-2 text-dusty-denim-700 dark:text-dusty-denim-300">Allow legitimate use, limit scraping</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">Write endpoints (mutations)</td>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">30–60 / min per user</td>
                  <td className="py-2 text-dusty-denim-700 dark:text-dusty-denim-300">Prevent spam, limit data writes</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">Webhooks / public</td>
                  <td className="py-2 pr-4 text-dusty-denim-700 dark:text-dusty-denim-300">60 / min per IP</td>
                  <td className="py-2 text-dusty-denim-700 dark:text-dusty-denim-300">Baseline protection</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>The 429 Response: Getting It Right</h2>
          <p>
            When you reject a request due to rate limiting, the response matters . both for
            legitimate clients that need to handle backoff correctly, and for your debugging
            experience.
          </p>
          <p>
            Always include these headers in 429 responses:
          </p>
          <ul>
            <li><code>Retry-After</code>: seconds until the client can retry</li>
            <li><code>X-RateLimit-Limit</code>: the limit that was exceeded</li>
            <li><code>X-RateLimit-Remaining</code>: requests remaining in current window (0)</li>
            <li><code>X-RateLimit-Reset</code>: Unix timestamp when the window resets</li>
          </ul>
          <p>
            Return a clear JSON body: <code>&#123;"error": "rate_limit_exceeded", "retryAfter": 45&#125;</code>.
            Never return an empty body on a 429 . it makes debugging miserable for API consumers.
          </p>

          <h2>Common Rate Limiting Mistakes</h2>
          <p>
            Even teams that implement rate limiting often get one of these wrong:
          </p>
          <ul>
            <li>
              <strong>Rate limiting by IP only on authenticated endpoints.</strong> IP-based
              limiting is trivially bypassed by rotating IPs. Authenticated endpoints should rate
              limit by user/API key identity, not IP.
            </li>
            <li>
              <strong>Skipping rate limiting on internal or &quot;admin&quot; endpoints.</strong>
              If an endpoint is accessible from the internet, it needs rate limiting . regardless
              of how few clients are supposed to use it.
            </li>
            <li>
              <strong>Setting limits in code but not verifying them in production.</strong>
              Rate limiting middleware can be accidentally disabled by a middleware ordering
              change, a deployment configuration issue, or a proxy stripping headers. Verify
              that rate limiting is actually enforced on your live endpoints . not just configured
              in code. See the{" "}
              <Link href="/blog/owasp-top-10-api-checklist" className="text-prussian-blue-600 hover:underline">
                OWASP API Top 10 checklist
              </Link>{" "}
              for what to verify at deployment.
            </li>
            <li>
              <strong>Using in-memory storage for distributed systems.</strong> In-memory rate
              limiting doesn&apos;t work across multiple instances or serverless function invocations.
              Use a shared store (Redis, Upstash, DynamoDB) for any distributed deployment.
            </li>
          </ul>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            Verify that rate limiting is actually enforced on your live endpoints . not just
            configured in code. External scan covers rate limiting, headers, CORS, and more.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/score"
              className="rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Run a free scan now →
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-prussian-blue-300 dark:border-prussian-blue-700 px-6 py-3 text-sm font-semibold text-prussian-blue-700 dark:text-prussian-blue-300 transition hover:bg-prussian-blue-100 dark:hover:bg-prussian-blue-900/40"
            >
              Get lifetime access for $79
            </Link>
          </div>
        </div>

        {/* Related */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-4">Related</h3>
          <div className="flex flex-col gap-3">
            <Link
              href="/blog/api-security-complete-guide"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              API Security: The Complete Guide for Developers (2026) →
            </Link>
            <Link
              href="/blog/7-api-security-mistakes"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              7 API Security Mistakes Killing Your Startup →
            </Link>
            <Link
              href="/blog/owasp-top-10-api-checklist"
              className="text-sm text-prussian-blue-600 hover:underline"
            >
              OWASP Top 10 for APIs: A Practical Checklist for 2026 →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

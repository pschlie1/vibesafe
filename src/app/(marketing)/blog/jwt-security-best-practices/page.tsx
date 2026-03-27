import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "JWT Security Best Practices: 8 Mistakes That Expose Your API | Scantient Blog",
  description:
    "JSON Web Token vulnerabilities that developers miss. Eight JWT security mistakes . weak algorithms, no expiry, secrets in payloads, the none algorithm bypass . with practical fixes for each.",
  keywords: "JWT security, JSON web token vulnerabilities, JWT authentication security, JWT best practices, JWT security mistakes",
  openGraph: {
    title: "JWT Security Best Practices: 8 Mistakes That Expose Your API",
    description:
      "The eight most common JWT security mistakes . weak algorithms, missing expiry, secrets in payloads, the none algorithm bypass . and how to fix each one.",
    url: "https://scantient.com/blog/jwt-security-best-practices",
    siteName: "Scantient",
    type: "article",
    publishedTime: "2026-03-18T00:00:00Z",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Security Best Practices: 8 Mistakes That Expose Your API",
    description:
      "JWT vulnerabilities developers actually make in production: the none algorithm bypass, weak secrets, no expiry, and more. With fixes.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "JWT Security Best Practices: 8 Mistakes That Expose Your API",
  description:
    "JSON Web Token vulnerabilities that developers miss. Eight JWT security mistakes with practical fixes for each.",
  datePublished: "2026-03-18T00:00:00Z",
  dateModified: "2026-03-21T00:00:00Z",
  author: { "@type": "Person", "name": "Peter Schliesmann", "url": "https://scantient.com/about", "jobTitle": "Founder", "sameAs": ["https://www.linkedin.com/in/peterschliesmann"] },
  publisher: {
    "@type": "Organization",
    name: "Scantient",
    url: "https://scantient.com",
  },
  url: "https://scantient.com/blog/jwt-security-best-practices",
  mainEntityOfPage: "https://scantient.com/blog/jwt-security-best-practices",
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
      name: "JWT Security Best Practices: 8 Mistakes That Expose Your API",
      item: "https://scantient.com/blog/jwt-security-best-practices",
    },
  ],
};

export default function JwtSecurityBestPracticesPage() {
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
      "name": "What are JWT security best practices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Always verify the JWT signature before trusting claims. Use strong algorithms (RS256 or ES256, not HS256 with weak secrets). Set short expiry times. Validate the algorithm in the header. Never store sensitive data in the payload. Implement token revocation for logout."
      }
    },
    {
      "@type": "Question",
      "name": "What is the algorithm confusion attack in JWT?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Algorithm confusion attacks exploit servers that accept the algorithm specified in the JWT header without validation. If a server expects RS256 but accepts HS256, an attacker can forge tokens using the public key as the HMAC secret. Always specify and enforce the expected algorithm server-side."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check if my JWT implementation is secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Test that your API rejects tokens with modified algorithms, expired tokens, invalid signatures, and missing claims. Scantient checks for common JWT implementation issues in its API security scan."
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
              Authentication
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-black-950 dark:text-alabaster-grey-50 sm:text-4xl">
            JWT Security Best Practices: 8 Mistakes That Expose Your API
          </h1>
          <p className="mt-4 text-lg text-dusty-denim-700 dark:text-dusty-denim-400">
            JWTs are everywhere . and so are JWT vulnerabilities. Most of these mistakes are
            invisible in code review and only exploitable at runtime. Here&apos;s what to avoid, and
            what to do instead.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-dusty-denim-500">
            <time dateTime="2026-03-18">March 18, 2026</time>
            <span>·</span>
            <span>9 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <p>
            JSON Web Tokens are the dominant authentication mechanism for modern APIs. Libraries
            like <code>jsonwebtoken</code>, <code>jose</code>, and <code>next-auth</code> make them
            trivially easy to implement. Which is exactly the problem . it&apos;s easy to implement
            JWT auth in a way that looks correct but is fundamentally broken from a security
            standpoint.
          </p>
          <p>
            These eight JWT security mistakes are the ones we see most often in startup-scale
            production APIs. Some are well-known. A few are subtle enough to catch experienced
            developers off guard.
          </p>

          <h2>Mistake 1: Accepting the <code>none</code> Algorithm</h2>
          <p>
            This is the most dangerous JWT vulnerability, and it&apos;s been in the wild since JWT was
            standardized. The JWT spec allows an algorithm value of <code>none</code>, meaning no
            signature is required. Some JWT libraries honor this by default.
          </p>
          <p>
            An attacker can take any valid JWT, change the payload to claim admin privileges, set{" "}
            <code>alg: none</code>, strip the signature, and submit it. If your library accepts it,
            the attacker now has admin access.
          </p>
          <p>
            <strong>Fix:</strong> Explicitly specify the allowed algorithm(s) in your JWT
            verification configuration. Never accept <code>none</code>. In{" "}
            <code>jsonwebtoken</code>: pass <code>{"{ algorithms: ['RS256'] }"}</code> to{" "}
            <code>jwt.verify()</code>. In <code>jose</code>: the algorithm is explicit in the
            verification function signature.
          </p>

          <h2>Mistake 2: Using a Weak Signing Secret</h2>
          <p>
            If you&apos;re using HMAC-based JWT (HS256, HS384, HS512), your security is entirely
            dependent on the strength of your signing secret. A short, guessable, or reused secret
            can be cracked offline if an attacker captures a valid JWT.
          </p>
          <p>
            Common bad secrets: <code>secret</code>, <code>password</code>,{" "}
            <code>jwt_secret</code>, app names, 8-character strings, and anything you typed quickly
            during initial setup. We&apos;ve seen production apps using <code>test123</code> as their
            JWT secret.
          </p>
          <p>
            <strong>Fix:</strong> Generate a cryptographically random secret of at least 256 bits
            (32 bytes). In Node.js: <code>crypto.randomBytes(32).toString(&apos;hex&apos;)</code>. Store
            it in an environment variable, never in code. For new apps, prefer RS256 (asymmetric)
            over HS256 . the private key stays on your server and can&apos;t be brute-forced from a
            captured token.
          </p>

          <h2>Mistake 3: No Token Expiry</h2>
          <p>
            A JWT with no <code>exp</code> claim is valid forever. If it&apos;s ever stolen . through
            XSS, log scraping, an insecure third-party service . there&apos;s no automatic expiry to
            limit the damage. The stolen token grants access indefinitely.
          </p>
          <p>
            <strong>Fix:</strong> Always set an <code>exp</code> claim. Access tokens should expire
            in 15–60 minutes. Use refresh tokens (stored in httpOnly cookies, not localStorage)
            for session persistence. The short expiry window limits the blast radius of any token
            compromise.
          </p>

          <h2>Mistake 4: Storing Sensitive Data in the Payload</h2>
          <p>
            The JWT payload is base64-encoded, not encrypted. Anyone who has your token can decode
            it and read the payload . no secret needed. This is by design: JWTs are signed (for
            integrity), not encrypted (for confidentiality).
          </p>
          <p>
            We&apos;ve seen JWTs containing plaintext passwords, API keys, credit card numbers, full
            user objects with PII, and internal system identifiers that help attackers enumerate
            resources. All of this was visible to anyone who captured the token.
          </p>
          <p>
            <strong>Fix:</strong> Only put non-sensitive identifiers in the JWT payload: user ID,
            role, session ID. If you need to pass sensitive data with authentication context, use
            server-side sessions with a session ID in the JWT, or use JWE (JSON Web Encryption)
            for the rare cases where payload encryption is genuinely necessary.
          </p>

          <h2>Mistake 5: Not Validating the Token Signature at All</h2>
          <p>
            This sounds like something that couldn&apos;t happen, but it does . particularly when
            developers implement JWT handling manually, use the wrong library method, or decode a
            token for payload inspection and forget to also verify it.
          </p>
          <p>
            The pattern looks like: <code>const payload = jwt.decode(token)</code> instead of{" "}
            <code>const payload = jwt.verify(token, secret)</code>. The{" "}
            <code>decode()</code> method in most JWT libraries does not verify the signature . it
            just reads the payload. An attacker can forge any payload they want.
          </p>
          <p>
            <strong>Fix:</strong> Always use <code>verify()</code>, never{" "}
            <code>decode()</code>, for tokens that control authorization. If you need to inspect a
            token before verifying (e.g., to extract the key ID for RS256), verify immediately
            after. Make signature verification part of your middleware, not an afterthought.
          </p>

          <h2>Mistake 6: Algorithm Confusion (RS256 → HS256 Downgrade)</h2>
          <p>
            This is a subtle but devastating attack. When using RS256, you sign with a private key
            and verify with the public key. If your JWT library accepts both RS256 and HS256, an
            attacker can take your public key (which is, by definition, public) and use it as the
            secret to create a valid HS256-signed token.
          </p>
          <p>
            Your library thinks it&apos;s verifying an HS256 token with the (known) public key as the
            secret . and it succeeds. The attacker has created a validly-signed token without
            knowing your private key.
          </p>
          <p>
            <strong>Fix:</strong> Explicitly specify allowed algorithms in your verify call. Never
            allow both RS256 and HS256 for the same token type. If you use RS256, reject HS256
            entirely.
          </p>

          <h2>Mistake 7: Storing JWTs in localStorage</h2>
          <p>
            JWTs stored in <code>localStorage</code> are accessible to any JavaScript running on
            your page . including injected scripts from XSS vulnerabilities. This makes{" "}
            <code>localStorage</code> token storage incompatible with Content Security Policy and
            creates a standing risk: if you ever have a single XSS vulnerability anywhere in your
            app, every user&apos;s tokens are exposed.
          </p>
          <p>
            <strong>Fix:</strong> Store JWTs in <code>httpOnly</code> cookies. These are inaccessible
            to JavaScript entirely and are automatically sent with requests. Pair with{" "}
            <code>Secure</code> (HTTPS only) and <code>SameSite=Strict</code> or{" "}
            <code>SameSite=Lax</code> to prevent CSRF. The combination of httpOnly + Secure +
            SameSite is significantly more robust than localStorage for token storage.
          </p>

          <h2>Mistake 8: No Token Revocation Strategy</h2>
          <p>
            Pure stateless JWTs can&apos;t be revoked before they expire. If a user logs out, their
            token is still valid until the <code>exp</code> timestamp. If a token is stolen, there&apos;s
            no way to invalidate it. If an admin needs to immediately terminate a session (suspected
            account compromise, GDPR deletion request), there&apos;s no mechanism to do so.
          </p>
          <p>
            This is an inherent trade-off in stateless auth. Most startups accept it by keeping
            expiry times short. But for any app handling sensitive data, you need a revocation
            strategy.
          </p>
          <p>
            <strong>Fix:</strong> Implement a token blocklist (Redis is ideal . fast lookups,
            automatic TTL-based cleanup) or use short-lived tokens with a refresh token rotation
            scheme. On every request, check the blocklist against the token&apos;s JTI (JWT ID) claim.
            On logout or compromise, add the JTI to the blocklist until the token&apos;s natural expiry.
          </p>

          <h2>JWT Security Checklist</h2>
          <ul>
            <li>✅ <code>none</code> algorithm explicitly rejected in verify configuration</li>
            <li>✅ Signing secret is cryptographically random, ≥32 bytes, stored in env vars</li>
            <li>✅ <code>exp</code> claim set on all tokens; access tokens expire in &lt;60 minutes</li>
            <li>✅ No sensitive data (passwords, keys, PII) in JWT payload</li>
            <li>✅ <code>verify()</code> used everywhere . never <code>decode()</code> for auth decisions</li>
            <li>✅ Allowed algorithms explicitly specified . no algorithm confusion risk</li>
            <li>✅ Tokens stored in httpOnly Secure SameSite cookies, not localStorage</li>
            <li>✅ Revocation strategy: token blocklist or short-lived tokens + refresh rotation</li>
          </ul>

          {/* CTA block */}
          <div className="not-prose my-8 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-6 text-center">
            <p className="font-semibold text-ink-black-950 dark:text-alabaster-grey-50">
              Check your API for authentication and security issues
            </p>
            <p className="mt-1 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
              Free external scan . headers, CORS, SSL, exposed endpoints, API key exposure. 60 seconds.
            </p>
            <Link
              href="/score"
              className="mt-4 inline-block rounded-lg bg-prussian-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-prussian-blue-700"
            >
              Scan Your API Free →
            </Link>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-prussian-blue-200 dark:border-prussian-blue-800 bg-prussian-blue-50 dark:bg-prussian-blue-950/30 p-8 text-center">
          <h3 className="text-xl font-bold text-ink-black-950 dark:text-alabaster-grey-50">
            Scan Your API Free . 60 Seconds
          </h3>
          <p className="mt-2 text-sm text-dusty-denim-700 dark:text-dusty-denim-400">
            External security scan catches what code review misses. No signup. No SDK.
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

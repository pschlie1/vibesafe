import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Blog — Scantient",
  description:
    "Security insights, compliance guides, and practical advice for IT leaders managing AI-generated applications.",
};

const posts = [
  {
    slug: "/blog/api-security-complete-guide",
    category: "API Security",
    title: "API Security: The Complete Guide for Developers (2026)",
    excerpt:
      "The definitive guide to API security for indie devs and startup CTOs. Covers injection, broken auth, excessive data exposure, rate limiting, CORS, JWT best practices, testing tools, and a practical launch checklist.",
    date: "March 21, 2026",
    readTime: "18 min read",
    featured: true,
  },
  {
    slug: "/blog/what-is-external-security-scanning",
    category: "Security",
    title: "What Is External Security Scanning? (And Why Every Production API Needs It)",
    excerpt:
      "Code review finds bugs. Dependency scanners find CVEs. Neither can see what your live API looks like from the internet. External scanning can — and it reveals a completely different class of security problems.",
    date: "March 21, 2026",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug: "/blog/jwt-security-best-practices",
    category: "Authentication",
    title: "JWT Security Best Practices: 8 Mistakes That Expose Your API",
    excerpt:
      "The eight most common JWT security mistakes — the none algorithm bypass, weak secrets, no expiry, secrets in payloads, localStorage storage — with practical fixes for each one.",
    date: "March 21, 2026",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug: "/blog/prompt-injection-api-security",
    category: "AI Security",
    title: "Prompt Injection Attacks: How to Protect Your AI API (Developer Guide)",
    excerpt:
      "Prompt injection is the SQL injection of AI APIs. Direct injection, indirect injection, real attack consequences, and concrete defenses for every LLM-powered application.",
    date: "March 21, 2026",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "/blog/saas-launch-security-checklist",
    category: "Checklist",
    title: "SaaS Launch Security Checklist: 15 Things to Check Before Going Live",
    excerpt:
      "15 security items to verify before your SaaS launches — SSL, security headers, CORS, auth, rate limiting, exposed endpoints, secrets, and more. With a 60-second shortcut for the most common items.",
    date: "March 21, 2026",
    readTime: "11 min read",
    featured: false,
  },
  {
    slug: "/blog/securing-ai-app-api",
    category: "AI Security",
    title: "Securing Your AI App's API: What to Check Before Launch",
    excerpt:
      "API key exposure, rate limiting, input validation for LLM endpoints, prompt injection defense, data leakage, CORS — everything to audit on your AI app before launch day. Position Scantient as the tool that checks all of this in 60 seconds.",
    date: "March 21, 2026",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "/blog/post-deploy-security-checklist",
    category: "Checklist",
    title: "Your Deploy Just Went Live. Now Run This Security Checklist.",
    excerpt:
      "SSL, security headers, exposed endpoints, API keys, CORS, CSP, rate limits — the production security checklist every indie dev should run before tweeting their launch. Check all of it in 60 seconds.",
    date: "March 21, 2026",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "/blog/why-ctos-choose-external-security-scanning",
    category: "Strategy",
    title: "Why CTOs Choose External Security Scanning Over Code-Level Tools",
    excerpt:
      "Shift-left is necessary but not sufficient. External scanning catches what code analysis misses — here's the gap every startup CTO needs to close before launch.",
    date: "March 21, 2026",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "/blog/snyk-vs-scantient-what-your-startup-needs",
    category: "Comparisons",
    title: "Snyk vs Scantient: What Your Startup Actually Needs",
    excerpt:
      "An honest comparison — not marketing fluff. Snyk is enterprise shift-left dependency scanning. Scantient is post-deploy external API security monitoring. Here's when to use each, including a pricing table.",
    date: "March 21, 2026",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "/blog/gitguardian-vs-scantient",
    category: "Comparisons",
    title: "GitGuardian vs Scantient: Secrets Detection vs Full Security Posture",
    excerpt:
      "GitGuardian is the secrets scanning specialist. Scantient monitors your deployed app's full security posture. Honest comparison with pricing table — when to use each.",
    date: "March 21, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "/blog/indie-dev-security-checklist",
    category: "Checklist",
    title: "The Indie Dev Security Checklist: Ship Fast Without Getting Hacked",
    excerpt:
      "12 security items to check before launch. Each one: what to do, why attackers care, how to verify. Covers secrets, headers, CORS, auth, SSL, and more.",
    date: "March 21, 2026",
    readTime: "10 min read",
    featured: false,
  },
  {
    slug: "/blog/7-api-security-mistakes",
    category: "Security",
    title: "7 API Security Mistakes Killing Your Startup",
    excerpt:
      "Exposed API keys, missing security headers, overpermissive CORS — these seven mistakes are sitting in production apps right now. Real examples, what to do instead, and a startup security checklist.",
    date: "March 21, 2026",
    readTime: "9 min read",
    featured: false,
  },
  {
    slug: "/blog/owasp-top-10-api-checklist",
    category: "API Security",
    title: "OWASP Top 10 for APIs: A Practical Checklist for 2026",
    excerpt:
      "All 10 OWASP API Security risks with practical fixes — not just definitions. Which ones require code review, which ones you can check in 60 seconds, and how Scantient covers 7 of the 10 automatically.",
    date: "March 21, 2026",
    readTime: "12 min read",
    featured: false,
  },
  {
    slug: "/blog/security-headers-indie-devs",
    category: "Security",
    title: "5 Security Headers Every Indie Dev Should Set (And How to Check Them)",
    excerpt:
      "CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy — what each does, the one-liner to add it, and what attackers do when it's missing. Check all 5 in 60 seconds.",
    date: "March 21, 2026",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "/blog/ai-policy-compliance-engineering",
    category: "AI Compliance",
    title: "Your Engineering Team Probably Has No AI Usage Policy (And Why That's a Security Problem)",
    excerpt:
      "Most engineering teams use 10+ AI tools with zero formal policy. Shadow AI is a compliance time bomb — here's what your AI usage policy actually needs.",
    date: "March 2, 2026",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "/vibe-coding-risks",
    category: "Security",
    title: "The Hidden Security Risks of Vibe-Coded Applications",
    excerpt:
      "AI coding tools let anyone ship a production app in an afternoon. Here's what IT needs to know about the security gaps that come with them.",
    date: "February 20, 2026",
    readTime: "8 min read",
    featured: false,
  },
  {
    slug: "/compliance",
    category: "Compliance",
    title: "Continuous Compliance Monitoring for AI-Generated Applications",
    excerpt:
      "SOC 2, ISO 27001, NIST CSF: your compliance obligations don't have a carve-out for AI-generated code. Here's how to maintain coverage.",
    date: "February 14, 2026",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "/security-checklist",
    category: "Security",
    title: "The IT Director's Security Checklist for AI-Built Apps",
    excerpt:
      "A practical checklist for evaluating the security posture of every AI-generated application deployed in your organization.",
    date: "February 7, 2026",
    readTime: "5 min read",
    featured: false,
  },
];

const upcoming = [
  { title: "How to Build a Shadow AI App Inventory", category: "Operations" },
  { title: "CISO Briefing: Explaining AI App Risk to the Board", category: "Leadership" },
  { title: "Incident Response for Vibe-Coded Applications", category: "Security" },
];

export default function BlogPage() {
  const featured = posts[0]!;
  const rest = posts.slice(1);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">Blog</p>
        <h1 className="text-4xl font-bold tracking-tight">Security for the AI era</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">
          Practical guides for IT Directors and CISOs navigating the new world of AI-generated software.
        </p>

        {/* Featured post */}
        <div className="mt-12">
          <Link
            href={featured.slug}
            className="group block overflow-hidden rounded-2xl border border-border bg-surface-raised p-8 transition hover:border-border hover:bg-surface-raised sm:p-12"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-muted">
              {featured.category} · Featured
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight text-heading group-hover:text-heading sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{featured.excerpt}</p>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted">
              <span>{featured.date}</span>
              <span>·</span>
              <span>{featured.readTime}</span>
            </div>
          </Link>
        </div>

        {/* Rest of posts */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={post.slug}
              className="group block rounded-2xl border border-border p-6 transition hover:border-border hover:bg-surface-raised"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                {post.category}
              </span>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-heading group-hover:text-heading">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming soon */}
        <div className="mt-16">
          <h2 className="text-lg font-semibold text-heading">Coming soon</h2>
          <div className="mt-4 space-y-3">
            {upcoming.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-xl border border-dashed border-border px-5 py-4"
              >
                <div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted">
                    {item.category}
                  </span>
                  <p className="mt-0.5 text-sm font-medium text-muted">{item.title}</p>
                </div>
                <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-muted">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 rounded-2xl bg-surface-raised p-8 text-center">
          <h2 className="text-xl font-bold">Get new posts in your inbox</h2>
          <p className="mt-2 text-sm text-muted">
            Practical security and compliance insights for IT leaders. No fluff.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </div>

    </>
  );
}

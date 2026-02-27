import Link from "next/link";

const checks = [
  { icon: "🔑", title: "Exposed API Keys", desc: "Detects OpenAI, Stripe, Supabase, GitHub, and 8 more secret patterns leaked in client-side JavaScript." },
  { icon: "🛡️", title: "Missing Security Headers", desc: "CSP, HSTS, X-Frame-Options, Permissions-Policy, and CORS misconfiguration." },
  { icon: "🔓", title: "Auth Bypass Patterns", desc: "Client-side role checks, localStorage auth gates, and cookie-based authorization flaws." },
  { icon: "📜", title: "Inline Script Risks", desc: "Secrets in script tags, dangerouslySetInnerHTML XSS vectors, and unsafe eval patterns." },
  { icon: "⚙️", title: "Config & Meta Leaks", desc: "Source maps in production, dev mode indicators, and server technology disclosure." },
  { icon: "📊", title: "Uptime & Performance", desc: "Response time tracking, regression detection, and availability monitoring every 4 hours." },
];

const tiers = [
  {
    name: "Starter",
    price: "$199",
    period: "/month",
    desc: "For teams getting started with AI app governance",
    features: ["5 monitored apps", "2 team members", "4-hour scan intervals", "Email alerts", "Weekly governance report"],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$399",
    period: "/month",
    desc: "For IT teams managing a growing AI app portfolio",
    features: ["15 monitored apps", "5 team members", "4-hour scan intervals", "Email + Slack alerts", "Weekly governance report", "Remediation workflow", "API access", "Audit log"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$799",
    period: "/month",
    desc: "For organizations with compliance requirements",
    features: ["50 monitored apps", "Unlimited team members", "1-hour scan intervals", "All alert channels", "PDF compliance reports", "SSO/SAML", "Custom checks", "Dedicated support"],
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="font-bold">VibeSafe</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-black">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          73% of AI-generated apps have security vulnerabilities
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Your employees ship AI-built apps.
          <br />
          <span className="text-gray-400">You have zero visibility.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          VibeSafe continuously monitors the health and security of every AI-generated app in your
          organization. No SDK required. Built for IT leaders, not developers.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start 14-day free trial
          </Link>
          <Link
            href="#pricing"
            className="rounded-lg border px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-400">No credit card required · Setup in 2 minutes</p>
      </section>

      {/* Social proof */}
      <section className="border-y bg-gray-50 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-4 text-center text-sm text-gray-500">
          <div>
            <p className="text-2xl font-bold text-gray-900">73%</p>
            <p>of vibe-coded apps have vulnerabilities</p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div>
            <p className="text-2xl font-bold text-gray-900">170+</p>
            <p>Loveable apps breached in one CVE</p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div>
            <p className="text-2xl font-bold text-gray-900">$50K–$500K</p>
            <p>cost per undetected breach</p>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div>
            <p className="text-2xl font-bold text-gray-900">0 SDK</p>
            <p>instrumentation required</p>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-2 text-center text-3xl font-bold">What we monitor</h2>
        <p className="mb-12 text-center text-gray-500">
          Continuous external checks that catch what manual reviews miss
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {checks.map((check) => (
            <div key={check.title} className="rounded-xl border p-5">
              <span className="text-2xl">{check.icon}</span>
              <h3 className="mt-3 font-semibold">{check.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{check.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">How it works</h2>
          <div className="space-y-8">
            {[
              { step: "1", title: "Register your apps", desc: "Enter the URL of any AI-built app. No code changes, no SDK, no developer involvement required." },
              { step: "2", title: "We scan continuously", desc: "Every 4 hours, VibeSafe runs security and health checks from the outside — exactly like an attacker would." },
              { step: "3", title: "Get plain-language alerts", desc: "When something breaks or a vulnerability appears, you get an alert with a ready-to-paste AI fix prompt." },
              { step: "4", title: "Review your governance dashboard", desc: "Weekly compliance reports show every app's status, open findings, and remediation progress." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
        <h2 className="mb-2 text-center text-3xl font-bold">Simple, transparent pricing</h2>
        <p className="mb-12 text-center text-gray-500">
          One undetected breach costs $50K–$500K. VibeSafe pays for itself on day one.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 ${tier.highlighted ? "border-black ring-1 ring-black" : ""}`}
            >
              {tier.highlighted && (
                <span className="mb-3 inline-block rounded-full bg-black px-2.5 py-0.5 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold">{tier.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-gray-500">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{tier.desc}</p>
              <Link
                href="/signup"
                className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-medium transition ${
                  tier.highlighted
                    ? "bg-black text-white hover:bg-gray-800"
                    : "border text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tier.cta}
              </Link>
              <ul className="mt-6 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 text-green-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-black px-4 py-16 text-center text-white">
        <h2 className="text-3xl font-bold">Stop finding out about breaches from your CEO.</h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          Start monitoring your AI-built app portfolio in 2 minutes. No credit card required.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-100"
        >
          Start your free trial
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-gray-500">
          <p>© 2026 VibeSafe. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-gray-900">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

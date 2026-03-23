"use client";
import Link from "next/link";
import { useState } from "react";

const footerColumns = [
  {
    header: "Product",
    links: [
      { label: "Automated Scanning", href: "/#features" },
      { label: "Vulnerability Management", href: "/#features" },
      { label: "Developer Workflow", href: "/docs" },
      { label: "Compliance Reports", href: "/compliance" },
      { label: "Pricing", href: "/pricing" },
      { label: "API Reference", href: "/docs" },
    ],
  },
  {
    header: "Resources",
    links: [
      { label: "Free Security Score", href: "/score" },
      { label: "Security Checklist", href: "/security-checklist" },
      { label: "Vibe Coding Risks", href: "/vibe-coding-risks", badge: "New" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/help" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    header: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    header: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/pschlie1/scantient",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/scantient",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/scantient",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <footer
      style={{
        background: "radial-gradient(ellipse at 20% 80%, var(--color-hero-edge) 0%, var(--color-footer-bg) 60%, var(--color-footer-bg) 100%)",
      }}
    >
      {/* Main footer grid */}
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-12 py-24 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand block — 2/5 width on lg */}
          <div className="lg:col-span-2">
            {/* Logo + wordmark */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, var(--color-cta-green) 0%, var(--color-cta-green-dark) 100%)" }}
              >
                <span className="text-sm font-bold text-white">S</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Scantient</span>
            </div>

            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: "var(--color-footer-text-secondary)" }}>
              Securing the future of AI-generated code. External security scanning for apps built with Cursor, Lovable, Bolt, and Replit.
            </p>

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {["SOC 2 Type II", "GDPR Compliant"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold"
                  style={{ borderColor: "var(--color-footer-border)", color: "var(--color-footer-text-secondary)", background: "var(--color-footer-badge-bg)" }}
                >
                  🔒 {badge}
                </span>
              ))}
            </div>

            {/* Social icons */}
            <div className="mt-5 flex gap-3">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200"
                  style={{ borderColor: "var(--color-footer-border)", color: "var(--color-footer-text-secondary)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--color-cta-green)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-badge-new-border)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--color-footer-text-secondary)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-footer-border)";
                  }}
                >
                  {s.icon}
                </Link>
              ))}
            </div>

            {/* Email capture */}
            <div className="mt-8">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#22C55E]">
                AI Security Updates
              </p>
              {submitted ? (
                <p className="mt-2 text-sm text-[#22C55E]">You are on the list.</p>
              ) : (
                <>
                  <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-1 focus:ring-[#22C55E]"
                      style={{
                        background: "var(--color-footer-input-bg)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid var(--color-footer-input-border)",
                      }}
                    />
                    <button
                      type="submit"
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
                      style={{
                        background: "linear-gradient(135deg, var(--color-cta-green) 0%, var(--color-cta-green-dark) 100%)",
                        boxShadow: "0 0 12px rgba(34,197,94,0.35)",
                      }}
                    >
                      Join
                    </button>
                  </form>
                  <p className="mt-2 text-[11px]" style={{ color: "var(--color-footer-text-tertiary)" }}>
                    Join 5,000+ security engineers. No spam, ever.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Link columns — 2-col on mobile, 4-col on lg */}
          <div className="grid grid-cols-2 gap-8 sm:col-span-2 lg:col-span-3 lg:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.header}>
                <h4 className="mb-5 text-xs font-semibold uppercase tracking-widest text-white">
                  {col.header}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label} className="flex items-center gap-2">
                      <Link
                        href={link.href}
                        className="text-[0.8125rem] transition-colors duration-200 hover:text-white"
                        style={{ color: "var(--color-footer-text-secondary)" }}
                      >
                        {link.label}
                      </Link>
                      {"badge" in link && link.badge && (
                        <span
                          className="animate-pulse rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                          style={{
                            borderColor: "var(--color-badge-new-border)",
                            color: "var(--color-cta-green)",
                            background: "var(--color-badge-new-bg)",
                          }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--color-footer-border)" }}>
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
            <p className="text-xs" style={{ color: "var(--color-footer-text-tertiary)" }}>
              &copy; 2026 Scantient Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/status"
                className="flex items-center gap-1.5 text-xs transition-colors duration-200 hover:text-white"
                style={{ color: "var(--color-footer-text-secondary)" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                Status
              </Link>
              <Link
                href="/security-checklist"
                className="flex items-center gap-1 text-xs transition-colors duration-200 hover:text-white"
                style={{ color: "var(--color-footer-text-secondary)" }}
              >
                🔒 Security
              </Link>
              <Link
                href="/privacy"
                className="text-xs transition-colors duration-200 hover:text-white"
                style={{ color: "var(--color-footer-text-secondary)" }}
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

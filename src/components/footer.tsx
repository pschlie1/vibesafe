"use client";
import Link from "next/link";
import { useState } from "react";

const footerColumns = [
  {
    header: "Product",
    links: [
      { label: "Overview", href: "/#features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Compliance", href: "/compliance" },
      { label: "API Reference", href: "/docs" },
      { label: "Community", href: "/help" },
    ],
  },
  {
    header: "Resources",
    links: [
      { label: "Free Security Score", href: "/score" },
      { label: "Security Checklist", href: "/security-checklist" },
      { label: "Vibe Coding Risks", href: "/vibe-coding-risks", badge: "New" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    header: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    header: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/pschlie1/scantient",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com/scantient",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/scantient",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
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
    <footer className="bg-surface">
      {/* Top section */}
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-12 py-20 sm:grid-cols-2 lg:grid-cols-5">

          {/* Col 1 - Brand block (2/5 width on lg) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-raised">
                <span className="text-sm font-bold text-heading">S</span>
              </div>
              <span className="text-xl font-bold text-heading">Scantient</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Securing the future of AI-generated code. External security scanning for apps built with Cursor, Lovable, Bolt, and Replit.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex gap-4">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-muted transition-colors hover:text-[#3B82F6]"
                >
                  {s.icon}
                </Link>
              ))}
            </div>

            {/* Email capture */}
            <div className="mt-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#22C55E]">
                AI Security Updates
              </p>
              {submitted ? (
                <p className="text-sm text-[#22C55E]">You are on the list.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 min-w-0 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-heading placeholder:text-muted focus:border-[#3B82F6] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link columns — 2-col grid on mobile, 4 cols on lg */}
          <div className="grid grid-cols-2 gap-8 sm:col-span-2 lg:col-span-3 lg:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.header}>
                <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#22C55E]">
                  {col.header}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label} className="flex items-center gap-2">
                      <Link
                        href={link.href}
                        className="text-sm font-medium text-muted transition-colors hover:text-[#3B82F6]"
                      >
                        {link.label}
                      </Link>
                      {"badge" in link && link.badge && (
                        <span className="rounded bg-[#22C55E]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#22C55E]">
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
      <div className="border-t border-border-subtle">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
            <p className="text-sm text-muted">
              &copy; 2026 Scantient Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/status"
                className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-[#3B82F6]"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
                Status
              </Link>
              <Link
                href="/security-checklist"
                className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-[#3B82F6]"
              >
                <span>🔒</span> Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

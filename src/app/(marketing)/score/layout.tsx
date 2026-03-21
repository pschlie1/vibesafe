/**
 * Layout for the free security score page.
 *
 * audit-14: The score page itself is a "use client" component (needs hooks for
 * the interactive scan form), so it cannot export `metadata` directly. We add
 * this thin server-component layout to provide SEO metadata for the route.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does a scan take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most scans complete in under 60 seconds. We run 20 security checks in parallel against your live URL, so results are ready fast — no waiting, no queuing.",
      },
    },
    {
      "@type": "Question",
      name: "What does Scantient check?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scantient runs 20 external security checks including: exposed API keys, missing security headers (HSTS, CSP, X-Frame-Options), CORS misconfigurations, exposed admin/debug endpoints, SSL certificate validity, cookie security flags, mixed content, and more.",
      },
    },
    {
      "@type": "Question",
      name: "Is the free scan really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The one-time free scan requires no account, no credit card, and no signup. Just paste your URL and get results in 60 seconds. Continuous monitoring and historical reports require a paid plan.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to install anything?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Scantient is a 100% external scanner — no SDK, no npm package, no code changes required. We scan your app the same way an attacker would: from the outside, against your live URL.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Free API Security Scan — Check Your Site in 60 Seconds | Scantient",
  description:
    "Run a free API vulnerability scanner and security audit on your site in 60 seconds. No signup, no SDK — paste your URL and get instant results. Scantient checks 20 security controls.",
  openGraph: {
    title: "Free API Security Scan — Check Your Site in 60 Seconds | Scantient",
    description:
      "Free api vulnerability scanner. Paste your URL and get a full security audit api in 60 seconds — 20 checks, no signup, no installation required.",
    url: "https://scantient.com/score",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free API Security Scan — Check Your Site in 60 Seconds | Scantient",
    description:
      "Free api vulnerability scanner and security audit api. Paste your URL, get results in 60 seconds.",
  },
};

export default function ScoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

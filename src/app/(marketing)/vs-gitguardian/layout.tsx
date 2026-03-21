/**
 * vs-gitguardian page layout — provides metadata and JSON-LD schema for the /vs-gitguardian route.
 * The page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "GitGuardian vs Scantient: External Security Scanning for Indie Devs",
  description:
    "GitGuardian scans your git history. Scantient scans your deployed app. As a GitGuardian alternative for indie developers, Scantient covers runtime security that git-based scanning never sees.",
  openGraph: {
    title: "GitGuardian vs Scantient: External Security Scanning for Indie Devs",
    description:
      "GitGuardian alternative for indie devs. Scantient scans your live deployed app — not just your git history — for API keys, CORS issues, and runtime security gaps.",
    url: "https://scantient.com/vs-gitguardian",
    siteName: "Scantient",
    type: "website",
    images: [
      {
        url: "https://scantient.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitGuardian vs Scantient comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitGuardian vs Scantient: External Security Scanning for Indie Devs",
    description:
      "GitGuardian alternative. Scantient scans your deployed app for runtime security gaps — no git access needed.",
    images: ["https://scantient.com/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Scantient a GitGuardian alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scantient and GitGuardian protect different security surfaces. GitGuardian specializes in scanning git repositories for secrets — catching credentials accidentally committed to source control. Scantient monitors your deployed application from the outside, checking 20+ security categories including exposed secrets in JavaScript bundles, security headers, CORS policies, SSL certificates, and exposed debug endpoints. They're complementary tools, not direct substitutes.",
      },
    },
    {
      "@type": "Question",
      name: "What does Scantient find that GitGuardian misses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GitGuardian focuses on secrets in git history and source code. Scantient finds security issues in your running production app: HTTP security headers (CSP, HSTS, X-Frame-Options), CORS misconfiguration, SSL certificate expiry, exposed debug endpoints, secrets that appear in built JavaScript bundles (not in git but exposed at runtime), and third-party script integrity issues.",
      },
    },
    {
      "@type": "Question",
      name: "How does GitGuardian pricing compare to Scantient?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "GitGuardian's Team plan is priced per developer at approximately $29/developer/month — for a 5-person team that's $145+/month or $1,740/year. Scantient offers a $79 one-time lifetime deal for continuous monitoring with no per-seat fees. For solo developers and small startup teams, Scantient is dramatically more cost-effective.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a GitHub integration to use Scantient?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Scantient requires no GitHub integration, no repository access, and no code installation. You paste your deployed app URL and get security scan results in 60 seconds. This external scanning approach tests what real attackers see — your live application — not your source code.",
      },
    },
  ],
};

export default function VsGitGuardianLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        id="faq-schema-vs-gitguardian"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

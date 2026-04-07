/**
 * vs-snyk page layout . provides metadata and JSON-LD schema for the /vs-snyk route.
 * The page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Snyk vs Scantient: Post-Deploy Security Without Enterprise Pricing",
  description:
    "Looking for a Snyk alternative? Scantient covers what Snyk misses: runtime security, deployed app scanning, and API vulnerability detection. $79 lifetime vs Snyk's per-seat pricing.",
  openGraph: {
    title: "Snyk vs Scantient: Post-Deploy Security Without Enterprise Pricing",
    description:
      "Snyk alternative for startups. Scantient scans your deployed app for runtime security gaps Snyk never sees. No per-seat pricing, $79 lifetime.",
    url: "https://scantient.com/vs-snyk",
    siteName: "Scantient",
    type: "website",
    images: [
      {
        url: "https://scantient.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Snyk vs Scantient comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snyk vs Scantient: Post-Deploy Security Without Enterprise Pricing",
    description:
      "Snyk alternative without enterprise pricing. Scantient covers runtime and post-deploy API security for $79 lifetime.",
    images: ["https://scantient.com/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Scantient a Snyk alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scantient and Snyk solve complementary but different problems. Snyk focuses on dependency vulnerability scanning in your source code (shift-left). Scantient monitors your deployed application from the outside, checking security headers, CORS policies, exposed endpoints, SSL certificates, and secrets in JavaScript bundles. Most startups benefit from using both: Snyk in CI for dependency scanning, Scantient for continuous post-deploy monitoring.",
      },
    },
    {
      "@type": "Question",
      name: "What does Scantient check that Snyk doesn't?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scantient checks your live, deployed application for things Snyk can't see from source code: HTTP security headers (CSP, HSTS, X-Frame-Options), CORS policy enforcement, SSL certificate health and expiry, exposed debug endpoints like /.env or /api/admin, API keys visible in bundled JavaScript, and third-party script integrity. These runtime issues are invisible to static code analysis.",
      },
    },
    {
      "@type": "Question",
      name: "How does Scantient pricing compare to Snyk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Snyk's Team plan starts at roughly $400/month and scales per developer seat. Scantient offers a $79 one-time lifetime deal for continuous monitoring of one application, and a $399/month Pro plan for teams monitoring multiple apps with compliance reporting. For solo developers and small teams, Scantient is significantly more cost-effective.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to install an SDK to use Scantient?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Scantient is an external scanner. Paste your URL and get results in 60 seconds. No SDK installation, no CI/CD integration required, no code changes. External scanning tests what attackers see, not what's in your source code.",
      },
    },
  ],
};

export default function VsSnykLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        id="faq-schema-vs-snyk"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

/**
 * vs-checkmarx page layout — provides metadata and JSON-LD schema for the /vs-checkmarx route.
 * The page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Checkmarx vs Scantient: API Security Without the Complexity",
  description:
    "Need a Checkmarx alternative without the enterprise complexity? Scantient delivers external API security scanning in 60 seconds — no agent, no integration, no six-figure contract.",
  openGraph: {
    title: "Checkmarx vs Scantient: API Security Without the Complexity",
    description:
      "Checkmarx alternative for startups and indie devs. Scantient scans your live API and app for security vulnerabilities without enterprise setup or pricing.",
    url: "https://scantient.com/vs-checkmarx",
    siteName: "Scantient",
    type: "website",
    images: [
      {
        url: "https://scantient.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Checkmarx vs Scantient comparison",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkmarx vs Scantient: API Security Without the Complexity",
    description:
      "Checkmarx alternative. External API security scanning in 60 seconds — no enterprise contract, no complexity.",
    images: ["https://scantient.com/og-image.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Scantient a Checkmarx alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scantient and Checkmarx solve different security problems. Checkmarx is a SAST (Static Application Security Testing) tool that analyzes your source code for potential vulnerabilities before deployment. Scantient is an external security monitor that scans your deployed application from the outside, checking what attackers actually see: security headers, CORS policies, SSL certificates, exposed endpoints, and secrets in JavaScript bundles. They're complementary, not interchangeable.",
      },
    },
    {
      "@type": "Question",
      name: "What are the main differences between Checkmarx and Scantient?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Checkmarx requires source code access and integration into your CI/CD pipeline. Results take minutes to hours. It finds code-level vulnerabilities (SQL injection patterns, XSS sinks, etc.). Scantient requires only a URL. Results take 60 seconds. It finds runtime security issues: missing security headers, misconfigured CORS, expired SSL certificates, exposed debug endpoints, and secrets visible in deployed JavaScript. No SDK, no agent, no code changes.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Scantient cost compared to Checkmarx?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Checkmarx is an enterprise product with custom pricing, typically starting at $20,000+/year for enterprise deals. Scantient offers a $79 one-time lifetime deal for solo developers and small teams, and $399/month for Pro teams needing multi-app monitoring and compliance reports. For startups and SMBs, Scantient is accessible without an enterprise procurement process.",
      },
    },
    {
      "@type": "Question",
      name: "Does Scantient require installing any software or agents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Scantient is a fully external scanner. You provide your application's URL, and Scantient scans it from the outside — exactly as an attacker would. No agent installation, no IDE plugins, no CI/CD integration required. This makes setup take 2 minutes instead of days, and means zero impact on your development workflow.",
      },
    },
  ],
};

export default function VsCheckmarxLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        id="faq-schema-vs-checkmarx"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

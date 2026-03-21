/**
 * vs-checkmarx page layout — provides metadata for the /vs-checkmarx route.
 * The page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkmarx vs Scantient: API Security Without the Complexity",
    description:
      "Checkmarx alternative. External API security scanning in 60 seconds — no enterprise contract, no complexity.",
  },
};

export default function VsCheckmarxLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

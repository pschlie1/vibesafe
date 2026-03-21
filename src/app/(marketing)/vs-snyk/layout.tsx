/**
 * vs-snyk page layout — provides metadata for the /vs-snyk route.
 * The page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Snyk vs Scantient: Post-Deploy Security Without Enterprise Pricing",
  description:
    "Looking for a Snyk alternative? Scantient covers what Snyk misses — runtime security, deployed app scanning, and API vulnerability detection. $79 lifetime vs Snyk's per-seat pricing.",
  openGraph: {
    title: "Snyk vs Scantient: Post-Deploy Security Without Enterprise Pricing",
    description:
      "Snyk alternative for startups. Scantient scans your deployed app for runtime security gaps Snyk never sees — no per-seat pricing, $79 lifetime.",
    url: "https://scantient.com/vs-snyk",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snyk vs Scantient: Post-Deploy Security Without Enterprise Pricing",
    description:
      "Snyk alternative without enterprise pricing. Scantient covers runtime and post-deploy API security for $79 lifetime.",
  },
};

export default function VsSnykLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

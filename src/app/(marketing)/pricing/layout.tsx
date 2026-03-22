/**
 * Pricing page layout . provides metadata for the /pricing route.
 * The pricing page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scantient Pricing . API Security from $79 Lifetime | Free Scan Available",
  description:
    "Scantient pricing: start with a free scan, then get lifetime API security tools access for $79 one-time. No subscription. A Snyk alternative pricing model built for indie developers and startups.",
  openGraph: {
    title: "Scantient Pricing . API Security from $79 Lifetime | Free Scan Available",
    description:
      "API security tools starting at $79 lifetime. Snyk alternative pricing . no per-seat fees, no subscriptions. Free scan always available.",
    url: "https://scantient.com/pricing",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scantient Pricing . API Security from $79 Lifetime | Free Scan Available",
    description:
      "API security tools from $79 lifetime. Snyk alternative pricing for startups and indie developers.",
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

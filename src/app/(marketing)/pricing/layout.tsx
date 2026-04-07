/**
 * Pricing page layout . provides metadata for the /pricing route.
 * The pricing page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Scantient Pricing: Lifetime Deal, Startup $39/mo, Pro $399/mo | API Security",
  description:
    "Scantient pricing: $79 lifetime deal for indie devs, $39/mo Startup tier for growing teams, $399/mo Pro for compliance. All plans include 20 security checks. No SDK required.",
  openGraph: {
    title: "Scantient Pricing: Lifetime Deal, Startup $39/mo, Pro $399/mo | API Security",
    description:
      "API security monitoring from $39/mo. Lifetime deal at $79 one-time. Startup, Pro, and Enterprise plans with 20 security checks, automated scans, and Slack alerts.",
    url: "https://scantient.com/pricing",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scantient Pricing: Lifetime Deal, Startup $39/mo, Pro $399/mo | API Security",
    description:
      "API security monitoring from $39/mo. Lifetime deal at $79 one-time. 20 security checks, no SDK required.",
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

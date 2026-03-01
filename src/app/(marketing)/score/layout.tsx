/**
 * Layout for the free security score page.
 *
 * audit-14: The score page itself is a "use client" component (needs hooks for
 * the interactive scan form), so it cannot export `metadata` directly. We add
 * this thin server-component layout to provide SEO metadata for the route.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Security Score — Scantient",
  description:
    "Check your website's security score instantly. Get a grade, detailed findings, and actionable fixes — no account required.",
  openGraph: {
    title: "Free Security Score — Scantient",
    description: "Instant security scan for any website. See your grade and findings in seconds.",
    url: "https://scantient.com/score",
  },
};

export default function ScoreLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

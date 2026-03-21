import type { Metadata } from "next";
import MarketingNav from "@/components/marketing-nav";
import Footer from "@/components/footer";

/**
 * Marketing layout — also serves as the metadata source for the homepage (/)
 * since that page is a "use client" component and cannot export metadata directly.
 * All other marketing pages that need custom titles/descriptions define their own
 * layout.tsx or export metadata directly (server components like blog posts).
 */
export const metadata: Metadata = {
  title: "Scantient — Free API Security Scanner | Find Vulnerabilities in 60 Seconds",
  description:
    "Scantient is a free API security scanner and website security checker. Paste your URL and get a full security audit in 60 seconds — no signup, no SDK, no setup required.",
  openGraph: {
    title: "Scantient — Free API Security Scanner | Find Vulnerabilities in 60 Seconds",
    description:
      "Free api security scanner and website security checker. Paste your URL and get a full security audit in 60 seconds — no signup, no SDK, no setup required.",
    url: "https://scantient.com",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scantient — Free API Security Scanner | Find Vulnerabilities in 60 Seconds",
    description:
      "Free api security scanner and website security checker. Paste your URL and get a full security audit in 60 seconds.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <MarketingNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

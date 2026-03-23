import type { Metadata } from "next";
import MarketingNav from "@/components/marketing-nav";
import Footer from "@/components/footer";

/**
 * Marketing layout . also serves as the metadata source for the homepage (/)
 * since that page is a "use client" component and cannot export metadata directly.
 * All other marketing pages that need custom titles/descriptions define their own
 * layout.tsx or export metadata directly (server components like blog posts).
 */
export const metadata: Metadata = {
  title: "Security Scanner for AI-Built Apps | Scantient",
  description:
    "Built with Cursor, Lovable, or Bolt? Find exposed API keys, broken auth, and security holes in 60 seconds. No SDK. No setup.",
  openGraph: {
    title: "Security Scanner for AI-Built Apps | Scantient",
    description:
      "Built with Cursor, Lovable, or Bolt? Find exposed API keys, broken auth, and security holes in 60 seconds. No SDK. No setup.",
    url: "https://scantient.com",
    siteName: "Scantient",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Scanner for AI-Built Apps | Scantient",
    description:
      "Built with Cursor, Lovable, or Bolt? Find exposed API keys, broken auth, and security holes in 60 seconds. No SDK. No setup.",
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

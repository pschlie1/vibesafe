/**
 * vs-gitguardian page layout — provides metadata for the /vs-gitguardian route.
 * The page is a "use client" component, so metadata is defined here.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "GitGuardian vs Scantient: External Security Scanning for Indie Devs",
    description:
      "GitGuardian alternative. Scantient scans your deployed app for runtime security gaps — no git access needed.",
  },
};

export default function VsGitGuardianLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://scantient.com";
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${baseUrl}/`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/pricing`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/score`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/docs`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/compliance`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/security-checklist`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/vibe-coding-risks`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/for-msps`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/ai-policy-compliance`, changeFrequency: "monthly" as const, priority: 0.7 },
    // Competitor comparison pages (high SEO value)
    { url: `${baseUrl}/vs-gitguardian`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/vs-snyk`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/vs-checkmarx`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/vs-hostedscan`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/vs-aikido`, changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  // Blog posts
  const blogPosts = [
    "ai-policy-compliance-engineering",
    "7-api-security-mistakes",
    "snyk-vs-scantient-what-your-startup-needs",
    "why-ctos-choose-external-security-scanning",
    "indie-dev-security-checklist",
    "gitguardian-vs-scantient",
    "securing-ai-app-api",
    "post-deploy-security-checklist",
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: now,
  }));

  return [...staticPages, ...blogPosts];
}

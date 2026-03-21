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
    // AI Security landing page (greenfield SEO keyword)
    { url: `${baseUrl}/ai-security`, changeFrequency: "monthly" as const, priority: 0.9 },
  ];

  // Blog posts
  const blogPosts = [
    // Wave 1 pillar content
    "api-security-complete-guide",
    "what-is-external-security-scanning",
    "jwt-security-best-practices",
    "prompt-injection-api-security",
    "saas-launch-security-checklist",
    // Wave 2 pillar content
    "api-key-management-best-practices",
    "internal-vs-external-security-scanning",
    "soc2-api-security-requirements",
    "owasp-llm-top-10-api-builders",
    "oauth-security-vulnerabilities",
    // Wave 3 pillar content
    "security-tools-indie-hackers",
    "how-to-scan-production-api",
    "securing-openai-api-integration",
    "api-rate-limiting-guide",
    "devsecops-for-startups",
    // Existing posts
    "ai-policy-compliance-engineering",
    "7-api-security-mistakes",
    "snyk-vs-scantient-what-your-startup-needs",
    "why-ctos-choose-external-security-scanning",
    "indie-dev-security-checklist",
    "gitguardian-vs-scantient",
    "securing-ai-app-api",
    "post-deploy-security-checklist",
    "security-headers-indie-devs",
    "owasp-top-10-api-checklist",
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: now,
  }));

  return [...staticPages, ...blogPosts];
}

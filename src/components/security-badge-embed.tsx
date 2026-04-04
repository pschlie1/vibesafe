"use client";

import { useState } from "react";

interface SecurityBadgeEmbedProps {
  orgSlug: string;
  /** Current score (0–100). Used for live preview. */
  score: number;
}

type Format = "svg" | "markdown" | "html";

export function SecurityBadgeEmbed({ orgSlug, score }: SecurityBadgeEmbedProps) {
  const [copied, setCopied] = useState<Format | null>(null);

  const badgeUrl = `https://scantient.com/api/public/badge/${orgSlug}`;
  const scoreUrl = `https://scantient.com/score`;

  const snippets: Record<Format, string> = {
    svg: badgeUrl,
    markdown: `[![Scantient Security Score](${badgeUrl})](${scoreUrl})`,
    html: `<a href="${scoreUrl}"><img src="${badgeUrl}" alt="Scantient Security Score" /></a>`,
  };

  async function copy(format: Format) {
    await navigator.clipboard.writeText(snippets[format]);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  }

  // Grade derived from score for the preview
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const color = score >= 80 ? "#4c1" : score >= 50 ? "#dfb317" : "#e05d44";

  return (
    <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Security badge</h2>
        <p className="mt-1 text-sm text-muted">
          Embed a live security score badge in your README, docs, or landing page. Updates automatically with each scan.
        </p>
      </div>

      {/* Live preview */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-raised p-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="20" role="img" aria-label={`Scantient: ${score} ${grade}`}>
          <linearGradient id="s" x2="0" y2="100%">
            <stop offset="0" stopColor="#bbb" stopOpacity=".1" />
            <stop offset="1" stopOpacity=".1" />
          </linearGradient>
          <clipPath id="r">
            <rect width="120" height="20" rx="3" fill="#fff" />
          </clipPath>
          <g clipPath="url(#r)">
            <rect width="72" height="20" fill="#555" />
            <rect x="72" width="48" height="20" fill={color} />
            <rect width="120" height="20" fill="url(#s)" />
          </g>
          <g fill="#fff" textAnchor="middle" fontFamily="DejaVu Sans,Verdana,Geneva,sans-serif" fontSize="110">
            <text x="370" y="150" fill="#010101" fillOpacity=".3" transform="scale(.1)" textLength="620" lengthAdjust="spacing">Scantient</text>
            <text x="370" y="140" transform="scale(.1)" textLength="620" lengthAdjust="spacing">Scantient</text>
            <text x="950" y="150" fill="#010101" fillOpacity=".3" transform="scale(.1)" textLength="380" lengthAdjust="spacing">{score} {grade}</text>
            <text x="950" y="140" transform="scale(.1)" textLength="380" lengthAdjust="spacing">{score} {grade}</text>
          </g>
        </svg>
        <span className="text-xs text-muted">Live preview based on current score</span>
      </div>

      {/* Copy snippets */}
      <div className="space-y-3">
        {(["markdown", "html", "svg"] as Format[]).map((fmt) => (
          <div key={fmt} className="flex items-center gap-2">
            <span className="w-24 text-xs font-medium uppercase tracking-wide text-muted">
              {fmt === "svg" ? "Direct URL" : fmt}
            </span>
            <code className="flex-1 truncate rounded bg-surface-raised px-3 py-1.5 text-xs font-mono text-body">
              {snippets[fmt]}
            </code>
            <button
              type="button"
              onClick={() => copy(fmt)}
              className="shrink-0 rounded border border-border px-3 py-1.5 text-xs font-medium text-body hover:bg-surface-raised transition-colors"
            >
              {copied === fmt ? "Copied!" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

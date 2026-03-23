"use client";

import { useState } from "react";

export function ComplianceShareButton() {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  async function handleShare() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/compliance/share", { method: "POST" });
      const data = (await res.json()) as { url?: string; expiresAt?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to generate link");
        return;
      }

      if (data.url) {
        setUrl(data.url);
        setExpiresAt(data.expiresAt ?? null);
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={loading}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-heading transition hover:bg-surface-raised disabled:opacity-60"
      >
        {loading ? "Generating..." : copied ? "Link copied!" : "Share with Auditor"}
      </button>

      {error && (
        <p className="absolute right-0 top-10 mt-1 w-64 rounded-lg border border-error/20 bg-surface p-2 text-xs text-error shadow-lg">
          {error}
        </p>
      )}

      {url && !error && (
        <div className="absolute right-0 top-10 z-10 mt-1 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-xs font-semibold text-heading">Auditor link ready</p>
          <p className="mt-1 break-all text-xs text-muted">{url}</p>
          {expiresAt && (
            <p className="mt-2 text-xs text-muted">
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="mt-2 text-xs font-medium text-primary hover:underline"
          >
            {copied ? "Copied!" : "Copy again"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/org/digest")
      .then((r) => r.json())
      .then((d) => {
        setDigestEnabled(d.weeklyDigestEnabled ?? false);
        setLoading(false);
      });
  }, []);

  async function handleToggle() {
    setSaving(true);
    const next = !digestEnabled;
    const res = await fetch("/api/org/digest", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyDigestEnabled: next }),
    });
    if (res.ok) setDigestEnabled(next);
    setSaving(false);
  }

  async function handleSendNow() {
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/reports/weekly", { method: "POST" });
      if (res.ok) {
        const d = await res.json();
        setSendResult({ ok: true, message: `Digest sent to ${d.to} (${d.appsIncluded} apps)` });
      } else {
        const d = await res.json();
        setSendResult({ ok: false, message: d.error ?? "Send failed" });
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) return <div className="py-4 text-sm text-muted">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Weekly digest */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Weekly security digest</h2>
            <p className="mt-1 text-sm text-muted">
              Receive a weekly email summary of your security posture: scores, critical findings, and scan activity across all monitored apps. Sent every Monday morning to the org owner.
            </p>
            <p className="mt-2 text-xs text-muted">Requires Starter plan or higher.</p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              digestEnabled ? "bg-primary" : "bg-surface-raised"
            } disabled:opacity-50`}
            role="switch"
            aria-checked={digestEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                digestEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {digestEnabled && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendNow}
              disabled={sending}
              className="rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-body hover:bg-surface transition-colors disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send digest now"}
            </button>
            {sendResult && (
              <p className={`text-sm font-medium ${sendResult.ok ? "text-success" : "text-error"}`}>
                {sendResult.ok ? "✓" : "✗"} {sendResult.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Digest preview */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-1 text-lg font-semibold">What's in the digest</h2>
        <p className="mb-4 text-sm text-muted">The weekly email includes:</p>
        <ul className="space-y-2 text-sm text-body">
          {[
            "Total critical and high findings across all apps for the past 7 days",
            "Per-app security score and scan count",
            "Apps that need immediate attention (score below 80)",
            "Direct link to your dashboard",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-success mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

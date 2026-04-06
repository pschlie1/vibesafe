"use client";

import { useEffect, useState } from "react";
import { FormInput, FormSelect } from "@/components/ui";

type AlertConfig = {
  id: string;
  channel: string;
  destination: string;
  minSeverity: string;
  enabled: boolean;
};

const CHANNEL_LABELS: Record<string, string> = {
  EMAIL: "Email",
  SLACK: "Slack",
  TEAMS: "Microsoft Teams",
  WEBHOOK: "Webhook",
};

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: "✉️",
  SLACK: "💬",
  TEAMS: "🟦",
  WEBHOOK: "🔗",
};

function SlackSetupGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-lg border border-info/20 bg-info/5 p-3 text-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between font-medium text-info"
        onClick={() => setOpen((v) => !v)}
      >
        <span>How to get a Slack webhook URL</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ol className="mt-3 space-y-1.5 text-xs text-body list-decimal list-inside">
          <li>Open <strong>api.slack.com/apps</strong> and click <strong>Create New App</strong></li>
          <li>Choose <strong>From scratch</strong>, name it "Scantient Alerts", pick your workspace</li>
          <li>Under <strong>Features</strong>, click <strong>Incoming Webhooks</strong> and toggle it on</li>
          <li>Click <strong>Add New Webhook to Workspace</strong>, pick the channel to post to</li>
          <li>Copy the webhook URL (starts with <code>https://hooks.slack.com/services/…</code>) and paste it below</li>
        </ol>
      )}
    </div>
  );
}

function WebhookInfo() {
  return (
    <div className="mt-2 rounded-lg border border-border bg-surface-raised p-3 text-xs text-muted space-y-1">
      <p><strong className="text-body">Payload format:</strong> JSON POST with fields: <code>event</code>, <code>severity</code>, <code>appName</code>, <code>url</code>, <code>findingTitle</code>, <code>timestamp</code>.</p>
      <p><strong className="text-body">Signature:</strong> Each request includes an <code>X-Scantient-Signature</code> header (HMAC-SHA256 of the raw body). Verify it on your server to confirm authenticity.</p>
      <p><strong className="text-body">Compatible with:</strong> Zapier, Make, n8n, custom servers — anything that accepts a JSON POST.</p>
    </div>
  );
}

function maskDestination(channel: string, dest: string): string {
  if (channel === "EMAIL") return dest;
  // Show only first 30 chars + ellipsis for webhook URLs
  return dest.length > 40 ? dest.slice(0, 37) + "…" : dest;
}

export default function AlertsPage() {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [form, setForm] = useState({ channel: "EMAIL", destination: "", minSeverity: "HIGH" });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/alerts").then((r) => r.json()).then((d) => setConfigs(d.configs ?? []));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Teams is stored as WEBHOOK (detected by URL pattern in alerts.ts)
      const payload = { ...form, channel: form.channel === "TEAMS" ? "WEBHOOK" : form.channel };
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const d = await res.json();
        setConfigs((prev) => [...prev, d.config]);
        setForm({ channel: "EMAIL", destination: "", minSeverity: "HIGH" });
      } else {
        const d = await res.json();
        setError(d.error ?? "Failed to add channel");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    setConfigs((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !enabled } : c)));
  }

  async function handleTest(id: string) {
    setTesting(id);
    setTestResult(null);
    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId: id }),
      });
      setTestResult({ id, ok: res.ok });
    } finally {
      setTesting(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this alert channel?")) return;
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  }

  const placeholder =
    form.channel === "EMAIL"
      ? "alerts@company.com"
      : form.channel === "SLACK"
        ? "https://hooks.slack.com/services/…"
        : form.channel === "TEAMS"
          ? "https://outlook.webhook.office.com/…"
          : "https://your-server.com/webhooks/scantient";

  return (
    <div className="space-y-6">
      {/* Existing channels */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Alert channels</h2>
        {configs.length === 0 ? (
          <p className="text-sm text-muted">No alert channels configured. Add one below.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted">
                <th className="pb-2">Channel</th>
                <th className="pb-2">Destination</th>
                <th className="pb-2">Min severity</th>
                <th className="pb-2">Status</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {configs.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 font-medium">
                    <span className="mr-1.5">{CHANNEL_ICONS[c.channel] ?? "📣"}</span>
                    {CHANNEL_LABELS[c.channel] ?? c.channel}
                  </td>
                  <td className="py-2 text-body font-mono text-xs truncate max-w-[200px]" title={c.destination}>
                    {maskDestination(c.channel, c.destination)}
                  </td>
                  <td className="py-2 text-xs">{c.minSeverity}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(c.id, c.enabled)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${c.enabled ? "bg-success/10 text-success" : "bg-surface-raised text-body"}`}
                    >
                      {c.enabled ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="py-2 space-x-3 text-right whitespace-nowrap">
                    {testResult?.id === c.id && (
                      <span className={`text-xs font-medium ${testResult.ok ? "text-success" : "text-error"}`}>
                        {testResult.ok ? "✓ Sent" : "✗ Failed"}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleTest(c.id)}
                      disabled={testing === c.id}
                      className="text-xs text-info hover:underline disabled:opacity-50"
                    >
                      {testing === c.id ? "Sending…" : "Test"}
                    </button>
                    <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-error hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add channel */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-1 text-lg font-semibold">Add alert channel</h2>
        <p className="mb-4 text-sm text-muted">Get notified when new findings are detected. Slack and webhooks require a Pro plan or higher.</p>

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <FormSelect
              name="channel"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value, destination: "" })}
            >
              <option value="EMAIL">✉️ Email</option>
              <option value="SLACK">💬 Slack</option>
              <option value="TEAMS">🟦 Microsoft Teams</option>
              <option value="WEBHOOK">🔗 Custom webhook</option>
            </FormSelect>

            <FormInput
              name="destination"
              required
              type={form.channel === "EMAIL" ? "email" : "url"}
              placeholder={placeholder}
              className="flex-1 min-w-[240px]"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />

            <FormSelect
              name="minSeverity"
              value={form.minSeverity}
              onChange={(e) => setForm({ ...form, minSeverity: e.target.value })}
            >
              <option value="CRITICAL">Critical only</option>
              <option value="HIGH">High+</option>
              <option value="MEDIUM">Medium+</option>
              <option value="LOW">All findings</option>
            </FormSelect>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {saving ? "Adding…" : "Add channel"}
            </button>
          </div>

          {/* Contextual setup guides */}
          {form.channel === "SLACK" && <SlackSetupGuide />}
          {form.channel === "WEBHOOK" && <WebhookInfo />}

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export function MspInviteButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/msp/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orgName }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to send invite");
        return;
      }

      setSuccess(true);
      setEmail("");
      setOrgName("");
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
      >
        Add Client
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-heading">Invite Client Organization</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-heading transition-colors"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="mt-6 rounded-xl border border-success/20 bg-success/5 p-4 text-center">
                <p className="font-semibold text-success">Invite sent!</p>
                <p className="mt-1 text-sm text-muted">
                  The client will receive an email to join your MSP portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading" htmlFor="invite-orgname">
                    Client Organization Name
                  </label>
                  <input
                    id="invite-orgname"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading" htmlFor="invite-email">
                    Admin Email Address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@client.com"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {error && (
                  <p className="text-sm text-error">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Invite"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:text-heading"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-muted">
                  The client admin receives an email invite. Once they accept, their organization
                  links to your MSP portal and their apps appear in your portfolio.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

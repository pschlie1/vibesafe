"use client";

import { useEffect, useState } from "react";

type Member = { id: string; name: string | null; email: string; role: string; lastLoginAt: string | null };

const ROLE_PERMISSIONS: Array<{
  action: string;
  owner: boolean;
  admin: boolean;
  member: boolean;
  viewer: boolean;
}> = [
  { action: "View findings and scan history",  owner: true, admin: true, member: true,  viewer: true  },
  { action: "View compliance reports",         owner: true, admin: true, member: true,  viewer: true  },
  { action: "Trigger a scan",                  owner: true, admin: true, member: true,  viewer: false },
  { action: "Resolve / dismiss findings",      owner: true, admin: true, member: true,  viewer: false },
  { action: "Add and edit apps",               owner: true, admin: true, member: false, viewer: false },
  { action: "Delete apps",                     owner: true, admin: true, member: false, viewer: false },
  { action: "Manage alert channels",           owner: true, admin: true, member: false, viewer: false },
  { action: "Manage integrations (Jira, etc)", owner: true, admin: true, member: false, viewer: false },
  { action: "Invite team members",             owner: true, admin: true, member: false, viewer: false },
  { action: "Manage billing and subscription", owner: true, admin: false,member: false, viewer: false },
  { action: "Manage SSO configuration",        owner: true, admin: false,member: false, viewer: false },
  { action: "Transfer org ownership",          owner: true, admin: false,member: false, viewer: false },
];

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-success font-semibold">✓</span>
  ) : (
    <span className="text-muted">—</span>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [sending, setSending] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    fetch("/api/team").then((r) => r.json()).then((d) => setMembers(d.members ?? []));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteEmail("");
        const d = await res.json();
        setMembers((prev) => [...prev, d.user]);
      } else {
        const err = await res.json();
        alert(err.error ?? "Failed to invite");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Members table */}
      <div className="rounded-lg border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Team members</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium uppercase tracking-wider text-muted">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Last login</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="py-2 font-medium">{m.name ?? "—"}</td>
                <td className="py-2 text-body">{m.email}</td>
                <td className="py-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium
                    ${m.role === "OWNER" ? "bg-primary/10 text-primary" :
                      m.role === "ADMIN" ? "bg-info/10 text-info" :
                      m.role === "VIEWER" ? "bg-surface-raised text-muted" :
                      "bg-surface-raised text-body"}`}>
                    {m.role}
                  </span>
                </td>
                <td className="py-2 text-xs text-muted">
                  {m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleDateString() : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite */}
      <div className="rounded-lg border bg-surface p-6">
        <h2 className="mb-1 text-lg font-semibold">Invite team member</h2>
        <p className="mb-4 text-sm text-muted">An email invitation will be sent. The role controls what they can do in Scantient.</p>
        <form onSubmit={handleInvite} className="flex gap-3 flex-wrap">
          <input
            type="email"
            required
            placeholder="colleague@company.com"
            className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm focus:border-primary-hover focus:outline-none focus:ring-1 focus:ring-primary-hover"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          >
            <option value="MEMBER">Member — scan, resolve findings</option>
            <option value="ADMIN">Admin — full access except billing</option>
            <option value="VIEWER">Viewer — read only</option>
          </select>
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {sending ? "Inviting…" : "Invite"}
          </button>
        </form>
      </div>

      {/* RBAC permission matrix */}
      <div className="rounded-lg border bg-surface p-6">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setShowMatrix((v) => !v)}
        >
          <div>
            <h2 className="text-lg font-semibold">Role permissions</h2>
            <p className="mt-0.5 text-sm text-muted">What each role can do in Scantient</p>
          </div>
          <span className="text-muted text-sm">{showMatrix ? "Hide ▲" : "Show ▼"}</span>
        </button>

        {showMatrix && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="pb-2 text-left w-1/2">Action</th>
                  <th className="pb-2 text-center">Owner</th>
                  <th className="pb-2 text-center">Admin</th>
                  <th className="pb-2 text-center">Member</th>
                  <th className="pb-2 text-center">Viewer</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ROLE_PERMISSIONS.map((row) => (
                  <tr key={row.action} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="py-2 pr-4 text-body">{row.action}</td>
                    <td className="py-2 text-center"><Check ok={row.owner} /></td>
                    <td className="py-2 text-center"><Check ok={row.admin} /></td>
                    <td className="py-2 text-center"><Check ok={row.member} /></td>
                    <td className="py-2 text-center"><Check ok={row.viewer} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

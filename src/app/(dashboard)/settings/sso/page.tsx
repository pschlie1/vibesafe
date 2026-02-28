"use client";

import { useState } from "react";

export default function SSOPage() {
  // Placeholder: in production, fetch from org context
  const isEnterprise = false;

  const [idpUrl, setIdpUrl] = useState("");
  const [certificate, setCertificate] = useState("");
  const [entityId, setEntityId] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder — would POST to /api/settings/sso
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-semibold">SSO / SAML Integration</h2>
        <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700">
          Enterprise
        </span>
      </div>

      {!isEnterprise ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">SSO is available on the Enterprise plan</h3>
          <p className="mb-6 text-sm text-gray-600">
            Enable SAML-based single sign-on to let your team authenticate through your identity provider (Okta, Azure AD, Google Workspace, etc.).
          </p>
          <a
            href="/settings/billing"
            className="inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            Upgrade to Enterprise
          </a>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Identity Provider URL</label>
            <input
              type="url"
              value={idpUrl}
              onChange={(e) => setIdpUrl(e.target.value)}
              placeholder="https://your-idp.example.com/sso/saml"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="urn:vibesafe:saml"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X.509 Certificate</label>
            <textarea
              rows={5}
              value={certificate}
              onChange={(e) => setCertificate(e.target.value)}
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
            >
              Save Configuration
            </button>
            {saved && <span className="text-sm text-green-600">✓ Saved</span>}
          </div>
        </form>
      )}
    </div>
  );
}

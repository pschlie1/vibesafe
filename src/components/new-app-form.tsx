"use client";

import { useState } from "react";

type FormState = {
  name: string;
  url: string;
  ownerEmail: string;
  ownerName: string;
  criticality: "low" | "medium" | "high";
};

const initialState: FormState = {
  name: "",
  url: "",
  ownerEmail: "",
  ownerName: "",
  criticality: "medium",
};

export function NewAppForm() {
  const [data, setData] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    setSaving(false);
    if (res.ok) {
      setData(initialState);
      window.location.reload();
    } else {
      alert("Could not register app");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Register app</h3>
      <input className="w-full rounded border p-2" placeholder="App name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder="https://app.company.com" value={data.url} onChange={(e) => setData({ ...data, url: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder="Owner email" value={data.ownerEmail} onChange={(e) => setData({ ...data, ownerEmail: e.target.value })} />
      <input className="w-full rounded border p-2" placeholder="Owner name (optional)" value={data.ownerName} onChange={(e) => setData({ ...data, ownerName: e.target.value })} />
      <select className="w-full rounded border p-2" value={data.criticality} onChange={(e) => setData({ ...data, criticality: e.target.value as FormState["criticality"] })}>
        <option value="low">Low criticality</option>
        <option value="medium">Medium criticality</option>
        <option value="high">High criticality</option>
      </select>
      <button disabled={saving} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
        {saving ? "Saving..." : "Add app"}
      </button>
    </form>
  );
}

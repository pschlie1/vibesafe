"use client";

import { useState } from "react";

type Props = {
  findingId: string;
  currentStatus: string;
};

const statuses = [
  { value: "OPEN", label: "Open", color: "text-red-600" },
  { value: "ACKNOWLEDGED", label: "Acknowledged", color: "text-yellow-600" },
  { value: "IN_PROGRESS", label: "In Progress", color: "text-blue-600" },
  { value: "RESOLVED", label: "Resolved", color: "text-green-600" },
  { value: "IGNORED", label: "Ignored", color: "text-gray-500" },
];

export function FindingActions({ findingId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [updating, setUpdating] = useState(false);

  async function handleChange(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } finally {
      setUpdating(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={updating}
      className={`rounded border px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
        statuses.find((s) => s.value === status)?.color ?? ""
      }`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

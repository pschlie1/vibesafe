"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type OrgData = {
  user: { orgName: string };
  org: {
    limits: {
      tier: string;
      status: string;
      maxApps: number;
      maxUsers: number;
      trialEndsAt: string | null;
      cancelAtPeriodEnd: boolean;
      currentPeriodEnd: string | null;
    };
    appCount: number;
    userCount: number;
  };
};

const plans = [
  { key: "FREE", name: "Builder", price: "$49/mo", apps: 1, users: 1, talkToSales: false },
  { key: "STARTER", name: "Starter", price: "$199/mo", apps: 5, users: 2, talkToSales: false },
  { key: "PRO", name: "Pro", price: "$399/mo", apps: 15, users: 10, talkToSales: false },
  { key: "ENTERPRISE", name: "Enterprise", price: "$1,500/mo", apps: 100, users: 50, talkToSales: true },
];

export default function BillingPage() {
  const [data, setData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then(setData);
  }, []);

  // FIX 2: read ?success=true&plan=X after Stripe checkout redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const plan = searchParams.get("plan");
    if (success !== "true") return;

    const planLabel = plan ? `Your ${plan} plan is now active.` : "Your plan is now active.";
    setSuccessBanner(`Payment successful — ${planLabel}`);

    successTimerRef.current = setTimeout(() => setSuccessBanner(null), 8000);

    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, [searchParams]);

  // Auto-trigger checkout if the user signed up via a plan CTA (e.g. /signup?plan=ltd)
  // The plan is stored in sessionStorage by the signup page and cleared here after use.
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingCheckoutPlan");
    if (!pending) return;
    sessionStorage.removeItem("pendingCheckoutPlan");
    // Small delay to ensure the billing page is fully mounted
    setTimeout(() => handleUpgrade(pending), 500);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpgrade(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        alert(error ?? "Could not create checkout session");
      }
    } finally {
      setLoading(null);
    }
  }

  // FIX 1: surface portal errors inline instead of silently failing
  async function handleManage() {
    setPortalError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        setPortalError("Could not open billing portal. Please try again.");
      }
    } catch {
      setPortalError("Could not open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (!data) return <div className="text-sm text-muted">Loading…</div>;

  const { limits } = data.org;

  // FIX 3: format cancel date when present
  const cancelDate =
    limits.cancelAtPeriodEnd && limits.currentPeriodEnd
      ? new Date(limits.currentPeriodEnd).toLocaleDateString()
      : null;

  return (
    <div className="space-y-6">
      {/* FIX 2: payment success banner */}
      {successBanner && (
        <div className="flex items-center justify-between rounded-lg border border-success bg-surface-raised px-4 py-3 text-sm text-success">
          <span>{successBanner}</span>
          <button
            onClick={() => {
              setSuccessBanner(null);
              if (successTimerRef.current) clearTimeout(successTimerRef.current);
            }}
            className="ml-4 text-success hover:text-heading"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* FIX 3: cancel-at-period-end warning banner */}
      {cancelDate && (
        <div className="rounded-lg border border-warning bg-surface-raised px-4 py-3 text-sm text-warning">
          Your plan is set to cancel on {cancelDate}. You will keep access until then.
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-lg border bg-surface p-6">
        <h2 className="text-lg font-semibold">Current plan</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Plan" value={limits.tier} />
          <Stat label="Status" value={limits.status} />
          <Stat label="Apps" value={`${data.org.appCount} / ${limits.maxApps}`} />
          <Stat label="Users" value={`${data.org.userCount} / ${limits.maxUsers}`} />
        </div>
        {limits.trialEndsAt && (
          <p className="mt-3 text-sm text-warning">
            Trial ends {new Date(limits.trialEndsAt).toLocaleDateString()}
          </p>
        )}
        {limits.tier !== "FREE" && (
          <div className="mt-4">
            <button
              onClick={handleManage}
              disabled={loading === "portal"}
              className="rounded border px-3 py-1.5 text-sm hover:bg-surface-raised disabled:opacity-50"
            >
              {loading === "portal" ? "Opening…" : "Manage billing"}
            </button>
            {/* FIX 1: inline portal error message */}
            {portalError && (
              <p className="mt-2 text-sm text-error">{portalError}</p>
            )}
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="rounded-lg border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Upgrade your plan</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrent = plan.key === limits.tier;
            return (
              <div key={plan.key} className={`rounded-lg border p-4 ${isCurrent ? "border-primary" : ""}`}>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold">{plan.price}</p>
                <p className="mt-1 text-xs text-muted">
                  {plan.apps >= 999 ? "Unlimited" : plan.apps} apps · {plan.users >= 999 ? "Unlimited" : plan.users} users
                </p>
                {isCurrent ? (
                  <p className="mt-3 text-xs font-medium text-success">Current plan</p>
                ) : plan.talkToSales ? (
                  <a
                    href="mailto:sales@scantient.com"

                    className="mt-3 block w-full rounded border border-primary py-1.5 text-center text-sm font-medium text-heading hover:bg-surface-raised"
                  >
                    Talk to sales
                  </a>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={loading === plan.key}
                    className="mt-3 w-full rounded bg-primary py-1.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                  >
                    {loading === plan.key ? "Loading…" : "Upgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

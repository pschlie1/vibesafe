/**
 * PagerDuty Events API v2 integration.
 * Creates and resolves incidents in PagerDuty via routing keys.
 */

const PAGERDUTY_EVENTS_URL = "https://events.pagerduty.com/v2/enqueue";

export async function createPagerDutyIncident(
  routingKey: string,
  payload: {
    summary: string;
    severity: "critical" | "error" | "warning" | "info";
    source: string; // app URL
    component?: string; // app name
    group?: string; // org name
    customDetails?: Record<string, string>;
  },
): Promise<{ deduplicationKey: string } | null> {
  const body = {
    routing_key: routingKey,
    event_action: "trigger",
    payload: {
      summary: payload.summary,
      severity: payload.severity,
      source: payload.source,
      component: payload.component,
      group: payload.group,
      custom_details: payload.customDetails ?? {},
    },
  };

  try {
    const res = await fetch(PAGERDUTY_EVENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.pagerduty+json;version=2",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[pagerduty] Failed to create incident:", res.status, text);
      return null;
    }

    const data = (await res.json()) as { dedup_key?: string; message?: string };
    if (!data.dedup_key) return null;
    return { deduplicationKey: data.dedup_key };
  } catch (err) {
    console.error("[pagerduty] Error creating incident:", err);
    return null;
  }
}

export async function resolvePagerDutyIncident(
  routingKey: string,
  deduplicationKey: string,
): Promise<boolean> {
  const body = {
    routing_key: routingKey,
    event_action: "resolve",
    dedup_key: deduplicationKey,
  };

  try {
    const res = await fetch(PAGERDUTY_EVENTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.pagerduty+json;version=2",
      },
      body: JSON.stringify(body),
    });

    return res.ok;
  } catch {
    return false;
  }
}

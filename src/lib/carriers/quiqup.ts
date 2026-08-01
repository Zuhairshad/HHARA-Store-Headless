import type { LiveStatus, LiveStatusState } from "./types";

// Quiqup public tracking page
export function buildTrackingUrl(trackingNumber: string): string {
  return `https://track.quiqup.com/${encodeURIComponent(trackingNumber)}`;
}

// Quiqup Partner API — endpoint & response shape must be confirmed against
// the account contract (they vary by integration type). We read env keys and
// gracefully return null if missing or the call fails.
//
// Required env: QUIQUP_API_KEY  (also often QUIQUP_CLIENT_ID)
// Docs: https://developers.quiqup.com/
export async function getLiveStatus(trackingNumber: string): Promise<LiveStatus | null> {
  const key = process.env.QUIQUP_API_KEY;
  const clientId = process.env.QUIQUP_CLIENT_ID;
  if (!key) return null;

  try {
    const url = `https://api.quiqup.com/v1/orders/${encodeURIComponent(trackingNumber)}/tracking`;
    const res = await fetch(url, {
      headers: {
        "X-API-Key": key,
        ...(clientId ? { "X-Client-Id": clientId } : {}),
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      state?: string;
      status?: string;
      description?: string;
      updated_at?: string;
      estimated_delivery_at?: string;
      events?: Array<{ at?: string; created_at?: string; state?: string; description?: string; location?: string }>;
    };

    return {
      carrier: "quiqup",
      state: mapQuiqupState(data.state ?? data.status),
      description: data.description || data.status || "Update received",
      updatedAt: data.updated_at ?? null,
      estimatedDelivery: data.estimated_delivery_at ?? null,
      events: (data.events ?? []).slice(0, 8).map((e) => ({
        at: e.at ?? e.created_at ?? "",
        description: e.description ?? e.state ?? "",
        location: e.location,
      })),
    };
  } catch {
    return null;
  }
}

function mapQuiqupState(state?: string): LiveStatusState {
  const s = (state ?? "").toLowerCase();
  if (s.includes("delivered")) return "delivered";
  if (s.includes("out_for_delivery") || s.includes("out for delivery")) return "out_for_delivery";
  if (s.includes("picked")) return "picked_up";
  if (s.includes("transit") || s.includes("dispatched")) return "in_transit";
  if (s.includes("fail") || s.includes("return") || s.includes("exception")) return "exception";
  if (s.includes("pending") || s.includes("created") || s.includes("new")) return "pending";
  return "unknown";
}

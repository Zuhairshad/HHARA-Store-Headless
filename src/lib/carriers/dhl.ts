import type { LiveStatus, LiveStatusState } from "./types";

export function buildTrackingUrl(trackingNumber: string): string {
  return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trackingNumber)}&brand=DHL`;
}

// DHL Shipment Tracking – Unified API
// https://developer.dhl.com/api-reference/shipment-tracking
export async function getLiveStatus(trackingNumber: string): Promise<LiveStatus | null> {
  const key = process.env.DHL_API_KEY;
  if (!key) return null;

  try {
    const url = `https://api-eu.dhl.com/track/shipments?trackingNumber=${encodeURIComponent(trackingNumber)}`;
    const res = await fetch(url, {
      headers: { "DHL-API-Key": key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      shipments?: Array<{
        status?: { statusCode?: string; status?: string; description?: string; timestamp?: string };
        estimatedTimeOfDelivery?: string;
        events?: Array<{ timestamp?: string; description?: string; location?: { address?: { addressLocality?: string } } }>;
      }>;
    };

    const s = data.shipments?.[0];
    if (!s) return null;

    return {
      carrier: "dhl",
      state: mapDhlState(s.status?.statusCode),
      description: s.status?.description || s.status?.status || "Update received",
      updatedAt: s.status?.timestamp ?? null,
      estimatedDelivery: s.estimatedTimeOfDelivery ?? null,
      events: (s.events ?? []).slice(0, 8).map((e) => ({
        at: e.timestamp ?? "",
        description: e.description ?? "",
        location: e.location?.address?.addressLocality,
      })),
    };
  } catch {
    return null;
  }
}

function mapDhlState(code?: string): LiveStatusState {
  switch (code) {
    case "pre-transit":
      return "pending";
    case "transit":
      return "in_transit";
    case "delivered":
      return "delivered";
    case "failure":
      return "exception";
    default:
      return "unknown";
  }
}

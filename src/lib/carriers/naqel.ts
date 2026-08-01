import type { LiveStatus, LiveStatusState } from "./types";

// Naqel Express public tracking page
export function buildTrackingUrl(trackingNumber: string): string {
  return `https://www.naqelksa.com/en/track?waybill=${encodeURIComponent(trackingNumber)}`;
}

// Naqel Express API — endpoint & auth model vary by contract (they run both
// SOAP and REST). Confirm the concrete URL and response shape with your
// Naqel integration lead. This scaffold reads env keys, calls their v1 REST
// tracking endpoint, and returns null if anything fails.
//
// Required env: NAQEL_API_TOKEN  (or NAQEL_USERNAME + NAQEL_PASSWORD)
export async function getLiveStatus(trackingNumber: string): Promise<LiveStatus | null> {
  const token = process.env.NAQEL_API_TOKEN;
  const user = process.env.NAQEL_USERNAME;
  const pass = process.env.NAQEL_PASSWORD;
  if (!token && !(user && pass)) return null;

  try {
    const url = `https://gateway.naqelksa.com/api/v1/tracking?waybillNo=${encodeURIComponent(trackingNumber)}`;
    const authHeader = token
      ? `Bearer ${token}`
      : `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;

    const res = await fetch(url, {
      headers: { Authorization: authHeader, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: string;
      statusDescription?: string;
      lastUpdate?: string;
      estimatedDelivery?: string;
      trackingDetails?: Array<{ date?: string; activity?: string; description?: string; location?: string }>;
    };

    return {
      carrier: "naqel",
      state: mapNaqelState(data.status),
      description: data.statusDescription || data.status || "Update received",
      updatedAt: data.lastUpdate ?? null,
      estimatedDelivery: data.estimatedDelivery ?? null,
      events: (data.trackingDetails ?? []).slice(0, 8).map((e) => ({
        at: e.date ?? "",
        description: e.activity || e.description || "",
        location: e.location,
      })),
    };
  } catch {
    return null;
  }
}

function mapNaqelState(state?: string): LiveStatusState {
  const s = (state ?? "").toLowerCase();
  if (s.includes("delivered")) return "delivered";
  if (s.includes("out for delivery")) return "out_for_delivery";
  if (s.includes("picked")) return "picked_up";
  if (s.includes("transit") || s.includes("shipped")) return "in_transit";
  if (s.includes("fail") || s.includes("return") || s.includes("exception") || s.includes("held")) return "exception";
  if (s.includes("pending") || s.includes("created")) return "pending";
  return "unknown";
}

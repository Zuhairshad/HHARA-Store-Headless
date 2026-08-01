"use server";

import { headers } from "next/headers";
import { getOrderByNameAndEmail, type OrderTracking } from "./shopify";
import { detectCarrier, getCarrierUrl, getLiveStatus, type CarrierKey, type LiveStatus } from "./carriers";
import { rateLimit } from "./rate-limit";

export type CarrierInfo = {
  key: CarrierKey;
  displayName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  live: LiveStatus | null;
};

export type LookupResult =
  | { ok: true; order: OrderTracking; carrier: CarrierInfo | null }
  | { ok: false; error: string };

export async function lookupOrder(formData: FormData): Promise<LookupResult> {
  const orderName = String(formData.get("orderName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const ip = await getClientIp();
  const rl = rateLimit(`order-lookup:${ip}`, { limit: 10, windowSec: 300 });
  if (!rl.ok) {
    const mins = Math.max(1, Math.ceil(rl.retryAfterSec / 60));
    return {
      ok: false,
      error: `Too many lookup attempts. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  if (!orderName || !email) {
    return { ok: false, error: "Please enter both your order number and email." };
  }
  if (!/^#?\d{3,}$/.test(orderName)) {
    return { ok: false, error: "Order number should look like #1001 or 1001." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    const order = await getOrderByNameAndEmail(orderName, email);
    if (!order) {
      return {
        ok: false,
        error: "We couldn't find an order with that number and email. Please double-check both.",
      };
    }

    const carrier = await buildCarrierInfo(order);
    return { ok: true, order, carrier };
  } catch (err) {
    console.error("[lookupOrder]", err);
    return { ok: false, error: "Something went wrong looking up your order. Please try again." };
  }
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

async function buildCarrierInfo(order: OrderTracking): Promise<CarrierInfo | null> {
  const fulfillment = order.fulfillments[0];
  const tracking = fulfillment?.trackingInfo?.[0];
  if (!tracking || (!tracking.number && !tracking.url)) return null;

  const key = detectCarrier(tracking.company);
  const url = tracking.url || getCarrierUrl(tracking.company, tracking.number);

  let live: LiveStatus | null = null;
  if (tracking.number) {
    try {
      live = await getLiveStatus(tracking.company, tracking.number);
    } catch (err) {
      console.error("[buildCarrierInfo] live status failed:", err);
    }
  }

  return {
    key,
    displayName: tracking.company,
    trackingNumber: tracking.number,
    trackingUrl: url,
    live,
  };
}

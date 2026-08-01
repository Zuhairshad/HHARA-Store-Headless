import * as dhl from "./dhl";
import * as naqel from "./naqel";
import * as quiqup from "./quiqup";
import type { CarrierKey, LiveStatus } from "./types";

export type { CarrierKey, LiveStatus, LiveStatusEvent, LiveStatusState } from "./types";

export const CARRIER_NAMES: Record<CarrierKey, string> = {
  quiqup: "Quiqup",
  naqel: "Naqel Express",
  dhl: "DHL",
  unknown: "Carrier",
};

export function detectCarrier(company: string | null | undefined): CarrierKey {
  const c = (company ?? "").toLowerCase();
  if (!c) return "unknown";
  if (c.includes("quiqup")) return "quiqup";
  if (c.includes("naqel")) return "naqel";
  if (c.includes("dhl")) return "dhl";
  return "unknown";
}

export function getCarrierUrl(
  company: string | null | undefined,
  trackingNumber: string | null | undefined
): string | null {
  if (!trackingNumber) return null;
  const carrier = detectCarrier(company);
  switch (carrier) {
    case "quiqup": return quiqup.buildTrackingUrl(trackingNumber);
    case "naqel":  return naqel.buildTrackingUrl(trackingNumber);
    case "dhl":    return dhl.buildTrackingUrl(trackingNumber);
    default:       return null;
  }
}

export async function getLiveStatus(
  company: string | null | undefined,
  trackingNumber: string | null | undefined
): Promise<LiveStatus | null> {
  if (!trackingNumber) return null;
  const carrier = detectCarrier(company);
  switch (carrier) {
    case "quiqup": return quiqup.getLiveStatus(trackingNumber);
    case "naqel":  return naqel.getLiveStatus(trackingNumber);
    case "dhl":    return dhl.getLiveStatus(trackingNumber);
    default:       return null;
  }
}

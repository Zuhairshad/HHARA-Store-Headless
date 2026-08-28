import { AnalyticsEvent, formatEcommerceItem, EcommerceItem } from "./types";
import { getConsentPreferences } from "./consent";
import { captureAttribution } from "./attribution";
import { shouldEmitEvent } from "./deduplication";
import { emitGA4 } from "./providers/ga4";
import { emitMeta } from "./providers/meta";
import { emitTikTok } from "./providers/tiktok";

export * from "./types";
export * from "./consent";
export * from "./attribution";
export * from "./deduplication";

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  // 1. In-memory 500ms duplicate suppression
  if (!shouldEmitEvent(event)) {
    return;
  }

  // 2. Parse/update attribution if needed
  try {
    captureAttribution();
  } catch (err) {
    console.warn("[analytics] attribution capture error:", err);
  }

  // 3. Check consent state
  const consent = getConsentPreferences();

  // 4. GA4 / Google Tag (direct gtag with Consent Mode v2 or analytics consent)
  // If Consent Mode v2 is configured, gtag can receive events; otherwise gate on analytics consent
  if (consent.analytics || Boolean(process.env.NEXT_PUBLIC_GA4_ID)) {
    try {
      emitGA4(event);
    } catch (err) {
      console.warn("[analytics:ga4] emission error:", err);
    }
  }

  // 5. Meta Pixel (requires marketing consent)
  if (consent.marketing) {
    try {
      emitMeta(event);
    } catch (err) {
      console.warn("[analytics:meta] emission error:", err);
    }
  }

  // 6. TikTok Pixel (requires marketing consent)
  if (consent.marketing) {
    try {
      emitTikTok(event);
    } catch (err) {
      console.warn("[analytics:tiktok] emission error:", err);
    }
  }
}

import { AttributionData } from "./types";
import { getConsentPreferences } from "./consent";

export const ATTRIBUTION_STORAGE_KEY = "hhara_attribution_v1";
export const ATTRIBUTION_COOKIE_KEY = "hhara_attr";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax${secure}`;
}

export function captureAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const utm_source = params.get("utm_source") || undefined;
  const utm_medium = params.get("utm_medium") || undefined;
  const utm_campaign = params.get("utm_campaign") || undefined;
  const utm_term = params.get("utm_term") || undefined;
  const utm_content = params.get("utm_content") || undefined;
  const gclid = params.get("gclid") || undefined;
  const fbclid = params.get("fbclid") || undefined;
  const ttclid = params.get("ttclid") || undefined;

  const hasParams = Boolean(
    utm_source || utm_medium || utm_campaign || utm_term || utm_content || gclid || fbclid || ttclid
  );

  const referrer = typeof document !== "undefined" && document.referrer ? document.referrer : undefined;
  const isExternalReferrer = referrer && !referrer.includes(window.location.hostname);

  if (!hasParams && !isExternalReferrer) {
    return getStoredAttribution();
  }

  const fresh: AttributionData = {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    gclid,
    fbclid,
    ttclid,
    referrer: isExternalReferrer ? referrer : undefined,
    landing_page: window.location.pathname + window.location.search,
    timestamp: Date.now(),
  };

  const consent = getConsentPreferences();
  // Persist if analytics or marketing consent granted, or temporarily in session
  if (consent.analytics || consent.marketing || !consent.decided) {
    try {
      localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fresh));
      writeCookie(ATTRIBUTION_COOKIE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  }

  return fresh;
}

export function getStoredAttribution(): AttributionData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }

  try {
    const rawCookie = readCookie(ATTRIBUTION_COOKIE_KEY);
    if (rawCookie) return JSON.parse(rawCookie);
  } catch {
    // ignore
  }

  return null;
}

export function formatCartAttributes(attr: AttributionData | null): { key: string; value: string }[] {
  if (!attr) return [];
  const attributes: { key: string; value: string }[] = [];

  if (attr.utm_source) attributes.push({ key: "_utm_source", value: attr.utm_source });
  if (attr.utm_medium) attributes.push({ key: "_utm_medium", value: attr.utm_medium });
  if (attr.utm_campaign) attributes.push({ key: "_utm_campaign", value: attr.utm_campaign });
  if (attr.utm_term) attributes.push({ key: "_utm_term", value: attr.utm_term });
  if (attr.utm_content) attributes.push({ key: "_utm_content", value: attr.utm_content });
  if (attr.gclid) attributes.push({ key: "_gclid", value: attr.gclid });
  if (attr.fbclid) attributes.push({ key: "_fbclid", value: attr.fbclid });
  if (attr.ttclid) attributes.push({ key: "_ttclid", value: attr.ttclid });
  if (attr.referrer) attributes.push({ key: "_landing_referrer", value: attr.referrer });
  if (attr.landing_page) attributes.push({ key: "_landing_page", value: attr.landing_page });

  return attributes;
}

export function appendAttributionToUrl(rawUrl: string, attr: AttributionData | null): string {
  if (!rawUrl || !attr) return rawUrl;

  try {
    const base = typeof window !== "undefined" && window.location ? window.location.origin : "https://hhara.com";
    const url = new URL(rawUrl, base);

    if (attr.utm_source && !url.searchParams.has("utm_source")) url.searchParams.set("utm_source", attr.utm_source);
    if (attr.utm_medium && !url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", attr.utm_medium);
    if (attr.utm_campaign && !url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", attr.utm_campaign);
    if (attr.utm_term && !url.searchParams.has("utm_term")) url.searchParams.set("utm_term", attr.utm_term);
    if (attr.utm_content && !url.searchParams.has("utm_content")) url.searchParams.set("utm_content", attr.utm_content);
    if (attr.gclid && !url.searchParams.has("gclid")) url.searchParams.set("gclid", attr.gclid);
    if (attr.fbclid && !url.searchParams.has("fbclid")) url.searchParams.set("fbclid", attr.fbclid);
    if (attr.ttclid && !url.searchParams.has("ttclid")) url.searchParams.set("ttclid", attr.ttclid);

    return url.toString();
  } catch {
    return rawUrl;
  }
}

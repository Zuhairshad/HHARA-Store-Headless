import { ConsentPreferences } from "./types";
export type { ConsentPreferences };

export const CONSENT_STORAGE_KEY = "hhara_consent_v1";
export const CONSENT_COOKIE_KEY = "hhara_consent";
export const CONSENT_VERSION = "2026.1";

const DEFAULT_PREFERENCES: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  decided: false,
  version: CONSENT_VERSION,
};

let memoryConsent: ConsentPreferences | null = null;
type ConsentListener = (preferences: ConsentPreferences) => void;
const listeners = new Set<ConsentListener>();

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax${secure}`;
}

export function getConsentPreferences(): ConsentPreferences {
  if (memoryConsent) return memoryConsent;

  if (typeof window === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }

  // 1. Try localStorage
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
        memoryConsent = {
          essential: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          decided: Boolean(parsed.decided),
          timestamp: parsed.timestamp || Date.now(),
          version: parsed.version || CONSENT_VERSION,
        };
        return memoryConsent;
      }
    }
  } catch {
    // ignore
  }

  // 2. Try cookie fallback
  try {
    const rawCookie = readCookie(CONSENT_COOKIE_KEY);
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie);
      if (parsed && typeof parsed.analytics === "boolean" && typeof parsed.marketing === "boolean") {
        memoryConsent = {
          essential: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
          decided: Boolean(parsed.decided),
          timestamp: parsed.timestamp || Date.now(),
          version: parsed.version || CONSENT_VERSION,
        };
        return memoryConsent;
      }
    }
  } catch {
    // ignore
  }

  return { ...DEFAULT_PREFERENCES };
}

export function setConsentPreferences(updates: { analytics: boolean; marketing: boolean }): ConsentPreferences {
  const updated: ConsentPreferences = {
    essential: true,
    analytics: updates.analytics,
    marketing: updates.marketing,
    decided: true,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  };

  memoryConsent = updated;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    try {
      writeCookie(CONSENT_COOKIE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Sync with Google Consent Mode v2
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: updated.analytics ? "granted" : "denied",
        ad_storage: updated.marketing ? "granted" : "denied",
        ad_user_data: updated.marketing ? "granted" : "denied",
        ad_personalization: updated.marketing ? "granted" : "denied",
      });
    }

    // Sync with Meta Pixel
    if (typeof window.fbq === "function") {
      window.fbq("consent", updated.marketing ? "grant" : "revoke");
    }

    // Sync with TikTok Pixel
    if (typeof window.ttq === "object" && window.ttq) {
      if (updated.marketing && typeof window.ttq.grantConsent === "function") {
        window.ttq.grantConsent();
      } else if (!updated.marketing && typeof window.ttq.holdConsent === "function") {
        window.ttq.holdConsent();
      }
    }

    // Notify listeners
    listeners.forEach((listener) => {
      try {
        listener(updated);
      } catch (err) {
        console.warn("[analytics:consent] listener error", err);
      }
    });

    window.dispatchEvent(new CustomEvent("hhara:consent_changed", { detail: updated }));
  }

  return updated;
}

export function subscribeConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openConsentPreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hhara:open_consent_modal"));
  }
}

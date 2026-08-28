"use client";

import React, { useState, useEffect } from "react";
import { getConsentPreferences, setConsentPreferences } from "@/lib/analytics/consent";
import { ConsentPreferences } from "@/lib/analytics/types";

export function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(() => getConsentPreferences());

  const [analyticsChecked, setAnalyticsChecked] = useState(false);
  const [marketingChecked, setMarketingChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initial = getConsentPreferences();
    setPreferences(initial);
    setAnalyticsChecked(initial.analytics);
    setMarketingChecked(initial.marketing);

    if (!initial.decided) {
      setShowBanner(true);
    }

    const handleOpenModal = () => {
      const current = getConsentPreferences();
      setAnalyticsChecked(current.analytics);
      setMarketingChecked(current.marketing);
      setShowModal(true);
    };

    window.addEventListener("hhara:open_consent_modal", handleOpenModal);
    return () => {
      window.removeEventListener("hhara:open_consent_modal", handleOpenModal);
    };
  }, []);

  if (!mounted) return null;

  const handleAcceptAll = () => {
    const updated = setConsentPreferences({ analytics: true, marketing: true });
    setPreferences(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectNonEssential = () => {
    const updated = setConsentPreferences({ analytics: false, marketing: false });
    setPreferences(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    const updated = setConsentPreferences({
      analytics: analyticsChecked,
      marketing: marketingChecked,
    });
    setPreferences(updated);
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {/* ─── Floating Consent Banner ─── */}
      {showBanner && !showModal && (
        <aside
          role="dialog"
          aria-label="Cookie and Privacy Preferences"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "24px",
            right: "24px",
            maxWidth: "680px",
            margin: "0 auto",
            backgroundColor: "#1c1917",
            color: "#f5f0eb",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "4px",
            padding: "24px 28px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            fontFamily: "var(--font-sans, Montserrat, sans-serif)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h3
              style={{
                fontFamily: "var(--font-display, Cormorant Garamond, serif)",
                fontSize: "20px",
                fontWeight: 500,
                letterSpacing: "0.03em",
                margin: 0,
                color: "#f5f0eb",
              }}
            >
              Your Privacy & Experience
            </h3>
            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.6",
                color: "rgba(245, 240, 235, 0.8)",
                margin: 0,
              }}
            >
              We use essential cookies to power store operations, secure checkout, and deliver a refined, considered
              experience. With your consent, we also use analytics and marketing cookies to enhance performance and tailor
              content.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "4px",
            }}
          >
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "transparent",
                border: "1px solid rgba(245, 240, 235, 0.2)",
                color: "rgba(245, 240, 235, 0.7)",
                padding: "9px 18px",
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Preferences
            </button>
            <button
              onClick={handleRejectNonEssential}
              style={{
                background: "transparent",
                border: "1px solid rgba(245, 240, 235, 0.35)",
                color: "#f5f0eb",
                padding: "9px 18px",
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              style={{
                backgroundColor: "#f5f0eb",
                border: "1px solid #f5f0eb",
                color: "#1c1917",
                padding: "9px 18px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderRadius: "2px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Accept All
            </button>
          </div>
        </aside>
      )}

      {/* ─── Detailed Preferences Modal ─── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "var(--font-sans, Montserrat, sans-serif)",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cookie Preferences"
            style={{
              backgroundColor: "#1c1917",
              color: "#f5f0eb",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "4px",
              padding: "32px",
              maxWidth: "540px",
              width: "100%",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display, Cormorant Garamond, serif)",
                  fontSize: "24px",
                  fontWeight: 500,
                  margin: "0 0 8px 0",
                  letterSpacing: "0.03em",
                }}
              >
                Cookie Preferences
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(245, 240, 235, 0.75)", margin: 0, lineHeight: 1.5 }}>
                Customise how cookies are used during your visit to Maison HHARA.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Essential */}
              <div
                style={{
                  padding: "14px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "2px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ paddingRight: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#f5f0eb" }}>Essential Cookies</div>
                  <div style={{ fontSize: "12px", color: "rgba(245, 240, 235, 0.6)", marginTop: "2px" }}>
                    Required for core shopping features, bag memory, and secure checkout.
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "rgba(245, 240, 235, 0.5)", whiteSpace: "nowrap" }}>
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <label
                style={{
                  padding: "14px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "2px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ paddingRight: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#f5f0eb" }}>Analytics & Performance</div>
                  <div style={{ fontSize: "12px", color: "rgba(245, 240, 235, 0.6)", marginTop: "2px" }}>
                    Helps us understand storefront interaction to refine browsing performance.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsChecked}
                  onChange={(e) => setAnalyticsChecked(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#C19A6B", cursor: "pointer" }}
                />
              </label>

              {/* Marketing */}
              <label
                style={{
                  padding: "14px 16px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  borderRadius: "2px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ paddingRight: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#f5f0eb" }}>Marketing & Insights</div>
                  <div style={{ fontSize: "12px", color: "rgba(245, 240, 235, 0.6)", marginTop: "2px" }}>
                    Enables tailored editorial communications and relevant social advertisements.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={marketingChecked}
                  onChange={(e) => setMarketingChecked(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#C19A6B", cursor: "pointer" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(245, 240, 235, 0.25)",
                  color: "#f5f0eb",
                  padding: "9px 18px",
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                style={{
                  backgroundColor: "#f5f0eb",
                  border: "1px solid #f5f0eb",
                  color: "#1c1917",
                  padding: "9px 20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: "2px",
                  cursor: "pointer",
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

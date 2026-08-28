"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/newsletter-actions";

export function StandaloneFooter() {
  const [email, setEmail] = useState("");
  const [hpCompany, setHpCompany] = useState("");
  const [formTs] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || busy) return;
    setBusy(true);
    setError(null);
    const res = await subscribeNewsletter(
      email,
      undefined,
      undefined,
      undefined,
      hpCompany,
      formTs
    );
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error || "Subscription failed");
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="/" className="footer-brand-logo" style={{ cursor: "pointer" }}>
              <img src="/images/monkey-peeking.png" alt="HHARA" className="footer-monkey-logo" />
              <div className="footer-brand-right">
                <img src="/images/Text-PNG-02.png" alt="HHARA" className="footer-wordmark" />
                <div className="footer-brand-desc">
                  <span>Consciously made luxury athleisure.</span>
                  <span>Worn around the world with intent.</span>
                  <span>Every piece does more than dress you.</span>
                </div>
              </div>
            </a>
            <form className="footer-newsletter" onSubmit={handleSubmit}>
              <input
                type="text"
                name="_hp_company"
                value={hpCompany}
                onChange={(e) => setHpCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: "none", opacity: 0, position: "absolute", left: "-9999px" }}
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={done || busy}
                required
              />
              <button type="submit" disabled={done || busy}>
                {done ? "✓" : busy ? "…" : "Subscribe"}
              </button>
            </form>
            {error && <div style={{ marginTop: 8, fontSize: 11, color: "#faa" }}>{error}</div>}
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>The Collection</h4>
              <ul>
                <li><a href="/?r=shop">Shop All</a></li>
                <li><a href="/?r=shop">The Dahlia Set</a></li>
                <li><a href="/?r=shop">The Imara Set</a></li>
                <li><a href="/?r=lookbook">The Lookbook</a></li>
                <li><a href="/?r=shop">Accessories</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Customer Service</h4>
              <ul>
                <li><a href="/?r=faq">FAQ</a></li>
                <li><a href="/?r=shipping">Shipping &amp; Delivery</a></li>
                <li><a href="/orders/track">Track Order</a></li>
                <li><a href="/?r=returns">Returns &amp; Refunds</a></li>
                <li><a href="/?r=size-guide">Size Guide</a></li>
                <li><a href="/?r=contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Information</h4>
              <ul>
                <li><a href="/?r=atelier">About Us</a></li>
                <li><a href="/?r=stores">Impact</a></li>
                <li><a href="/?r=gift-card">E-Gift Card</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="/?r=privacy">Privacy &amp; Cookie Policy</a></li>
                <li><a href="/?r=terms">Terms &amp; Conditions</a></li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("hhara:open_consent_modal"));
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "inherit",
                      font: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    Cookie Preferences
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© HHARA 2026 · UAE · Dahlia Moxie Trading LLC</span>
          <div className="pay">
            <a href="https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@thisishhara?_r=1&_t=ZS-98ZT7R2xNId" target="_blank" rel="noreferrer">TikTok</a>
            <a href="https://www.facebook.com/share/1HgbM6QsDv/?mibextid=wwXIfr" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://x.com/thisishhara?s=11&t=AEjr7Nl3uAuFnFM1MDRlTw" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://www.linkedin.com/company/thisishhara/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://pin.it/5F59avDdF" target="_blank" rel="noreferrer">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

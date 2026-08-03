"use client";

import { useState, useEffect } from "react";

const ANNOUNCE = [
  "Free Next Day Delivery in UAE",
  "Free Global Express Shipping Over AED 1,900",
];

export function StandaloneNav() {
  const [idx, setIdx] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ANNOUNCE.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="announce">
        <div
          className="announce-track"
          style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", position: "relative", height: "100%" }}
        >
          <span
            key={idx}
            style={{ animation: "announceFade 0.6s ease-in-out forwards", display: "inline-block", textAlign: "center", width: "100%" }}
          >
            {ANNOUNCE[idx]}
          </span>
        </div>
        <div className="announce-locale">
          <span>EN</span>
          <span>AED</span>
        </div>
      </div>

      <header className="header" style={{ position: "sticky" }}>
        <div className="header-inner">
          <button className="mobile-menu-trigger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg className="icon" viewBox="0 0 24 24">
              <line x1="3" y1="8" x2="21" y2="8" />
              <line x1="3" y1="16" x2="21" y2="16" />
            </svg>
          </button>

          <nav className="header-nav">
            <a href="/?r=shop">Shop</a>
            <a href="/?r=lookbook">Lookbook</a>
            <a href="/?r=atelier">About Us</a>
            <a href="/?r=stores">Impact</a>
          </nav>

          <a href="/" className="brandmark">
            <img src="/images/hhara-logo.png" alt="HHARA" className="brandmark-text" />
          </a>

          <div className="header-actions">
            <a href="/" className="ha-btn ha-link" data-tooltip="Search" aria-label="Search">
              <svg className="icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </a>
            <a href="/orders/track" className="ha-btn ha-link" data-tooltip="Track your order" aria-label="Track your order">
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="2" y="7" width="12" height="10" />
                <path d="M14 10h4l3 3v4h-7" />
                <circle cx="6.5" cy="18" r="1.8" />
                <circle cx="17.5" cy="18" r="1.8" />
              </svg>
            </a>
            <a href="/" className="ha-btn ha-link" data-tooltip="Account" aria-label="Account">
              <svg className="icon" viewBox="0 0 24 24">
                <circle cx="12" cy="9" r="3.5" />
                <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
              </svg>
            </a>
            <a href="/" className="ha-btn ha-link" data-tooltip="Wishlist" aria-label="Wishlist">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
              </svg>
            </a>
            <a href="/" className="ha-btn ha-link" data-tooltip="Cart" aria-label="Cart">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M5 8h14l-1 12H6L5 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div
        className={`mobile-menu-backdrop ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`mobile-menu-drawer ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="mobile-menu-head">
          <h3>HHARA</h3>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 4 }}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>
        <div className="mobile-menu-body">
          <nav className="mobile-menu-nav">
            <a href="/?r=shop">Shop All</a>
            <a href="/?r=lookbook">Lookbook</a>
            <a href="/?r=atelier">About Us</a>
            <a href="/?r=stores">Impact</a>
            <a href="/orders/track" className="active">Track Order</a>
          </nav>
        </div>
        <div className="mobile-menu-footer">
          <div className="mobile-menu-locale">
            <span>EN</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>AED</span>
          </div>
        </div>
      </aside>
    </>
  );
}

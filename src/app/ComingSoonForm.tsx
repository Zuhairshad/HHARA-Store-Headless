"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/newsletter-actions";
import { trackEvent } from "@/lib/analytics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ComingSoonForm() {
  const [email, setEmail] = useState("");
  const [hpCompany, setHpCompany] = useState("");
  const [formTs] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await subscribeNewsletter(value, undefined, undefined, undefined, hpCompany, formTs, "Coming Soon");
    setBusy(false);
    if (res.ok) {
      setDone(true);
      trackEvent({ name: "customer_subscribed", payload: { source: "coming_soon", email: value } });
    } else {
      setError(res.error || "Something went wrong. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="cs-circle">
        <div className="cs-thanks" aria-live="polite">
          <span className="cs-thanks-title">Welcome to the Circle.</span>
          <span className="cs-thanks-sub cs-tracked">You will hear from us first</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-circle">
      <p className="cs-tracked">Join the HHARA Circle</p>
      <p className="cs-lede">First access, before the collection opens to everyone.</p>
      <form className="cs-form" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          name="_hp_company"
          value={hpCompany}
          onChange={(e) => setHpCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ display: "none" }}
        />
        <label htmlFor="cs-email" className="cs-sr-only">Email address</label>
        <input
          id="cs-email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          disabled={busy}
          required
        />
        <button type="submit" disabled={busy}>{busy ? "…" : "Join"}</button>
      </form>
      <p className="cs-error" role="alert">{error}</p>
    </div>
  );
}

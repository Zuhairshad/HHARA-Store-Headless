"use client";

import { useState } from "react";
import { setPasswordFromEmailLink } from "@/lib/customer-actions";
import { StandaloneNav } from "@/components/StandaloneNav";
import { StandaloneFooter } from "@/components/StandaloneFooter";

const COPY = {
  reset: {
    eyebrow: "Account",
    title: "Set a new password",
    sub: "Choose a new password for your HHARA account. You'll be signed in straight after.",
    button: "Save password",
    busy: "Saving…",
  },
  activate: {
    eyebrow: "Account",
    title: "Activate your account",
    sub: "Choose a password to finish setting up your HHARA account. You'll be signed in straight after.",
    button: "Activate account",
    busy: "Activating…",
  },
};

export default function SetPasswordClient({ kind, link }: { kind: "reset" | "activate"; link: string }) {
  const copy = COPY[kind];
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) return setError("Your password needs at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    const res = await setPasswordFromEmailLink(kind, link, password);
    if (res.ok) {
      window.location.href = "/account";
      return;
    }
    setBusy(false);
    setError(res.error || "We couldn't set your password. Please try again.");
  };

  return (
    <>
      <StandaloneNav />
      <main className="ot-root" style={{ maxWidth: 640 }}>
        <header className="ot-hero">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="display ot-title">{copy.title}</h1>
          <p className="ot-sub">{copy.sub}</p>
        </header>

        <section className="ot-card">
          {!link ? (
            <p className="ot-error" role="alert" style={{ margin: 0 }}>
              This link is incomplete. Please open it again from your email, or{" "}
              <a href="/account" style={{ textDecoration: "underline" }}>request a new one</a>.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="ot-form" style={{ gridTemplateColumns: "1fr" }} noValidate>
              <div className="ot-field">
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  maxLength={40}
                  required
                />
              </div>
              <div className="ot-field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={busy}
                  maxLength={40}
                  required
                />
                <label style={{ display: "flex", gap: 8, alignItems: "center", textTransform: "none", letterSpacing: 0, fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} style={{ width: "auto" }} />
                  Show passwords
                </label>
              </div>
              <div className="ot-submit-row">
                <button type="submit" className="ot-submit" disabled={busy}>
                  {busy ? copy.busy : copy.button}
                </button>
              </div>
            </form>
          )}
          {error && (
            <p className="ot-error" role="alert">
              {error}
              {/expired|already been used/.test(error) && (
                <> <a href="/account" style={{ textDecoration: "underline" }}>Request a new link</a></>
              )}
            </p>
          )}
        </section>
      </main>
      <StandaloneFooter />
    </>
  );
}

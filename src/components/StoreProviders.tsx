"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { PhoneCountryProvider } from "@/components/PhoneCountry";
import { ShopifyWebPixels } from "@/components/analytics/ShopifyWebPixels";
import { BASE_CURRENCY } from "@/lib/currency";
import { DEFAULT_DIAL_COUNTRY } from "@/lib/dial-codes";
import type { StoreSession } from "@/lib/session";
import { recoverFromStaleDeploy } from "@/lib/stale-deploy";

type SessionState = {
  /** False until /api/session has answered (or failed), so the UI can avoid showing a wrong signed-out/empty state. */
  ready: boolean;
  session: StoreSession | null;
};

const SessionContext = createContext<SessionState>({ ready: false, session: null });

export function useStoreSession(): SessionState {
  return useContext(SessionContext);
}

// One request per page load, even if React mounts the provider twice (Strict Mode in development).
let inflight: Promise<StoreSession | null> | null = null;
function loadSession(): Promise<StoreSession | null> {
  if (!inflight) {
    inflight = fetch("/api/session", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? (r.json() as Promise<StoreSession>) : null))
      .catch(() => null);
  }
  return inflight;
}

/**
 * Pages are static and priced for the store-default market (AED). This starts there and switches to the visitor's
 * market, cart and customer once /api/session answers.
 */
export function StoreProviders({
  defaultOptions,
  children,
}: {
  defaultOptions: { country: string; currency: string }[];
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SessionState>({ ready: false, session: null });

  // Server actions without their own try/catch (sign-in, sign-up, footer forms…) surface a stale deploy here
  useEffect(() => {
    const onRejection = (e: PromiseRejectionEvent) => {
      if (recoverFromStaleDeploy(e.reason)) e.preventDefault();
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  useEffect(() => {
    let alive = true;
    loadSession().then((session) => {
      if (alive) setState({ ready: true, session });
    });
    return () => {
      alive = false;
    };
  }, []);

  const s = state.session;
  const currency = s?.currency ?? BASE_CURRENCY;
  return (
    <SessionContext.Provider value={state}>
      <CurrencyProvider currency={currency} options={s?.options ?? defaultOptions} rate={s?.rate ?? 1}>
        <ShopifyWebPixels currency={currency} />
        <PhoneCountryProvider country={s?.phoneCountry ?? DEFAULT_DIAL_COUNTRY}>{children}</PhoneCountryProvider>
      </CurrencyProvider>
    </SessionContext.Provider>
  );
}

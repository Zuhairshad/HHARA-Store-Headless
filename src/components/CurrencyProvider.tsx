"use client";

import React, { createContext, useContext } from "react";
import { BASE_CURRENCY, COUNTRY_COOKIE, FREE_SHIPPING_AED, formatPrice } from "@/lib/currency";

type CurrencyOption = { country: string; currency: string };

type CurrencyContextValue = {
  currency: string;
  /** Formats an amount that is already in the visitor's currency. */
  format: (amount: number) => string;
  /** Free-shipping threshold converted to the visitor's currency (approximate). */
  freeShippingThreshold: number;
  options: CurrencyOption[];
  /** Switches the country we price in; reloads so products and cart come back in its currency. */
  selectCountry: (country: string) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  options,
  rate,
  children,
}: {
  currency: string;
  options: CurrencyOption[];
  /** AED → currency rate, for the free-shipping threshold only. */
  rate: number;
  children: React.ReactNode;
}) {
  const value: CurrencyContextValue = {
    currency,
    format: (amount) => formatPrice(amount, currency),
    freeShippingThreshold: Math.round(FREE_SHIPPING_AED * rate),
    options,
    selectCountry: (country) => {
      document.cookie = `${COUNTRY_COOKIE}=${country}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      window.location.reload();
    },
  };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

const FALLBACK: CurrencyContextValue = {
  currency: BASE_CURRENCY,
  format: (amount) => formatPrice(amount, BASE_CURRENCY),
  freeShippingThreshold: FREE_SHIPPING_AED,
  options: [{ country: "AE", currency: BASE_CURRENCY }],
  selectCountry: () => {},
};

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext) ?? FALLBACK;
}

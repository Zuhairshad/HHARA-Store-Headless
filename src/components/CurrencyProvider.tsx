"use client";

import React, { createContext, useContext, useState } from "react";
import { BASE_CURRENCY, CURRENCY_COOKIE, MAIN_CURRENCIES, formatPrice, isCurrencyCode } from "@/lib/currency";

type CurrencyContextValue = {
  currency: string;
  setCurrency: (c: string) => void;
  /** Formats an AED amount in the visitor's currency. */
  format: (aed: number) => string;
  /** Formats an AED amount as AED, whatever the visitor's currency. */
  formatBase: (aed: number) => string;
  isConverted: boolean;
  /** Options for the currency switcher. */
  currencies: string[];
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  initialCurrency,
  localCurrency,
  rates,
  children,
}: {
  initialCurrency: string;
  /** Currency of the visitor's own country, always offered in the switcher. */
  localCurrency: string;
  rates: Record<string, number>;
  children: React.ReactNode;
}) {
  const [currency, setCurrencyState] = useState(initialCurrency);

  const setCurrency = (c: string) => {
    if (!isCurrencyCode(c) || !rates[c]) return;
    setCurrencyState(c);
    document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  };

  const currencies = [...new Set([...MAIN_CURRENCIES, localCurrency, currency])].filter((c) => rates[c]);

  const value: CurrencyContextValue = {
    currency,
    setCurrency,
    format: (aed) => formatPrice(aed, currency, rates[currency] ?? 1),
    formatBase: (aed) => formatPrice(aed, BASE_CURRENCY, 1),
    isConverted: currency !== BASE_CURRENCY,
    currencies,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

const FALLBACK: CurrencyContextValue = {
  currency: BASE_CURRENCY,
  setCurrency: () => {},
  format: (aed) => formatPrice(aed, BASE_CURRENCY, 1),
  formatBase: (aed) => formatPrice(aed, BASE_CURRENCY, 1),
  isConverted: false,
  currencies: [BASE_CURRENCY],
};

export function useCurrency(): CurrencyContextValue {
  return useContext(CurrencyContext) ?? FALLBACK;
}

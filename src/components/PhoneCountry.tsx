"use client";

import React, { createContext, useContext } from "react";
import { DEFAULT_DIAL_COUNTRY, DIAL_OPTIONS } from "@/lib/dial-codes";

// The country phone fields start on: where the visitor's IP is (so +1 in the US, +92 in Pakistan).
const PhoneCountryContext = createContext(DEFAULT_DIAL_COUNTRY);

export function PhoneCountryProvider({ country, children }: { country: string; children: React.ReactNode }) {
  return <PhoneCountryContext.Provider value={country}>{children}</PhoneCountryContext.Provider>;
}

export function useDefaultPhoneCountry(): string {
  return useContext(PhoneCountryContext);
}

export function PhoneCountrySelect({
  value,
  onChange,
  className,
  style,
}: {
  value: string;
  onChange: (country: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <select aria-label="Country code" value={value} onChange={(e) => onChange(e.target.value)} className={className} style={style}>
      {DIAL_OPTIONS.map((o) => (
        <option key={o.country} value={o.country}>{o.label}</option>
      ))}
    </select>
  );
}

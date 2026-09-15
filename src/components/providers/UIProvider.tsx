"use client";
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useContext, createContext } from "react";
import { useCart } from "./CartProvider";

interface UIContextValue {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  signupPopupOpen: boolean;
  setSignupPopupOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  // cartOpen / setCartOpen sourced from CartProvider (CartProvider is the parent)
  const { cartOpen, setCartOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [signupPopupOpen, setSignupPopupOpen] = useState(false);

  return (
    <UIContext.Provider value={{
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      signupPopupOpen,
      setSignupPopupOpen,
    }}>
      {children}
    </UIContext.Provider>
  );
}

"use server";

import { cookies } from "next/headers";
import {
  customerCreate,
  customerAccessTokenCreate,
  customerAccessTokenDelete,
  getCustomer,
  customerAssociateCart,
} from "./shopify";

const COOKIE = "hhara_customer_token";

async function writeToken(token: string, expiresAt: string) {
  const c = await cookies();
  const expires = new Date(expiresAt);
  c.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

async function readToken(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value || null;
}

async function clearToken() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function signUp(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  acceptsMarketing?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  const created = await customerCreate(input);
  if (created.errors.length) return { ok: false, error: created.errors[0].message };
  // Auto-login after signup
  const tok = await customerAccessTokenCreate(input.email, input.password);
  if (!tok.token) return { ok: false, error: tok.errors[0]?.message || "Login after signup failed" };
  await writeToken(tok.token.accessToken, tok.token.expiresAt);
  return { ok: true };
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const tok = await customerAccessTokenCreate(email, password);
  if (!tok.token) return { ok: false, error: tok.errors[0]?.message || "Invalid credentials" };
  await writeToken(tok.token.accessToken, tok.token.expiresAt);
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const token = await readToken();
  if (token) {
    try { await customerAccessTokenDelete(token); } catch {}
  }
  await clearToken();
}

export async function getCurrentCustomer() {
  const token = await readToken();
  if (!token) return null;
  try {
    return await getCustomer(token);
  } catch {
    await clearToken();
    return null;
  }
}

export async function attachCustomerToCart(cartId: string): Promise<void> {
  const token = await readToken();
  if (!token) return;
  try { await customerAssociateCart(cartId, token); } catch {}
}

"use server";

import { cookies } from "next/headers";
import {
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
  getCart,
  ShopifyCart,
  cartDiscountCodesUpdate,
} from "./shopify";

const COOKIE = "hhara_cart_id";

async function readCartId(): Promise<string | null> {
  const c = await cookies();
  return c.get(COOKIE)?.value || null;
}

async function writeCartId(id: string) {
  const c = await cookies();
  c.set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function clearCartId() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function ensureCart(): Promise<ShopifyCart> {
  const id = await readCartId();
  if (id) {
    const existing = await getCart(id);
    if (existing) return existing;
    await clearCartId();
  }
  const created = await cartCreate();
  await writeCartId(created.id);
  return created;
}

export async function addLine(merchandiseId: string, quantity: number): Promise<ShopifyCart> {
  const cart = await ensureCart();
  return cartLinesAdd(cart.id, [{ merchandiseId, quantity }]);
}

export async function updateLine(lineId: string, quantity: number): Promise<ShopifyCart> {
  const id = await readCartId();
  if (!id) return ensureCart();
  if (quantity <= 0) return cartLinesRemove(id, [lineId]);
  return cartLinesUpdate(id, [{ id: lineId, quantity }]);
}

export async function removeLine(lineId: string): Promise<ShopifyCart> {
  const id = await readCartId();
  if (!id) return ensureCart();
  return cartLinesRemove(id, [lineId]);
}

export async function getCurrentCart(): Promise<ShopifyCart | null> {
  const id = await readCartId();
  if (!id) return null;
  return getCart(id);
}

export async function applyDiscountCode(code: string): Promise<ShopifyCart> {
  const id = await readCartId();
  if (!id) return ensureCart();
  return cartDiscountCodesUpdate(id, code ? [code] : []);
}

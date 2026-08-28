"use server";

import { cookies } from "next/headers";
import {
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
  cartAttributesUpdate,
  getCart,
  ShopifyCart,
  cartDiscountCodesUpdate,
} from "./shopify";

const COOKIE = "hhara_cart_id";
const ATTR_COOKIE = "hhara_attr";

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

async function getAttributionAttributes(): Promise<{ key: string; value: string }[]> {
  try {
    const c = await cookies();
    const raw = c.get(ATTR_COOKIE)?.value;
    if (!raw) return [];
    const attr = JSON.parse(decodeURIComponent(raw));
    const attributes: { key: string; value: string }[] = [];
    if (attr.utm_source) attributes.push({ key: "_utm_source", value: String(attr.utm_source) });
    if (attr.utm_medium) attributes.push({ key: "_utm_medium", value: String(attr.utm_medium) });
    if (attr.utm_campaign) attributes.push({ key: "_utm_campaign", value: String(attr.utm_campaign) });
    if (attr.utm_term) attributes.push({ key: "_utm_term", value: String(attr.utm_term) });
    if (attr.utm_content) attributes.push({ key: "_utm_content", value: String(attr.utm_content) });
    if (attr.gclid) attributes.push({ key: "_gclid", value: String(attr.gclid) });
    if (attr.fbclid) attributes.push({ key: "_fbclid", value: String(attr.fbclid) });
    if (attr.ttclid) attributes.push({ key: "_ttclid", value: String(attr.ttclid) });
    if (attr.referrer) attributes.push({ key: "_landing_referrer", value: String(attr.referrer) });
    if (attr.landing_page) attributes.push({ key: "_landing_page", value: String(attr.landing_page) });
    return attributes;
  } catch {
    return [];
  }
}

export async function ensureCart(): Promise<ShopifyCart> {
  const id = await readCartId();
  if (id) {
    try {
      const existing = await getCart(id);
      if (existing && existing.checkoutUrl) return existing;
    } catch (e) {
      console.warn("[cart] failed to fetch existing cart, creating new one:", e);
    }
    await clearCartId();
  }
  let created = await cartCreate();
  await writeCartId(created.id);

  // Sync initial attribution attributes if present
  try {
    const attrs = await getAttributionAttributes();
    if (attrs.length > 0) {
      created = await cartAttributesUpdate(created.id, attrs);
    }
  } catch (err) {
    console.warn("[cart] attribution sync on create error:", err);
  }

  return created;
}

export async function syncCartAttribution(attributes: { key: string; value: string }[]): Promise<ShopifyCart | null> {
  const id = await readCartId();
  if (!id || !attributes.length) return null;
  try {
    return await cartAttributesUpdate(id, attributes);
  } catch (e) {
    console.warn("[cart] syncCartAttribution error:", e);
    return null;
  }
}

export async function addLine(merchandiseId: string, quantity: number): Promise<ShopifyCart> {
  let cart = await ensureCart();
  try {
    return await cartLinesAdd(cart.id, [{ merchandiseId, quantity }]);
  } catch (e) {
    // Cart may be expired/invalid: clear and retry with a fresh cart
    console.warn("[cart] addLine failed, retrying with fresh cart:", e);
    await clearCartId();
    cart = await ensureCart();
    return cartLinesAdd(cart.id, [{ merchandiseId, quantity }]);
  }
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

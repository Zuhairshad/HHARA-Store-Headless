"use server";

import { setCustomerNote, shopifyFetch } from "./shopify";
import { verifyHumanSubmission } from "./bot-protection";
import { subscribeKlaviyo, updateKlaviyoProfile } from "./klaviyo";

// Create a Shopify customer with marketing consent, and subscribe the email
// directly to a Klaviyo list (when KLAVIYO_PRIVATE_API_KEY and KLAVIYO_LIST_ID are set).
export async function subscribeNewsletter(
  email: string,
  name?: string,
  phone?: string,
  dob?: string,
  honeypot?: string,
  formTimestamp?: number,
  source?: string
): Promise<{ ok: boolean; error?: string }> {
  // 1. Anti-Bot Verification
  const botCheck = await verifyHumanSubmission({
    honeypot,
    timestamp: formTimestamp,
    email,
    action: "newsletter",
  });
  if (!botCheck.allowed) {
    return { ok: false, error: botCheck.error || "Subscription rejected." };
  }

  const [shopify, klaviyoOk] = await Promise.all([
    subscribeShopify(email, name, phone, dob),
    subscribeKlaviyo(email, source),
  ]);
  if (klaviyoOk && (name || phone || dob)) await updateKlaviyoProfile(email, { name, phone, dob });
  // Klaviyo alone is enough to count as subscribed if Shopify rejected the request
  if (!shopify.ok && klaviyoOk) return { ok: true };
  return shopify;
}

async function subscribeShopify(
  email: string,
  name?: string,
  phone?: string,
  dob?: string
): Promise<{ ok: boolean; error?: string }> {
  const query = /* GraphQL */ `
    mutation Subscribe($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email }
        customerUserErrors { code message field }
      }
    }
  `;
  try {
    const input: any = {
      email: email.trim().toLowerCase(),
      acceptsMarketing: true,
      password: cryptoRandom(),
    };
    if (name) {
      const parts = name.trim().split(/\s+/);
      input.firstName = parts[0];
      if (parts.length > 1) {
        input.lastName = parts.slice(1).join(" ");
      }
    }
    if (phone) {
      input.phone = phone.trim();
    }

    const data = await shopifyFetch<{ customerCreate: { customer: any; customerUserErrors: { code: string; message: string }[] } }>(query, {
      input,
    });
    const errs = data.customerCreate.customerUserErrors;
    if (errs.length) {
      // Treat duplicate as success - they're already on the list
      if (errs.some((e) => /already/i.test(e.message) || e.code === "TAKEN")) return { ok: true };
      // Never show Shopify's internal messages (e.g. about the hidden generated password) to visitors
      console.error("[newsletter] Shopify customerCreate failed:", errs);
      if (errs.some((e: any) => e.field?.includes("email"))) {
        return { ok: false, error: "Please enter a valid email address." };
      }
      return { ok: false, error: "We couldn't add you just now. Please try again in a moment." };
    }
    // The Storefront API can't take a note, so the birthday is saved via the Admin API
    const customerId = data.customerCreate.customer?.id;
    if (customerId && dob) await setCustomerNote(customerId, `DOB: ${dob}`);
    return { ok: true };
  } catch (err: any) {
    console.error("[newsletter] Shopify subscribe threw:", err);
    return { ok: false, error: "We couldn't add you just now. Please try again in a moment." };
  }
}

function cryptoRandom(): string {
  // Strong random password (Shopify requires one even for marketing-only signup).
  // 16 bytes -> 32 hex chars; Shopify rejects passwords over 40 characters.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

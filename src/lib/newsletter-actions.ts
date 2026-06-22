"use server";

import { shopifyFetch } from "./shopify";

// Create a Shopify customer with marketing consent. Klaviyo (installed in the
// store) will sync this customer automatically from the Shopify webhook.
export async function subscribeNewsletter(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Invalid email" };
  }
  const query = /* GraphQL */ `
    mutation Subscribe($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id email }
        customerUserErrors { code message field }
      }
    }
  `;
  try {
    const data = await shopifyFetch<{ customerCreate: { customer: any; customerUserErrors: { code: string; message: string }[] } }>(query, {
      input: {
        email,
        acceptsMarketing: true,
        // No password - Shopify creates a "guest" / marketing-only customer record.
        // If Shopify rejects this for missing password, we'll fall through and treat
        // certain error codes as success (e.g. ALREADY_EXISTS).
        password: cryptoRandom(),
      },
    });
    const errs = data.customerCreate.customerUserErrors;
    if (errs.length) {
      // Treat duplicate as success - they're already on the list
      if (errs.some((e) => /already/i.test(e.message) || e.code === "TAKEN")) return { ok: true };
      return { ok: false, error: errs[0].message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to subscribe" };
  }
}

function cryptoRandom(): string {
  // Strong random password (Shopify requires one even for marketing-only signup)
  const bytes = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

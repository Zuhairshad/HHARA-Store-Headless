"use server";

import { shopifyFetch } from "./shopify";
import { verifyHumanSubmission } from "./bot-protection";

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
    if (dob) {
      input.note = `DOB: ${dob}`;
    }

    const data = await shopifyFetch<{ customerCreate: { customer: any; customerUserErrors: { code: string; message: string }[] } }>(query, {
      input,
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

// Subscribe an email to a Klaviyo list with email marketing consent.
// Returns false (never throws) when not configured or on failure.
async function subscribeKlaviyo(email: string, source?: string): Promise<boolean> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!apiKey || !listId) return false;

  try {
    const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        revision: "2025-01-15",
        accept: "application/vnd.api+json",
        "content-type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            custom_source: source || "Website Newsletter",
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: email.trim().toLowerCase(),
                    subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });
    if (!res.ok) {
      console.error("Klaviyo subscribe failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Klaviyo subscribe error", err);
    return false;
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

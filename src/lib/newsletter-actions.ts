"use server";

import { createSubscriber, subscribeExistingCustomer } from "./shopify";
import { verifyHumanSubmission } from "./bot-protection";
import { subscribeKlaviyo, updateKlaviyoProfile } from "./klaviyo";
import { FIELD_LIMITS } from "./form-rules";

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
  // 0. Length caps: the inputs' maxLength only binds the browser, this action can be called directly
  if (
    typeof email !== "string" ||
    email.trim().length > FIELD_LIMITS.email ||
    (name && name.trim().length > FIELD_LIMITS.name) ||
    (phone && phone.trim().length > FIELD_LIMITS.phone) ||
    (dob && dob.trim().length > FIELD_LIMITS.dob)
  ) {
    return { ok: false, error: "Please check your details and try again." };
  }

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
  const input: { email: string; firstName?: string; lastName?: string; phone?: string; note?: string } = {
    email: email.trim().toLowerCase(),
  };
  if (name) {
    const parts = name.trim().split(/\s+/);
    input.firstName = parts[0];
    if (parts.length > 1) input.lastName = parts.slice(1).join(" ");
  }
  if (phone) input.phone = phone.trim();
  if (dob) input.note = `DOB: ${dob}`;
  try {
    // A subscriber record without a password. Creating a full account here (as the popup used
    // to, with a hidden random password) left people with an account they could not sign in to.
    const res = await createSubscriber(input);
    if (res.ok) return { ok: true };
    // Already a customer (subscriber or account holder): make sure they are subscribed
    if (res.taken) {
      await subscribeExistingCustomer(input.email);
      return { ok: true };
    }
    if (res.emailInvalid) return { ok: false, error: "Please enter a valid email address." };
    return { ok: false, error: "We couldn't add you just now. Please try again in a moment." };
  } catch (err: any) {
    console.error("[newsletter] Shopify subscribe threw:", err);
    return { ok: false, error: "We couldn't add you just now. Please try again in a moment." };
  }
}

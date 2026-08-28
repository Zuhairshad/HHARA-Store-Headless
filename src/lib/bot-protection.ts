import { headers } from "next/headers";
import { rateLimit } from "./rate-limit";

// Common disposable/temporary email provider domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "sharklasers.com",
  "yopmail.com",
  "dispostable.com",
  "trashmail.com",
  "getairmail.com",
  "throwawaymail.com",
  "fakemailgenerator.com",
]);

export interface BotCheckParams {
  honeypot?: string;
  timestamp?: number; // client form render timestamp
  email: string;
  action: "signup" | "newsletter";
}

export interface BotCheckResult {
  allowed: boolean;
  error?: string;
  reason?: "honeypot" | "rate_limited" | "invalid_email" | "disposable_email" | "too_fast";
}

export async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return h.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

export async function verifyHumanSubmission(params: BotCheckParams): Promise<BotCheckResult> {
  const { honeypot, timestamp, email, action } = params;

  // 1. Honeypot check: Bots fill hidden inputs automatically
  if (honeypot && honeypot.trim().length > 0) {
    console.warn(`[bot-protection] Honeypot triggered for ${action} by email: ${email}`);
    return {
      allowed: false,
      reason: "honeypot",
      error: "Submission rejected.",
    };
  }

  // 2. Timing check: Humans take at least 1.2 seconds to view and submit a form
  if (timestamp) {
    const elapsed = Date.now() - timestamp;
    if (elapsed < 1000) {
      console.warn(`[bot-protection] Fast submission (${elapsed}ms) for ${action} by email: ${email}`);
      return {
        allowed: false,
        reason: "too_fast",
        error: "Please wait a moment before submitting.",
      };
    }
  }

  // 3. Email syntax & format check
  const cleanEmail = (email || "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      allowed: false,
      reason: "invalid_email",
      error: "Please enter a valid email address.",
    };
  }

  // 4. Disposable email domain check
  const domain = cleanEmail.split("@")[1];
  if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      allowed: false,
      reason: "disposable_email",
      error: "Temporary or disposable email addresses are not permitted.",
    };
  }

  // 5. Rate limiting by IP and action
  const ip = await getClientIp();
  const rateLimitOpts =
    action === "signup"
      ? { limit: 5, windowSec: 600 } // 5 signups per 10 mins per IP
      : { limit: 6, windowSec: 300 }; // 6 newsletter subscriptions per 5 mins per IP

  const rateResult = rateLimit(`bot:${action}:${ip}`, rateLimitOpts);
  if (!rateResult.ok) {
    console.warn(`[bot-protection] Rate limit exceeded for IP: ${ip} on action: ${action}`);
    return {
      allowed: false,
      reason: "rate_limited",
      error: `Too many requests. Please try again in ${rateResult.retryAfterSec} seconds.`,
    };
  }

  return { allowed: true };
}

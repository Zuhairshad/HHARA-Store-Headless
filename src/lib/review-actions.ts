"use server";

import { getClientIp } from "./bot-protection";
import { rateLimit } from "./rate-limit";
import { trackKlaviyoEvent } from "./klaviyo";

// Reviews are never published automatically. Each one is sent to Klaviyo as a "Submitted Review"
// event on the team inbox's profile; a Klaviyo flow on that metric emails it to the inbox for approval.
const REVIEW_INBOX = process.env.REVIEW_NOTIFY_EMAIL || "contact@hhara.com";

export interface ReviewInput {
  name: string;
  location: string;
  rating: number;
  product: string;
  review: string;
  page?: string;
}

export async function submitReview(
  input: ReviewInput,
  honeypot?: string,
  formTimestamp?: number
): Promise<{ ok: boolean; error?: string }> {
  // Bots fill hidden inputs and submit instantly; quietly accept so they don't retry
  if (honeypot && honeypot.trim()) return { ok: true };
  if (formTimestamp && Date.now() - formTimestamp < 3000) {
    return { ok: false, error: "Please take a moment before submitting." };
  }

  const ip = await getClientIp();
  const limit = rateLimit(`review:${ip}`, { limit: 3, windowSec: 600 });
  if (!limit.ok) {
    return { ok: false, error: `Too many reviews sent. Please try again in ${limit.retryAfterSec} seconds.` };
  }

  const clean = (s: unknown, max: number) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  const name = clean(input.name, 40);
  const location = clean(input.location, 40);
  const product = clean(input.product, 80);
  const review = clean(input.review, 500);
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));
  if (!name || !location || !review) {
    return { ok: false, error: "Please fill in your name, location and review." };
  }

  const ok = await trackKlaviyoEvent("Submitted Review", REVIEW_INBOX, {
    ReviewerName: name,
    ReviewerLocation: location,
    Rating: rating,
    Stars: "★".repeat(rating) + "☆".repeat(5 - rating),
    Product: product,
    Review: review,
    Page: clean(input.page, 200),
    SubmittedAt: new Date().toISOString(),
  });
  if (!ok) return { ok: false, error: "We couldn't send your review just now. Please try again in a moment." };
  return { ok: true };
}

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

// Purges the cached catalogue (tag "products") when Shopify reports a product change.
// Two ways in, both fail closed when their secret is not configured:
//   1. Shopify webhook (products/create|update|delete, inventory_levels/update): X-Shopify-Hmac-Sha256 signed with
//      SHOPIFY_WEBHOOK_SECRET (Settings → Notifications → Webhooks shows the signing secret).
//   2. Manual purge: POST /api/revalidate?secret=<REVALIDATION_TOKEN>.

// In-memory sliding window rate limiter (max 10 requests per minute per IP, per function instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 10;
const WINDOW_MS = 60 * 1000;

function getIpAddress(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) if (now > val.resetTime) rateLimitMap.delete(key);
  }
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }
  record.count++;
  return record.count > LIMIT;
}

/** Constant-time string comparison (no early exit that leaks how much of the secret matched). */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function purge(method: string) {
  revalidateTag("products");
  console.log(`[revalidate] purged "products" via ${method}`);
  return NextResponse.json({ revalidated: true, method, now: Date.now() });
}

export async function POST(req: NextRequest) {
  if (rateLimited(getIpAddress(req))) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const manualToken = process.env.REVALIDATION_TOKEN;
  const given = req.nextUrl.searchParams.get("secret");
  if (manualToken && given && safeEqual(given, manualToken)) return purge("query_token");

  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  if (webhookSecret && hmac) {
    const rawBody = await req.text();
    const digest = crypto.createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("base64");
    if (safeEqual(digest, hmac)) return purge(`webhook:${req.headers.get("x-shopify-topic") || "unknown"}`);
    console.warn("[revalidate] invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!manualToken && !webhookSecret) console.error("[revalidate] neither REVALIDATION_TOKEN nor SHOPIFY_WEBHOOK_SECRET is set");
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

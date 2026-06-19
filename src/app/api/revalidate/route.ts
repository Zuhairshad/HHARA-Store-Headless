import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

// In-memory sliding window rate limiter (max 10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 10;
const WINDOW_MS = 60 * 1000; // 1 minute

function getIpAddress(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Clean up memory leaks periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  record.count++;
  return record.count > LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = getIpAddress(req);
  
  if (checkRateLimit(ip)) {
    console.warn(`[shopify-webhook] Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const token = req.nextUrl.searchParams.get("secret");

  // 1. Check Query Parameter Token (for manual purging or dev/test triggers)
  const devToken = process.env.REVALIDATION_TOKEN || "test_bypass_token";
  if (token && token === devToken) {
    revalidateTag("products");
    console.log("[shopify-webhook] Manual revalidation triggered successfully.");
    return NextResponse.json({ revalidated: true, method: "query_token", now: Date.now() });
  }

  // 2. Check Shopify Webhook HMAC Signature
  if (secret) {
    const hmac = req.headers.get("x-shopify-hmac-sha256");
    if (!hmac) {
      console.warn("[shopify-webhook] Missing x-shopify-hmac-sha256 header.");
      return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
    }

    try {
      const rawBody = await req.text();
      const hash = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64");

      if (hash !== hmac) {
        console.warn("[shopify-webhook] Invalid signature check.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }

      revalidateTag("products");
      console.log("[shopify-webhook] Valid webhook signature. Purged 'products' cache tag.");
      return NextResponse.json({ revalidated: true, method: "webhook", now: Date.now() });
    } catch (err: any) {
      console.error("[shopify-webhook] Error processing raw request body:", err);
      return NextResponse.json({ error: "Error parsing body" }, { status: 500 });
    }
  }

  console.warn("[shopify-webhook] Unauthorized revalidation attempt: no matching tokens/secrets.");
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_API = `https://${process.env.SHOPIFY_STORE_DOMAIN || "cuxtmt-tw.myshopify.com"}/api/${process.env.SHOPIFY_API_VERSION || "2025-01"}/graphql.json`;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || "";

// Parse desc="<value>" from a Server-Timing entry like: _y;desc="abc-123"
function parseServerTimingToken(serverTiming: string, key: string): string | null {
  const re = new RegExp(`(?:^|,)\\s*${key}\\s*;[^,]*desc="([^"]+)"`);
  const match = serverTiming.match(re);
  return match ? match[1] : null;
}

async function proxy(request: NextRequest) {
  const body = request.method === "POST" ? await request.text() : undefined;

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": TOKEN,
  };

  // Forward existing visitor/session tokens so Shopify can refresh them
  const visitToken = request.headers.get("X-Shopify-VisitToken");
  const uniqueToken = request.headers.get("X-Shopify-UniqueToken");
  if (visitToken) upstreamHeaders["X-Shopify-VisitToken"] = visitToken;
  if (uniqueToken) upstreamHeaders["X-Shopify-UniqueToken"] = uniqueToken;

  // Also forward existing _shopify_y / _shopify_s cookies so Shopify issues
  // consistent tokens across requests rather than fresh ones each time
  const shopifyY = request.cookies.get("_shopify_y")?.value;
  const shopifyS = request.cookies.get("_shopify_s")?.value;
  if (shopifyY) upstreamHeaders["X-Shopify-UniqueToken"] = shopifyY;
  if (shopifyS) upstreamHeaders["X-Shopify-VisitToken"] = shopifyS;

  try {
    const upstream = await fetch(SHOPIFY_API, {
      method: request.method === "GET" ? "POST" : request.method,
      headers: upstreamHeaders,
      body: body ?? JSON.stringify({ query: "{ shop { name } }" }),
    });

    const responseBody = await upstream.text();
    const serverTiming = upstream.headers.get("Server-Timing") ?? "";

    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        ...(serverTiming && { "Server-Timing": serverTiming }),
        "Timing-Allow-Origin": "*",
      },
    });

    // Shopify's headless Storefront API returns _y (unique visitor) and _s (session)
    // in Server-Timing but NOT _cmp, so hydrogen-react's extractFromPerformanceEntry
    // returns void and falls back to buildUUID() (random tokens Shopify ignores).
    // We parse the real Shopify-issued tokens here and set them as cookies on
    // site.hhara.com so the cookie fallback path picks up genuine tokens.
    const yToken = parseServerTimingToken(serverTiming, "_y");
    const sToken = parseServerTimingToken(serverTiming, "_s");

    if (yToken) {
      response.cookies.set("_shopify_y", yToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 360, // 360 days — matches Shopify's own TTL
        sameSite: "lax",
        secure: true,
        httpOnly: false, // Must be readable by JS (hydrogen-react reads it)
      });
    }

    if (sToken) {
      response.cookies.set("_shopify_s", sToken, {
        path: "/",
        maxAge: 60 * 30, // 30 minutes — session token
        sameSite: "lax",
        secure: true,
        httpOnly: false,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}

export const GET = proxy;
export const POST = proxy;

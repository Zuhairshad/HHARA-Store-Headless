// Same-origin Storefront API proxy.
// useShopifyCookies (hydrogen-react) fetches /api/unstable/graphql.json same-origin
// so the browser can read Server-Timing headers (browsers only expose these for same-origin
// responses). Shopify embeds _shopify_y / _shopify_s visitor tokens in those headers;
// getTrackingValues() reads them via PerformanceResourceTiming.serverTiming.
import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_API = `https://${process.env.SHOPIFY_STORE_DOMAIN || "cuxtmt-tw.myshopify.com"}/api/${process.env.SHOPIFY_API_VERSION || "2025-01"}/graphql.json`;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || "";

async function proxy(request: NextRequest) {
  const body = request.method === "POST" ? await request.text() : undefined;

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": TOKEN,
  };

  // Forward existing visitor tokens if present so Shopify can refresh them
  const visitToken = request.headers.get("X-Shopify-VisitToken");
  const uniqueToken = request.headers.get("X-Shopify-UniqueToken");
  if (visitToken) upstreamHeaders["X-Shopify-VisitToken"] = visitToken;
  if (uniqueToken) upstreamHeaders["X-Shopify-UniqueToken"] = uniqueToken;

  try {
    const upstream = await fetch(SHOPIFY_API, {
      method: request.method === "GET" ? "POST" : request.method,
      headers: upstreamHeaders,
      body: body ?? JSON.stringify({ query: "{ shop { name } }" }),
    });

    const responseBody = await upstream.text();
    const serverTiming = upstream.headers.get("Server-Timing") ?? "";

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        // Expose Server-Timing to the browser — this is what useShopifyCookies reads
        ...(serverTiming && { "Server-Timing": serverTiming }),
        "Timing-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}

export const GET = proxy;
export const POST = proxy;

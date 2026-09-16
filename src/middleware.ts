import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_API = `https://${process.env.SHOPIFY_STORE_DOMAIN || "cuxtmt-tw.myshopify.com"}/api/${process.env.SHOPIFY_API_VERSION || "2025-01"}/graphql.json`;

function parseServerTimingToken(serverTiming: string, key: string): string | null {
  const re = new RegExp(`(?:^|,)\\s*${key}\\s*;[^,]*desc="([^"]+)"`);
  const match = serverTiming.match(re);
  return match ? match[1] : null;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only seed cookies when _shopify_y is absent (first-time visitor or expired).
  // On subsequent visits this returns immediately with zero overhead.
  const shopifyY = request.cookies.get("_shopify_y");
  if (shopifyY?.value) return response;

  try {
    const upstream = await fetch(SHOPIFY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN || "",
      },
      body: JSON.stringify({ query: "{ shop { name } }" }),
    });

    const serverTiming = upstream.headers.get("Server-Timing") ?? "";
    const yToken = parseServerTimingToken(serverTiming, "_y");
    const sToken = parseServerTimingToken(serverTiming, "_s");

    if (yToken) {
      response.cookies.set("_shopify_y", yToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 360,
        sameSite: "lax",
        secure: true,
        httpOnly: false,
      });
    }

    if (sToken) {
      response.cookies.set("_shopify_s", sToken, {
        path: "/",
        maxAge: 60 * 30,
        sameSite: "lax",
        secure: true,
        httpOnly: false,
      });
    }
  } catch {
    // non-critical — page still loads, cookies set client-side as fallback
  }

  return response;
}

export const config = {
  // Run on page requests only — skip static assets, images, and API routes
  matcher: ["/((?!_next/static|_next/image|favicon|api|.*\\.(?:ico|png|jpg|jpeg|svg|webp|avif|woff2?|css|js)$).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { trackingCookieDomain } from "@/lib/shopify/analytics-config";

// Same-origin Storefront API endpoint that hydrogen-react's useShopifyCookies({ fetchTrackingValues: true }) calls.
// Shopify answers it with:
//   - Server-Timing _y / _s / _cmp: visitor, session and consent tokens. The browser reads them from the Performance API
//     (Timing-Allow-Origin) and useShopifyCookies writes _shopify_y / _shopify_s on .hhara.com, so checkout.hhara.com
//     sees the same visitor.
//   - Set-Cookie _shopify_essential / _shopify_analytics / _shopify_marketing (HttpOnly) and _shopify_cmp. We pass them
//     through with Domain=.hhara.com for the same reason.
// _cmp is only returned for the consentManagement query, which is why this route sends exactly the query hydrogen-react
// sends. Whatever the browser posts, nothing else ever goes upstream: this is not a general GraphQL proxy.
// consentManagement only exists on the "unstable" Storefront API version (as hydrogen-react's path says), so this one
// fixed query goes there; everything else in the app uses the pinned SHOPIFY_API_VERSION.
const UPSTREAM = `https://${process.env.SHOPIFY_STORE_DOMAIN || "cuxtmt-tw.myshopify.com"}/api/unstable/graphql.json`;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN || "";
const TRACKING_QUERY = JSON.stringify({
  query: "query ensureCookies { consentManagement { cookies(visitorConsent:{}) { cookieDomain } } }",
});
const MAX_BODY_BYTES = 2048;

/** Only Shopify's own tracking/consent cookies are forwarded upstream (never the cart or customer token). */
function shopifyCookieHeader(request: NextRequest): string {
  return request.cookies
    .getAll()
    .filter((c) => /^(_shopify_|_tracking_consent$|_cmp$)/.test(c.name))
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

/** Re-scopes an upstream Set-Cookie to our domain: drops Shopify's Domain attribute, adds ours. */
function rescopeSetCookie(raw: string, domain: string | undefined): string {
  const parts = raw.split(";").map((p) => p.trim()).filter((p) => p && !/^domain=/i.test(p));
  if (domain) parts.push(`Domain=${domain}`);
  return parts.join("; ");
}

async function proxy(request: NextRequest) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
  }

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": TOKEN,
  };
  const visitToken = request.headers.get("X-Shopify-VisitToken");
  const uniqueToken = request.headers.get("X-Shopify-UniqueToken");
  if (visitToken) upstreamHeaders["X-Shopify-VisitToken"] = visitToken;
  if (uniqueToken) upstreamHeaders["X-Shopify-UniqueToken"] = uniqueToken;
  const cookie = shopifyCookieHeader(request);
  if (cookie) upstreamHeaders["Cookie"] = cookie;

  try {
    const upstream = await fetch(UPSTREAM, { method: "POST", headers: upstreamHeaders, body: TRACKING_QUERY, cache: "no-store" });
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Timing-Allow-Origin": "*",
    });
    const serverTiming = upstream.headers.get("Server-Timing");
    if (serverTiming) headers.set("Server-Timing", serverTiming);

    const domain = trackingCookieDomain(request.headers.get("x-forwarded-host") ?? request.headers.get("host"));
    for (const c of upstream.headers.getSetCookie()) {
      if (/^_shopify_|^_tracking_consent=|^_cmp=/.test(c)) headers.append("Set-Cookie", rescopeSetCookie(c, domain));
    }
    return new NextResponse(await upstream.text(), { status: upstream.status, headers });
  } catch {
    // Tracking must never break the page: hydrogen-react proceeds without tokens.
    return NextResponse.json({ data: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}

export const POST = proxy;

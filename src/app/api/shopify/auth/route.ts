import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const REQUIRED_SCOPES = [
  "read_products", "write_products",
  "read_inventory", "write_inventory",
  "read_locations",
  "read_publications", "write_publications",
  "read_product_listings", "write_product_listings",
  "read_orders", "write_orders",
  "read_fulfillments", "write_fulfillments",
  "write_merchant_managed_fulfillment_orders",
  "read_customers", "write_customers",
  "read_themes", "write_themes",
  "read_content", "write_content",
  "read_draft_orders", "write_draft_orders",
  "read_discounts", "write_discounts",
  "read_price_rules", "write_price_rules",
  "read_shipping",
  "read_files", "write_files",
  "write_webhooks",
].join(",");

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get("shop") || process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;

  if (!shop || !clientId) {
    return NextResponse.json(
      { error: "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_CLIENT_ID" },
      { status: 500 }
    );
  }
  if (!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: "Invalid shop domain" }, { status: 400 });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${req.nextUrl.origin}/api/shopify/callback`;
  const installUrl =
    `https://${shop}/admin/oauth/authorize?` +
    new URLSearchParams({
      client_id: clientId,
      scope: REQUIRED_SCOPES,
      redirect_uri: redirectUri,
      state,
      "grant_options[]": "",
    }).toString();

  const res = NextResponse.redirect(installUrl);
  res.cookies.set("shopify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}

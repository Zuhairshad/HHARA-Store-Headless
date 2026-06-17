import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const REQUIRED_SCOPES = [
  "write_products",
  "read_products",
  "write_inventory",
  "read_inventory",
  "read_locations",
  "write_publications",
  "read_publications",
  "read_orders",
  "write_orders",
  "read_product_listings",
  "write_product_listings",
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

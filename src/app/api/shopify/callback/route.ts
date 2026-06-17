import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function verifyHmac(params: URLSearchParams, secret: string): boolean {
  const hmac = params.get("hmac");
  if (!hmac) return false;
  const sorted = Array.from(params.entries())
    .filter(([k]) => k !== "hmac" && k !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const computed = crypto.createHmac("sha256", secret).update(sorted).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

function persistTokenToEnv(token: string, shop: string) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  let content = "";
  if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, "utf8");

  const upsert = (key: string, value: string) => {
    const line = `${key}=${value}`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) content = content.replace(re, line);
    else content = content.trimEnd() + "\n" + line + "\n";
  };

  upsert("SHOPIFY_ADMIN_TOKEN", token);
  upsert("SHOPIFY_STORE_DOMAIN", shop);
  fs.writeFileSync(envPath, content);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const code = params.get("code");
  const shop = params.get("shop");
  const state = params.get("state");
  const stateCookie = req.cookies.get("shopify_oauth_state")?.value;

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Server missing SHOPIFY_CLIENT_ID/SECRET" }, { status: 500 });
  }
  if (!code || !shop || !state) {
    return NextResponse.json({ error: "Missing code, shop or state" }, { status: 400 });
  }
  if (!stateCookie || state !== stateCookie) {
    return NextResponse.json({ error: "State mismatch — possible CSRF" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: "Invalid shop domain" }, { status: 400 });
  }
  if (!verifyHmac(params, clientSecret)) {
    return NextResponse.json({ error: "HMAC verification failed" }, { status: 400 });
  }

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    return NextResponse.json({ error: "Token exchange failed", detail: body }, { status: 502 });
  }

  const data = (await tokenRes.json()) as { access_token: string; scope: string };

  try {
    persistTokenToEnv(data.access_token, shop);
  } catch (err) {
    console.error("Failed to persist token:", err);
  }

  const res = NextResponse.redirect(`${req.nextUrl.origin}/api/shopify/installed?ok=1`);
  res.cookies.delete("shopify_oauth_state");
  return res;
}

import { NextResponse } from "next/server";

export async function GET() {
  const hasToken = !!process.env.SHOPIFY_ADMIN_TOKEN;
  return new NextResponse(
    `<html><body style="font-family:system-ui;padding:40px;max-width:640px;line-height:1.6">
      <h1>${hasToken ? "✓ Shopify Admin connected" : "Token not detected yet"}</h1>
      <p>The admin access token has been written to <code>.env.local</code>. Restart the dev server to pick it up:</p>
      <pre style="background:#f5f5f5;padding:12px;border-radius:6px">npm run dev</pre>
      <p>Then run the seed script to create the 4 HHARA products and delete the 8 mocks:</p>
      <pre style="background:#f5f5f5;padding:12px;border-radius:6px">node scripts/seed-shopify.mjs</pre>
      <p><a href="/">← Back to storefront</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

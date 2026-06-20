#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const API = process.env.SHOPIFY_API_VERSION || "2025-01";
const ENDPOINT = `https://${DOMAIN}/api/${API}/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors) {
    console.error("GraphQL errors:", JSON.stringify(body.errors, null, 2));
    throw new Error("GraphQL");
  }
  return body.data;
}

try {
  // 1. Fetch a product variant ID
  const pData = await gql(`{
    products(first: 1) {
      nodes {
        variants(first: 1) {
          nodes {
            id
            title
          }
        }
      }
    }
  }`);

  const variantId = pData.products.nodes[0].variants.nodes[0].id;
  console.log(`Using variant: ${variantId}`);

  // 2. Create a Cart
  const cartData = await gql(`
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `, {
    input: {
      lines: [{ merchandiseId: variantId, quantity: 1 }]
    }
  });

  const checkoutUrl = cartData.cartCreate.cart.checkoutUrl;
  console.log(`Checkout URL: ${checkoutUrl}`);

  // 3. Test checkout URL redirect destination
  console.log("\nTesting checkout URL redirection...");
  const res = await fetch(checkoutUrl, { redirect: "manual" });
  console.log(`HTTP Status: ${res.status}`);
  const redirectUrl = res.headers.get("location");
  console.log(`Redirect location: ${redirectUrl}`);

  if (redirectUrl) {
    if (redirectUrl.includes("/password")) {
      console.log("\n❌ FAIL: Checkout is still redirecting to the password page!");
    } else {
      console.log("\n✅ SUCCESS: Checkout is redirecting directly to the checkouts page (no password required)!");
    }
  } else {
    // If no redirect, check body content
    const html = await res.text();
    if (html.includes("password")) {
      console.log("\n❌ FAIL: Checkout page mentions password protection!");
    } else {
      console.log("\n✅ SUCCESS: Checkout page loaded without password protection!");
    }
  }
} catch (e) {
  console.error("Error during checkout test:", e);
}

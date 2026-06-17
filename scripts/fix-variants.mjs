#!/usr/bin/env node
// Fills in missing variants on existing HHARA products and sets prices.
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
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = process.env.SHOPIFY_API_VERSION || "2025-01";
const ENDPOINT = `https://${DOMAIN}/admin/api/${API}/graphql.json`;

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Bark Oxides", "Zinc Crimson"];

const PRICES = {
  "imara-bra": "450.00",
  "imara-legging": "620.00",
  "dalia-bra": "420.00",
  "dalia-short": "390.00",
};

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors) {
    console.error("GraphQL errors:", JSON.stringify(body.errors, null, 2));
    throw new Error("GraphQL");
  }
  return body.data;
}

async function listHharaProducts() {
  const data = await gql(`{
    products(first: 50) {
      nodes {
        id
        handle
        title
        variants(first: 50) {
          nodes {
            id
            price
            selectedOptions { name value }
          }
        }
      }
    }
  }`);
  return data.products.nodes.filter((p) => /imara|dalia/i.test(p.title));
}

function comboKey(size, color) {
  return `${size}|${color}`;
}

async function ensureVariants(product) {
  const existing = new Set(
    product.variants.nodes.map((v) => {
      const opts = Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value]));
      return comboKey(opts.Size, opts.Color);
    })
  );

  const price = PRICES[product.handle] || "0.00";

  const toCreate = [];
  for (const size of SIZES) {
    for (const color of COLORS) {
      if (!existing.has(comboKey(size, color))) {
        toCreate.push({
          optionValues: [
            { optionName: "Size", name: size },
            { optionName: "Color", name: color },
          ],
          price,
          inventoryItem: { tracked: true },
        });
      }
    }
  }

  if (toCreate.length) {
    const data = await gql(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants { id title }
          userErrors { field message }
        }
      }`,
      { productId: product.id, variants: toCreate }
    );
    if (data.productVariantsBulkCreate.userErrors.length) {
      console.warn(`  warnings:`, data.productVariantsBulkCreate.userErrors);
    }
    console.log(`  ✓ ${product.title} — added ${data.productVariantsBulkCreate.productVariants.length}`);
  }

  // Set price on all variants (including the default with 0.00)
  const allVariantUpdates = product.variants.nodes
    .filter((v) => v.price === "0.00" || v.price === "0.0")
    .map((v) => ({ id: v.id, price }));

  if (allVariantUpdates.length) {
    const data = await gql(
      `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id price }
          userErrors { field message }
        }
      }`,
      { productId: product.id, variants: allVariantUpdates }
    );
    if (data.productVariantsBulkUpdate.userErrors.length) {
      console.warn(`  price update warnings:`, data.productVariantsBulkUpdate.userErrors);
    }
    console.log(`  ✓ ${product.title} — priced ${data.productVariantsBulkUpdate.productVariants.length} default variant(s) at AED ${price}`);
  }
}

(async () => {
  const products = await listHharaProducts();
  console.log(`found ${products.length} HHARA products`);
  for (const p of products) {
    await ensureVariants(p);
  }
  console.log("✓ done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

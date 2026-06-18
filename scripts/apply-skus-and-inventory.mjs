#!/usr/bin/env node
// Sets SKU on every variant and stocks each at 100 at the primary location.
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
const QTY = 100;

const PRODUCT_CODE = {
  "imara-bra": "IMB",
  "imara-legging": "IML",
  "dalia-bra": "DAB",
  "dalia-short": "DAS",
};
const COLOR_CODE = {
  "Bark Oxides": "BRK",
  "Zinc Crimson": "ZNC",
};

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors) {
    console.error(JSON.stringify(body.errors, null, 2));
    throw new Error("GraphQL");
  }
  return body.data;
}

const locs = await gql(`{ locations(first:5){ nodes{ id name } } }`);
const locationId = locs.locations.nodes[0].id;
console.log(`location: ${locs.locations.nodes[0].name}`);

const data = await gql(`{
  products(first:20){
    nodes {
      id
      handle
      variants(first:50){
        nodes {
          id
          sku
          inventoryItem { id }
          selectedOptions { name value }
        }
      }
    }
  }
}`);

for (const p of data.products.nodes) {
  const pc = PRODUCT_CODE[p.handle];
  if (!pc) { console.log(`skip ${p.handle}`); continue; }
  console.log(`\n${p.handle}`);

  const variantUpdates = p.variants.nodes.map((v) => {
    const size = v.selectedOptions.find((o) => o.name === "Size")?.value || "ONE";
    const color = v.selectedOptions.find((o) => o.name === "Color")?.value || "";
    const cc = COLOR_CODE[color] || color.slice(0, 3).toUpperCase();
    const sku = `HHARA-${pc}-${size}-${cc}`;
    return { id: v.id, sku, inventoryItemId: v.inventoryItem.id };
  });

  const skuRes = await gql(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants { id sku }
        userErrors { field message }
      }
    }`,
    {
      productId: p.id,
      variants: variantUpdates.map((u) => ({ id: u.id, inventoryItem: { sku: u.sku } })),
    }
  );
  if (skuRes.productVariantsBulkUpdate.userErrors.length) {
    console.warn("sku warnings:", skuRes.productVariantsBulkUpdate.userErrors);
  }
  for (const v of skuRes.productVariantsBulkUpdate.productVariants) {
    console.log(`  sku → ${v.sku}`);
  }

  for (const u of variantUpdates) {
    await gql(
      `mutation($inv: InventorySetQuantitiesInput!) {
        inventorySetQuantities(input: $inv) {
          userErrors { field message }
        }
      }`,
      {
        inv: {
          name: "available",
          reason: "correction",
          ignoreCompareQuantity: true,
          quantities: [{ inventoryItemId: u.inventoryItemId, locationId, quantity: QTY }],
        },
      }
    );
  }
  console.log(`  inventory → ${QTY} on ${variantUpdates.length} variants`);
}

console.log("\n✓ done");

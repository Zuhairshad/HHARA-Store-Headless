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
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = process.env.SHOPIFY_API_VERSION || "2025-01";
const ENDPOINT = `https://${DOMAIN}/admin/api/${API}/graphql.json`;

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

try {
  const data = await gql(`{
    products(first:50) {
      nodes {
        id
        title
        handle
        totalInventory
        variants(first:50) {
          nodes {
            id
            title
            sku
            inventoryQuantity
          }
        }
      }
    }
  }`);

  console.log("=== SHOPIFY LIVE INVENTORY CHECK ===");
  for (const p of data.products.nodes) {
    console.log(`\nProduct: ${p.title} (${p.handle})`);
    console.log(`Total Product Inventory: ${p.totalInventory}`);
    console.log("Variants:");
    let sum = 0;
    for (const v of p.variants.nodes) {
      console.log(`  - Variant: "${v.title}" | SKU: ${v.sku || "NONE"} | Stock: ${v.inventoryQuantity}`);
      sum += v.inventoryQuantity;
    }
    console.log(`  Sum of variant stock: ${sum}`);
  }
} catch (e) {
  console.error("Error during check:", e);
}

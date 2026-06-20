#!/usr/bin/env node
// Sets inventory quantity for all HHARA variants at the primary location.
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

const QUANTITY = 10;

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

const locs = await gql(`{ locations(first:5){ nodes{ id name } } }`);
const primary = locs.locations.nodes[0];
console.log(`primary location: ${primary.name} (${primary.id})`);

const data = await gql(`{
  products(first:50) {
    nodes {
      id
      title
      variants(first:50) {
        nodes {
          id
          title
          inventoryItem { id }
        }
      }
    }
  }
}`);
const hhara = data.products.nodes.filter((p) => /imara|dalia/i.test(p.title));

const setQuantities = [];
for (const p of hhara) {
  for (const v of p.variants.nodes) {
    setQuantities.push({
      inventoryItemId: v.inventoryItem.id,
      locationId: primary.id,
      quantity: QUANTITY,
    });
  }
}

console.log(`setting ${setQuantities.length} inventory entries to ${QUANTITY}`);

const result = await gql(
  `mutation($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup { reason }
      userErrors { field message }
    }
  }`,
  {
    input: {
      name: "available",
      reason: "correction",
      ignoreCompareQuantity: true,
      quantities: setQuantities,
    },
  }
);

if (result.inventorySetQuantities.userErrors.length) {
  console.error("errors:", result.inventorySetQuantities.userErrors);
} else {
  console.log("✓ inventory set");
}

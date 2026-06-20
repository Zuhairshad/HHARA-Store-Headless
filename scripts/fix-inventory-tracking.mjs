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
  // 1. Get all variants and their tracking status
  const data = await gql(`{
    products(first:50) {
      nodes {
        id
        title
        variants(first:50) {
          nodes {
            id
            title
            sku
            inventoryItem {
              id
              tracked
            }
          }
        }
      }
    }
  }`);

  const locs = await gql(`{ locations(first:5){ nodes{ id name } } }`);
  const locationId = locs.locations.nodes[0].id;

  console.log("=== FIXING INVENTORY TRACKING STATE ===");
  
  for (const p of data.products.nodes) {
    if (!/imara|dalia/i.test(p.title)) continue;
    console.log(`\nProduct: ${p.title}`);
    
    for (const v of p.variants.nodes) {
      if (!v.inventoryItem.tracked) {
        console.log(`  - Variant "${v.title}" (SKU: ${v.sku}) is NOT tracked. Enabling...`);
        
        // 2. Enable tracking
        const updateRes = await gql(`
          mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
            inventoryItemUpdate(id: $id, input: $input) {
              inventoryItem { id tracked }
              userErrors { field message }
            }
          }
        `, {
          id: v.inventoryItem.id,
          input: { tracked: true }
        });
        
        if (updateRes.inventoryItemUpdate.userErrors.length) {
          console.error("    Error enabling tracking:", updateRes.inventoryItemUpdate.userErrors);
        } else {
          console.log("    ✓ Tracking enabled successfully.");
          
          // 3. Set quantity to 100 since it was untracked (sometimes enabling tracking resets or needs explicit set)
          const setRes = await gql(`
            mutation($inv: InventorySetQuantitiesInput!) {
              inventorySetQuantities(input: $inv) {
                userErrors { field message }
              }
            }
          `, {
            inv: {
              name: "available",
              reason: "correction",
              ignoreCompareQuantity: true,
              quantities: [{ inventoryItemId: v.inventoryItem.id, locationId, quantity: 100 }],
            }
          });
          
          if (setRes.inventorySetQuantities.userErrors.length) {
            console.error("    Error setting quantity:", setRes.inventorySetQuantities.userErrors);
          } else {
            console.log("    ✓ Quantity set to 100.");
          }
        }
      } else {
        console.log(`  - Variant "${v.title}" (SKU: ${v.sku}) is already tracked.`);
      }
    }
  }
  
  console.log("\nFix complete. Running a verify check...");
  
  // Verify final totalInventory
  const verifyData = await gql(`{
    products(first:50) {
      nodes {
        title
        totalInventory
        variants(first:50) {
          nodes {
            title
            inventoryQuantity
            inventoryItem { tracked }
          }
        }
      }
    }
  }`);
  
  console.log("\n=== VERIFIED STATE ===");
  for (const p of verifyData.products.nodes) {
    if (!/imara|dalia/i.test(p.title)) continue;
    console.log(`${p.title} | totalInventory: ${p.totalInventory}`);
    for (const v of p.variants.nodes) {
      console.log(`  ${v.title} | Stock: ${v.inventoryQuantity} | Tracked: ${v.inventoryItem.tracked}`);
    }
  }

} catch (e) {
  console.error("Error during execution:", e);
}

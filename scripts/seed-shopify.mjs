#!/usr/bin/env node
// One-shot: delete all existing products and seed the 4 HHARA SKUs.
// Run: node scripts/seed-shopify.mjs
// Reads SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_TOKEN from .env.local

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local manually (no dotenv dep)
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = process.env.SHOPIFY_API_VERSION || "2025-01";
if (!DOMAIN || !ADMIN_TOKEN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN");
  process.exit(1);
}

const ENDPOINT = `https://${DOMAIN}/admin/api/${API}/graphql.json`;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
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

async function listAllProducts() {
  const ids = [];
  let cursor = null;
  while (true) {
    const data = await gql(
      `query($cursor: String) { products(first: 100, after: $cursor) { pageInfo { hasNextPage endCursor } nodes { id title } } }`,
      { cursor }
    );
    ids.push(...data.products.nodes.map((n) => ({ id: n.id, title: n.title })));
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return ids;
}

async function deleteProduct(id) {
  const data = await gql(
    `mutation($id: ID!) { productDelete(input: { id: $id }) { deletedProductId userErrors { field message } } }`,
    { id }
  );
  if (data.productDelete.userErrors.length) throw new Error(JSON.stringify(data.productDelete.userErrors));
  return data.productDelete.deletedProductId;
}

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = ["Bark Oxides", "Zinc Crimson"];

const PRODUCTS = [
  {
    title: "Imara Bra",
    handle: "imara-bra",
    productType: "The Imara Set",
    descriptionHtml:
      "<p>Sculpted scoop-neck architecture with brushed-gold structural hardware. High-density double-knit with moisture-wicking construction, a hidden ergonomic internal support band, and capillary ventilation channels.</p><ul><li>Premium recycled performance knit</li><li>Brushed-gold low-friction hardware</li><li>Hidden internal support band</li><li>Machine wash cold · do not tumble dry</li></ul>",
    price: "450.00",
    tags: ["the-imara-set", "bra", "athleisure", "sustainable"],
  },
  {
    title: "Imara Legging",
    handle: "imara-legging",
    productType: "The Imara Set",
    descriptionHtml:
      "<p>Precision-engineered 7/8 ankle-skimming crop with our signature anatomical chevron-contoured waistband. Zero-slip high-waisted stabilization, flatlock structural seaming for moisture control.</p><ul><li>7/8 ankle-skimming length</li><li>Chevron anatomical waistband</li><li>Zero-slip stabilization</li><li>Machine wash cold · do not tumble dry</li></ul>",
    price: "620.00",
    tags: ["the-imara-set", "legging", "athleisure", "sustainable"],
  },
  {
    title: "Dalia Bra",
    handle: "dalia-bra",
    productType: "The Dalia Set",
    descriptionHtml:
      "<p>Low-profile cross-back strap construction with custom brushed-gold hardware accents. Medium-impact adaptive support, open-back thermal ventilation, removable washable contour cups.</p><ul><li>Cross-back strap architecture</li><li>Brushed-gold hardware accents</li><li>Removable contour cups</li><li>Machine wash cold · do not tumble dry</li></ul>",
    price: "420.00",
    tags: ["the-dalia-set", "bra", "athleisure", "sustainable"],
  },
  {
    title: "Dalia Short",
    handle: "dalia-short",
    productType: "The Dalia Set",
    descriptionHtml:
      "<p>High-rise optimization with a 5\" non-restrictive inseam. Omnidirectional 4-way mechanical stretch matrix with targeted muscular stabilization and an integrated secure inner waistband pocket.</p><ul><li>5\" inseam, high-rise</li><li>4-way mechanical stretch</li><li>Hidden inner waistband pocket</li><li>Machine wash cold · do not tumble dry</li></ul>",
    price: "390.00",
    tags: ["the-dalia-set", "short", "athleisure", "sustainable"],
  },
];

async function createProductWithVariants(p) {
  // Step 1: create the product shell with options
  const createData = await gql(
    `mutation($input: ProductInput!) {
      productCreate(input: $input) {
        product { id title }
        userErrors { field message }
      }
    }`,
    {
      input: {
        title: p.title,
        handle: p.handle,
        descriptionHtml: p.descriptionHtml,
        productType: p.productType,
        tags: p.tags,
        status: "ACTIVE",
        productOptions: [
          { name: "Size", values: SIZES.map((v) => ({ name: v })) },
          { name: "Color", values: COLORS.map((v) => ({ name: v })) },
        ],
      },
    }
  );
  if (createData.productCreate.userErrors.length) {
    throw new Error(JSON.stringify(createData.productCreate.userErrors));
  }
  const productId = createData.productCreate.product.id;

  // Step 2: bulk create variants (10 = 5 sizes × 2 colors)
  const variantsInput = SIZES.flatMap((size) =>
    COLORS.map((color) => ({
      optionValues: [
        { optionName: "Size", name: size },
        { optionName: "Color", name: color },
      ],
      price: p.price,
      inventoryItem: { tracked: true },
    }))
  );

  const bulkData = await gql(
    `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        productVariants { id title }
        userErrors { field message }
      }
    }`,
    { productId, variants: variantsInput }
  );
  if (bulkData.productVariantsBulkCreate.userErrors.length) {
    console.warn("Variant warnings:", bulkData.productVariantsBulkCreate.userErrors);
  }

  console.log(`  ✓ ${p.title} (${bulkData.productVariantsBulkCreate.productVariants.length} variants)`);
  return productId;
}

(async () => {
  console.log("→ listing existing products");
  const existing = await listAllProducts();
  console.log(`  found ${existing.length}`);

  for (const p of existing) {
    console.log(`  deleting: ${p.title}`);
    await deleteProduct(p.id);
  }

  console.log("→ seeding 4 HHARA products");
  for (const p of PRODUCTS) {
    await createProductWithVariants(p);
  }

  console.log("✓ done — refresh your storefront");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

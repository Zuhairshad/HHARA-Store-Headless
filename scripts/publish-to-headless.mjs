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

const TARGET_PUBLICATIONS = ["My Store Headless", "Online Store"];

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

const pubs = await gql(`{ publications(first:20){ nodes{ id name } } }`);
const targets = pubs.publications.nodes.filter((p) => TARGET_PUBLICATIONS.includes(p.name));
console.log("publishing to:", targets.map((p) => p.name).join(", "));

const products = await gql(`{ products(first:50){ nodes{ id title } } }`);
const hhara = products.products.nodes.filter((p) => /imara|dalia/i.test(p.title));

for (const p of hhara) {
  const data = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id: p.id, input: targets.map((t) => ({ publicationId: t.id })) }
  );
  if (data.publishablePublish.userErrors.length) {
    console.warn(`  warnings for ${p.title}:`, data.publishablePublish.userErrors);
  } else {
    console.log(`  ✓ published: ${p.title}`);
  }
}

import { getProducts } from "@/lib/shopify";
import { displayColorName, productDescription } from "@/lib/products";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

// Product feed for Google Merchant Center (data source "file from URL", fetched daily).
// One item per variant, priced in AED, linking to the www.hhara.com product page.
// Shipping and returns come from the account-level policies in Merchant Center.

export const revalidate = 3600;

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const numericId = (gid: string) => gid.split("/").pop() ?? gid;

const tag = (name: string, value: string | null | undefined) =>
  value ? `<g:${name}>${xml(value)}</g:${name}>` : "";

export async function GET() {
  const products = await getProducts(100, "AE");

  const items = products.flatMap((p) => {
    // Products without their own photos fall back to placeholder images on the site; keep them out of Google.
    if (!p.featuredImage) return [];

    const description = productDescription(p).replace(/\s+/g, " ").trim() || p.title;
    const productImages = p.images.map((i) => i.url);

    return p.variants.map((v) => {
      const opt = (re: RegExp) => v.selectedOptions.find((o) => re.test(o.name))?.value;
      const rawColor = opt(/color|colour|colorway/i);
      const color = rawColor ? displayColorName(rawColor) : undefined;
      const size = opt(/size/i) ?? (/sock/i.test(p.title) ? "UK 4-7" : "One Size");

      const image = v.image?.url ?? p.featuredImage!.url;
      const extraImages = productImages.filter((u) => u !== image).slice(0, 10);
      const title = [p.title, [color, size].filter(Boolean).join(" / ")].filter(Boolean).join(" - ");

      return `<item>
${tag("id", numericId(v.id))}
${tag("item_group_id", numericId(p.id))}
<title>${xml(title)}</title>
<description>${xml(description)}</description>
<link>${xml(`${SITE_URL}/products/${p.handle}`)}</link>
${tag("image_link", image)}
${extraImages.map((u) => tag("additional_image_link", u)).join("\n")}
${tag("availability", v.availableForSale ? "in_stock" : "out_of_stock")}
${tag("price", `${Number(v.price.amount).toFixed(2)} ${v.price.currencyCode}`)}
${tag("brand", SITE_NAME)}
${tag("condition", "new")}
${tag("identifier_exists", "no")}
${tag("gender", "female")}
${tag("age_group", "adult")}
${tag("color", color)}
${tag("size", size)}
${tag("product_type", p.productType)}
</item>`.replace(/\n{2,}/g, "\n");
    });
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${SITE_NAME}</title>
<link>${SITE_URL}</link>
<description>${SITE_NAME} products</description>
${items.join("\n")}
</channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

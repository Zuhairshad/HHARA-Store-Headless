import { getProducts } from "@/lib/shopify";
import { DEFAULT_DESCRIPTION, IS_LAUNCHED, JOURNAL_ARTICLES, PAGES, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

// llms.txt (https://llmstxt.org): a plain-text brief that helps AI assistants
// describe and link to HHARA accurately.
export async function GET() {
  if (!IS_LAUNCHED) {
    const teaser = [
      "# HHARA",
      "",
      "> HHARA is a considered-luxury women's activewear label based in the UAE. She is Wonder. Arriving October 2026.",
      "",
      `- [HHARA — Coming Soon](${SITE_URL}/): join the list for launch news. Instagram: @thisishhara.`,
      "",
    ].join("\n");
    return new Response(teaser, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  let productLines: string[] = [];
  try {
    const products = await getProducts(100);
    productLines = products.map((p) => {
      const price = p.priceRange?.minVariantPrice;
      const priceText = price ? ` (from ${price.amount} ${price.currencyCode})` : "";
      const summary = p.description?.split("\n")[0]?.trim();
      return `- [${p.title}](${SITE_URL}/products/${p.handle})${priceText}${summary ? `: ${summary}` : ""}`;
    });
  } catch (err) {
    console.error("llms.txt: failed to load products", err);
  }

  const pageLines = Object.entries(PAGES)
    .filter(([, page]) => !page.noindex)
    .map(([path, page]) => `- [${page.title}](${SITE_URL}${path}): ${page.description}`);

  const articleLines = JOURNAL_ARTICLES.map(
    (a) => `- [${a.title}](${SITE_URL}/journal/${a.id}): ${a.excerpt}`,
  );

  const body = [
    "# HHARA",
    "",
    `> HHARA is a considered-luxury women's activewear label based in the UAE. ${DEFAULT_DESCRIPTION}`,
    "",
    "HHARA makes a small capsule of performance pieces — the Imara and Dahlia sets — in two colourways, Chicory Brown and Olive, using recycled performance fabric. Tagline: \"She is Wonder.\" Instagram: @thisishhara.",
    "",
    "## Products",
    ...(productLines.length ? productLines : [`- [Shop all](${SITE_URL}/shop)`]),
    "",
    "## Pages",
    ...pageLines,
    "",
    "## Journal",
    ...articleLines,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

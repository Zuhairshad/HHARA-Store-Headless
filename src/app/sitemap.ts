import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopify";
import { IS_LAUNCHED, JOURNAL_ARTICLES, PAGES, SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  if (!IS_LAUNCHED) {
    return [{ url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 }];
  }

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...Object.entries(PAGES)
      .filter(([, page]) => !page.noindex)
      .map(([path]) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: path === "/home" || path === "/shop" ? 0.9 : 0.5,
      })),
  ];

  const articles: MetadataRoute.Sitemap = JOURNAL_ARTICLES.map((a) => ({
    url: `${SITE_URL}/journal/${a.id}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  let products: MetadataRoute.Sitemap = [];
  try {
    products = (await getProducts(100)).map((p) => ({
      url: `${SITE_URL}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
      images: p.featuredImage?.url ? [p.featuredImage.url] : undefined,
    }));
  } catch (err) {
    console.error("sitemap: failed to load products", err);
  }

  return [...pages, ...products, ...articles];
}

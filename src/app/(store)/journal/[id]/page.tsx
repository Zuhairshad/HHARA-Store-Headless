import type { Metadata } from "next";
import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { JOURNAL_ARTICLES, SITE_URL } from "@/lib/seo";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = JOURNAL_ARTICLES.find((a) => a.id === id);
  if (!article) return { title: "The Journal | HHARA" };
  const title = `${article.title} | The HHARA Journal`;
  return {
    title,
    description: article.excerpt,
    alternates: { canonical: `/journal/${id}` },
    openGraph: { title, description: article.excerpt, url: `/journal/${id}`, type: "article", publishedTime: article.date },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  const article = JOURNAL_ARTICLES.find((a) => a.id === id);
  const jsonLd = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    url: `${SITE_URL}/journal/${id}`,
    author: { "@type": "Organization", name: "HHARA" },
    publisher: { "@id": `${SITE_URL}/#organization` },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HharaApp initialProducts={products} initialCart={cart} initialCustomer={customer} initialRoute="article" initialArticleId={id} />
    </>
  );
}

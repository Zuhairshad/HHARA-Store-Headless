import type { Metadata } from "next";
import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";

export const revalidate = 0;

async function getProduct(handle: string) {
  const products = await getStorefrontProducts();
  return products.find((p) => p.shopifyHandle === handle) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product | HHARA" };
  return {
    title: `${product.name} | HHARA`,
    description: product.description?.split("\n")[0] || `${product.name} — Considered Luxury Activewear by HHARA`,
    openGraph: {
      title: `${product.name} | HHARA`,
      images: product.featuredImage ? [{ url: product.featuredImage.url }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);

  const product = products.find((p) => p.shopifyHandle === handle);

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.split("\n")[0] || product.name,
    sku: product.variants[0]?.sku || handle,
    brand: { "@type": "Brand", name: "HHARA" },
    url: `https://site.hhara.com/products/${handle}`,
    image: product.featuredImage?.url,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku || undefined,
      name: v.title,
      price: v.price,
      priceCurrency: "AED",
      availability: v.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://site.hhara.com/products/${handle}`,
    })),
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HharaApp
        initialProducts={products}
        initialCart={cart}
        initialCustomer={customer}
        initialRoute="product"
        initialProductHandle={handle}
      />
    </>
  );
}

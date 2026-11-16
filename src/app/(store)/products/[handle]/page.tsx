import type { Metadata } from "next";
import HharaApp from "@/components/HharaApp";
import { notFound } from "next/navigation";
import { SHOPIFY_CONFIGURED, getStorefrontProducts } from "@/lib/products";
import { getProducts } from "@/lib/shopify";
import { BASE_CURRENCY } from "@/lib/currency";
import { BRAND_ID, ORGANIZATION_ID, SITE_NAME, SITE_URL } from "@/lib/seo";

// Static/ISR: no cookies, headers or searchParams here. Rendered for the store-default market (AED); the visitor's
// cart, customer and currency come from /api/session. New products are rendered on first request (dynamicParams stays on).
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    return (await getProducts(100, "AE")).map((p) => ({ handle: p.handle }));
  } catch (err) {
    console.error("[products] generateStaticParams: Shopify unreachable, pages will be built on demand:", err);
    return [];
  }
}

async function getProduct(handle: string) {
  const products = await getStorefrontProducts();
  return products.find((p) => p.shopifyHandle === handle) || null;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return { title: "Product | HHARA" };
  const title = `${product.name} | HHARA`;
  const description = product.description?.split("\n")[0] || `${product.name} — Considered Luxury Activewear by HHARA`;
  const images = product.featuredImage ? [product.featuredImage.url] : [];
  return {
    title,
    alternates: { canonical: `/products/${handle}` },
    description,
    openGraph: {
      title,
      images: images.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const currency = BASE_CURRENCY;
  const products = await getStorefrontProducts();

  const product = products.find((p) => p.shopifyHandle === handle);
  // An unknown handle is a 404, not a 200 page (otherwise anything can mint a cache entry). Without Shopify credentials
  // (local/preview builds) there is no catalogue to check against, so the built-in products are shown as before.
  if (!product && SHOPIFY_CONFIGURED) notFound();

  // Store-wide policies, kept in line with the Shipping and Returns pages:
  // free 14-day returns and free next-day delivery, both UAE only.
  const returnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "AE",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn",
  };
  const shippingDetails = {
    "@type": "OfferShippingDetails",
    // Free in every currency, so match the offer's currency.
    shippingRate: { "@type": "MonetaryAmount", value: "0.00", currency },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 1, unitCode: "DAY" },
    },
  };

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.split("\n")[0] || product.name,
    sku: product.variants[0]?.sku || handle,
    // Same @id as the Brand node in the site-wide graph, so every product is tied to one HHARA entity
    brand: { "@type": "Brand", "@id": BRAND_ID, name: SITE_NAME },
    manufacturer: { "@id": ORGANIZATION_ID },
    url: `${SITE_URL}/products/${handle}`,
    image: product.featuredImage?.url,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku || undefined,
      name: v.title,
      price: v.price,
      priceCurrency: currency,
      availability: v.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${handle}`,
      hasMerchantReturnPolicy: returnPolicy,
      shippingDetails,
    })),
  } : null;

  // HHARA › Shop › product, so Google sees each product as part of the HHARA site
  const breadcrumbJsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${SITE_URL}/products/${handle}` },
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd]) }}
        />
      )}
      <HharaApp
        initialProducts={products}
        initialRoute="product"
        initialProductHandle={handle}
      />
    </>
  );
}

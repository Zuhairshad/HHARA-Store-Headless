import type { Metadata } from "next";
import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { SITE_URL } from "@/lib/seo";
import { getVisitorContext } from "@/lib/visitor";

export const revalidate = 0;

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
  const [products, cart, customer, { currency }] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
    getVisitorContext(),
  ]);

  const product = products.find((p) => p.shopifyHandle === handle);

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
    // Free in every currency, so match the offer's currency (it follows the visitor's country).
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
    brand: { "@type": "Brand", name: "HHARA" },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
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

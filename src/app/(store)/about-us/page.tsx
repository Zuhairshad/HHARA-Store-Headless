import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { ORGANIZATION_ID, PAGES, SITE_URL, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/about-us");

export const revalidate = 0;

// The About page is where Google learns who HHARA is; mainEntity points at the site-wide Organization node
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE_URL}/about-us`,
  name: PAGES["/about-us"].title,
  description: PAGES["/about-us"].description,
  mainEntity: { "@id": ORGANIZATION_ID },
};

export default async function RoutePage() {
  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <HharaApp initialProducts={products} initialCart={cart} initialCustomer={customer} initialRoute="atelier" />
    </>
  );
}

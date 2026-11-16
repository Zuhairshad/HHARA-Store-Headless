import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { ORGANIZATION_ID, PAGES, SITE_URL, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/about-us");

// Static/ISR: no cookies, headers or searchParams here. The visitor's cart, customer and currency come from /api/session.
export const revalidate = 3600;

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
  const products = await getStorefrontProducts();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <HharaApp initialProducts={products} initialRoute="atelier" />
    </>
  );
}

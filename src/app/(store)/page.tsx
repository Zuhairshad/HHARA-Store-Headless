import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/");

// Static/ISR: no cookies, headers or searchParams here. "/?r=shop" is handled in HharaApp after load, and the
// visitor's cart, customer and currency come from /api/session.
export const revalidate = 3600;

export default async function Page() {
  const products = await getStorefrontProducts();
  return <HharaApp initialProducts={products} />;
}

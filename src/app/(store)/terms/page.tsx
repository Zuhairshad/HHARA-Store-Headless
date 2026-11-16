import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/terms");

// Static/ISR: no cookies, headers or searchParams here. The visitor's cart, customer and currency come from /api/session.
export const revalidate = 3600;

export default async function RoutePage() {
  const products = await getStorefrontProducts();
  return <HharaApp initialProducts={products} initialRoute="terms" />;
}

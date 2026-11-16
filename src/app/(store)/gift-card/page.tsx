import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { pageMetadata } from "@/lib/seo";
import { GIFT_CARDS_ENABLED } from "@/lib/gift-card";
import { redirect } from "next/navigation";

export const metadata = pageMetadata("/gift-card");

// Static/ISR: no cookies, headers or searchParams here. The visitor's cart, customer and currency come from /api/session.
export const revalidate = 3600;

export default async function RoutePage() {
  if (!GIFT_CARDS_ENABLED) redirect("/");
  const products = await getStorefrontProducts();
  return <HharaApp initialProducts={products} initialRoute="gift-card" />;
}

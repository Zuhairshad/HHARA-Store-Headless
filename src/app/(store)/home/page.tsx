import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { pageMetadata } from "@/lib/seo";
import { GIFT_CARDS_ENABLED } from "@/lib/gift-card";

export const metadata = pageMetadata("/home");

export const revalidate = 0;

const VALID_ROUTES = new Set(["shop", "lookbook", "atelier", "stores", "account", "faq", "shipping", "returns", "size-guide", "contact", "gift-card", "privacy", "terms", "wishlist"]);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const { r } = await searchParams;
  const initialRoute = r && VALID_ROUTES.has(r) && (r !== "gift-card" || GIFT_CARDS_ENABLED) ? r : undefined;
  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  return <HharaApp initialProducts={products} initialCart={cart} initialCustomer={customer} initialRoute={initialRoute} />;
}

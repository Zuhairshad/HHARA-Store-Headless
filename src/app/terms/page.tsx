import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/terms");

export const revalidate = 0;

export default async function RoutePage() {
  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  return <HharaApp initialProducts={products} initialCart={cart} initialCustomer={customer} initialRoute="terms" />;
}

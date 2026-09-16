import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";

export const revalidate = 0;

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);
  return <HharaApp initialProducts={products} initialCart={cart} initialCustomer={customer} initialRoute="article" initialArticleId={id} />;
}

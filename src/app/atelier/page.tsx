import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AtelierPage() {
  const products = await getStorefrontProducts();
  return <HharaApp initialProducts={products} initialRoute="atelier" />;
}

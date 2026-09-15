import HharaApp from "@/components/HharaApp";
import { getStorefrontProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const products = await getStorefrontProducts();
  const product = products.find((p: any) => p.handle === handle || p.id === handle);
  return (
    <HharaApp
      initialProducts={products}
      initialRoute="product"
      initialProductId={product?.id || handle}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const products = await getStorefrontProducts();
  const product = products.find((p: any) => p.handle === handle || p.id === handle);
  if (!product) return {};
  return {
    title: `${product.name} | HHARA`,
    description: product.description || "Considered luxury activewear from HHARA.",
    openGraph: {
      title: `${product.name} | HHARA`,
      images: product.featuredImage?.url ? [{ url: product.featuredImage.url }] : [],
    },
  };
}

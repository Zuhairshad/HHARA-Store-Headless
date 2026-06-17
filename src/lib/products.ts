import { getProducts, ShopifyProduct } from "./shopify";

const COLOR_HEX: Record<string, string> = {
  "Bark Oxides": "#5C4632",
  "Zinc Crimson": "#7A2E3A",
  "Default Title": "#888",
};

const TONE_CYCLE = ["tone-2", "tone-1", "tone-7", "tone-6", "tone-5", "tone-3"];
const ALT_TONE_CYCLE = ["tone-3", "tone-6", "tone-3", "tone-1", "tone-4", "tone-2"];

export type LocalProduct = {
  id: string;
  shopifyId: string;
  shopifyHandle: string;
  name: string;
  cat: string;
  price: number;
  priceWas?: number;
  swatches: { name: string; hex: string; variantIdByColor?: string }[];
  sizes: string[];
  tone: string;
  altTone: string;
  badge?: string;
  imgKey: string | null;
  featuredImage: { url: string; altText: string | null } | null;
  images: { url: string; altText: string | null }[];
  variants: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: number;
    selectedOptions: { name: string; value: string }[];
  }[];
  description: string;
  details: string[];
};

function mapShopifyProduct(p: ShopifyProduct, index: number): LocalProduct {
  const colorOpt = p.options.find((o) => /color|colour|colorway/i.test(o.name));
  const sizeOpt = p.options.find((o) => /size/i.test(o.name));

  const swatches = (colorOpt?.values && colorOpt.values.length ? colorOpt.values : ["Default"]).map((v) => ({
    name: v,
    hex: COLOR_HEX[v] || "#5C4632",
  }));
  const sizes = sizeOpt?.values?.length ? sizeOpt.values : ["One Size"];

  return {
    id: `p${index + 1}`,
    shopifyId: p.id,
    shopifyHandle: p.handle,
    name: p.title,
    cat: p.productType || "The Collection",
    price: parseFloat(p.priceRange.minVariantPrice.amount) || 0,
    swatches,
    sizes,
    tone: TONE_CYCLE[index % TONE_CYCLE.length],
    altTone: ALT_TONE_CYCLE[index % ALT_TONE_CYCLE.length],
    imgKey: null,
    featuredImage: p.featuredImage,
    images: p.images,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: parseFloat(v.price.amount) || 0,
      selectedOptions: v.selectedOptions,
    })),
    description: p.description,
    details: p.description.split(/\n+/).filter(Boolean),
  };
}

export async function getStorefrontProducts(): Promise<LocalProduct[]> {
  try {
    const products = await getProducts(50);
    return products.map(mapShopifyProduct);
  } catch (err) {
    console.error("[shopify] product fetch failed:", err);
    return [];
  }
}

export function findVariantId(product: LocalProduct, color: string, size: string): string | null {
  const v = product.variants.find((v) => {
    const opts = Object.fromEntries(v.selectedOptions.map((o) => [o.name.toLowerCase(), o.value]));
    const matchColor = !color || Object.values(opts).includes(color);
    const matchSize = !size || Object.values(opts).includes(size);
    return matchColor && matchSize;
  });
  return v?.id || product.variants[0]?.id || null;
}

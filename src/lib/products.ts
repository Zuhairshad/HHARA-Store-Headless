import { getProducts, ShopifyProduct } from "./shopify";

const COLOR_HEX: Record<string, string> = {
  "Chicory Coffee": "#3D2B1F",
  "Olive Green": "#5F6B4F",
  "Default Title": "#888",
};

const COLOR_NAME_MAP: Record<string, string> = {
  "Bark Oxides": "Chicory Coffee",
  "Zinc Crimson": "Olive Green",
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
  floatingVideoUrl?: string | null;
};

const TALA_FALLBACK_IMAGES = [
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_VNeckVest_DarkOlive_217.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_VNeckVest_DarkOlive.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_BandeauBra_MidnightNavy_070.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_BandeauBra_Midnight_navy.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_VNeckVest_DarkOlive_267.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_VNeckVest_DarkOlive_274.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_BandeauBra_MidnightNavy_106.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_VNeckVest_DarkOlive_201.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_BandeauBra_MidnightNavy_045.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_BandeauBra_MidnightNavy_143.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_VNeckVest_DarkOlive_DETAIL.jpg",
  "https://cdn.shopify.com/s/files/1/0081/8711/7664/files/Dayflex_BandeauBra_Midnight_navy_DETAIL.jpg"
];

function mapShopifyProduct(p: ShopifyProduct, index: number): LocalProduct {
  const colorOpt = p.options.find((o) => /color|colour|colorway/i.test(o.name));
  const sizeOpt = p.options.find((o) => /size/i.test(o.name));

  const swatches = (colorOpt?.values && colorOpt.values.length ? colorOpt.values : ["Default"]).map((v) => {
    const displayName = COLOR_NAME_MAP[v] ?? v;
    return { name: displayName, hex: COLOR_HEX[displayName] || COLOR_HEX[v] || "#3D2B1F" };
  });
  const sizes = sizeOpt?.values?.length ? sizeOpt.values : ["One Size"];

  let featuredImage = p.featuredImage;
  let images = p.images || [];

  if (!featuredImage || !images.length) {
    const idxA = (index * 2) % TALA_FALLBACK_IMAGES.length;
    const idxB = (index * 2 + 1) % TALA_FALLBACK_IMAGES.length;
    featuredImage = {
      url: TALA_FALLBACK_IMAGES[idxA],
      altText: p.title,
      width: 1000,
      height: 1500,
    };
    images = [
      featuredImage,
      {
        url: TALA_FALLBACK_IMAGES[idxB],
        altText: `${p.title} detail`,
        width: 1000,
        height: 1500,
      },
    ];
  }

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
    featuredImage,
    images,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      availableForSale: v.availableForSale,
      price: parseFloat(v.price.amount) || 0,
      selectedOptions: v.selectedOptions,
    })),
    description: p.description,
    details: p.description.split(/\n+/).filter(Boolean),
    floatingVideoUrl: p.metafield?.reference?.sources?.find((s: any) => 
      s.url.includes(".mp4") || s.mimeType?.includes("video/mp4")
    )?.url || p.metafield?.reference?.sources?.[0]?.url || null,
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

const REVERSE_COLOR_MAP: Record<string, string> = {
  "Chicory Coffee": "Bark Oxides",
  "Olive Green": "Zinc Crimson",
};

export function findVariantId(product: LocalProduct, color: string, size: string): string | null {
  const rawColor = REVERSE_COLOR_MAP[color] ?? color;
  const v = product.variants.find((v) => {
    const opts = Object.fromEntries(v.selectedOptions.map((o) => [o.name.toLowerCase(), o.value]));
    const matchColor = !color || Object.values(opts).includes(rawColor) || Object.values(opts).includes(color);
    const matchSize = !size || Object.values(opts).includes(size);
    return matchColor && matchSize;
  });
  return v?.id || product.variants[0]?.id || null;
}

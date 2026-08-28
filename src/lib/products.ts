import { getProducts, ShopifyProduct } from "./shopify";

const COLOR_HEX: Record<string, string> = {
  "Chicory Brown": "#3D2B1F",
  "Olive": "#636b2f",
  "Army Green": "#636b2f",
  "Cream": "#F5F0EB",
  "Camel": "#C19A6B",
  "Default Title": "#888",
};

const COLOR_NAME_MAP: Record<string, string> = {
  "Bark Oxides": "Chicory Brown",
  "Zinc Crimson": "Olive",
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

const V3_DESCRIPTIONS: Record<string, string> = {
  "Imara Sculpt Scoop Neck Bra": "The Imara Sculpt Scoop Neck Bra is thoughtfully designed to complement the body's natural shape with understated elegance. Sculpted paneling provides gentle support and a beautifully contoured fit, while the clean scoop neckline creates a refined, minimalist silhouette that transitions effortlessly from movement to everyday wear.\n\nA piece defined by quiet confidence, where comfort, structure, and timeless design exist in perfect balance.",
  "Imara Bra": "The Imara Sculpt Scoop Neck Bra is thoughtfully designed to complement the body's natural shape with understated elegance. Sculpted paneling provides gentle support and a beautifully contoured fit, while the clean scoop neckline creates a refined, minimalist silhouette that transitions effortlessly from movement to everyday wear.\n\nA piece defined by quiet confidence, where comfort, structure, and timeless design exist in perfect balance.",
  
  "Imara Seamless Sculpt High Waist Legging": "The Imara Seamless Sculpt High Waist Legging is engineered to complement the body's natural shape, creating a refined foundation for an elevated wardrobe. The high-rise waistband provides sculpted support and a smooth, contoured silhouette, while the seamless construction delivers a second-skin feel that moves effortlessly with you from waist to ankle.\n\nDesigned beyond the studio, this essential transitions seamlessly through every part of your day, from intentional movement to elevated everyday moments, where comfort and refinement meet.",
  "Imara Legging": "The Imara Seamless Sculpt High Waist Legging is engineered to complement the body's natural shape, creating a refined foundation for an elevated wardrobe. The high-rise waistband provides sculpted support and a smooth, contoured silhouette, while the seamless construction delivers a second-skin feel that moves effortlessly with you from waist to ankle.\n\nDesigned beyond the studio, this essential transitions seamlessly through every part of your day, from intentional movement to elevated everyday moments, where comfort and refinement meet.",

  "Dahlia Cross Back Bra": "The Dahlia Cross Back Bra is thoughtfully crafted to complement the body's natural shape, balancing refined design with effortless performance. Delicate cross-back create an elegant silhouette, while the softly sculpted neckline offers gentle support and a beautifully contoured fit that moves with ease throughout your day.\n\nMore than a bra, it's an expression of quiet confidence. Thoughtfully structured, meticulously finished, and designed to carry you seamlessly from mindful movement to elevated everyday living.",
  "Dahlia Bra": "The Dahlia Cross Back Bra is thoughtfully crafted to complement the body's natural shape, balancing refined design with effortless performance. Delicate cross-back create an elegant silhouette, while the softly sculpted neckline offers gentle support and a beautifully contoured fit that moves with ease throughout your day.\n\nMore than a bra, it's an expression of quiet confidence. Thoughtfully structured, meticulously finished, and designed to carry you seamlessly from mindful movement to elevated everyday living.",

  "Dahlia Seamless Sculpt High Waist Shorts": "The Dahlia Seamless Sculpt High Waist Short is designed to contour the body with refined simplicity. A sculpting high-rise waistband offers a smooth, supportive fit, while the seamless construction creates an exceptionally soft feel that sits effortlessly against the skin.\n\nElegant in form and versatile by design, a piece that transitions with ease from intentional movement to elevated everyday dressing, combining modern refinement with lasting comfort.",
  "Dahlia Short": "The Dahlia Seamless Sculpt High Waist Short is designed to contour the body with refined simplicity. A sculpting high-rise waistband offers a smooth, supportive fit, while the seamless construction creates an exceptionally soft feel that sits effortlessly against the skin.\n\nElegant in form and versatile by design, a piece that transitions with ease from intentional movement to elevated everyday dressing, combining modern refinement with lasting comfort.",

  "HHARA Comfort Socks": "An elevated essential designed with the same attention to detail as the collection, the HHARA Comfort Socks bring refined comfort to every step. A cushioned footbed provides gentle support, while a hand-linked toe seam ensures a smooth, seamless finish. The sleek design adds the finishing touch to any look from intentional movement to everyday styling.\n\nSimple in form, effortless in function, and created to complement the HHARA lifestyle."
};

function mapShopifyProduct(p: ShopifyProduct, index: number): LocalProduct {
  const colorOpt = p.options.find((o) => /color|colour|colorway/i.test(o.name));
  const sizeOpt = p.options.find((o) => /size/i.test(o.name));

  const swatches = (colorOpt?.values && colorOpt.values.length ? colorOpt.values : ["Default"]).map((v) => {
    const displayName = COLOR_NAME_MAP[v] ?? v;
    return { name: displayName, hex: COLOR_HEX[displayName] || COLOR_HEX[v] || "#3D2B1F" };
  });
  const rawSizes = sizeOpt?.values?.length ? sizeOpt.values : ["One Size"];
  const sizes = /sock/i.test(p.title) ? ["UK 4–7"] : rawSizes;

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

  const desc = V3_DESCRIPTIONS[p.title] || p.description || "";

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
    description: desc,
    details: desc.split(/\n+/).filter(Boolean),
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
  "Chicory Brown": "Bark Oxides",
  "Olive": "Zinc Crimson",
  "Army Green": "Zinc Crimson",
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

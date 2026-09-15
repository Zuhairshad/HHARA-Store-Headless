"use client";
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useContext, createContext } from "react";
import { addLine as serverAddLine, updateLine as serverUpdateLine, removeLine as serverRemoveLine, applyDiscountCode as serverApplyDiscount } from "@/lib/cart-actions";
import { trackEvent, formatEcommerceItem } from "@/lib/analytics";

// ─── local copies of constants that live in HharaApp.tsx ──────────────────────
const B = "https://pjvogtsleqosgl0a.public.blob.vercel-storage.com/products";

const PRODUCT_IMAGES: Record<string, { olive: string[]; brown: string[] }> = {
  p1: {
    olive: [`${B}/p1_olive_4.jpg`, `${B}/p1_olive_2.jpg`, `${B}/p1_olive_1.jpg`, `${B}/p1_olive_3.jpg`, `${B}/p1_olive_5.jpg`],
    brown: [`${B}/p1_brown_4.jpg`, `${B}/p1_brown_2.jpg`, `${B}/p1_brown_1.jpg`, `${B}/p1_brown_3.jpg`, `${B}/p1_brown_5.jpg`],
  },
  p2: {
    olive: [`${B}/p2_olive_1.jpg`, `${B}/p2_olive_2.jpg`, `${B}/p2_olive_3.jpg`, `${B}/p2_olive_4.jpg`, `${B}/p2_olive_5.jpg`],
    brown: [`${B}/p2_brown_1.jpg`, `${B}/p2_brown_2.jpg`, `${B}/p2_brown_3.jpg`, `${B}/p2_brown_4.jpg`, `${B}/p2_brown_5.jpg`],
  },
  p3: {
    olive: [`${B}/p3_olive_1.jpg`, `${B}/p3_olive_4.jpg`, `${B}/p3_olive_2.jpg`, `${B}/p3_olive_3.jpg`, `${B}/p3_olive_5.jpg`],
    brown: [`${B}/p3_brown_4.jpg`, `${B}/p3_brown_2.jpg`, `${B}/p3_brown_1.jpg`, `${B}/p3_brown_3.jpg`, `${B}/p3_brown_5.jpg`],
  },
  p4: {
    olive: [`${B}/p4_olive_4.jpg`, `${B}/p4_olive_1.jpg`, "/images/dshorts-olive-hover.jpg", `${B}/p4_olive_2.jpg`, `${B}/p4_olive_3.jpg`, `${B}/p4_olive_5.jpg`],
    brown: ["/images/dshorts-brown-hover.jpg", `${B}/p4_brown_2.jpg`, `${B}/p4_brown_1.jpg`, `${B}/p4_brown_3.jpg`, "/images/dshorts-brown-default.jpeg"],
  },
};

function getProductColorImages(imgKey: string, colorName: string): string[] {
  const data = PRODUCT_IMAGES[imgKey];
  if (!data) return [];
  if (colorName?.toLowerCase() === "olive") return data.olive;
  if (colorName?.toLowerCase().includes("brown")) return data.brown;
  return [...data.olive.slice(0, 3), ...data.brown.slice(0, 2)];
}

const PRODUCTS = [
  {
    id: "p1",
    name: "Imara Bra",
    cat: "The Imara Set",
    price: 0,
    swatches: [
      { name: "Chicory Brown", hex: "#3D2B1F" },
      { name: "Olive", hex: "#636b2f" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-2",
    altTone: "tone-3",
    badge: "New",
    imgKey: "p1",
    tagline: "Sculpted scoop-neck support",
  },
  {
    id: "p2",
    name: "Imara Legging",
    cat: "The Imara Set",
    price: 0,
    swatches: [
      { name: "Chicory Brown", hex: "#3D2B1F" },
      { name: "Olive", hex: "#636b2f" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-1",
    altTone: "tone-6",
    badge: "New",
    imgKey: "p2",
    tagline: "Anatomical high-waist support",
  },
  {
    id: "p3",
    name: "Dahlia Bra",
    cat: "The Dahlia Set",
    price: 0,
    swatches: [
      { name: "Chicory Brown", hex: "#3D2B1F" },
      { name: "Olive", hex: "#636b2f" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-7",
    altTone: "tone-3",
    imgKey: "p3",
    tagline: "Adaptive cross-back design",
  },
  {
    id: "p4",
    name: "Dahlia Short",
    cat: "The Dahlia Set",
    price: 0,
    swatches: [
      { name: "Chicory Brown", hex: "#3D2B1F" },
      { name: "Olive", hex: "#636b2f" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-6",
    altTone: "tone-1",
    imgKey: "p4",
    tagline: "Omnidirectional stretch short",
  },
  {
    id: "p5",
    name: "HHARA Comfort Socks",
    cat: "Accessories",
    price: 65,
    swatches: [{ name: "Camel", hex: "#C19A6B" }],
    sizes: ["UK 4–7"],
    tone: "tone-1",
    altTone: "tone-2",
    imgKey: "p5",
    featuredImage: { url: "https://images.unsplash.com/photo-1640025867572-f6b3a8410c81?auto=format&fit=crop&q=80&w=1200", altText: "HHARA Comfort Socks Camel" },
    tagline: "Refined comfort for every step",
  },
];

const CART_COLOR_NAME_MAP: Record<string, string> = {
  "Bark Oxides": "Chicory Brown",
  "Zinc Crimson": "Olive",
  "Army Green": "Olive",
};
const CART_COLOR_REVERSE_MAP: Record<string, string> = {
  "Chicory Brown": "Bark Oxides",
  "Olive": "Zinc Crimson",
  "Army Green": "Zinc Crimson",
};
// ──────────────────────────────────────────────────────────────────────────────

interface CartContextValue {
  shopifyCart: any;
  setShopifyCart: (cart: any) => void;
  localCartItems: any[];
  setLocalCartItems: (items: any) => void;
  cart: any[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: any) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateQty: (lineId: string, qty: number) => Promise<void>;
  applyDiscount: (code: string) => Promise<any>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children, initialCart }: { children: React.ReactNode; initialCart: any }) {
  const [shopifyCart, setShopifyCart] = useState<any>(initialCart || null);
  const [localCartItems, setLocalCartItems] = useState<any[]>([]);
  // cartOpen lives here so addToCart can open the drawer
  const [cartOpen, setCartOpen] = useState(false);

  // localStorage cart-id persistence
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCartId = localStorage.getItem("hhara_cart_id");
    if (storedCartId && !shopifyCart?.id) {
      // cart will be hydrated by the server; just note the stored id
    }
  }, []);

  useEffect(() => {
    if (shopifyCart?.id && typeof window !== "undefined") {
      localStorage.setItem("hhara_cart_id", shopifyCart.id);
    }
  }, [shopifyCart?.id]);

  // Use products passed via prop (or fall back to static list)
  const products = PRODUCTS;

  // Derive cart UI items from the Shopify cart structure
  const cart = [
    ...(shopifyCart?.lines || []).map((line: any) => {
      const productMatch = products.find((p: any) => p.variants?.some((v: any) => v.id === line.merchandise.id));
      const opts = Object.fromEntries(line.merchandise.selectedOptions.map((o: any) => [o.name.toLowerCase(), o.value]));
      return {
        key: line.id,
        lineId: line.id,
        variantId: line.merchandise.id,
        id: productMatch?.id || line.merchandise.product.handle,
        name: line.merchandise.product.title,
        price: parseFloat(line.cost.totalAmount.amount) / Math.max(line.quantity, 1),
        qty: line.quantity,
        color: (() => { const raw = opts.color || opts.colour || opts.colorway || "-"; return CART_COLOR_NAME_MAP[raw] ?? raw; })(),
        size: opts.size || "-",
        tone: productMatch?.tone || "tone-2",
        featuredImage: (() => {
          const colorRaw = opts.color || opts.colour || opts.colorway || "";
          const colorName = CART_COLOR_NAME_MAP[colorRaw] ?? colorRaw;
          const imgKey = productMatch?.imgKey;
          if (imgKey && PRODUCT_IMAGES[imgKey]) {
            const imgs = getProductColorImages(imgKey, colorName);
            if (imgs?.[0]) return imgs[0];
          }
          return line.merchandise.image?.url || productMatch?.featuredImage?.url || null;
        })(),
      };
    }),
    ...localCartItems,
  ];

  // Cart analytics — verbatim from HharaApp.tsx lines 5371–5397
  useEffect(() => {
    if (cartOpen || false) {
      if (cart && cart.length > 0) {
        const totalVal = cart.reduce((a: number, i: any) => a + (i.price || 0) * (i.qty || 1), 0);
        trackEvent({
          name: "cart_viewed",
          payload: {
            currency: "AED",
            value: totalVal,
            cart_id: shopifyCart?.id,
            items: cart.map((i: any) =>
              formatEcommerceItem({
                id: i.variantId || i.id,
                name: i.name,
                price: i.price,
                brand: "HHARA",
                category: "Considered Luxury",
                variant: `${i.color} / ${i.size}`,
                currency: "AED",
                quantity: i.qty,
              })
            ),
          },
        });
      }
    }
  }, [cartOpen]);

  const findVariantId = (product: any, color: string, size: string) => {
    if (!product?.variants?.length) return null;
    const rawColor = CART_COLOR_REVERSE_MAP[color] ?? color;
    const match = product.variants.find((v: any) => {
      const opts = Object.fromEntries(v.selectedOptions.map((o: any) => [o.name.toLowerCase(), o.value]));
      const cOk = !color || Object.values(opts).includes(rawColor) || Object.values(opts).includes(color);
      const sOk = !size || Object.values(opts).includes(size);
      return cOk && sOk;
    });
    return match?.id || product.variants[0].id;
  };

  const addToCart = async (item) => {
    if (item.isGiftCard) {
      const localId = `local-gc-${Date.now()}`;
      setLocalCartItems(prev => [...prev, {
        key: localId,
        lineId: localId,
        variantId: null,
        id: "gift-card",
        name: item.name,
        price: item.price,
        qty: 1,
        color: "-",
        size: "-",
        tone: "tone-4",
        featuredImage: "gift-card-monkey",
        isGiftCard: true,
      }]);
      setCartOpen(true);
      return;
    }
    const product = products.find((p: any) => p.id === item.id);
    const variantId = item.variantId || findVariantId(product, item.color, item.size);
    if (!variantId) {
      console.warn("No variant resolved for", item, "- product:", product?.name, "variants:", product?.variants?.length);
      setCartOpen(true);
      return;
    }
    try {
      const next = await serverAddLine(variantId, 1);
      setShopifyCart(next);
      setCartOpen(true);
      trackEvent({
        name: "product_added_to_cart",
        payload: {
          currency: "AED",
          value: item.price || product?.price || 0,
          cart_id: next?.id,
          items: [
            formatEcommerceItem({
              id: variantId,
              name: item.name || product?.name || "Product",
              price: item.price || product?.price || 0,
              brand: "HHARA",
              category: product?.cat || "Considered Luxury",
              variant: item.color ? `${item.color} / ${item.size || ""}` : "Default",
              currency: "AED",
              quantity: 1,
            }),
          ],
        },
      });
    } catch (e) {
      console.error("addToCart failed - variantId:", variantId, e);
      try {
        const retry = await serverAddLine(variantId, 1);
        setShopifyCart(retry);
        setCartOpen(true);
        trackEvent({
          name: "product_added_to_cart",
          payload: {
            currency: "AED",
            value: item.price || product?.price || 0,
            cart_id: retry?.id,
            items: [
              formatEcommerceItem({
                id: variantId,
                name: item.name || product?.name || "Product",
                price: item.price || product?.price || 0,
                brand: "HHARA",
                category: product?.cat || "Considered Luxury",
                variant: item.color ? `${item.color} / ${item.size || ""}` : "Default",
                currency: "AED",
                quantity: 1,
              }),
            ],
          },
        });
      } catch (e2) {
        console.error("addToCart retry also failed", e2);
      }
    }
  };


  const updateQty = async (lineId: string, qty: number) => {
    if (lineId.startsWith("local-")) {
      if (qty <= 0) setLocalCartItems(prev => prev.filter(i => i.lineId !== lineId));
      else setLocalCartItems(prev => prev.map(i => i.lineId === lineId ? { ...i, qty } : i));
      return;
    }
    try {
      const next = await serverUpdateLine(lineId, qty);
      setShopifyCart(next);
    } catch (e) {
      console.error("updateQty failed", e);
    }
  };

  const removeItem = async (lineId: string) => {
    const itemToRemove = cart.find((i: any) => i.lineId === lineId || i.key === lineId);
    if (lineId.startsWith("local-")) {
      setLocalCartItems(prev => prev.filter(i => i.lineId !== lineId));
      return;
    }
    try {
      const next = await serverRemoveLine(lineId);
      setShopifyCart(next);
      if (itemToRemove) {
        trackEvent({
          name: "product_removed_from_cart",
          payload: {
            currency: "AED",
            value: (itemToRemove.price || 0) * (itemToRemove.qty || 1),
            cart_id: next?.id,
            items: [
              formatEcommerceItem({
                id: itemToRemove.variantId || itemToRemove.id,
                name: itemToRemove.name,
                price: itemToRemove.price,
                brand: "HHARA",
                category: "Considered Luxury",
                variant: `${itemToRemove.color} / ${itemToRemove.size}`,
                currency: "AED",
                quantity: itemToRemove.qty,
              }),
            ],
          },
        });
      }
    } catch (e) {
      console.error("removeItem failed", e);
    }
  };

  const applyDiscount = async (code: string) => {
    try {
      const next = await serverApplyDiscount(code);
      setShopifyCart(next);
      return next;
    } catch (e) {
      console.error("applyDiscount failed", e);
      throw e;
    }
  };

  return (
    <CartContext.Provider value={{
      shopifyCart,
      setShopifyCart,
      localCartItems,
      setLocalCartItems,
      cart,
      cartOpen,
      setCartOpen,
      addToCart,
      removeItem,
      updateQty,
      applyDiscount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

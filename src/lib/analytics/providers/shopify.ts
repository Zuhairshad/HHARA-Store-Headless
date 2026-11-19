import {
  sendShopifyAnalytics,
  getClientBrowserParameters,
  AnalyticsEventName,
  AnalyticsPageType,
  ShopifySalesChannel,
  type ShopifyAnalyticsProduct,
} from "@shopify/hydrogen-react";
import { AnalyticsEvent, EcommerceItem } from "../types";
import { getConsentPreferences } from "../consent";
import { SHOPIFY_CONFIG } from "@/lib/shopify/analytics-config";

// Storefront events for Shopify Analytics (Headless channel), sent the way Hydrogen does it:
//   every page      → PAGE_VIEW_2 (trekkie page view + page_rendered)
//   product page    → + PRODUCT_VIEW      collection → + COLLECTION_VIEW      search → + SEARCH_VIEW
//   add to cart     → ADD_TO_CART
// Cart, checkout and purchase are recorded by Shopify's own checkout, which reads the shared _shopify_y/_s cookies
// (see ShopifyWebPixels), so they are not sent from here.

declare global {
  interface Window {
    Shopify?: {
      customerPrivacy?: {
        setTrackingConsent: (
          consent: {
            analytics: boolean;
            marketing: boolean;
            preferences: boolean;
            sale_of_data: boolean;
            headlessStorefront: boolean;
            checkoutRootDomain: string;
            storefrontRootDomain: string;
            storefrontAccessToken: string;
          },
          callback?: (result?: { error?: string }) => void
        ) => void;
      };
    };
  }
}

// hydrogen-react logs failed monorail posts (ad blockers, offline) with console.error, which Next dev turns into an
// error overlay. They are harmless, so drop that one message.
const SHOPIFY_ANALYTICS_ERROR = "sendShopifyAnalytics request is unsuccessful";
if (typeof window !== "undefined" && !(window as any).__hharaShopifyErrorFilter) {
  (window as any).__hharaShopifyErrorFilter = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith(SHOPIFY_ANALYTICS_ERROR)) return;
    originalError(...args);
  };
}

/** Currency the visitor is shopping in; StoreProviders keeps it in sync with /api/session. */
let activeCurrency: string = SHOPIFY_CONFIG.currency;
export function setShopifyAnalyticsCurrency(currency: string | null | undefined) {
  if (currency) activeCurrency = currency;
}

/**
 * Shopify consent flags. The store sells mainly in the UAE, so an undecided visitor counts as consenting (the consent
 * banner lets them opt out). Keep this in step with ShopifyWebPixels' setTrackingConsent call.
 */
export function shopifyConsent() {
  const prefs = getConsentPreferences();
  const analyticsAllowed = !prefs.decided || prefs.analytics;
  const marketingAllowed = !prefs.decided || prefs.marketing;
  return { analyticsAllowed, marketingAllowed, saleOfDataAllowed: marketingAllowed, hasUserConsent: analyticsAllowed };
}

const PAGE_TYPES: Record<string, string> = {
  home: AnalyticsPageType.home,
  shop: AnalyticsPageType.collection,
  collection: AnalyticsPageType.collection,
  product: AnalyticsPageType.product,
  search: AnalyticsPageType.search,
  cart: AnalyticsPageType.cart,
  "pre-checkout": AnalyticsPageType.cart,
  account: AnalyticsPageType.customersAccount,
  "gift-card": AnalyticsPageType.giftCard,
  privacy: AnalyticsPageType.policy,
  terms: AnalyticsPageType.policy,
  returns: AnalyticsPageType.policy,
  shipping: AnalyticsPageType.policy,
};

const isGid = (id: string | undefined, type: "Product" | "ProductVariant") =>
  !!id && id.startsWith(`gid://shopify/${type}/`);

function toProducts(items: EcommerceItem[]): ShopifyAnalyticsProduct[] {
  return items
    .filter((i) => isGid(i.product_id, "Product"))
    .map((i) => ({
      productGid: i.product_id!,
      variantGid: isGid(i.variant_id, "ProductVariant") ? i.variant_id : undefined,
      name: i.item_name,
      variantName: i.item_variant && i.item_variant !== "Default" ? i.item_variant : undefined,
      brand: i.item_brand || "HHARA",
      category: i.item_category,
      price: String(i.price),
      quantity: i.quantity,
    }));
}

function base(currency?: string) {
  return {
    shopId: SHOPIFY_CONFIG.shopId,
    storefrontId: SHOPIFY_CONFIG.storefrontId,
    shopifySalesChannel: ShopifySalesChannel.headless,
    acceptedLanguage: SHOPIFY_CONFIG.acceptedLanguage,
    currency: (currency || activeCurrency) as any,
    ...getClientBrowserParameters(),
    ...shopifyConsent(),
  };
}

function send(eventName: string, payload: Record<string, unknown>) {
  // The domain makes hydrogen-react post to https://<shop>/.well-known/shopify/monorail/… (first-party for Shopify)
  return sendShopifyAnalytics({ eventName, payload } as any, SHOPIFY_CONFIG.shopDomain);
}

// Events wait until useShopifyCookies has fetched Shopify's visitor/session tokens (as Hydrogen does), otherwise a new
// visitor's first page view goes out without them and Shopify can't tie it to the session.
let trackingReady = false;
let pending: AnalyticsEvent[] = [];
export function markShopifyTrackingReady() {
  if (trackingReady) return;
  trackingReady = true;
  const queued = pending;
  pending = [];
  queued.forEach((e) => void emitShopify(e));
}
if (typeof window !== "undefined") setTimeout(markShopifyTrackingReady, 4000); // never hold events forever

export async function emitShopify(event: AnalyticsEvent): Promise<void> {
  if (typeof window === "undefined") return;
  if (!trackingReady) {
    pending.push(event);
    return;
  }
  try {
    switch (event.name) {
      case "page_viewed": {
        const pageType = PAGE_TYPES[event.payload.page_type || ""] || AnalyticsPageType.page;
        await send(AnalyticsEventName.PAGE_VIEW_2, {
          ...base(),
          canonicalUrl: event.payload.page_location,
          pageType,
          ...(event.payload.resource_id ? { resourceId: event.payload.resource_id } : {}),
        });
        break;
      }
      case "product_viewed": {
        const products = toProducts(event.payload.items);
        if (!products.length) break;
        await send(AnalyticsEventName.PRODUCT_VIEW, {
          ...base(event.payload.currency),
          canonicalUrl: window.location.href,
          pageType: AnalyticsPageType.product,
          resourceId: products[0].productGid,
          totalValue: event.payload.value,
          products,
        });
        break;
      }
      case "collection_viewed":
        await send(AnalyticsEventName.COLLECTION_VIEW, {
          ...base(),
          canonicalUrl: window.location.href,
          pageType: AnalyticsPageType.collection,
          collectionHandle: event.payload.collection_handle,
        });
        break;
      case "search_submitted":
        await send(AnalyticsEventName.SEARCH_VIEW, {
          ...base(),
          canonicalUrl: window.location.href,
          pageType: AnalyticsPageType.search,
          searchString: event.payload.search_term,
        });
        break;
      case "product_added_to_cart": {
        const products = toProducts(event.payload.items);
        if (!products.length || !event.payload.cart_id) break;
        await send(AnalyticsEventName.ADD_TO_CART, {
          ...base(event.payload.currency),
          cartId: event.payload.cart_id,
          totalValue: event.payload.value,
          products,
        });
        break;
      }
      // removed-from-cart, cart viewed, checkout started, subscribed: no headless event in Shopify Analytics
    }
  } catch {
    // network errors are non-critical
  }
}

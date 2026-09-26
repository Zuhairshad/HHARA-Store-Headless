import {
  sendShopifyAnalytics,
  getClientBrowserParameters,
  AnalyticsEventName,
  AnalyticsPageType,
  ShopifySalesChannel,
} from "@shopify/hydrogen-react";
import { AnalyticsEvent } from "../types";
import { getConsentPreferences } from "../consent";
import { SHOPIFY_CONFIG } from "@/lib/shopify/analytics-config";

declare global {
  interface Window {
    Shopify?: {
      shop?: string;
      shopId?: string;
      currency?: { active: string; rate: string };
      analytics?: {
        publish: (eventName: string, payload: unknown, options?: unknown) => void;
        replayQueue?: Array<[string, unknown, unknown?]>;
      };
      customerPrivacy?: {
        setTrackingConsent: (
          consent: {
            analyticsAllowed: boolean;
            marketingAllowed: boolean;
            saleOfDataAllowed: boolean;
            headlessStorefront: boolean;
            checkoutRootDomain: string;
            storefrontRootDomain: string;
            storefrontAccessToken: string;
          },
          callback?: (err?: Error) => void
        ) => void;
      };
    };
  }
}

// hydrogen-react catches failed monorail requests (ad blockers, offline) and logs them
// via console.error, which Next.js dev surfaces as an error overlay. They're non-critical,
// so drop just that message and pass everything else through.
const SHOPIFY_ANALYTICS_ERROR = "sendShopifyAnalytics request is unsuccessful";
if (typeof window !== "undefined" && !(window as any).__hharaShopifyErrorFilter) {
  (window as any).__hharaShopifyErrorFilter = true;
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith(SHOPIFY_ANALYTICS_ERROR)) return;
    originalError(...args);
  };
}

const BASE_PAYLOAD = {
  shopId: SHOPIFY_CONFIG.shopId,
  currency: SHOPIFY_CONFIG.currency,
  storefrontId: SHOPIFY_CONFIG.storefrontId,
  shopifySalesChannel: ShopifySalesChannel.headless,
  acceptedLanguage: SHOPIFY_CONFIG.acceptedLanguage,
} as const;

function getConsentPayload() {
  if (typeof window === "undefined") return { analyticsAllowed: false, marketingAllowed: false, saleOfDataAllowed: false, hasUserConsent: false };
  const prefs = getConsentPreferences();
  const analyticsAllowed = !prefs.decided || prefs.analytics;
  const marketingAllowed = !prefs.decided || prefs.marketing;
  return {
    analyticsAllowed,
    marketingAllowed,
    saleOfDataAllowed: marketingAllowed,
    hasUserConsent: analyticsAllowed,
  };
}

function publishShim(eventName: string, payload: unknown) {
  try {
    window.Shopify?.analytics?.publish?.(eventName, payload);
  } catch {
    // non-critical
  }
}

export async function emitShopify(event: AnalyticsEvent): Promise<void> {
  if (typeof window === "undefined") return;

  const consentPayload = getConsentPayload();
  const browserParams = getClientBrowserParameters();

  // Common base shared by all sendShopifyAnalytics calls
  const BASE = {
    ...BASE_PAYLOAD,
    ...browserParams,
    ...consentPayload,
  };

  try {
    switch (event.name) {
    case "page_viewed": {
      const pageType =
        event.payload.page_type === "home"
          ? AnalyticsPageType.home
          : event.payload.page_type === "product"
          ? AnalyticsPageType.product
          : event.payload.page_type === "collection"
          ? AnalyticsPageType.collection
          : event.payload.page_type === "search"
          ? AnalyticsPageType.search
          : event.payload.page_type === "cart"
          ? AnalyticsPageType.cart
          : AnalyticsPageType.page;

      await sendShopifyAnalytics(
        { eventName: AnalyticsEventName.PAGE_VIEW, payload: { ...BASE, canonicalUrl: event.payload.page_location, pageType } },
        SHOPIFY_CONFIG.shopDomain
      );

      publishShim("page_viewed", {
        url: event.payload.page_location,
        title: event.payload.page_title,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      });
      break;
    }

    case "product_viewed": {
      await sendShopifyAnalytics(
        {
          eventName: AnalyticsEventName.PAGE_VIEW,
          payload: {
            ...BASE,
            canonicalUrl: window.location.href,
            pageType: AnalyticsPageType.product,
            resourceId: event.payload.product_id,
            totalValue: event.payload.value,
            products: event.payload.items.map((item) => ({
              productGid: item.item_id,
              name: item.item_name,
              brand: item.item_brand || "HHARA",
              category: item.item_category || "Considered Luxury",
              price: String(item.price),
              quantity: item.quantity,
            })),
          },
        },
        SHOPIFY_CONFIG.shopDomain
      );

      publishShim("product_viewed", {
        currency: event.payload.currency,
        totalAmount: String(event.payload.value),
        products: event.payload.items.map((item) => ({
          id: item.item_id,
          title: item.item_name,
          price: String(item.price),
          quantity: item.quantity,
        })),
      });
      break;
    }

    case "collection_viewed": {
      await sendShopifyAnalytics(
        {
          eventName: AnalyticsEventName.PAGE_VIEW,
          payload: {
            ...BASE,
            canonicalUrl: window.location.href,
            pageType: AnalyticsPageType.collection,
            collectionHandle: event.payload.collection_handle,
            products: event.payload.items.map((item) => ({
              productGid: item.item_id,
              name: item.item_name,
              brand: item.item_brand || "HHARA",
              price: String(item.price),
              quantity: item.quantity,
            })),
          },
        },
        SHOPIFY_CONFIG.shopDomain
      );

      publishShim("collection_viewed", {
        collection: { title: event.payload.collection_title, id: event.payload.collection_handle },
      });
      break;
    }

    case "search_submitted": {
      await sendShopifyAnalytics(
        {
          eventName: AnalyticsEventName.PAGE_VIEW,
          payload: { ...BASE, canonicalUrl: window.location.href, pageType: AnalyticsPageType.search, searchString: event.payload.search_term },
        },
        SHOPIFY_CONFIG.shopDomain
      );
      break;
    }

    case "product_added_to_cart": {
      const cartId = event.payload.cart_id || "";
      await sendShopifyAnalytics(
        {
          eventName: AnalyticsEventName.ADD_TO_CART,
          payload: {
            ...BASE,
            cartId,
            totalValue: event.payload.value,
            products: event.payload.items.map((item) => ({
              productGid: item.item_id,
              name: item.item_name,
              brand: item.item_brand || "HHARA",
              price: String(item.price),
              quantity: item.quantity,
              variantName: item.item_variant,
            })),
          },
        },
        SHOPIFY_CONFIG.shopDomain
      );

      publishShim("product_added_to_cart", {
        currency: event.payload.currency,
        totalAmount: String(event.payload.value),
        cartId,
        products: event.payload.items.map((item) => ({
          id: item.item_id,
          title: item.item_name,
          price: String(item.price),
          quantity: item.quantity,
        })),
      });
      break;
    }

    // Events with no hydrogen-react equivalent — dispatch through shim only
    case "product_removed_from_cart":
      publishShim("product_removed_from_cart", {
        currency: event.payload.currency,
        totalAmount: String(event.payload.value),
        cartId: event.payload.cart_id,
        products: event.payload.items.map((item) => ({
          id: item.item_id,
          title: item.item_name,
          price: String(item.price),
          quantity: item.quantity,
        })),
      });
      break;

    case "cart_viewed":
      publishShim("cart_viewed", {
        currency: event.payload.currency,
        totalAmount: String(event.payload.value),
        cartId: event.payload.cart_id,
        products: event.payload.items.map((item) => ({
          id: item.item_id,
          title: item.item_name,
          price: String(item.price),
          quantity: item.quantity,
        })),
      });
      break;

    case "checkout_started":
      publishShim("checkout_started", {
        currency: event.payload.currency,
        totalAmount: String(event.payload.value),
        cartId: event.payload.cart_id,
        checkoutUrl: event.payload.checkout_url,
        products: event.payload.items.map((item) => ({
          id: item.item_id,
          title: item.item_name,
          price: String(item.price),
          quantity: item.quantity,
        })),
      });
      break;

    case "customer_subscribed":
      publishShim("customer_subscribed", {
        email: event.payload.email,
        source: event.payload.source,
      });
      break;
    }
  } catch {
    // network errors from sendShopifyAnalytics are non-critical
  }
}

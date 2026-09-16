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
    };
  }
}

const BASE_PAYLOAD = {
  shopId: SHOPIFY_CONFIG.shopId,
  currency: SHOPIFY_CONFIG.currency,
  storefrontId: SHOPIFY_CONFIG.storefrontId,
  shopifySalesChannel: ShopifySalesChannel.headless,
  acceptedLanguage: SHOPIFY_CONFIG.acceptedLanguage,
} as const;

function hasUserConsent(): boolean {
  if (typeof window === "undefined") return false;
  const prefs = getConsentPreferences();
  return !prefs.decided || prefs.analytics;
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

  const consent = hasUserConsent();
  const browserParams = getClientBrowserParameters();

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

      const pageViewPayload = {
        ...BASE_PAYLOAD,
        ...browserParams,
        hasUserConsent: consent,
        canonicalUrl: event.payload.page_location,
        pageType,
      };

      await sendShopifyAnalytics(
        { eventName: AnalyticsEventName.PAGE_VIEW, payload: pageViewPayload },
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
      const productViewPayload = {
        ...BASE_PAYLOAD,
        ...browserParams,
        hasUserConsent: consent,
        canonicalUrl: typeof window !== "undefined" ? window.location.href : "",
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
      };

      await sendShopifyAnalytics(
        { eventName: AnalyticsEventName.PAGE_VIEW, payload: productViewPayload },
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
      const collectionPayload = {
        ...BASE_PAYLOAD,
        ...browserParams,
        hasUserConsent: consent,
        canonicalUrl: typeof window !== "undefined" ? window.location.href : "",
        pageType: AnalyticsPageType.collection,
        collectionHandle: event.payload.collection_handle,
        products: event.payload.items.map((item) => ({
          productGid: item.item_id,
          name: item.item_name,
          brand: item.item_brand || "HHARA",
          price: String(item.price),
          quantity: item.quantity,
        })),
      };

      await sendShopifyAnalytics(
        { eventName: AnalyticsEventName.PAGE_VIEW, payload: collectionPayload },
        SHOPIFY_CONFIG.shopDomain
      );

      publishShim("collection_viewed", {
        collection: { title: event.payload.collection_title, id: event.payload.collection_handle },
      });
      break;
    }

    case "search_submitted": {
      const searchPayload = {
        ...BASE_PAYLOAD,
        ...browserParams,
        hasUserConsent: consent,
        canonicalUrl: typeof window !== "undefined" ? window.location.href : "",
        pageType: AnalyticsPageType.search,
        searchString: event.payload.search_term,
      };

      await sendShopifyAnalytics(
        { eventName: AnalyticsEventName.PAGE_VIEW, payload: searchPayload },
        SHOPIFY_CONFIG.shopDomain
      );
      break;
    }

    case "product_added_to_cart": {
      const cartId = event.payload.cart_id || "";
      const addToCartPayload = {
        ...BASE_PAYLOAD,
        ...browserParams,
        hasUserConsent: consent,
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
      };

      await sendShopifyAnalytics(
        { eventName: AnalyticsEventName.ADD_TO_CART, payload: addToCartPayload },
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
}

import { AnalyticsEvent } from "../types";

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, any>) => void;
      page: () => void;
      grantConsent?: () => void;
      holdConsent?: () => void;
    };
  }
}

export function emitTikTok(event: AnalyticsEvent) {
  if (typeof window === "undefined" || !window.ttq || typeof window.ttq.track !== "function") return;

  switch (event.name) {
    case "page_viewed":
      if (typeof window.ttq.page === "function") {
        window.ttq.page();
      }
      break;

    case "product_viewed": {
      const item = event.payload.items[0];
      window.ttq.track("ViewContent", {
        content_id: item?.item_id || event.payload.product_id,
        content_type: "product",
        content_name: event.payload.title || item?.item_name,
        value: event.payload.value,
        currency: event.payload.currency,
      });
      break;
    }

    case "search_submitted":
      window.ttq.track("Search", {
        query: event.payload.search_term,
      });
      break;

    case "product_added_to_cart": {
      const item = event.payload.items[0];
      window.ttq.track("AddToCart", {
        content_id: item?.item_id,
        content_type: "product",
        content_name: item?.item_name,
        value: event.payload.value,
        currency: event.payload.currency,
        quantity: item?.quantity || 1,
      });
      break;
    }

    case "checkout_started": {
      const item = event.payload.items[0];
      window.ttq.track("InitiateCheckout", {
        content_id: item?.item_id,
        content_type: "product",
        value: event.payload.value,
        currency: event.payload.currency,
        quantity: event.payload.items.reduce((acc, i) => acc + i.quantity, 0),
      });
      break;
    }

    case "customer_subscribed":
      window.ttq.track("Subscribe", {
        source: event.payload.source,
      });
      break;
  }
}

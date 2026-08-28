import { AnalyticsEvent } from "../types";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function emitMeta(event: AnalyticsEvent) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  switch (event.name) {
    case "page_viewed":
      window.fbq("track", "PageView");
      break;

    case "product_viewed": {
      const item = event.payload.items[0];
      window.fbq("track", "ViewContent", {
        content_name: event.payload.title || item?.item_name || "Product",
        content_category: event.payload.category || item?.item_category || "Considered Luxury",
        content_ids: [item?.item_id || event.payload.product_id || ""].filter(Boolean),
        content_type: "product",
        value: event.payload.value,
        currency: event.payload.currency,
      });
      break;
    }

    case "collection_viewed":
      window.fbq("trackCustom", "ViewCategory", {
        content_name: event.payload.collection_title,
        content_category: event.payload.collection_handle,
      });
      break;

    case "search_submitted":
      window.fbq("track", "Search", {
        search_string: event.payload.search_term,
      });
      break;

    case "product_added_to_cart": {
      const ids = event.payload.items.map((i) => i.item_id).filter(Boolean);
      window.fbq("track", "AddToCart", {
        content_ids: ids,
        content_type: "product",
        value: event.payload.value,
        currency: event.payload.currency,
      });
      break;
    }

    case "checkout_started": {
      const ids = event.payload.items.map((i) => i.item_id).filter(Boolean);
      window.fbq("track", "InitiateCheckout", {
        content_ids: ids,
        content_type: "product",
        value: event.payload.value,
        currency: event.payload.currency,
        num_items: event.payload.items.reduce((acc, i) => acc + i.quantity, 0),
      });
      break;
    }

    case "customer_subscribed":
      window.fbq("track", "Lead", {
        content_name: event.payload.source,
      });
      break;
  }
}

import { AnalyticsEvent } from "../types";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function emitGA4(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;

  const dataLayer = (window.dataLayer = window.dataLayer || []);

  switch (event.name) {
    case "page_viewed": {
      const payload = {
        page_title: event.payload.page_title,
        page_location: event.payload.page_location,
        page_path: event.payload.page_path,
        page_type: event.payload.page_type,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "page_view", payload);
      }
      dataLayer.push({ event: "page_view", ...payload });
      break;
    }

    case "product_viewed": {
      const payload = {
        currency: event.payload.currency,
        value: event.payload.value,
        items: event.payload.items,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "view_item", payload);
      }
      dataLayer.push({
        event: "view_item",
        ecommerce: payload,
      });
      break;
    }

    case "collection_viewed": {
      const payload = {
        item_list_id: event.payload.collection_handle,
        item_list_name: event.payload.collection_title,
        items: event.payload.items,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "view_item_list", payload);
      }
      dataLayer.push({
        event: "view_item_list",
        ecommerce: payload,
      });
      break;
    }

    case "search_submitted": {
      const payload = {
        search_term: event.payload.search_term,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "search", payload);
      }
      dataLayer.push({ event: "search", ...payload });
      break;
    }

    case "product_added_to_cart": {
      const payload = {
        currency: event.payload.currency,
        value: event.payload.value,
        items: event.payload.items,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "add_to_cart", payload);
      }
      dataLayer.push({
        event: "add_to_cart",
        ecommerce: payload,
      });
      break;
    }

    case "product_removed_from_cart": {
      const payload = {
        currency: event.payload.currency,
        value: event.payload.value,
        items: event.payload.items,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "remove_from_cart", payload);
      }
      dataLayer.push({
        event: "remove_from_cart",
        ecommerce: payload,
      });
      break;
    }

    case "cart_viewed": {
      const payload = {
        currency: event.payload.currency,
        value: event.payload.value,
        items: event.payload.items,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "view_cart", payload);
      }
      dataLayer.push({
        event: "view_cart",
        ecommerce: payload,
      });
      break;
    }

    case "checkout_started": {
      const payload = {
        currency: event.payload.currency,
        value: event.payload.value,
        items: event.payload.items,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "begin_checkout", payload);
      }
      dataLayer.push({
        event: "begin_checkout",
        ecommerce: payload,
      });
      break;
    }

    case "customer_subscribed": {
      const payload = {
        lead_source: event.payload.source,
      };
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", payload);
      }
      dataLayer.push({ event: "generate_lead", ...payload });
      break;
    }
  }
}

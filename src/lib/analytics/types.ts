export type CurrencyCode = "AED" | "USD" | "EUR" | "GBP" | "SAR" | string;

export interface EcommerceItem {
  item_id: string; // SKU or Shopify Variant ID
  item_name: string; // Product title
  item_brand?: string; // e.g. "HHARA"
  item_category?: string; // e.g. "Activewear", "Bra", "Legging"
  item_variant?: string; // e.g. "Chicory Brown / S"
  price: number; // Unit price
  quantity: number; // Quantity
  currency?: CurrencyCode;
}

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: number;
}

export interface ConsentPreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
  timestamp?: number;
  version?: string;
}

export type AnalyticsEvent =
  | {
      name: "page_viewed";
      payload: {
        page_title: string;
        page_location: string;
        page_path: string;
        page_type?: string;
      };
    }
  | {
      name: "product_viewed";
      payload: {
        currency: CurrencyCode;
        value: number;
        items: EcommerceItem[];
        product_id?: string;
        handle?: string;
        title?: string;
        category?: string;
      };
    }
  | {
      name: "collection_viewed";
      payload: {
        collection_title: string;
        collection_handle?: string;
        items: EcommerceItem[];
      };
    }
  | {
      name: "search_submitted";
      payload: {
        search_term: string;
        results_count?: number;
      };
    }
  | {
      name: "product_added_to_cart";
      payload: {
        currency: CurrencyCode;
        value: number;
        items: EcommerceItem[];
        cart_id?: string;
      };
    }
  | {
      name: "product_removed_from_cart";
      payload: {
        currency: CurrencyCode;
        value: number;
        items: EcommerceItem[];
        cart_id?: string;
      };
    }
  | {
      name: "cart_viewed";
      payload: {
        currency: CurrencyCode;
        value: number;
        items: EcommerceItem[];
        cart_id?: string;
      };
    }
  | {
      name: "checkout_started";
      payload: {
        currency: CurrencyCode;
        value: number;
        items: EcommerceItem[];
        cart_id?: string;
        checkout_url?: string;
      };
    }
  | {
      name: "customer_subscribed";
      payload: {
        source: string;
        email?: string;
      };
    };

export function formatEcommerceItem(params: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  brand?: string;
  category?: string;
  variant?: string;
  currency?: CurrencyCode;
}): EcommerceItem {
  return {
    item_id: params.id,
    item_name: params.name,
    item_brand: params.brand || "HHARA",
    item_category: params.category || "Considered Luxury",
    item_variant: params.variant || "Default",
    price: typeof params.price === "number" ? params.price : parseFloat(params.price || "0"),
    quantity: params.quantity ?? 1,
    currency: params.currency || "AED",
  };
}

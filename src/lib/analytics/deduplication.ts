import { AnalyticsEvent } from "./types";

const recentSignatures = new Map<string, number>();
const DEDUP_WINDOW_MS = 500;

function createSignature(event: AnalyticsEvent): string {
  switch (event.name) {
    case "page_viewed":
      return `page_viewed:${event.payload.page_path}`;
    case "product_viewed":
      return `product_viewed:${event.payload.product_id || event.payload.handle || ""}:${event.payload.items[0]?.item_id || ""}`;
    case "collection_viewed":
      return `collection_viewed:${event.payload.collection_handle || event.payload.collection_title}`;
    case "search_submitted":
      return `search_submitted:${event.payload.search_term}`;
    case "product_added_to_cart":
      return `product_added_to_cart:${event.payload.items.map((i) => `${i.item_id}:${i.quantity}`).join(",")}`;
    case "product_removed_from_cart":
      return `product_removed_from_cart:${event.payload.items.map((i) => `${i.item_id}:${i.quantity}`).join(",")}`;
    case "cart_viewed":
      return `cart_viewed:${event.payload.cart_id || ""}:${event.payload.value}`;
    case "checkout_started":
      return `checkout_started:${event.payload.cart_id || ""}:${event.payload.value}`;
    case "customer_subscribed":
      return `customer_subscribed:${event.payload.source}:${event.payload.email || ""}`;
    default:
      return JSON.stringify(event);
  }
}

export function shouldEmitEvent(event: AnalyticsEvent): boolean {
  const now = Date.now();
  const sig = createSignature(event);

  // Clean old signatures
  for (const [key, timestamp] of recentSignatures.entries()) {
    if (now - timestamp > DEDUP_WINDOW_MS * 2) {
      recentSignatures.delete(key);
    }
  }

  const lastSeen = recentSignatures.get(sig);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
    return false;
  }

  recentSignatures.set(sig, now);
  return true;
}

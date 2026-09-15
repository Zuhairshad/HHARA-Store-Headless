import HharaApp from "@/components/HharaApp";
import HeroServer from "@/components/home/HeroServer";
import ServerHeroShell from "@/components/home/ServerHeroShell";
import { getStorefrontProducts } from "@/lib/products";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";

// Revalidate every 5 minutes — products and hero content change infrequently.
export const revalidate = 300;

const VALID_ROUTES = new Set([
  "shop", "lookbook", "atelier", "stores", "account", "faq",
  "shipping", "returns", "size-guide", "contact", "gift-card",
  "privacy", "terms", "wishlist",
]);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const { r } = await searchParams;
  const initialRoute = r && VALID_ROUTES.has(r) ? r : undefined;

  const [products, cart, customer] = await Promise.all([
    getStorefrontProducts(),
    getCurrentCart(),
    getCurrentCustomer(),
  ]);

  return (
    <div style={{ position: "relative" }}>
      {/*
        Server-rendered hero shell — gives the browser the LCP image and h1
        text on first byte, before any JavaScript downloads or React hydrates.
        ServerHeroShell (client) hides this div after React mounts so that
        HharaApp's own interactive hero takes over without a visible duplicate.
        Only shown on the home route; direct route links skip it.
      */}
      {!initialRoute && (
        <ServerHeroShell>
          <HeroServer />
        </ServerHeroShell>
      )}

      <HharaApp
        initialProducts={products}
        initialCart={cart}
        initialCustomer={customer}
        initialRoute={initialRoute}
      />
    </div>
  );
}

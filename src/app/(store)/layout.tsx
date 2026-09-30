// Store-only styles and Shopify tracking live here so the coming-soon page at "/" doesn't pay for them.
import "leaflet/dist/leaflet.css";
import "./design.css";
import { ShopifyWebPixels } from "@/components/analytics/ShopifyWebPixels";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShopifyWebPixels />
      {children}
    </>
  );
}

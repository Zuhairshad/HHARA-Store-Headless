// Store-only styles live here so the coming-soon page at "/" doesn't pay for them.
import "leaflet/dist/leaflet.css";
import "./design.css";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}

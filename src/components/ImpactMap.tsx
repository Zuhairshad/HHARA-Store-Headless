"use client";
import { useEffect, useRef } from "react";

export default function ImpactMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || instanceRef.current) return;

    import("leaflet").then((L) => {
      if (!containerRef.current || instanceRef.current) return;

      const map = L.map(containerRef.current, {
        center: [-1.2921, 36.8219],
        zoom: 5,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        doubleClickZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Initial redraw after layout settles
      const t = setTimeout(() => map.invalidateSize(), 100);

      // Resize observer for dynamic size changes
      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(containerRef.current!);

      // Kenya - forest green
      L.circleMarker([-1.2921, 36.8219], {
        radius: 7,
        fillColor: "#3d6b4a",
        color: "#F7F3ED",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(
          `<span class="mtt-label">OUR FIRST CHAPTER</span>
           <span class="mtt-title">Kenya</span>
           <span class="mtt-body">Every HHARA purchase directly sponsors a child's education here. Small. Local. Real.</span>`,
          { className: "hhara-map-tooltip", direction: "top", offset: [0, -10] }
        );

      instanceRef.current = { map, ro, t };
    });

    return () => {
      if (instanceRef.current) {
        clearTimeout(instanceRef.current.t);
        instanceRef.current.ro?.disconnect();
        instanceRef.current.map?.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "460px" }} />;
}

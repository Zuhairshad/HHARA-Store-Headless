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
        center: [13, 46],
        zoom: 4,
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

      // Dubai — zinfandel red
      L.circleMarker([25.2048, 55.2708], {
        radius: 7,
        fillColor: "#6B2737",
        color: "#F7F3ED",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip("<strong>Dubai</strong><br/>Where We're Built", {
          className: "hhara-map-tooltip",
          direction: "top",
          offset: [0, -10],
        });

      // Nairobi, Kenya — forest green
      L.circleMarker([-1.2921, 36.8219], {
        radius: 7,
        fillColor: "#3d6b4a",
        color: "#F7F3ED",
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip("<strong>Nairobi, Kenya</strong><br/>Our First Chapter", {
          className: "hhara-map-tooltip",
          direction: "top",
          offset: [0, -10],
        });

      instanceRef.current = map;
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "460px" }} />;
}

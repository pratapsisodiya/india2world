"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const GlobeGL = dynamic(() => import("react-globe.gl"), { ssr: false });

const INDIA = { lat: 20.5937, lng: 78.9629 };

const DESTINATIONS = [
  { lat: 40.7128,  lng: -74.006,   label: "New York" },
  { lat: 51.5074,  lng: -0.1278,   label: "London" },
  { lat: 25.2048,  lng: 55.2708,   label: "Dubai" },
  { lat: 52.52,    lng: 13.405,    label: "Berlin" },
  { lat: 35.6762,  lng: 139.6503,  label: "Tokyo" },
  { lat: 1.3521,   lng: 103.8198,  label: "Singapore" },
  { lat: -33.8688, lng: 151.2093,  label: "Sydney" },
  { lat: -23.5505, lng: -46.6333,  label: "São Paulo" },
  { lat: 31.2304,  lng: 121.4737,  label: "Shanghai" },
  { lat: 6.5244,   lng: 3.3792,    label: "Lagos" },
  { lat: 48.8566,  lng: 2.3522,    label: "Paris" },
  { lat: 1.2921,   lng: 36.8219,   label: "Nairobi" },
];

const ARC_COLORS = ["#22d3ee", "#34d399", "#60a5fa", "#a78bfa", "#f97316"];

const arcsData = DESTINATIONS.map((dest, i) => ({
  startLat: INDIA.lat,
  startLng: INDIA.lng,
  endLat: dest.lat,
  endLng: dest.lng,
  color: ARC_COLORS[i % ARC_COLORS.length],
  label: dest.label,
}));

const pointsData = [
  { lat: INDIA.lat, lng: INDIA.lng, label: "India", size: 0.8, color: "#ff9933" },
  ...DESTINATIONS.map((d) => ({ ...d, size: 0.4, color: "#ffffff" })),
];

export function Globe({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<{ controls: () => any; pointOfView: (v: object, d: number) => void } | null>(null);
  const [size, setSize] = useState(400);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setSize(Math.round(w));
    });
    ro.observe(el);
    setSize(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // Auto-rotate via OrbitControls once globe mounts
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      controls.enableZoom = false;
    }
    // Start camera focused on India
    globeRef.current.pointOfView({ lat: INDIA.lat, lng: INDIA.lng, altitude: 2 }, 0);
  }, [size]); // re-run after size resolves so globeRef is populated

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden" }}>
      <GlobeGL
        ref={globeRef as never}
        width={size}
        height={size}
        // Physical map style (bright, natural colours — blue water, green/brown land)
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg"
        bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
        showAtmosphere
        atmosphereColor="#bfdbfe"
        atmosphereAltitude={0.12}
        backgroundColor="rgba(0,0,0,0)"
        // Arcs: altitude auto-scales with great-circle distance → short routes stay low, long routes arch high
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitudeAutoScale={0.45}
        arcStroke={0.7}
        arcDashLength={0.6}
        arcDashGap={0.08}
        arcDashAnimateTime={1600}
        // City dot markers
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.01}
        pointRadius="size"
        pointLabel="label"
        enablePointerInteraction
      />
    </div>
  );
}

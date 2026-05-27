"use client";

import { useEffect, useRef, useState } from "react";

export function Globe({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={containerRef} className={className} style={{ overflow: "hidden" }}>
      <picture>
        <source srcSet="/globe.png" type="image/png" />
        <img
          src="/globe.svg"
          alt="Globe"
          width={size}
          height={size}
          style={{ display: "block", width: "100%", height: "auto", objectFit: "cover" }}
          loading="lazy"
        />
      </picture>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useWebHaptics } from "web-haptics/react";

export function HapticsProvider({ children }: { children: React.ReactNode }) {
  const { trigger } = useWebHaptics();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      
      // Traverse up to find if we clicked inside an interactive element
      const interactive = target?.closest('button, a, [role="button"], [role="tab"], [role="menuitem"], [role="switch"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]');
      
      if (interactive) {
        // Check if haptics are explicitly disabled for this element
        const customPattern = interactive.getAttribute("data-haptic");
        
        if (customPattern === "none") {
          return;
        }
        
        if (customPattern === "success") {
          trigger("success");
        } else if (customPattern === "error") {
          trigger("error");
        } else if (customPattern === "heavy") {
          trigger("nudge");
        } else if (customPattern === "medium") {
          trigger(20);
        } else {
          // Default to light tap for interactions
          trigger(10);
        }
      }
    };

    // Use capturing phase to ensure it fires early and even if propagation is stopped
    document.addEventListener("click", handleClick, { capture: true, passive: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [trigger]);

  return <>{children}</>;
}

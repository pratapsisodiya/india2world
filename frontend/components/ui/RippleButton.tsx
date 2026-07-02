"use client";

import { useRef, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  as?: "button" | "div";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function RippleButton({
  children,
  onClick,
  className,
  as: Tag = "button",
  disabled,
  type = "button",
}: RippleButtonProps) {
  const ref = useRef<HTMLButtonElement & HTMLDivElement>(null);

  function handleClick(e: MouseEvent) {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const wave = document.createElement("span");
    wave.className = "ripple-wave";
    wave.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    el.appendChild(wave);

    wave.addEventListener("animationend", () => wave.remove(), { once: true });

    onClick?.();
  }

  return (
    // @ts-expect-error — dynamic tag typing
    <Tag
      ref={ref}
      type={Tag === "button" ? type : undefined}
      disabled={disabled}
      onClick={handleClick}
      className={cn("ripple-container select-none", className)}
    >
      {children}
    </Tag>
  );
}

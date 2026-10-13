"use client";

import type { ReactNode } from "react";

// Brillo que sigue al cursor sobre las tarjetas .mx-card hijas (delegación de eventos).
export function Spotlight({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "ul" | "ol" }) {
  return (
    <Tag
      className={className}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const card = (e.target as HTMLElement).closest<HTMLElement>(".mx-card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}

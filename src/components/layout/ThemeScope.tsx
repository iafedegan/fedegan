"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function ThemeScope({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = pathname === "/" ? "esmeralda" : "institucional";
  return (
    <div
      data-theme={theme}
      className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-500"
    >
      {children}
    </div>
  );
}

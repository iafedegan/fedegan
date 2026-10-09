"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-4 md:bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] text-[var(--fg-lime-400)] shadow-[0_18px_34px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--fg-lime-500)] hover:text-[var(--fg-green-900)] sm:right-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}

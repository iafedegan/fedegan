"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { PopupConfig } from "@/lib/design/regions";
import { useLiveDesign } from "./live";

const KEY = "fedegan-popup-visto";

// Ventana emergente: una vez por sesión, con retardo configurable, cierre con Esc y devolución del foco.
export function SitePopup({ initial }: { initial: PopupConfig }) {
  const { value, preview } = useLiveDesign(initial, (d) => d.popup);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const enabled = Boolean(value.on && (value.title || value.text));

  useEffect(() => {
    if (!enabled) return;
    let seen = false;
    try {
      seen = !preview && sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setOpen(true), preview ? 0 : (value.delay ?? 3) * 1000);
    return () => clearTimeout(t);
  }, [enabled, preview, value.delay, value.title, value.text]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      if (!preview) sessionStorage.setItem(KEY, "1");
    } catch {}
  }

  if (!open || !enabled) return null; // si se desactiva mientras está abierta, deja de mostrarse
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-solid)] p-7 shadow-[var(--shadow-lg)]"
      >
        <button ref={closeRef} type="button" aria-label="Cerrar" onClick={close} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)]">
          <X size={20} />
        </button>
        {value.title && (
          <h2 id="popup-title" className="pr-8 font-[var(--font-display)] text-2xl font-bold leading-tight text-[var(--text)]">
            {value.title}
          </h2>
        )}
        {value.text && <p className="mt-3 leading-relaxed text-[var(--text-muted)]">{value.text}</p>}
        {value.ctaLabel && value.ctaHref && (
          <div className="mt-6">
            {value.ctaHref.startsWith("/") ? (
              <Link href={value.ctaHref} onClick={close} className="inline-flex rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 py-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)]">
                {value.ctaLabel}
              </Link>
            ) : (
              <a href={value.ctaHref} target="_blank" rel="noopener noreferrer" onClick={close} className="inline-flex rounded-[var(--radius-sm)] bg-[var(--fg-lime-500)] px-5 py-3 text-[0.8rem] font-bold uppercase tracking-[0.08em] text-[var(--fg-green-900)]">
                {value.ctaLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

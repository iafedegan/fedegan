"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Registra el service worker (solo en producción) y avisa cuando no hay conexión.
export function PwaRegister({ build }: { build: string }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // El service worker descarga varias páginas para el uso sin conexión: se registra con la página ya cargada y en reposo,
    // para que esa descarga no compita con lo que la persona está viendo.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const register = () => {
      timer = setTimeout(() => {
        navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(build)}`, { scope: "/" }).catch(() => {});
      }, 6000);
    };
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }
    const sync = () => setOffline(!navigator.onLine);
    const t = setTimeout(sync, 0);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      clearTimeout(t);
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, [build]);

  if (!offline) return null;
  return (
    <div role="status" className="fixed inset-x-3 top-[max(0.5rem,env(safe-area-inset-top))] z-[80] mx-auto flex max-w-md items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-solid)] px-4 py-2 text-sm font-semibold text-[var(--text)] shadow-[var(--shadow-lg)]">
      <WifiOff size={16} className="shrink-0 text-[var(--fg-lime-400)]" />
      Sin conexión: mostrando contenido guardado
    </div>
  );
}

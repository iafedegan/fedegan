"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Registra el service worker (solo en producción) y avisa cuando no hay conexión.
export function PwaRegister({ build }: { build: string }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(build)}`, { scope: "/" }).catch(() => {});
    }
    const sync = () => setOffline(!navigator.onLine);
    const t = setTimeout(sync, 0);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      clearTimeout(t);
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

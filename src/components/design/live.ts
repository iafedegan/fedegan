"use client";

import { useEffect, useState } from "react";
import { normalizeDesign, type DesignConfig } from "@/lib/design/regions";

/**
 * Toma el valor publicado y, si la página se muestra dentro del editor de diseño,
 * lo reemplaza en vivo por el del borrador que el editor envía con postMessage.
 */
export function useLiveDesign<T>(initial: T, pick: (d: DesignConfig) => T): { value: T; preview: boolean } {
  const [state, setState] = useState<{ value: T; preview: boolean }>({ value: initial, preview: false });
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; design?: unknown } | null;
      if (data?.type !== "design-draft") return;
      setState({ value: pick(normalizeDesign(data.design)), preview: true });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
    // pick es estable por componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}

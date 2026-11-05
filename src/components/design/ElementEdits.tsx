"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ElementEdit } from "@/lib/design/regions";
import { useLiveDesign } from "./live";
import { applyElements } from "./elements";

/** Aplica sobre la página las ediciones por elemento del CMS (y, dentro del editor, las del borrador en vivo). */
export function ElementEdits({ initial }: { initial: Record<string, ElementEdit> }) {
  const pathname = usePathname();
  const { value } = useLiveDesign(initial, (d) => d.elements);

  useEffect(() => {
    if (!Object.keys(value).length) {
      document.getElementById("design-elements")?.remove();
      return;
    }
    let raf = 0;
    const run = () => {
      raf = 0;
      applyElements(document, pathname, value);
    };
    run();
    // La página puede volver a pintarse (cargas diferidas, recorrido): se reaplica tras cada cambio del DOM.
    const mo = new MutationObserver(() => {
      if (!raf) raf = requestAnimationFrame(run);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname, value]);

  return null;
}

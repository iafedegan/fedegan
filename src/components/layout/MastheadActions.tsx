"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, EllipsisVertical } from "lucide-react";

// Barra de la app en el celular: «volver» a la izquierda (fuera de la portada) con zona táctil de 44 px y el menú a la derecha.
// En escritorio no se ve (el cabezote grande y la barra verde ya traen todo).
export function MastheadActions() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="mh-actions">
      {pathname !== "/" ? (
        <button type="button" onClick={() => router.back()} aria-label="Volver" className="mh-act">
          <ChevronLeft size={26} strokeWidth={2.2} aria-hidden />
        </button>
      ) : (
        <span aria-hidden className="mh-act mh-act-vacio" />
      )}
      {/* El menú único del celular vive aquí, en el encabezado de todas las páginas. */}
      <button type="button" onClick={() => window.dispatchEvent(new Event("fedegan:menu"))} aria-haspopup="dialog" aria-label="Abrir el menú" className="mh-act">
        <EllipsisVertical size={24} strokeWidth={2.4} aria-hidden />
      </button>
    </div>
  );
}

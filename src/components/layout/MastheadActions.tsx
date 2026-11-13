"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// Barra de la app en el celular: «volver» a la izquierda (fuera de la portada) con zona táctil de 44 px (buscar va en la barra inferior).
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
      {/* Buscar ya está en la barra inferior: aquí solo queda el espacio para que el logo siga centrado. */}
      <span aria-hidden className="mh-act mh-act-vacio" />
    </div>
  );
}

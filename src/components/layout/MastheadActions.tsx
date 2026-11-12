"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";

// Barra de la app en el celular: «volver» a la izquierda (fuera de la portada) y buscar a la derecha, con zonas táctiles de 44 px.
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
      <Link href="/buscador" aria-label="Buscar" className="mh-act">
        <Search size={22} strokeWidth={2.1} aria-hidden />
      </Link>
    </div>
  );
}

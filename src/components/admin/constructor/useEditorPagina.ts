"use client";

import { useEffect, useMemo, useState } from "react";
import { aBloques, aElementos, problema, type Bloque, type Elemento } from "@/lib/cms/bloques";

/**
 * Estado de una página que se arma en el constructor: los elementos, lo que se publicaría y si quedan cambios por publicar.
 * `marcarPublicado` recibe lo que se acaba de publicar (el mismo texto que viaja en el campo `bloques` del formulario).
 */
export function useEditorPagina(bloques: Bloque[]) {
  const [elementos, setElementos] = useState<Elemento[]>(() => aElementos(bloques));
  const publicables = useMemo(() => JSON.stringify(aBloques(elementos)), [elementos]);
  const [publicado, setPublicado] = useState(publicables);
  const incompletos = useMemo(() => elementos.filter((e) => problema(e) !== null).length, [elementos]);
  const sucio = publicables !== publicado;

  // Con cambios sin publicar, el navegador avisa antes de cerrar o recargar la página.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  return { elementos, setElementos, publicables, sucio, incompletos, marcarPublicado: setPublicado };
}

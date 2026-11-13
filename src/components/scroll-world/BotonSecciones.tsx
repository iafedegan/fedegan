"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutGrid } from "lucide-react";

const abrirMenu = () => window.dispatchEvent(new Event("fedegan:menu"));

// «Ver todas las secciones»: queda en la portada y, cuando el desplazamiento lo deja atrás, se fija justo debajo del
// encabezado para que se pueda ir a cualquier sección desde donde esté la persona.
export function BotonSecciones() {
  const ref = useRef<HTMLButtonElement>(null);
  const [fijo, setFijo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // «Atrás» = el botón quedó tapado por el encabezado fijo (su borde de abajo pasó el borde de abajo del encabezado).
    const medir = () => {
      const mh = document.querySelector<HTMLElement>(".mh");
      const tope = mh ? mh.getBoundingClientRect().bottom : 64;
      setFijo(el.getBoundingClientRect().bottom < tope + 4);
    };
    // Sin requestAnimationFrame: con la pestaña en segundo plano se detiene. React ya agrupa los cambios de estado iguales.
    const pedir = medir;
    medir();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, []);

  return (
    <>
      <button ref={ref} type="button" className="pt-todo" aria-haspopup="dialog" onClick={abrirMenu}>
        <LayoutGrid size={18} aria-hidden />
        Ver todas las secciones
      </button>
      {/* Por portal al <body>: la hoja translúcida tiene desenfoque y eso encierra a todo lo «fixed» que lleve dentro. */}
      {fijo && createPortal(
        <button type="button" className="pt-todo-fijo" aria-haspopup="dialog" onClick={abrirMenu}>
          <LayoutGrid size={18} aria-hidden />
          Ver todas las secciones
        </button>,
        document.body,
      )}
    </>
  );
}

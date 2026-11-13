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
    const alto = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--mh-h")) || 64;
    const io = new IntersectionObserver(
      ([e]) => setFijo(!e.isIntersecting && e.boundingClientRect.top < alto()),
      // El margen superior es el alto del encabezado fijo: se considera «atrás» al quedar tapado por él.
      { rootMargin: `-${Math.round(alto())}px 0px 0px 0px`, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
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

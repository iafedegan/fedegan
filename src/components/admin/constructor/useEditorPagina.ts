"use client";

import { useCallback, useEffect, useMemo, useReducer, useState, type Dispatch, type SetStateAction } from "react";
import { aBloques, aElementos, problema, type Bloque, type Elemento } from "@/lib/cms/bloques";

// Historial de los cambios de la página (deshacer y rehacer). Varios cambios seguidos al mismo elemento en menos de un segundo
// (escribir) cuentan como uno solo; cualquier cambio de la estructura (añadir, mover, quitar) es un paso propio.
type Estado = { actual: Elemento[]; pasado: Elemento[][]; futuro: Elemento[][]; marca: { t: number; clave: string } };
type Accion = { tipo: "poner"; f: SetStateAction<Elemento[]>; t: number } | { tipo: "deshacer" } | { tipo: "rehacer" };
const MAX_PASOS = 60;

/** El id del único elemento que cambió entre dos versiones (con los mismos elementos y en el mismo orden); si no, «». */
function cambioUnico(antes: Elemento[], despues: Elemento[]): string {
  if (antes.length !== despues.length) return "";
  let clave = "";
  for (let i = 0; i < antes.length; i++) {
    if (antes[i].id !== despues[i].id) return "";
    if (antes[i] !== despues[i]) {
      if (clave) return "";
      clave = antes[i].id;
    }
  }
  return clave;
}

function reducir(s: Estado, a: Accion): Estado {
  if (a.tipo === "poner") {
    const sig = typeof a.f === "function" ? a.f(s.actual) : a.f;
    if (sig === s.actual) return s;
    const clave = cambioUnico(s.actual, sig);
    const junta = clave !== "" && clave === s.marca.clave && a.t - s.marca.t < 1000;
    return { actual: sig, pasado: junta ? s.pasado : [...s.pasado, s.actual].slice(-MAX_PASOS), futuro: [], marca: { t: a.t, clave } };
  }
  if (a.tipo === "deshacer") {
    if (!s.pasado.length) return s;
    return { actual: s.pasado[s.pasado.length - 1], pasado: s.pasado.slice(0, -1), futuro: [s.actual, ...s.futuro], marca: { t: 0, clave: "" } };
  }
  if (!s.futuro.length) return s;
  return { actual: s.futuro[0], pasado: [...s.pasado, s.actual], futuro: s.futuro.slice(1), marca: { t: 0, clave: "" } };
}

/**
 * Estado de una página que se arma en el constructor: los elementos (con su historial), lo que se publicaría y si quedan cambios por publicar.
 * `marcarPublicado` recibe lo que se acaba de publicar (el mismo texto que viaja en el campo `bloques` del formulario).
 */
export function useEditorPagina(bloques: Bloque[]) {
  const [estado, despachar] = useReducer(reducir, bloques, (b): Estado => ({ actual: aElementos(b), pasado: [], futuro: [], marca: { t: 0, clave: "" } }));
  const elementos = estado.actual;
  const setElementos: Dispatch<SetStateAction<Elemento[]>> = useCallback((f) => despachar({ tipo: "poner", f, t: Date.now() }), []);
  const deshacer = useCallback(() => despachar({ tipo: "deshacer" }), []);
  const rehacer = useCallback(() => despachar({ tipo: "rehacer" }), []);

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

  const historial = useMemo(
    () => ({ deshacer, rehacer, puedeDeshacer: estado.pasado.length > 0, puedeRehacer: estado.futuro.length > 0 }),
    [deshacer, rehacer, estado.pasado.length, estado.futuro.length],
  );

  return { elementos, setElementos, publicables, sucio, incompletos, marcarPublicado: setPublicado, historial };
}

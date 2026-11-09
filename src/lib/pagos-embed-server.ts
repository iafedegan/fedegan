import "server-only";
import { cache } from "react";
import { pagosActual } from "@/content/pagos";
import { SITE_URL } from "@/lib/site-url";
import { permiteEmbeber } from "@/lib/pagos-embed";

/**
 * ¿El sistema de pagos admite mostrarse dentro del portal? Se consulta a sus cabeceras y se recuerda 10 minutos:
 * en cuanto quien administra pagos.fedegan.org.co lo permita, la página empieza a incrustarlo sola, sin tocar el portal.
 * Si no responde, se asume que no (y se muestra el acceso directo).
 */
export const getPagosEmbebible = cache(async (): Promise<boolean> => {
  try {
    const res = await fetch(pagosActual, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000), redirect: "follow", headers: { Accept: "text/html" } });
    return res.ok && permiteEmbeber(res.headers, new URL(SITE_URL).origin);
  } catch {
    return false;
  }
});

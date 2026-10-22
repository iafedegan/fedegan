// Personalización por uso: con permiso de la persona, el portal cuenta en una cookie propia (en su dispositivo)
// qué secciones visita más y ordena el recorrido en consecuencia. No se envía nada a ningún servidor y no se
// usa la dirección MAC (un navegador no puede leerla): solo un contador por sección.

export const CONSENT_COOKIE = "fedegan-consent";
export const USO_COOKIE = "fedegan-uso";
export const EVENTO_PRIVACIDAD = "fedegan:privacidad";
export const EVENTO_USO = "fedegan:uso";
const UN_ANIO = 60 * 60 * 24 * 365;

function leer(nombre: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.split("; ").find((c) => c.startsWith(`${nombre}=`));
  return m ? decodeURIComponent(m.slice(nombre.length + 1)) : null;
}

function escribir(nombre: string, valor: string) {
  document.cookie = `${nombre}=${encodeURIComponent(valor)}; Max-Age=${UN_ANIO}; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

function borrar(nombre: string) {
  document.cookie = `${nombre}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/** true = aceptó, false = rechazó, null = aún no responde. */
export function getConsent(): boolean | null {
  const v = leer(CONSENT_COOKIE);
  return v === "1" ? true : v === "0" ? false : null;
}

export function setConsent(acepta: boolean) {
  escribir(CONSENT_COOKIE, acepta ? "1" : "0");
  if (!acepta) {
    borrar(USO_COOKIE);
    void fetch("/api/uso", { method: "DELETE", keepalive: true }).catch(() => {});
  }
  window.dispatchEvent(new Event(EVENTO_USO));
}

export type Uso = Record<string, number>;

export function getUso(): Uso {
  if (getConsent() !== true) return {};
  try {
    const o = JSON.parse(leer(USO_COOKIE) ?? "{}");
    return o && typeof o === "object" ? (o as Uso) : {};
  } catch {
    return {};
  }
}

/** Suma una visita a la sección (solo si hay permiso). */
export function registrarUso(id: string) {
  if (getConsent() !== true) return;
  const uso = getUso();
  uso[id] = (uso[id] ?? 0) + 1;
  escribir(USO_COOKIE, JSON.stringify(uso));
  // Copia en el servidor (Supabase), también solo con permiso, para conocer qué secciones se usan más.
  void fetch("/api/uso", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seccion: id }), keepalive: true }).catch(() => {});
  window.dispatchEvent(new Event(EVENTO_USO));
}

export function borrarUso() {
  borrar(USO_COOKIE);
  void fetch("/api/uso", { method: "DELETE", keepalive: true }).catch(() => {});
  window.dispatchEvent(new Event(EVENTO_USO));
}

/** Secciones del recorrido según la ruta que se visita. */
export function seccionDeRuta(ruta: string): string | null {
  const r = ruta.replace(/\/+$/, "");
  const reglas: [RegExp, string][] = [
    [/^\/(seccion\/)?programas(\/|$)/, "programas"],
    [/^\/(seccion\/)?normatividad(\/|$)/, "normatividad"],
    [/^\/(seccion\/)?publicaciones(\/|$)/, "publicaciones"],
    [/^\/seccion\/cifras-del-sector(\/|$)/, "cifras"],
    [/^\/seccion\/fng(\/|$)/, "fng"],
    [/^\/seccion\/fep(\/|$)/, "fep"],
    [/^\/seccion\/sistema-integrado-de-gestion(\/|$)/, "sig"],
    [/^\/noticias(\/|$)/, "noticias"],
  ];
  return reglas.find(([re]) => re.test(r))?.[1] ?? null;
}

/** Ordena por uso (de mayor a menor); a igual uso, conserva el orden original. Con poco uso no reordena. */
export function ordenarPorUso<T extends { id: string }>(items: T[], uso: Uso, minimo = 3): T[] {
  const total = Object.values(uso).reduce((a, b) => a + b, 0);
  if (total < minimo) return items;
  return items.map((it, i) => ({ it, i })).sort((a, b) => (uso[b.it.id] ?? 0) - (uso[a.it.id] ?? 0) || a.i - b.i).map((x) => x.it);
}

/** Para useSyncExternalStore: el texto de la cookie de uso (vacío sin permiso) y la suscripción a sus cambios. */
export const instantaneaUso = () => (getConsent() === true ? leer(USO_COOKIE) ?? "" : "");
export const suscribirUso = (cb: () => void) => {
  window.addEventListener(EVENTO_USO, cb);
  return () => window.removeEventListener(EVENTO_USO, cb);
};
export const parseUso = (txt: string): Uso => {
  try {
    const o = JSON.parse(txt || "{}");
    return o && typeof o === "object" ? (o as Uso) : {};
  } catch {
    return {};
  }
};

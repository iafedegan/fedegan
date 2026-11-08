// Gamificación del Studio: puntos de experiencia (XP), niveles de ganadero, racha de días, insignias y estrellas por juego.
// Todo se guarda en este navegador (localStorage). Las funciones puras se prueban sin navegador; `dar`, `hito` y `estrellas`
// leen y escriben el almacenamiento y avisan a la interfaz con un evento.

export type Estado = {
  xp: number;
  racha: number;
  dia: string; // último día con actividad (AAAA-MM-DD)
  insignias: string[];
  estrellas: Record<string, number>; // «juego:clave» -> mejor resultado (0 a 3)
  abiertos: string[]; // «clave:material» ya abiertos
  contadores: Record<string, number>;
  sonido: boolean;
  voz: boolean; // leer en voz alta las preguntas de los juegos
};

export const ESTADO_INICIAL: Estado = { xp: 0, racha: 0, dia: "", insignias: [], estrellas: {}, abiertos: [], contadores: {}, sonido: true, voz: false };

export const NIVELES = [
  { desde: 0, nombre: "Ternero" },
  { desde: 120, nombre: "Novillo" },
  { desde: 320, nombre: "Ganadero" },
  { desde: 650, nombre: "Mayoral" },
  { desde: 1100, nombre: "Capataz" },
  { desde: 1700, nombre: "Hacendado" },
  { desde: 2600, nombre: "Maestro FEDEGÁN" },
] as const;

export type NivelInfo = { n: number; nombre: string; desde: number; hasta: number | null; pct: number; falta: number };

/** Nivel según los XP: número, nombre, avance hacia el siguiente y cuánto falta. */
export function nivelDe(xp: number): NivelInfo {
  let i = 0;
  for (let k = 0; k < NIVELES.length; k++) if (xp >= NIVELES[k].desde) i = k;
  const sig = NIVELES[i + 1];
  const desde = NIVELES[i].desde;
  return { n: i + 1, nombre: NIVELES[i].nombre, desde, hasta: sig ? sig.desde : null, pct: sig ? Math.round(((xp - desde) / (sig.desde - desde)) * 100) : 100, falta: sig ? sig.desde - xp : 0 };
}

export const INSIGNIAS = {
  "primera-tarjeta": { titulo: "Primera tarjeta", texto: "Domine su primera tarjeta didáctica.", icono: "layers" },
  "explorador": { titulo: "Explorador", texto: "Abra los nueve materiales de un mismo tema.", icono: "compass" },
  "perfecto": { titulo: "Puntería perfecta", texto: "Responda un cuestionario sin errores.", icono: "target" },
  "racha-3": { titulo: "Constante", texto: "Estudie 3 días seguidos.", icono: "flame" },
  "racha-7": { titulo: "Una semana de campo", texto: "Estudie 7 días seguidos.", icono: "flame" },
  "relampago": { titulo: "Rápido como el rayo", texto: "Logre 100 puntos en el reto Relámpago.", icono: "zap" },
  "memoria": { titulo: "Buena memoria", texto: "Gane Memoria con tres estrellas.", icono: "brain" },
  "orador": { titulo: "Buen oído", texto: "Escuche una audio-lección completa.", icono: "headphones" },
  "voz": { titulo: "Con voz propia", texto: "Responda dictando con su voz.", icono: "mic" },
  "estrellas-5": { titulo: "Cinco estrellas", texto: "Reúna 5 estrellas en los juegos.", icono: "star" },
  "estrellas-15": { titulo: "Constelación", texto: "Reúna 15 estrellas en los juegos.", icono: "star" },
} as const;
export type InsigniaId = keyof typeof INSIGNIAS;

/** Fecha local AAAA-MM-DD. */
export const hoyDe = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function ayerDe(dia: string): string {
  const [y, m, d] = dia.split("-").map(Number);
  return hoyDe(new Date(y, m - 1, d - 1));
}

/** Racha de días seguidos: si ya hubo actividad hoy no cambia; si fue ayer suma; si no, vuelve a 1. */
export function aplicarRacha(e: Estado, hoy: string): Estado {
  if (e.dia === hoy) return e;
  return { ...e, dia: hoy, racha: e.dia && ayerDe(hoy) === e.dia ? e.racha + 1 : 1 };
}

export const totalEstrellas = (e: Estado) => Object.values(e.estrellas).reduce((n, x) => n + x, 0);

/** Insignias que se acaban de ganar con este estado (las que aún no tenía). */
export function insigniasNuevas(e: Estado): InsigniaId[] {
  const tiene = new Set(e.insignias);
  const c = e.contadores;
  // «Explorador»: los nueve materiales de un mismo tema (clave = «alcance:id»).
  const porClave: Record<string, number> = {};
  for (const a of e.abiertos) {
    const k = a.split(":").slice(0, 2).join(":");
    porClave[k] = (porClave[k] ?? 0) + 1;
  }
  const gana: [InsigniaId, boolean][] = [
    ["primera-tarjeta", (c.tarjetas ?? 0) >= 1],
    ["explorador", Object.values(porClave).some((n) => n >= 9)],
    ["perfecto", (c.perfecto ?? 0) >= 1],
    ["racha-3", e.racha >= 3],
    ["racha-7", e.racha >= 7],
    ["relampago", (c.relampago ?? 0) >= 100],
    ["memoria", Object.entries(e.estrellas).some(([k, v]) => k.startsWith("memoria:") && v >= 3)],
    ["orador", (c.audio ?? 0) >= 1],
    ["voz", (c.voz ?? 0) >= 1],
    ["estrellas-5", totalEstrellas(e) >= 5],
    ["estrellas-15", totalEstrellas(e) >= 15],
  ];
  return gana.filter(([id, ok]) => ok && !tiene.has(id)).map(([id]) => id);
}

// ---------- Almacenamiento y avisos ----------

const KEY = "fs:juego";
export const EVENTO = "fs-juego";

export type Aviso = { xp: number; motivo: string; subio: NivelInfo | null; insignias: InsigniaId[]; cambio?: "estado" };

export function leerEstado(): Estado {
  if (typeof localStorage === "undefined") return ESTADO_INICIAL;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return v && typeof v === "object" ? { ...ESTADO_INICIAL, ...v } : ESTADO_INICIAL;
  } catch {
    return ESTADO_INICIAL;
  }
}

function guardar(e: Estado, aviso: Aviso) {
  try {
    localStorage.setItem(KEY, JSON.stringify(e));
  } catch {
    /* sin almacenamiento: el progreso no se guarda */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<Aviso>(EVENTO, { detail: aviso }));
}

/** Suma XP (y mantiene la racha). Avisa a la interfaz si subió de nivel o ganó insignias. */
export function dar(xp: number, motivo: string, extra?: (e: Estado) => Estado): Estado {
  let e = aplicarRacha(leerEstado(), hoyDe());
  const antes = nivelDe(e.xp);
  e = { ...e, xp: Math.max(0, e.xp + Math.round(xp)) };
  if (extra) e = extra(e);
  const nuevas = insigniasNuevas(e);
  if (nuevas.length) e = { ...e, insignias: [...e.insignias, ...nuevas] };
  const despues = nivelDe(e.xp);
  guardar(e, { xp: Math.round(xp), motivo, subio: despues.n > antes.n ? despues : null, insignias: nuevas });
  return e;
}

/** Suma a un contador interno (tarjetas dominadas, cuestionarios perfectos, audio-lecciones…) sin dar XP. */
export function contar(nombre: string, n = 1, motivo = "") {
  return dar(0, motivo, (e) => ({ ...e, contadores: { ...e.contadores, [nombre]: (e.contadores[nombre] ?? 0) + n } }));
}

/** Guarda el mejor resultado de un juego (0 a 3 estrellas) y da XP por el juego y por lo que mejoró. */
export function estrellas(juego: string, clave: string, n: number, motivo: string, opc: { xp?: number; extra?: (e: Estado) => Estado } = {}): number {
  const k = `${juego}:${clave}`;
  const previo = leerEstado().estrellas[k] ?? 0;
  const mejora = Math.max(0, n - previo);
  dar(10 + n * 10 + mejora * 10 + (opc.xp ?? 0), motivo, (e) => {
    const con = { ...e, estrellas: { ...e.estrellas, [k]: Math.max(previo, n) } };
    return opc.extra ? opc.extra(con) : con;
  });
  return Math.max(previo, n);
}

/** Registra que se abrió un material (la primera vez da un poco de XP). */
export function abrirMaterial(clave: string, kind: string) {
  const id = `${clave}:${kind}`;
  if (leerEstado().abiertos.includes(id)) return;
  dar(2, "Material abierto", (e) => ({ ...e, abiertos: [...e.abiertos, id] }));
}

export function ajustar(parcial: Partial<Pick<Estado, "sonido" | "voz">>) {
  const e = { ...leerEstado(), ...parcial };
  guardar(e, { xp: 0, motivo: "", subio: null, insignias: [], cambio: "estado" });
}

// ---------- Sonidos y vibración ----------

let audio: AudioContext | null = null;
export type Sonido = "ok" | "mal" | "nivel" | "clic" | "tic";

/** Efectos cortos con el navegador (sin archivos). Respeta el ajuste de sonido. */
export function sonar(tipo: Sonido) {
  if (typeof window === "undefined" || !leerEstado().sonido) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audio ??= new Ctx();
    if (audio.state === "suspended") void audio.resume();
    const notas: Record<Sonido, [number, number][]> = {
      ok: [[660, 0.09], [880, 0.14]],
      mal: [[220, 0.18], [165, 0.2]],
      nivel: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.25]],
      clic: [[740, 0.04]],
      tic: [[520, 0.03]],
    };
    let t = audio.currentTime;
    for (const [f, d] of notas[tipo]) {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = tipo === "mal" ? "sawtooth" : "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(tipo === "tic" ? 0.05 : 0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + d + 0.02);
      t += d * 0.85;
    }
    if (tipo === "ok" || tipo === "mal") navigator.vibrate?.(tipo === "ok" ? 12 : [20, 40, 20]);
  } catch {
    /* sin audio */
  }
}

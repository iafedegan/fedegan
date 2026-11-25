// API de aliados de la Escuela Virtual: permite que otra aplicación de FEDEGÁN (p. ej. Gestión Ganadera)
// inscriba a sus usuarios, muestre las lecciones y registre su avance, sin llevarlos al portal.
//
// Autenticación entre servidores: cada aliado tiene una clave propia en una variable de entorno
// `ALIADO_<NOMBRE>_CLAVE` y la envía como `Authorization: Bearer …` junto con `X-Aliado: <nombre>`.
// La persona se identifica con un id opaco del aliado; la clave de estudiante es «<aliado>:<id>», por lo que
// nunca coincide con una cuenta del portal (que usa el correo) ni se puede suplantar a nadie por su correo.
import { createHash, timingSafeEqual } from "node:crypto";
import { LEVELS, type Level } from "./queries-types";

const ALIADO = /^[a-z0-9-]{3,30}$/;
const USUARIO = /^[A-Za-z0-9_-]{6,64}$/;

const sha = (v: string) => createHash("sha256").update(v).digest();

/** Nombre del aliado si la solicitud trae su clave correcta; null en cualquier otro caso. */
export function aliadoAutenticado(headers: Pick<Headers, "get">, env: Record<string, string | undefined> = process.env): string | null {
  const aliado = (headers.get("x-aliado") ?? "").trim().toLowerCase();
  if (!ALIADO.test(aliado)) return null;
  const esperada = env[`ALIADO_${aliado.toUpperCase().replace(/-/g, "_")}_CLAVE`];
  const auth = headers.get("authorization") ?? "";
  const dada = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  // Se compara el resumen de ambas para no filtrar el largo de la clave y en tiempo constante.
  if (!esperada || esperada.length < 24 || !dada || !timingSafeEqual(sha(dada), sha(esperada))) return null;
  return aliado;
}

/** Clave de estudiante en la Escuela para un usuario del aliado; null si el id no es válido. */
export function claveEstudiante(aliado: string, usuario: unknown): string | null {
  return typeof usuario === "string" && USUARIO.test(usuario) ? `${aliado}:${usuario}` : null;
}

export type LeccionAliado = {
  id: string;
  titulo: string;
  tipo: "video" | "lectura" | "quiz";
  minutos: number;
  vistaPrevia: boolean;
  /** La persona puede abrirla: está inscrita o la lección es de vista previa gratuita. */
  disponible: boolean;
  completada: boolean;
  nota: number | null;
  notaMinima?: number;
  // Solo si está disponible:
  video?: { tipo: "iframe" | "file"; src: string };
  contenido?: string;
  recurso?: { url: string; etiqueta: string };
};

type Leccion = {
  id: string; title: string; kind: "video" | "lectura" | "quiz"; videoUrl: string | null; content: string;
  minutes: number; freePreview: boolean; resourceUrl: string | null; resourceLabel: string; passScore: number;
};
type Curso = {
  id: string; slug: string; title: string; subtitle: string; description: string; learnPoints: string[]; category: string;
  level: string; instructor: string; instructorBio: string; cover: string | null; certificate: boolean;
  externalUrl: string | null; lessons: number; minutes: number; rating: number; ratings: number;
  modules: { id: string; title: string; summary: string; lessons: Leccion[] }[];
};
type Inscripcion = { enrolledAt: string; completedAt: string | null; code: string | null } | null;

/** Resumen de un curso para el catálogo (sin lecciones). */
export function resumenCurso(c: Omit<Curso, "modules">) {
  return {
    slug: c.slug, titulo: c.title, subtitulo: c.subtitle, categoria: c.category, nivel: LEVELS[c.level as Level] ?? c.level, instructor: c.instructor,
    imagen: c.cover, lecciones: c.lessons, minutos: c.minutes, certificado: c.certificate, externo: c.externalUrl,
    valoracion: c.ratings ? Math.round(c.rating * 10) / 10 : null,
  };
}

/**
 * Detalle del curso para una persona: el temario siempre, pero el video, el texto y el recurso solo de las
 * lecciones que puede abrir (inscrita o vista previa). La nota mínima de una evaluación se muestra; sus
 * preguntas y respuestas no (se piden aparte y sin la respuesta correcta).
 */
export function detalleCurso(
  c: Curso,
  inscripcion: Inscripcion,
  progreso: Map<string, number | null>,
  embed: (url: string) => { tipo: "iframe" | "file"; src: string },
  origenVerificacion: string,
) {
  const modulos = c.modules.map((m) => ({
    id: m.id,
    titulo: m.title,
    lecciones: m.lessons.map((l): LeccionAliado => {
      const disponible = Boolean(inscripcion) || l.freePreview;
      const base: LeccionAliado = {
        id: l.id, titulo: l.title, tipo: l.kind, minutos: l.minutes, vistaPrevia: l.freePreview, disponible,
        completada: progreso.has(l.id), nota: progreso.get(l.id) ?? null,
        ...(l.kind === "quiz" ? { notaMinima: l.passScore } : {}),
      };
      if (!disponible) return base;
      return {
        ...base,
        ...(l.videoUrl ? { video: embed(l.videoUrl) } : {}),
        ...(l.content ? { contenido: l.content } : {}),
        ...(l.resourceUrl ? { recurso: { url: l.resourceUrl, etiqueta: l.resourceLabel } } : {}),
      };
    }),
  }));
  const total = c.modules.reduce((n, m) => n + m.lessons.length, 0);
  const hechas = progreso.size;
  return {
    ...resumenCurso(c),
    descripcion: c.description,
    aprendera: c.learnPoints,
    instructorBio: c.instructorBio,
    modulos,
    inscripcion: inscripcion
      ? {
          desde: inscripcion.enrolledAt,
          avance: { hechas, total, porcentaje: total ? Math.min(100, Math.round((hechas / total) * 100)) : 0 },
          terminado: inscripcion.completedAt,
          certificado:
            inscripcion.completedAt && inscripcion.code
              ? { codigo: inscripcion.code, fecha: inscripcion.completedAt, verificar: `${origenVerificacion}/escuela-virtual/verificar/${inscripcion.code}` }
              : null,
        }
      : null,
  };
}

export const noAutorizado = () => Response.json({ error: "no_autorizado", mensaje: "Clave de aliado no válida." }, { status: 401, headers: { "Cache-Control": "no-store" } });
export const malaSolicitud = (mensaje: string) => Response.json({ error: "solicitud_no_valida", mensaje }, { status: 400, headers: { "Cache-Control": "no-store" } });
export const noEncontrado = (mensaje = "No existe.") => Response.json({ error: "no_existe", mensaje }, { status: 404, headers: { "Cache-Control": "no-store" } });
export const sinServicio = () => Response.json({ error: "sin_servicio", mensaje: "La Escuela Virtual no está configurada." }, { status: 503, headers: { "Cache-Control": "no-store" } });
export const ok = (cuerpo: unknown, status = 200) => Response.json(cuerpo, { status, headers: { "Cache-Control": "no-store" } });

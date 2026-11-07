"use server";

import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import { ROLES, hasAnyRole } from "@/lib/access";
import { CMS_TAG } from "./client";
import { copiarLote, estadoCopia, type EstadoCopia, type ResultadoLote } from "./documentos-copia";

// Cambiar dónde viven los documentos del portal es sensible: solo administradores.
async function admin() {
  const s = await auth();
  return s?.user && hasAnyRole(s.user.roles, [ROLES.portalAdmin]) ? (s.user.email ?? s.user.name ?? "admin") : null;
}

export async function avanceCopia(): Promise<EstadoCopia | null> {
  if (!(await admin())) return null;
  return estadoCopia();
}

/** Copia otro lote de documentos a Supabase. El panel la llama una y otra vez hasta que no queden pendientes. */
export async function copiarDocumentos(): Promise<ResultadoLote & { estado?: EstadoCopia }> {
  if (!(await admin())) return { ok: false, message: "Solo los administradores del portal pueden copiar documentos.", copiados: 0, omitidos: 0, errores: [], pendientes: 0 };
  const r = await copiarLote();
  if (r.ok && (r.copiados > 0 || r.omitidos > 0)) {
    updateTag(CMS_TAG);
    revalidatePath("/", "layout");
  }
  return { ...r, estado: r.ok ? await estadoCopia() : undefined };
}

"use server";

import { auth } from "@/auth";
import { hasAnyRole } from "@/lib/access";
import { redactarPagina, type Proveedor, type ResultadoIA } from "@/lib/ia";
import { adminDb } from "./client";
import { EDITOR_ROLES } from "./guard";

type Entrada = { proveedor: string; pedido: string; titulo: string; nombre: string; ruta: string; seccion: string; actual: string };

const corto = (v: unknown, max: number) => String(v ?? "").slice(0, max);

/** Redacta el contenido de una página con IA. No guarda nada: el editor revisa el texto y pulsa «Guardar cambios». */
export async function generarContenido(e: Entrada): Promise<ResultadoIA> {
  const s = await auth();
  if (!s?.user || !hasAnyRole(s.user.roles, EDITOR_ROLES)) return { ok: false, message: "Su usuario no puede editar contenido." };
  const proveedor = e.proveedor === "gemini" ? "gemini" : e.proveedor === "claude" ? "claude" : null;
  if (!proveedor) return { ok: false, message: "Elija Claude o Gemini." };
  const pedido = corto(e.pedido, 4000).trim();
  if (pedido.length < 8) return { ok: false, message: "Describa con un poco más de detalle qué quiere en la página." };

  const r = await redactarPagina(proveedor as Proveedor, {
    pedido,
    titulo: corto(e.titulo, 200),
    nombre: corto(e.nombre, 120),
    ruta: corto(e.ruta, 300),
    seccion: corto(e.seccion, 120),
    actual: corto(e.actual, 60_000),
  });
  if (r.ok) {
    const actor = s.user.email ?? s.user.name ?? "editor";
    await adminDb()?.from("audit_log").insert({ actor, action: "editar", entity: "ia", summary: `Texto generado con ${proveedor} para ${corto(e.ruta, 200)}` });
  }
  return r;
}

"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLegacyPage, getLegacySection } from "@/content/legacy";
import { adminDb, CMS_TAG } from "./client";
import { requireEditorActor } from "./guard";
import { textToBlocks } from "./paginas-texto";
import { slugify } from "./nodos";

export type NodoState = { ok?: boolean; message?: string; next?: string };

const MAX_TEXTO = 120_000;
// Rutas de /seccion/<slug> que ya tienen un uso propio.
const RESERVADAS = ["seguridad-ganadera", "cifras-del-sector"];
const SIN_CLAVE = "El servidor no tiene la clave de servicio de Supabase (SUPABASE_SERVICE_ROLE_KEY).";
const SIN_TABLA = "No se pudo guardar: falta la tabla del árbol del sitio. Ejecute docs/migraciones/011-arbol-sitio.sql en Supabase.";

const HREF_OK = /^(https?:\/\/\S+|\/[A-Za-z0-9_\-/.?=&#%]*)$/;
const PADRE_OK = /^(~\d+(\.\d+)*|[A-Za-z0-9_\-/.]+)$/;

async function refrescar() {
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
}

const volver = (mensaje: string, ok = true) => redirect(`/admin/arbol?${ok ? "ok" : "error"}=${encodeURIComponent(mensaje)}`);

async function existeSeccion(db: SupabaseClient, slug: string) {
  if (getLegacySection(slug)) return true;
  const { data } = await db.from("site_nodes").select("id").eq("section", slug).eq("is_section", true).maybeSingle();
  return Boolean(data);
}

async function claveLibre(db: SupabaseClient, base: string) {
  let key = base;
  for (let n = 2; n < 100; n++) {
    if (!getLegacyPage(key)) {
      const { data } = await db.from("site_nodes").select("id").eq("key", key).maybeSingle();
      if (!data) return key;
    }
    key = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

async function siguienteOrden(db: SupabaseClient, section: string) {
  const { data } = await db.from("site_nodes").select("sort_order").eq("section", section).order("sort_order", { ascending: false }).limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? 0) + 1;
}

function validarContenido(texto: string) {
  if (texto.length > MAX_TEXTO) return "El texto es demasiado largo.";
  const blocks = textToBlocks(texto);
  if (blocks.length > 1500) return "La página tiene demasiados bloques.";
  const malo = blocks.find((b) => b.t === "embed" && !/^https:\/\/\S+$/.test(b.text ?? ""));
  const boton = blocks.find((b) => b.t === "button" && !/^(https:\/\/\S+|\/[^\s/]\S*|\/)$/.test((b.text ?? "").split("|")[1] ?? ""));
  if (boton) return `Un botón debe enlazar a https://… o a una ruta que empiece con / (revise: ${boton.text?.split("|")[0]}).`;
  return malo ? `El contenido incrustado debe ser una dirección https:// (revise: ${malo.text}).` : null;
}

/** Crea una página o un enlace nuevo dentro de una sección, colgando del nodo elegido (a cualquier nivel). */
export async function crearNodo(_prev: NodoState, fd: FormData): Promise<NodoState> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: SIN_CLAVE };

  const section = String(fd.get("section") ?? "");
  const parent = String(fd.get("parent") ?? "");
  const tipo = String(fd.get("tipo") ?? "pagina") === "enlace" ? "enlace" : "pagina";
  const label = String(fd.get("label") ?? "").trim();
  const href = String(fd.get("href") ?? "").trim();
  const texto = String(fd.get("texto") ?? "");

  if (!label || label.length > 120) return { ok: false, message: "El nombre es obligatorio (máximo 120 caracteres)." };
  if (!(await existeSeccion(db, section))) return { ok: false, message: "La sección no existe." };
  if (parent) {
    if (!PADRE_OK.test(parent)) return { ok: false, message: "El nodo padre no es válido." };
    if (!parent.startsWith("~")) {
      const legado = getLegacyPage(parent);
      const { data } = await db.from("site_nodes").select("id").eq("key", parent).eq("section", section).maybeSingle();
      if (!(legado?.sections.includes(section) || data)) return { ok: false, message: "El nodo padre no existe en esta sección." };
    }
  }
  if (tipo === "enlace" && !HREF_OK.test(href)) return { ok: false, message: "El enlace debe ser una ruta del portal (/pagos) o una dirección https://…" };
  const malo = tipo === "pagina" ? validarContenido(texto) : null;
  if (malo) return { ok: false, message: malo };

  const key = await claveLibre(db, `${section}/${slugify(label) || "pagina"}`);
  const row = {
    section,
    parent: parent || null,
    key,
    label,
    title: label,
    blocks: tipo === "pagina" ? textToBlocks(texto) : [],
    href: tipo === "enlace" ? href : null,
    sort_order: await siguienteOrden(db, section),
    updated_by: actor,
  };
  const { data, error } = await db.from("site_nodes").insert(row).select("id").single();
  if (error) return { ok: false, message: /site_nodes/.test(error.message) ? SIN_TABLA : `No se pudo crear: ${error.message}` };
  await db.from("audit_log").insert({ actor, action: "crear", entity: "arbol", entity_id: String(data.id), summary: label });
  await refrescar();
  return {
    ok: true,
    message: tipo === "pagina" ? "Página creada. Ya se ve en el sitio; ahora puede escribir su contenido." : "Enlace creado.",
    next: tipo === "pagina" ? `/admin/arbol/${data.id}` : undefined,
  };
}

/** Crea una sección nueva (con su portada) y, si se pide, la agrega a la barra de navegación. */
export async function crearSeccion(_prev: NodoState, fd: FormData): Promise<NodoState> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: SIN_CLAVE };

  const label = String(fd.get("label") ?? "").trim();
  const enBarra = fd.get("navbar") === "on";
  if (!label || label.length > 80) return { ok: false, message: "El nombre es obligatorio (máximo 80 caracteres)." };

  const base = slugify(label) || "seccion";
  let slug = base;
  for (let n = 2; n < 100 && (RESERVADAS.includes(slug) || (await existeSeccion(db, slug)) || getLegacyPage(slug)); n++) slug = `${base}-${n}`;

  const { data, error } = await db
    .from("site_nodes")
    .insert({ section: slug, parent: null, key: slug, label, title: label, is_section: true, sort_order: 0, updated_by: actor })
    .select("id")
    .single();
  if (error) return { ok: false, message: /site_nodes/.test(error.message) ? SIN_TABLA : `No se pudo crear: ${error.message}` };
  await db.from("audit_log").insert({ actor, action: "crear", entity: "arbol", entity_id: String(data.id), summary: `Sección ${label}` });

  if (enBarra) {
    const { data: ultimo } = await db.from("nav_items").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const orden = ((ultimo?.[0]?.sort_order as number | undefined) ?? 0) + 1;
    const { error: e2 } = await db.from("nav_items").insert({ label, href: `/seccion/${slug}`, sort_order: orden, published: true, updated_by: actor });
    if (e2) {
      await refrescar();
      return { ok: true, message: `Sección creada, pero no se pudo agregar a la barra: ${e2.message}`, next: `/admin/arbol/${data.id}` };
    }
  }
  await refrescar();
  return { ok: true, message: enBarra ? "Sección creada y agregada a la barra de navegación." : "Sección creada.", next: `/admin/arbol/${data.id}` };
}

/** Guarda el nombre, el título y el contenido (o el enlace) de un nodo creado en el panel. */
export async function editarNodo(_prev: NodoState, fd: FormData): Promise<NodoState> {
  const actor = await requireEditorActor();
  const db = adminDb();
  if (!db) return { ok: false, message: SIN_CLAVE };

  const id = String(fd.get("id") ?? "");
  const label = String(fd.get("label") ?? "").trim();
  const title = String(fd.get("title") ?? "").trim();
  const href = String(fd.get("href") ?? "").trim();
  const texto = String(fd.get("texto") ?? "");
  const { data: nodo } = await db.from("site_nodes").select("id,href").eq("id", id).maybeSingle();
  if (!nodo) return { ok: false, message: "El nodo no existe." };
  if (!label || label.length > 120) return { ok: false, message: "El nombre es obligatorio (máximo 120 caracteres)." };

  const cambios: Record<string, unknown> = { label, updated_by: actor };
  if (nodo.href) {
    if (!HREF_OK.test(href)) return { ok: false, message: "El enlace debe ser una ruta del portal (/pagos) o una dirección https://…" };
    cambios.href = href;
    cambios.title = label;
  } else {
    if (!title || title.length > 200) return { ok: false, message: "El título es obligatorio (máximo 200 caracteres)." };
    const malo = validarContenido(texto);
    if (malo) return { ok: false, message: malo };
    cambios.title = title;
    cambios.blocks = textToBlocks(texto);
  }
  const { error } = await db.from("site_nodes").update(cambios).eq("id", id);
  if (error) return { ok: false, message: `No se pudo guardar: ${error.message}` };
  await db.from("audit_log").insert({ actor, action: "editar", entity: "arbol", entity_id: id, summary: label });
  await refrescar();
  return { ok: true, message: "Guardado. El cambio ya se ve en el sitio." };
}

/** Sube o baja un nodo creado en el panel entre sus hermanos (los nodos copiados del portal actual conservan su orden). */
export async function moverNodo(fd: FormData) {
  const actor = await requireEditorActor();
  const db = adminDb();
  const id = String(fd.get("id") ?? "");
  const dir = fd.get("dir") === "up" ? -1 : 1;
  if (!db || !id) redirect("/admin/arbol");
  const { data: nodo } = await db.from("site_nodes").select("section,parent").eq("id", id).maybeSingle();
  if (!nodo) volver("El nodo no existe.", false);
  const q = db.from("site_nodes").select("id").eq("section", nodo!.section).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  const { data } = await (nodo!.parent ? q.eq("parent", nodo!.parent) : q.is("parent", null));
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) volver("Sin cambios");
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) await db.from("site_nodes").update({ sort_order: k + 1, updated_by: actor }).eq("id", ids[k]);
  await refrescar();
  volver("Orden actualizado");
}

export async function publicarNodo(fd: FormData) {
  const actor = await requireEditorActor();
  const db = adminDb();
  const id = String(fd.get("id") ?? "");
  if (!db || !id) redirect("/admin/arbol");
  const { data } = await db.from("site_nodes").select("published,label").eq("id", id).maybeSingle();
  if (!data) volver("El nodo no existe.", false);
  const next = !(data!.published as boolean);
  await db.from("site_nodes").update({ published: next, updated_by: actor }).eq("id", id);
  await db.from("audit_log").insert({ actor, action: next ? "publicar" : "ocultar", entity: "arbol", entity_id: id, summary: String(data!.label) });
  await refrescar();
  volver(next ? "Publicado" : "Oculto del sitio");
}

/** Elimina un nodo creado en el panel con todo lo que cuelga de él; si es una sección, también sale de la barra. */
export async function eliminarNodo(fd: FormData) {
  const actor = await requireEditorActor();
  const db = adminDb();
  const id = String(fd.get("id") ?? "");
  if (!db || !id) redirect("/admin/arbol");
  const { data: nodo } = await db.from("site_nodes").select("id,section,key,label,is_section").eq("id", id).maybeSingle();
  if (!nodo) volver("El nodo no existe.", false);

  if (nodo!.is_section) {
    await db.from("site_nodes").delete().eq("section", nodo!.section);
    await db.from("nav_items").delete().eq("href", `/seccion/${nodo!.section}`);
  } else {
    const { data } = await db.from("site_nodes").select("id,key,parent").eq("section", nodo!.section);
    const todos = (data ?? []) as { id: string; key: string; parent: string | null }[];
    const borrar = new Set<string>([nodo!.id as string]);
    const claves = new Set<string>([nodo!.key as string]);
    for (let again = true; again; ) {
      again = false;
      for (const n of todos) {
        if (!borrar.has(n.id) && n.parent && claves.has(n.parent)) {
          borrar.add(n.id);
          claves.add(n.key);
          again = true;
        }
      }
    }
    await db.from("site_nodes").delete().in("id", [...borrar]);
  }
  await db.from("audit_log").insert({ actor, action: "eliminar", entity: "arbol", entity_id: id, summary: String(nodo!.label) });
  await refrescar();
  volver("Eliminado");
}

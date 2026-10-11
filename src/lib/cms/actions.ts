"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/auth";
import { hasAnyRole } from "@/lib/access";
import { EDITOR_ROLES } from "./guard";
import { adminDb, CMS_TAG, MEDIA_BUCKET, publicMediaUrl } from "./client";
import { getEntity, type Entity, type Field } from "./entities";

export type FormState = { error?: string };

async function requireEditor() {
  const session = await auth();
  if (!session?.user) redirect("/ingresar");
  if (!hasAnyRole(session.user.roles, EDITOR_ROLES)) redirect("/admin");
  return session.user.email ?? session.user.name ?? "editor";
}

const NOT_CONFIGURED = "El CMS aún no tiene la clave de servicio (SUPABASE_SERVICE_ROLE_KEY) en el servidor.";

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function safeHref(v: string) {
  return /^(\/(?!\/)|https:\/\/|http:\/\/|#)/.test(v) && !/^\s*javascript:/i.test(v);
}

const ALLOWED_UPLOAD = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["application/pdf", "pdf"],
]);

async function readField(
  f: Field,
  fd: FormData,
  entity: Entity,
  creating: boolean,
  db: NonNullable<ReturnType<typeof adminDb>>,
): Promise<{ skip?: boolean; value?: unknown; error?: string }> {
  const raw = fd.get(f.name);
  const text = typeof raw === "string" ? raw.trim() : "";

  switch (f.type) {
    case "slug": {
      if (!creating) return { skip: true };
      const from = entity.slugFrom ? String(fd.get(entity.slugFrom) ?? "") : "";
      const slug = slugify(text || from);
      if (!slug) return { error: `${f.label}: escriba un valor para generar el identificador.` };
      return { value: slug };
    }
    case "bool":
      return { value: raw === "on" };
    case "number": {
      const n = Number.parseInt(text, 10);
      if (Number.isNaN(n)) return f.required ? { error: `${f.label} es obligatorio.` } : { value: 0 };
      return { value: n };
    }
    case "tags": {
      const tags = [...new Set(text.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 6);
      if (tags.some((t) => t.length > 40)) return { error: `${f.label}: cada etiqueta admite hasta 40 caracteres.` };
      return { value: tags };
    }
    case "select": {
      if (!f.options?.some((o) => o.value === text)) return { error: `${f.label}: elija una opción válida.` };
      return { value: text };
    }
    case "date": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) return { error: `${f.label}: fecha no válida.` };
      return { value: text };
    }
    case "image":
    case "file": {
      let url = text;
      const file = fd.get(`${f.name}__file`);
      if (file instanceof File && file.size > 0) {
        const ext = ALLOWED_UPLOAD.get(file.type);
        if (!ext || (f.type === "image" && ext === "pdf")) {
          return { error: `${f.label}: formato de archivo no permitido.` };
        }
        if (file.size > 5 * 1024 * 1024) return { error: `${f.label}: el archivo supera 5 MB.` };
        const path = `${entity.key}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await db.storage.from(MEDIA_BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type });
        if (error) return { error: `${f.label}: no se pudo subir el archivo (${error.message}).` };
        url = publicMediaUrl(path);
      }
      if (!url) return f.required ? { error: `${f.label} es obligatorio.` } : { value: null };
      if (!safeHref(url)) return { error: `${f.label}: use una ruta que empiece por / o una dirección https://.` };
      return { value: url };
    }
    default: {
      if (!text) return f.required ? { error: `${f.label} es obligatorio.` } : { value: "" };
      if (text.length > (f.max ?? (f.type === "textarea" ? 2000 : 300))) {
        return { error: `${f.label}: máximo ${f.max ?? 300} caracteres.` };
      }
      if (f.name === "href" && !safeHref(text)) return { error: `${f.label}: use una ruta que empiece por / o una dirección https://.` };
      return { value: text };
    }
  }
}

function done(entityKey: string, msg: string): never {
  updateTag(CMS_TAG);
  revalidatePath("/", "layout");
  redirect(`/admin/${entityKey}?ok=${encodeURIComponent(msg)}`);
}

export async function saveRecord(_prev: FormState, fd: FormData): Promise<FormState> {
  const actor = await requireEditor();
  const entity = getEntity(String(fd.get("_entity") ?? ""));
  if (!entity) return { error: "Tipo de contenido desconocido." };
  const db = adminDb();
  if (!db) return { error: NOT_CONFIGURED };

  const id = String(fd.get("_id") ?? "");
  const creating = !id;
  const row: Record<string, unknown> = {};
  for (const f of entity.fields) {
    const r = await readField(f, fd, entity, creating, db);
    if (r.error) return { error: r.error };
    if (!r.skip) row[f.name] = r.value;
  }
  row.published = fd.get("published") === "on";
  row.updated_by = actor;

  if (creating) {
    if (entity.ordered) {
      const { data } = await db.from(entity.table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
      row.sort_order = ((data?.[0]?.sort_order as number | undefined) ?? -1) + 1;
    }
    const { data, error } = await db.from(entity.table).insert(row).select("id").single();
    if (error) return { error: error.code === "23505" ? "Ya existe un registro con ese identificador." : `No se pudo guardar: ${error.message}` };
    await db.from("audit_log").insert({ actor, action: "crear", entity: entity.key, entity_id: data.id, summary: String(row[entity.titleField] ?? "") });
  } else {
    const { error } = await db.from(entity.table).update(row).eq("id", id);
    if (error) return { error: `No se pudo guardar: ${error.message}` };
    await db.from("audit_log").insert({ actor, action: "editar", entity: entity.key, entity_id: id, summary: String(row[entity.titleField] ?? "") });
  }
  done(entity.key, creating ? "Registro creado" : "Cambios guardados");
}

export async function deleteRecord(fd: FormData) {
  const actor = await requireEditor();
  const entity = getEntity(String(fd.get("_entity") ?? ""));
  const id = String(fd.get("_id") ?? "");
  const db = adminDb();
  if (!entity || !id || !db) redirect("/admin");
  const { data } = await db.from(entity.table).select(entity.titleField).eq("id", id).maybeSingle();
  const { error } = await db.from(entity.table).delete().eq("id", id);
  if (error) redirect(`/admin/${entity.key}?error=${encodeURIComponent(error.message)}`);
  await db.from("audit_log").insert({ actor, action: "eliminar", entity: entity.key, entity_id: id, summary: String((data as Record<string, unknown> | null)?.[entity.titleField] ?? "") });
  done(entity.key, "Registro eliminado");
}

export async function togglePublished(fd: FormData) {
  const actor = await requireEditor();
  const entity = getEntity(String(fd.get("_entity") ?? ""));
  const id = String(fd.get("_id") ?? "");
  const db = adminDb();
  if (!entity || !id || !db) redirect("/admin");
  const { data } = await db.from(entity.table).select("published").eq("id", id).single();
  const next = !(data?.published as boolean);
  await db.from(entity.table).update({ published: next, updated_by: actor }).eq("id", id);
  await db.from("audit_log").insert({ actor, action: next ? "publicar" : "ocultar", entity: entity.key, entity_id: id });
  done(entity.key, next ? "Publicado" : "Oculto del sitio");
}

export async function moveRecord(fd: FormData) {
  const actor = await requireEditor();
  const entity = getEntity(String(fd.get("_entity") ?? ""));
  const id = String(fd.get("_id") ?? "");
  const dir = fd.get("_dir") === "up" ? -1 : 1;
  const db = adminDb();
  if (!entity || !entity.ordered || !id || !db) redirect("/admin");
  const { data } = await db.from(entity.table).select("id").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) done(entity.key, "Sin cambios");
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) {
    await db.from(entity.table).update({ sort_order: k, updated_by: actor }).eq("id", ids[k]);
  }
  done(entity.key, "Orden actualizado");
}

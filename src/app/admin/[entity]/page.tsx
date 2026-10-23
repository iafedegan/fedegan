import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListTree, AlertCircle, ArrowDown, ArrowUp, CheckCircle2, ChevronRight, Eye, EyeOff, ImageOff, Pencil, Plus } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { readDb } from "@/lib/cms/client";
import { getEntity } from "@/lib/cms/entities";
import { deleteRecord, moveRecord, togglePublished } from "@/lib/cms/actions";

export const metadata: Metadata = { title: "Panel del portal", robots: { index: false } };

type Row = Record<string, unknown>;

export default async function EntityListPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { entity: key } = await params;
  const { ok, error } = await searchParams;
  const entity = getEntity(key);
  if (!entity) notFound();

  const { db, writable } = readDb();
  let rows: Row[] = [];
  if (db) {
    const { data } = await db.from(entity.table).select("*").order(entity.orderBy.column, { ascending: entity.orderBy.ascending });
    rows = (data ?? []) as Row[];
  }

  const subtitle = (r: Row) => {
    if (entity.key === "eventos") {
      const d = r.starts_on ? new Date(`${String(r.starts_on)}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "";
      return `${String(r.kind ?? "")} · ${d}`;
    }
    return entity.subtitleField ? String(r[entity.subtitleField] ?? "") : "";
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
            <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
            <ChevronRight size={12} />
            <span className="font-medium text-[#5d6e65]">{entity.plural}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{entity.plural}</h1>
          <p className="mt-1.5 max-w-2xl text-[#5d6e65]">{entity.description}</p>
        </div>
        {writable && (
          <Link href={`/admin/${entity.key}/nuevo`} className="ad-btn ad-btn-primary">
            <Plus size={16} /> Nuevo {entity.label}
          </Link>
        )}
      </header>

      {ok && (
        <p role="status" className="flex items-center gap-2 rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-4 py-3 text-sm text-[#14573a]">
          <CheckCircle2 size={18} /> {ok}. Los cambios ya se ven en el sitio.
        </p>
      )}
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]">
          <AlertCircle size={18} /> {error}
        </p>
      )}
      {!writable && <ConfigNotice compact />}

      <div className="ad-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#eceae0] px-5 py-3.5 sm:px-6">
          <p className="text-sm font-semibold">{rows.length} {rows.length === 1 ? "elemento" : "elementos"}</p>
          <p className="text-xs text-[#8a978f]">{entity.ordered ? "Use las flechas para cambiar el orden en el sitio" : "Ordenados por fecha"}</p>
        </div>

        {rows.length === 0 ? (
          <p className="px-6 py-14 text-center text-[#8a978f]">Todavía no hay elementos.{writable ? " Cree el primero con el botón de arriba." : ""}</p>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {rows.map((r, i) => {
              const id = r.id as string;
              const title = String(r[entity.titleField] ?? "");
              const thumb = entity.thumbField ? (r[entity.thumbField] as string | null) : null;
              const published = Boolean(r.published);
              const updated = r.updated_at ? new Date(String(r.updated_at)).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "";
              return (
                <li key={id} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors hover:bg-[#faf9f4] sm:px-6">
                  {entity.thumbField && (
                    <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e4e2d6] bg-[#f1f0e8]">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className={`h-full w-full ${entity.key === "portales" ? "object-contain p-1.5" : "object-cover"}`} />
                      ) : (
                        <ImageOff size={18} className="text-[#b8b4a0]" />
                      )}
                    </span>
                  )}
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="truncate font-semibold">{title}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5d6e65]">
                      {subtitle(r) && <span className="truncate">{subtitle(r)}</span>}
                      {updated && <span className="text-xs text-[#8a978f]">Editado {updated}</span>}
                    </p>
                  </div>
                  <span className={`ad-pill ${published ? "ad-pill-ok" : "ad-pill-off"}`}>{published ? "Publicado" : "Oculto"}</span>
                  <div className="flex items-center gap-1.5">
                    {entity.ordered && (
                      <>
                        <form action={moveRecord}>
                          <input type="hidden" name="_entity" value={entity.key} />
                          <input type="hidden" name="_id" value={id} />
                          <input type="hidden" name="_dir" value="up" />
                          <button type="submit" aria-label="Subir" title="Subir" disabled={!writable || i === 0} className="ad-icon-btn"><ArrowUp size={16} /></button>
                        </form>
                        <form action={moveRecord}>
                          <input type="hidden" name="_entity" value={entity.key} />
                          <input type="hidden" name="_id" value={id} />
                          <input type="hidden" name="_dir" value="down" />
                          <button type="submit" aria-label="Bajar" title="Bajar" disabled={!writable || i === rows.length - 1} className="ad-icon-btn"><ArrowDown size={16} /></button>
                        </form>
                      </>
                    )}
                    <form action={togglePublished}>
                      <input type="hidden" name="_entity" value={entity.key} />
                      <input type="hidden" name="_id" value={id} />
                      <button type="submit" disabled={!writable} aria-label={published ? "Ocultar del sitio" : "Publicar"} title={published ? "Ocultar del sitio" : "Publicar"} className="ad-icon-btn">
                        {published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </form>
                    {entity.key === "cursos" && (
                      <Link href={`/admin/cursos/${id}/curriculo`} aria-label="Currículo" title="Currículo (módulos y lecciones)" className="ad-icon-btn"><ListTree size={16} /></Link>
                    )}
                    <Link href={`/admin/${entity.key}/${id}`} aria-label="Editar" title="Editar" className="ad-icon-btn"><Pencil size={16} /></Link>
                    <form action={deleteRecord}>
                      <input type="hidden" name="_entity" value={entity.key} />
                      <input type="hidden" name="_id" value={id} />
                      <DeleteButton label={title} disabled={!writable} />
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

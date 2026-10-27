import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Pencil, Search } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { allLegacyPages, legacyHref, legacySections } from "@/content/legacy";
import { readDb } from "@/lib/cms/client";
import { listOverrides } from "@/lib/cms/paginas";

export const metadata: Metadata = { title: "Páginas migradas · Panel del portal", robots: { index: false } };

const POR_PAGINA = 40;

const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default async function PaginasAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; s?: string; p?: string; solo?: string }> }) {
  const { q = "", s = "", p = "1", solo } = await searchParams;
  const { writable } = readDb();
  const { map: editadas, tableReady } = await listOverrides();

  const qn = normalizar(q.trim());
  const todas = allLegacyPages()
    .filter((x) => (!s || x.slug === s) && (!qn || normalizar(x.page.title).includes(qn) || normalizar(x.key).includes(qn)) && (solo !== "editadas" || editadas.has(x.key)))
    .sort((a, b) => a.slug.localeCompare(b.slug) || a.page.title.localeCompare(b.page.title));
  const paginas = Math.max(1, Math.ceil(todas.length / POR_PAGINA));
  const actual = Math.min(Math.max(1, Number(p) || 1), paginas);
  const filas = todas.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA);
  const href = (over: Record<string, string>) => {
    const params = new URLSearchParams({ ...(q ? { q } : {}), ...(s ? { s } : {}), ...(solo ? { solo } : {}), ...over });
    return `/admin/paginas?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Páginas migradas</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Páginas migradas</h1>
        <p className="mt-1.5 max-w-2xl text-[#5d6e65]">
          El texto de las {allLegacyPages().length} páginas copiadas del portal actual. Edite el texto aquí; el original se conserva y se puede restaurar.
        </p>
      </header>

      {!writable && <ConfigNotice compact />}
      {writable && !tableReady && (
        <p className="rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]">
          Falta crear la tabla de páginas editables: ejecute <code className="font-mono">docs/migraciones/010-paginas-editables.sql</code> en Supabase.
        </p>
      )}

      <form action="/admin/paginas" className="ad-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a978f]" />
          <input name="q" defaultValue={q} placeholder="Buscar por título o ruta…" className="ad-input pl-10" />
        </div>
        <div className="sm:w-60">
          <select name="s" defaultValue={s} className="ad-input" aria-label="Sección">
            <option value="">Todas las secciones</option>
            {Object.entries(legacySections).map(([slug, sec]) => (
              <option key={slug} value={slug}>{sec.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-[#5d6e65]">
          <input type="checkbox" name="solo" value="editadas" defaultChecked={solo === "editadas"} className="h-4 w-4 accent-[#165a43]" /> Solo editadas
        </label>
        <button type="submit" className="ad-btn ad-btn-primary">Filtrar</button>
      </form>

      <div className="ad-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#eceae0] px-5 py-3.5 sm:px-6">
          <p className="text-sm font-semibold">{todas.length} páginas</p>
          <p className="text-xs text-[#8a978f]">{editadas.size} con texto editado</p>
        </div>
        {filas.length === 0 ? (
          <p className="px-6 py-14 text-center text-[#8a978f]">Ninguna página coincide con el filtro.</p>
        ) : (
          <ul className="divide-y divide-[#eceae0]">
            {filas.map(({ key, page, slug }) => {
              const e = editadas.get(key);
              return (
                <li key={key} className="flex flex-wrap items-center gap-3 px-5 py-3.5 hover:bg-[#faf9f4] sm:px-6">
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="truncate font-semibold">{page.title}</p>
                    <p className="truncate text-xs text-[#8a978f]">
                      {legacySections[slug]?.label} · <span className="font-mono">{legacyHref(slug, key)}</span>
                    </p>
                  </div>
                  {e ? (
                    <span className="ad-pill ad-pill-gold" title={e.updated_by ?? ""}>
                      Editada {new Date(e.updated_at).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" })}
                    </span>
                  ) : (
                    <span className="ad-pill ad-pill-off">Original</span>
                  )}
                  <Link href={`/admin/paginas/editar/${key.split("/").map(encodeURIComponent).join("/")}`} className="ad-icon-btn" aria-label={`Editar ${page.title}`} title="Editar">
                    <Pencil size={16} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {paginas > 1 && (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-3 text-sm">
          {actual > 1 && <Link href={href({ p: String(actual - 1) })} className="ad-btn ad-btn-ghost">← Anterior</Link>}
          <span className="text-[#5d6e65]">Página {actual} de {paginas}</span>
          {actual < paginas && <Link href={href({ p: String(actual + 1) })} className="ad-btn ad-btn-ghost">Siguiente →</Link>}
        </nav>
      )}
    </div>
  );
}

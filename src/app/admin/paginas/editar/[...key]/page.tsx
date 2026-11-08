import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, RotateCcw } from "lucide-react";
import { marcoDePagina } from "@/components/admin/MarcoPagina";
import { PaginaForm } from "@/components/admin/PaginaForm";
import { getLegacyPage, legacyHref, legacySections } from "@/content/legacy";
import { docsDePagina } from "@/content/legacy/documentos";
import { readDb } from "@/lib/cms/client";
import { restorePagina } from "@/lib/cms/pagina-actions";
import { getPageOverride } from "@/lib/cms/paginas";

export const metadata: Metadata = { title: "Editar página · Panel del portal", robots: { index: false } };

export default async function EditarPaginaPage({ params, searchParams }: { params: Promise<{ key: string[] }>; searchParams: Promise<{ restaurada?: string }> }) {
  const { key: partes } = await params;
  const { restaurada } = await searchParams;
  const key = partes.map((s) => decodeURIComponent(s)).join("/");
  const page = getLegacyPage(key);
  if (!page) notFound();
  const slug = page.sections[0];
  const { writable } = readDb();
  const override = await getPageOverride(key);
  const bloques = override?.blocks ?? page.blocks;
  const plano = JSON.stringify(bloques);
  const marco = await marcoDePagina(slug, key);
  const docs = docsDePagina(key);
  // Los faltantes que ya están en la página (por ejemplo, de una edición anterior) no se vuelven a ofrecer.
  const faltan = (docs?.faltan ?? []).filter(([, url]) => !plano.includes(url) && !plano.includes(url.replace(/ /g, "%20")));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <Link href="/admin/paginas" className="hover:text-[#165a43]">Páginas y documentos</Link>
          <ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">{legacySections[slug]?.label}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{override?.title ?? page.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <Link href={legacyHref(slug, key)} target="_blank" className="inline-flex items-center gap-1.5 font-semibold text-[#165a43]">
            Ver en el sitio <ExternalLink size={13} />
          </Link>
          <a href={page.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#5d6e65]">
            Página original <ExternalLink size={13} />
          </a>
          {override && <span className="ad-pill ad-pill-gold">Texto editado</span>}
          {docs && <span className="ad-pill ad-pill-ok">{docs.total} documentos en el original</span>}
        </p>
        {restaurada && <p className="mt-3 rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-4 py-2.5 text-sm text-[#14573a]">Se restauró el texto original.</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="ad-card min-w-0 p-5 sm:p-7">
          <PaginaForm pageKey={key} title={override?.title ?? page.title} bloques={bloques} writable={writable} faltan={faltan} enTablas={docs?.enTablas ?? 0} marco={marco} />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="ad-card p-5 text-sm leading-relaxed text-[#5d6e65]">
            <h2 className="mb-3 text-base font-bold text-[#11271d]">Cómo se arma</h2>
            <ul className="flex flex-col gap-2">
              <li>Pulse un elemento para abrir sus opciones.</li>
              <li>Arrastre elementos desde la paleta, o púlselos para añadirlos.</li>
              <li>Las tablas del original se conservan: se pueden mover o quitar, pero no se editan aquí.</li>
              <li>Nada se publica hasta pulsar <strong>Publicar cambios</strong>.</li>
            </ul>
          </div>
          {override && (
            <form action={restorePagina} className="ad-card p-5">
              <input type="hidden" name="key" value={key} />
              <p className="mb-3 text-sm text-[#5d6e65]">Vuelve al texto copiado del portal actual y descarta los cambios publicados.</p>
              <button type="submit" disabled={!writable} className="ad-btn ad-btn-ghost w-full">
                <RotateCcw size={15} /> Restaurar el original
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

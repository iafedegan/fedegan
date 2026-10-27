import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink, RotateCcw } from "lucide-react";
import { PaginaForm } from "@/components/admin/PaginaForm";
import { getLegacyPage, legacyHref, legacySections } from "@/content/legacy";
import { readDb } from "@/lib/cms/client";
import { restorePagina } from "@/lib/cms/pagina-actions";
import { blocksToText } from "@/lib/cms/paginas-texto";
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
  const texto = blocksToText(override?.blocks ?? page.blocks);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link>
          <ChevronRight size={12} />
          <Link href="/admin/paginas" className="hover:text-[#165a43]">Páginas migradas</Link>
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
        </p>
        {restaurada && <p className="mt-3 rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-4 py-2.5 text-sm text-[#14573a]">Se restauró el texto original.</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="ad-card p-5 sm:p-7">
          <PaginaForm pageKey={key} title={override?.title ?? page.title} texto={texto} writable={writable} />
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="ad-card p-5 text-sm leading-relaxed text-[#5d6e65]">
            <h2 className="mb-3 text-base font-bold text-[#11271d]">Cómo se escribe</h2>
            <ul className="flex flex-col gap-2">
              <li>Una <strong>línea en blanco</strong> separa los párrafos.</li>
              <li><code className="font-mono text-[0.8rem]">## Título</code> encabezado (<code className="font-mono text-[0.8rem]">###</code> y <code className="font-mono text-[0.8rem]">####</code> más pequeños).</li>
              <li><code className="font-mono text-[0.8rem]">- elemento</code> lista.</li>
              <li><code className="font-mono text-[0.8rem]">**negrita**</code> y <code className="font-mono text-[0.8rem]">[texto](https://…)</code> o <code className="font-mono text-[0.8rem]">[texto](/ruta)</code> para enlaces.</li>
              <li><code className="font-mono text-[0.8rem]">@video https://…</code> video, documento o tablero incrustado.</li>
              <li><code className="font-mono text-[0.8rem]">{"{{tabla 1}}"}</code> es una tabla del original: se conserva; muévala o bórrela, pero no se edita aquí.</li>
              <li>Para que una línea no se tome como lista o encabezado, empiece con <code className="font-mono text-[0.8rem]">\</code>.</li>
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

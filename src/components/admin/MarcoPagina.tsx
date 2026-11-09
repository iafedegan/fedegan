import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { QuickRail } from "@/components/blocks/Accesos";
import { PrevNext, SectionSearch, SectionTiles, countBelow, flattenTree } from "@/components/legacy/SectionParts";
import { findTrail, legacyHref } from "@/content/legacy";
import { customPagesOf, getSection } from "@/lib/cms/nodos";
import type { InicialPartes } from "@/lib/cms/partes";

// Lo que el sitio añade solo en una página. El encabezado queda fijo arriba; el resto (fichas de los temas, accesos rápidos, índice,
// páginas hijas, anterior y siguiente) son «partes» que se mueven en la lista como cualquier elemento (src/lib/cms/partes.ts).

export type MarcoPagina = { antes: ReactNode; partes: Record<string, ReactNode>; inicial: InicialPartes };

function Zona({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-dashed border-[#cfd8c4] bg-[#f6f8f2]" aria-label={`${titulo} (automático)`}>
      <header className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3.5 pt-2.5">
        <Lock size={12} aria-hidden className="text-[#8a978f]" />
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#5d6e65]">{titulo}</span>
        {nota && <span className="text-xs text-[#7a877f]">· {nota}</span>}
      </header>
      {/* inert: se ve igual que en el sitio, pero sus enlaces y botones no hacen nada aquí. */}
      <div inert className="px-4 pb-4 pt-2">{children}</div>
    </section>
  );
}

const Titulo = ({ children }: { children: ReactNode }) => <p className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)]">{children}</p>;

/** Las partes automáticas de la página `key` de la sección `slug`; null si la sección no existe. */
export async function marcoDePagina(slug: string, key: string): Promise<MarcoPagina | null> {
  const section = await getSection(slug);
  if (!section) return null;
  const custom = await customPagesOf(slug);

  // Portada de la sección: encabezado con cifras y buscador, una ficha por cada tema y, al lado del texto, los accesos rápidos.
  if (key === section.landing) {
    const ramas = section.tree.filter((n) => n.key !== key);
    const paginas = ramas.reduce((a, n) => a + 1 + countBelow(n), 0);
    const nada = <p className="text-sm italic text-[var(--text-muted)]">Esta parte no muestra nada en esta página por ahora.</p>;
    return {
      antes: (
        <Zona titulo="Encabezado de la sección" nota="fijo: se arma con el nombre y las páginas de la sección">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Titulo>{section.label}</Titulo>
            {ramas.length > 0 && (
              <div className="flex flex-col gap-3">
                <dl className="hub-stats">
                  <div><dt>Temas</dt><dd>{ramas.length}</dd></div>
                  <div><dt>Páginas</dt><dd>{paginas}</dd></div>
                </dl>
                <SectionSearch label={section.label} />
              </div>
            )}
          </div>
        </Zona>
      ),
      partes: {
        fichas: ramas.length > 0 ? (
          <div inert>
            <div className="hub-head"><span className="font-[var(--font-display)] text-2xl font-bold">Explore {section.label}</span></div>
            <SectionTiles nodes={ramas} slug={slug} custom={custom} />
          </div>
        ) : nada,
        accesos: <div inert className="max-w-sm"><QuickRail /></div>,
        indice: nada, hijas: nada, anteriorsiguiente: nada,
      },
      inicial: { antes: ["fichas"], despues: ["accesos"] },
    };
  }

  // Página de contenido: migas y título arriba; abajo, las páginas de este tema y «Anterior / Siguiente».
  const ruta = findTrail(section.tree, key) ?? [];
  const aqui = ruta[ruta.length - 1];
  const hijas = (aqui?.children ?? []).filter((n) => n.key !== key);
  const orden = [{ label: section.label, href: `/seccion/${slug}` }, ...flattenTree(section.tree, slug).filter((p) => p.href !== `/seccion/${slug}`)];
  const i = orden.findIndex((p) => p.href === legacyHref(slug, key));
  const prev = i > 0 ? orden[i - 1] : undefined;
  const next = i >= 0 && i < orden.length - 1 ? orden[i + 1] : undefined;
  const nada = <p className="text-sm italic text-[var(--text-muted)]">Esta parte no muestra nada en esta página por ahora.</p>;
  return {
    antes: (
      <Zona titulo="Cabecera y menú de la sección" nota="fijo: migas arriba y el menú de la sección a la izquierda">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {[section.label, ...ruta.slice(0, -1).map((n) => n.label)].join("  ›  ")}
        </p>
      </Zona>
    ),
    partes: {
      indice: <p className="text-sm text-[var(--text-muted)]">«En esta página»: la lista de los títulos de la página (aparece sola cuando hay tres o más).</p>,
      hijas: hijas.length > 0 ? <div inert><SectionTiles nodes={hijas} slug={slug} custom={custom} /></div> : nada,
      anteriorsiguiente: prev || next ? <div inert><PrevNext prev={prev} next={next} /></div> : nada,
      fichas: nada, accesos: nada,
    },
    inicial: { antes: ["indice"], despues: ["hijas", "anteriorsiguiente"] },
  };
}

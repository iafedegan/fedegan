import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { QuickRail } from "@/components/blocks/Accesos";
import { PrevNext, SectionSearch, SectionTiles, countBelow, flattenTree } from "@/components/legacy/SectionParts";
import { findTrail, legacyHref } from "@/content/legacy";
import { customPagesOf, getSection } from "@/lib/cms/nodos";

// Lo que el sitio añade solo alrededor del contenido de una página (encabezado, fichas de los temas, accesos rápidos,
// páginas hermanas…). El editor lo muestra en su sitio, sin poder tocarlo, para ver la página completa tal como está armada.

export type MarcoPagina = { antes: ReactNode; despues: ReactNode };

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
    return {
      antes: (
        <div className="flex flex-col gap-3">
          <Zona titulo="Encabezado de la sección" nota="se arma con el nombre y las páginas de la sección">
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
          {ramas.length > 0 && (
            <Zona titulo="Fichas de los temas" nota="una por cada página de primer nivel (se crean o se quitan desde el árbol del sitio); para sumar otra, use «Ficha de tema»">
              <div className="hub-head"><span className="font-[var(--font-display)] text-2xl font-bold">Explore {section.label}</span></div>
              <SectionTiles nodes={ramas} slug={slug} custom={custom} />
            </Zona>
          )}
          <p className="px-1 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#5d6e65]">Sobre esta sección · lo que usted arma</p>
        </div>
      ),
      despues: (
        <Zona titulo="Accesos rápidos" nota="van a un lado del texto en el sitio">
          <div className="max-w-sm"><QuickRail /></div>
        </Zona>
      ),
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
  return {
    antes: (
      <Zona titulo="Cabecera y menú de la sección" nota="migas arriba y el menú de la sección a la izquierda">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {[section.label, ...ruta.slice(0, -1).map((n) => n.label)].join("  ›  ")}
        </p>
      </Zona>
    ),
    despues:
      hijas.length > 0 || prev || next ? (
        <div className="flex flex-col gap-3">
          {hijas.length > 0 && (
            <Zona titulo="Páginas de este tema" nota="una ficha por cada página que cuelga de ésta; para sumar otra, use «Ficha de tema»">
              <SectionTiles nodes={hijas} slug={slug} custom={custom} />
            </Zona>
          )}
          {(prev || next) && (
            <Zona titulo="Anterior y siguiente" nota="siguen el orden del menú de la sección">
              <PrevNext prev={prev} next={next} />
            </Zona>
          )}
        </div>
      ) : null,
  };
}

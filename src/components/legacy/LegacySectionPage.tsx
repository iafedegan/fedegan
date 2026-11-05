import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { QuickRail } from "@/components/blocks/Accesos";
import { NavTree, type NavItem } from "@/components/legacy/NavTree";
import { TocRail, type TocItem } from "@/components/legacy/TocRail";
import { SectionMenu } from "@/components/legacy/SectionMenu";
import { ArticleTools } from "@/components/legacy/ArticleTools";
import { PrevNext, SectionSearch, SectionTiles, countBelow, flattenTree } from "@/components/legacy/SectionParts";
import { journeyPhotos } from "@/content/scroll-world";
import { getPageOverride } from "@/lib/cms/paginas";
import { findTrail, getLegacyPage, getLegacySection, legacyHref, type NavNode } from "@/content/legacy";

// Resuelve las rutas del menú en el servidor para no enviar el contenido migrado al navegador.
const toItems = (nodes: NavNode[], slug: string): NavItem[] =>
  nodes.map((n) => ({
    label: n.label,
    key: n.key,
    href: n.key ? legacyHref(slug, n.key) : n.href,
    external: !n.key && Boolean(n.href),
    children: n.children ? toItems(n.children, slug) : undefined,
  }));

const PHOTO_ID: Record<string, string> = { "cifras-del-sector": "cifras", "sistema-integrado-de-gestion": "sig" };

const sizeOf = (title: string) => (title.length > 90 ? "ed-t4" : title.length > 60 ? "ed-t3" : title.length > 32 ? "ed-t2" : "ed-t1");

// Páginas de una sección con el texto copiado del portal actual. Tienen dos composiciones:
//  · Portada de la sección: franja con titular y buscador, fichas de cada rama y, debajo, el texto de presentación.
//  · Página de contenido: migas, menú de la sección a la izquierda, texto en el centro e índice de la página a la derecha.
export async function LegacySectionPage({ slug, ruta }: { slug: string; ruta: string[] }) {
  const section = getLegacySection(slug);
  if (!section) notFound();
  const key = ruta.length ? ruta.map((s) => decodeURIComponent(s)).join("/") : section.landing;
  const base = getLegacyPage(key);
  if (!base || !base.sections.includes(slug)) notFound();
  // Si el equipo editó el texto en /admin/paginas, ese texto reemplaza a la copia original.
  const override = await getPageOverride(key);
  const page = override ? { ...base, title: override.title, blocks: override.blocks } : base;

  const trail = findTrail(section.tree, key) ?? [];
  const isLanding = key === section.landing;
  const here = trail[trail.length - 1];

  const crumbs: { label: string; href?: string }[] = [{ label: section.label, href: isLanding ? undefined : `/seccion/${slug}` }];
  if (!isLanding) {
    const ancestors = trail.slice(0, -1);
    if (ancestors.length) {
      ancestors.forEach((n) => crumbs.push({ label: n.label, href: n.key ? legacyHref(slug, n.key) : undefined }));
    } else if (page.parent) {
      const parent = getLegacyPage(page.parent);
      if (parent && page.parent !== section.landing) crumbs.push({ label: parent.title, href: legacyHref(slug, page.parent) });
    }
    crumbs.push({ label: page.title });
  }

  const hasMenu = section.tree.length > 0;
  const menuItems = toItems(section.tree, slug);
  // Índice de la página: sus títulos (sin las entradas que son solo un enlace), con el mismo id que pinta LegacyContent.
  const toc: TocItem[] = page.blocks
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => /^h[2-4]$/.test(b.t) && !/^\[[^\]]+\]\([^)]+\)$/.test((b.text ?? "").trim()))
    .map(({ b, i }) => ({ id: `s${i}`, label: (b.text ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").trim() }))
    .filter((t) => t.label.length > 0)
    .slice(0, 16);

  // Orden de lectura de la sección: la portada y luego las páginas del menú.
  const order = [{ label: section.label, href: `/seccion/${slug}` }, ...flattenTree(section.tree, slug).filter((p) => p.href !== `/seccion/${slug}`)];
  const at = order.findIndex((p) => p.href === legacyHref(slug, key));
  const prev = at > 0 ? order[at - 1] : undefined;
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : undefined;

  const empty = (
    <p className="rounded-[0.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-6 text-[var(--text-muted)]">
      Esta página reúne documentos y tableros del portal actual. Puede consultarla directamente allí.
    </p>
  );
  const source = (
    <p className="art-source">
      Contenido copiado del portal actual de FEDEGÁN.{" "}
      <a href={page.source} target="_blank" rel="noopener noreferrer">
        Ver página original <ExternalLink size={12} aria-hidden className="inline -translate-y-px" />
      </a>
    </p>
  );

  /* ───────────── Portada de la sección ───────────── */
  if (isLanding) {
    const branches = section.tree.filter((n) => n.key !== key);
    const pages = branches.reduce((a, n) => a + 1 + countBelow(n), 0);
    return (
      <>
        <PageHeader
          variant="band"
          title={section.label}
          description={page.title.length > 12 && page.title !== section.label ? page.title : undefined}
          image={(journeyPhotos[PHOTO_ID[slug] ?? slug] ?? (slug === "cartas-de-presidencia" ? { src: "/headers/ia-cartas.jpg", pos: "50% 50%", alt: "" } : undefined))?.src}
          imagePos={journeyPhotos[PHOTO_ID[slug] ?? slug]?.pos}
          breadcrumbs={crumbs}
          aside={
            <>
              {branches.length > 0 && (
                <dl className="hub-stats">
                  <div><dt>Temas</dt><dd>{branches.length}</dd></div>
                  <div><dt>Páginas</dt><dd>{pages}</dd></div>
                </dl>
              )}
              <SectionSearch label={section.label} />
            </>
          }
        />
        <Container className="hub-body">
          {branches.length > 0 && (
            <section aria-labelledby="hub-explorar">
              <div className="hub-head">
                <h2 id="hub-explorar">Explore {section.label}</h2>
                <p>Elija un tema. Cada ficha muestra lo que encontrará dentro.</p>
              </div>
              <SectionTiles nodes={branches} slug={slug} />
            </section>
          )}

          <div className={`hub-intro ${page.blocks.length > 0 ? "" : "is-empty"}`}>
            <article className="ed-body min-w-0 [overflow-wrap:anywhere]">
              {page.blocks.length > 0 && (
                <>
                  <p className="hub-label">Sobre esta sección</p>
                  <LegacyContent blocks={page.blocks} />
                </>
              )}
              {page.blocks.length === 0 && branches.length === 0 && empty}
              {source}
            </article>
            <aside className="min-w-0">
              <QuickRail />
            </aside>
          </div>
        </Container>
      </>
    );
  }

  /* ───────────── Página de contenido ───────────── */
  // Un solo recorrido: migas arriba; el menú de la sección a la izquierda (siempre visible en escritorio);
  // y en el centro el titular, el índice plegado de la página, el texto y «anterior / siguiente».
  const kids = (here?.children ?? []).filter((n) => n.key !== key);
  return (
    <>
      <PageHeader variant="strip" title={page.title} breadcrumbs={crumbs} />
      <Container className={`doc-split ${hasMenu ? "has-menu" : ""}`}>
        {hasMenu && (
          <aside className="doc-rail hidden lg:block">
            <div className="doc-sticky">
              <nav aria-label={`Menú de ${section.label}`} className="ed-rail">
                <Link href={`/seccion/${slug}`} className="ed-rail-title">{section.label}</Link>
                <NavTree nodes={menuItems} current={key} />
              </nav>
            </div>
          </aside>
        )}

        <article className="doc-content ed-body min-w-0 [overflow-wrap:anywhere]">
          <header className="art-head">
            <h1 className={`ed-title ${sizeOf(page.title)}`}>{page.title}</h1>
            {/* En pantallas sin menú lateral, el mismo árbol se abre en pantalla completa. */}
            {hasMenu && (
              <div className="lg:hidden">
                <SectionMenu label={section.label} items={menuItems} current={key} />
              </div>
            )}
          </header>

          {toc.length >= 3 && (
            <details className="toc-m">
              <summary>
                En esta página <span>{toc.length}</span>
              </summary>
              <TocRail items={toc} title="Ir a" />
            </details>
          )}

          {page.blocks.length > 0 ? <LegacyContent blocks={page.blocks} /> : empty}

          {kids.length > 0 && (
            <section className="art-kids" aria-labelledby="art-kids-h">
              <h2 id="art-kids-h">Dentro de {here?.label}</h2>
              <SectionTiles nodes={kids} slug={slug} />
            </section>
          )}

          <PrevNext prev={prev} next={next} />
          <ArticleTools />
          {source}
        </article>
      </Container>
    </>
  );
}

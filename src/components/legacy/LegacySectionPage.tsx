import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { QuickRail } from "@/components/blocks/Accesos";
import { NavTree, type NavItem } from "@/components/legacy/NavTree";
import { TocRail, type TocItem } from "@/components/legacy/TocRail";
import { SectionMenu } from "@/components/legacy/SectionMenu";
import { podarMenu } from "@/components/legacy/menu-poda";
import { ArticleTools } from "@/components/legacy/ArticleTools";
import { SeccionExplorador, type TemaMenu } from "@/components/legacy/SeccionExplorador";
import { PrevNext, SectionSearch, SectionTiles, countBelow, flattenTree, sacarFichas } from "@/components/legacy/SectionParts";
import { journeyPhotos } from "@/content/scroll-world";
import { getPageOverride } from "@/lib/cms/paginas";
import { getCopias } from "@/lib/cms/documentos-copia";
import { aplicarCopias } from "@/lib/cms/documentos-copia-util";
import { findTrail, legacyHref, type NavNode } from "@/content/legacy";
import { customPagesOf, getPage, getSection } from "@/lib/cms/nodos";
import type { LegacyBlock } from "@/content/legacy";

// Resuelve las rutas del menú en el servidor para no enviar el contenido migrado al navegador.
const toItems = (nodes: NavNode[], slug: string): NavItem[] =>
  nodes.map((n) => ({
    label: n.label,
    key: n.key,
    href: n.key ? legacyHref(slug, n.key) : n.href,
    external: !n.key && /^https?:\/\//.test(n.href ?? ""),
    children: n.children ? toItems(n.children, slug) : undefined,
  }));

const PHOTO_ID: Record<string, string> = { "cifras-del-sector": "cifras", "sistema-integrado-de-gestion": "sig" };

// Disposición propia: el texto va por tramos y, entre ellos, las partes automáticas donde el equipo las puso.
function cuerpoConPartes(blocks: LegacyBlock[], libre: boolean | undefined, partes: Record<string, ReactNode>) {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].t === "parte") {
      const cual = String(blocks[i].data?.cual ?? "");
      if (partes[cual]) out.push(<Fragment key={`p${i}`}>{partes[cual]}</Fragment>);
      i++;
      continue;
    }
    let j = i;
    while (j < blocks.length && blocks[j].t !== "parte") j++;
    out.push(<LegacyContent key={`t${i}`} blocks={blocks.slice(i, j)} libre={libre} lead={i === 0} offset={i} />);
    i = j;
  }
  return out;
}

const sizeOf = (title: string) => (title.length > 90 ? "ed-t4" : title.length > 60 ? "ed-t3" : title.length > 32 ? "ed-t2" : "ed-t1");

// Páginas de una sección con el texto copiado del portal actual. Tienen dos composiciones:
//  · Portada de la sección: franja con titular y buscador, fichas de cada rama y, debajo, el texto de presentación.
//  · Página de contenido: migas, menú de la sección a la izquierda, texto en el centro e índice de la página a la derecha.
export async function LegacySectionPage({ slug, ruta }: { slug: string; ruta: string[] }) {
  // La sección y sus páginas incluyen lo que el equipo creó en /admin/arbol.
  const section = await getSection(slug);
  if (!section) notFound();
  const key = ruta.length ? ruta.map((s) => decodeURIComponent(s)).join("/") : section.landing;
  const base = await getPage(key);
  if (!base || !base.sections.includes(slug)) notFound();
  const custom = await customPagesOf(slug);
  // Si el equipo editó el texto en /admin/paginas, ese texto reemplaza a la copia original.
  const override = await getPageOverride(key);
  const copias = await getCopias();
  const pagina = override ? { ...base, title: override.title, blocks: override.blocks } : base;
  // Los documentos que ya se copiaron a Supabase se enlazan desde ahí; el resto sigue apuntando al original.
  // Las «fichas de tema» armadas en el constructor se suman a la cuadrícula de temas en vez de ir en el texto.
  const { fichas, resto } = sacarFichas(pagina.blocks);
  const page = { ...pagina, blocks: aplicarCopias(resto, copias) };

  const sectionPhoto = journeyPhotos[PHOTO_ID[slug] ?? slug] ?? (slug === "cartas-de-presidencia" ? { src: "/headers/ia-cartas.jpg", pos: "50% 50%", alt: "" } : undefined);
  const trail = findTrail(section.tree, key) ?? [];
  const isLanding = key === section.landing;
  const here = trail[trail.length - 1];

  const crumbs: { label: string; href?: string }[] = [{ label: section.label, href: isLanding ? undefined : `/seccion/${slug}` }];
  if (!isLanding) {
    const ancestors = trail.slice(0, -1);
    if (ancestors.length) {
      ancestors.forEach((n) => crumbs.push({ label: n.label, href: n.key ? legacyHref(slug, n.key) : undefined }));
    } else if (page.parent) {
      const parent = await getPage(page.parent);
      if (parent && page.parent !== section.landing) crumbs.push({ label: parent.title, href: legacyHref(slug, page.parent) });
    }
    crumbs.push({ label: page.title });
  }

  const hasMenu = section.tree.length > 0;
  const menuItems = podarMenu(toItems(section.tree, slug), key, `/seccion/${slug}`);
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

  const propia = page.blocks.some((b) => b.t === "parte");
  const empty = (
    <p className="rounded-[0.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-6 text-[var(--text-muted)]">
      Esta página reúne documentos y tableros del portal actual. Puede consultarla directamente allí.
    </p>
  );
  /* ───────────── Portada de la sección ───────────── */
  if (isLanding) {
    const branches = section.tree.filter((n) => n.key !== key);
    const pages = branches.reduce((a, n) => a + 1 + countBelow(n), 0);
    // Con cientos de páginas, las primeras van como fichas y el resto como lista simple (si no, la portada pesaba más de 1 MB).
    const FICHAS_MAX = 36;
    const partir = branches.length > FICHAS_MAX + 12;
    const destacadas = partir ? branches.slice(0, FICHAS_MAX) : branches;
    const restantes = partir ? branches.slice(FICHAS_MAX) : [];
    // Menú de temas en vertical: al elegir uno, su página se muestra al lado (SeccionExplorador). Las fichas del constructor suman temas con enlace.
    const aTema = (n: NavNode): TemaMenu => ({
      clave: n.key,
      nombre: n.label,
      href: (n.key ? legacyHref(slug, n.key) : n.href) || undefined,
      hijos: (n.children ?? []).map(aTema),
    });
    const temas: TemaMenu[] = [...branches.map(aTema), ...fichas.map((f) => ({ nombre: f.titulo, href: f.enlace, hijos: [] }))];
    const introNodo =
      page.blocks.length > 0 ? (
        <article className="ed-body min-w-0 [overflow-wrap:anywhere]">
          <p className="hub-label">Sobre esta sección</p>
          <LegacyContent blocks={page.blocks} libre={page.libre} />
        </article>
      ) : null;
    const fichasNodo = temas.length > 0 ? <SeccionExplorador slug={slug} titulo={`Explore ${section.label}`} temas={temas} inicial={propia ? null : introNodo} lateral={propia ? undefined : <QuickRail />} /> : null;
    const accesosNodo = <div className="my-6 max-w-sm"><QuickRail /></div>;
    return (
      <>
        <PageHeader
          variant="band"
          title={section.label}
          description={page.title.length > 12 && page.title !== section.label ? page.title : undefined}
          image={sectionPhoto?.src}
          imagePos={sectionPhoto?.pos}
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
          {propia ? (
            <article className="ed-body min-w-0 [overflow-wrap:anywhere]">{cuerpoConPartes(page.blocks, page.libre, { fichas: fichasNodo, accesos: accesosNodo })}</article>
          ) : (
            <>
          {fichasNodo ?? (
          <div className={`hub-intro ${page.blocks.length > 0 ? "" : "is-empty"}`}>
            <article className="ed-body min-w-0 [overflow-wrap:anywhere]">
              {page.blocks.length > 0 && (
                <>
                  <p className="hub-label">Sobre esta sección</p>
                  <LegacyContent blocks={page.blocks} libre={page.libre} />
                </>
              )}
              {page.blocks.length === 0 && branches.length === 0 && fichas.length === 0 && empty}
            </article>
            <aside className="min-w-0">
              <QuickRail />
            </aside>
          </div>
          )}
            </>
          )}
        </Container>
      </>
    );
  }

  /* ───────────── Página de contenido ───────────── */
  // Un solo recorrido: migas arriba; el menú de la sección a la izquierda (siempre visible en escritorio);
  // y en el centro el titular, el índice plegado de la página, el texto y «anterior / siguiente».
  const kids = (here?.children ?? []).filter((n) => n.key !== key);
  const tocNodo =
    toc.length >= 3 ? (
      <details className="toc-m">
        <summary>
          En esta página <span>{toc.length}</span>
        </summary>
        <TocRail items={toc} title="Ir a" />
      </details>
    ) : null;
  const kidsNodo =
    kids.length > 0 || fichas.length > 0 ? (
      <section className="art-kids" aria-labelledby="art-kids-h">
        <h2 id="art-kids-h">Dentro de {here?.label}</h2>
        <SectionTiles nodes={kids} slug={slug} custom={custom} extras={fichas} />
      </section>
    ) : null;
  return (
    <>
      <PageHeader variant="strip" title={page.title} breadcrumbs={crumbs} image={sectionPhoto?.src} imagePos={sectionPhoto?.pos} />
      <Container className={`doc-split ${hasMenu ? "has-menu" : ""}`}>
        {hasMenu && (
          <aside className="doc-rail hidden lg:block">
            <div className="doc-sticky">
              <nav aria-label={`Menú de ${section.label}`} className="sx-menu sx-lat">
                <Link href={`/seccion/${slug}`} className="sx-menu-t">{section.label}</Link>
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

          {propia ? (
            cuerpoConPartes(page.blocks, page.libre, {
              indice: tocNodo,
              hijas: kidsNodo,
              anteriorsiguiente: <PrevNext prev={prev} next={next} />,
            })
          ) : (
            <>
          {toc.length >= 3 && (
            <details className="toc-m">
              <summary>
                En esta página <span>{toc.length}</span>
              </summary>
              <TocRail items={toc} title="Ir a" />
            </details>
          )}

          {page.blocks.length > 0 ? <LegacyContent blocks={page.blocks} libre={page.libre} /> : empty}

          {(kids.length > 0 || fichas.length > 0) && (
            <section className="art-kids" aria-labelledby="art-kids-h">
              <h2 id="art-kids-h">Dentro de {here?.label}</h2>
              <SectionTiles nodes={kids} slug={slug} custom={custom} extras={fichas} />
            </section>
          )}

          <PrevNext prev={prev} next={next} />
            </>
          )}

          <ArticleTools />
        </article>
      </Container>
    </>
  );
}

import { notFound } from "next/navigation";
import { Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { QuickRail } from "@/components/blocks/Accesos";
import { WaveCard } from "@/components/ui/WaveCard";
import { NavTree, type NavItem } from "@/components/legacy/NavTree";
import { journeyPhotos } from "@/content/scroll-world";
import { getPageOverride } from "@/lib/cms/paginas";
import { excerptOf, findTrail, getLegacyPage, getLegacySection, legacyHref, type NavNode } from "@/content/legacy";

const PHOTO_ID: Record<string, string> = { "cifras-del-sector": "cifras", "sistema-integrado-de-gestion": "sig" };

// Resuelve las rutas del menú en el servidor para no enviar el contenido migrado al navegador.
const toItems = (nodes: NavNode[], slug: string): NavItem[] =>
  nodes.map((n) => ({
    label: n.label,
    key: n.key,
    href: n.key ? legacyHref(slug, n.key) : n.href,
    external: !n.key && Boolean(n.href),
    children: n.children ? toItems(n.children, slug) : undefined,
  }));

// Página de una sección con el texto copiado del portal actual: menú lateral, migas y contenido.
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
  const toc = page.blocks
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => /^h[2-4]$/.test(b.t) && !/^\[[^\]]+\]\([^)]+\)$/.test((b.text ?? "").trim()))
    .map(({ b, i }) => ({ id: `s${i}`, label: (b.text ?? "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").trim() }))
    .filter((t) => t.label.length > 0)
    .slice(0, 16);
  const photo = journeyPhotos[PHOTO_ID[slug] ?? slug] ?? (slug === "cartas-de-presidencia" ? { src: "/headers/ia-cartas.jpg", pos: "50% 50%", alt: "" } : undefined);
  const children = isLanding ? section.tree.filter((n) => n.key && n.key !== key) : [];

  return (
    <>
      <PageHeader
        eyebrow={isLanding ? "Sección" : section.label}
        title={isLanding ? section.label : page.title}
        description={isLanding && page.title.length > 12 && page.title !== section.label ? page.title : undefined}
        image={photo?.src}
        imagePos={photo?.pos}
        breadcrumbs={crumbs}
      />
      <Container className={`grid gap-8 py-5 sm:py-8 ${hasMenu ? "lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-12" : ""}`}>
        {hasMenu && (
        <details className="ed-rail ed-rail-m lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-1 text-sm font-bold uppercase tracking-[0.14em] text-[var(--fg-lime-400)]">
            <Menu size={16} aria-hidden /> En esta sección
          </summary>
          <nav aria-label={`Menú de ${section.label}`} className="mt-3 border-t border-[var(--border)] pt-3">
            <NavTree nodes={menuItems} current={key} />
          </nav>
        </details>
        )}

        <article className="ed-body min-w-0 [overflow-wrap:anywhere]">
          {page.blocks.length > 0 ? (
            <LegacyContent blocks={page.blocks} />
          ) : (
            <p className="rounded-[0.25rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-6 text-[var(--text-muted)]">
              Esta página reúne documentos y tableros del portal actual. Puede consultarla directamente allí.
            </p>
          )}

          {children.length > 0 && (
            <div className="mt-12 border-t border-[var(--border)] pt-10">
              <h2 className="mb-5 font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Contenido de {section.label}</h2>
              <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {children.map((n, i) => {
                  const child = getLegacyPage(n.key!);
                  return (
                    <li key={n.key}>
                      <WaveCard href={legacyHref(slug, n.key!)} accent={(["esmeralda", "oro", "terracota", "turquesa"] as const)[i % 4]} icon="libro" title={n.label} text={child ? excerptOf(child, 150) : undefined} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <QuickRail className="mt-10 lg:hidden" />

          <p className="mt-12 border-t border-[var(--border)] pt-5 text-sm text-[var(--text-faint)]">
            Contenido copiado del portal actual de FEDEGÁN.{" "}
            <a href={page.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--fg-lime-400)] underline underline-offset-[3px]">
              Ver página original
            </a>
          </p>
        </article>

        {hasMenu && (
        <aside className="hidden lg:order-first lg:block">
          <div className="sticky top-36 flex max-h-[calc(100svh-10rem)] flex-col gap-3">
            <nav aria-label={`Menú de ${section.label}`} className="ed-rail min-h-0 flex-1 overflow-y-auto">
              <p className="ed-rail-kicker">Sección</p>
              <p className="ed-rail-title">{section.label}</p>
              <NavTree nodes={menuItems} current={key} />
            </nav>
            {toc.length >= 3 && (
              <nav aria-label="En esta página" className="ix-toc shrink-0">
                <p>En esta página</p>
                <ol>
                  {toc.map((t) => (
                    <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>
                  ))}
                </ol>
              </nav>
            )}
            <QuickRail />
          </div>
        </aside>
        )}
      </Container>
    </>
  );
}

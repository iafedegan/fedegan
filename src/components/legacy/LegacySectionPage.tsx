import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Menu } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegacyContent } from "@/components/legacy/LegacyContent";
import { QuickRail } from "@/components/blocks/Accesos";
import { WaveCard } from "@/components/ui/WaveCard";
import { journeyPhotos } from "@/content/scroll-world";
import { excerptOf, findTrail, getLegacyPage, getLegacySection, legacyHref, type NavNode } from "@/content/legacy";

const PHOTO_ID: Record<string, string> = { "cifras-del-sector": "cifras", "sistema-integrado-de-gestion": "sig" };

const holds = (n: NavNode, key: string): boolean => n.key === key || Boolean(n.children?.some((c) => holds(c, key)));

function NavTree({ nodes, slug, current, depth = 0 }: { nodes: NavNode[]; slug: string; current: string; depth?: number }) {
  return (
    <ul className={depth === 0 ? "flex flex-col" : "mt-0.5 flex flex-col border-l border-[var(--border)] pl-3"}>
      {nodes.map((n, i) => {
        const active = n.key === current;
        const cls = `block rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm leading-snug transition-colors ${
          active
            ? "bg-[rgba(216,181,88,0.12)] font-bold text-[var(--fg-lime-400)]"
            : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        }`;
        return (
          <li key={`${n.label}-${i}`}>
            {n.key ? (
              <Link href={legacyHref(slug, n.key)} className={cls} aria-current={active ? "page" : undefined}>
                {n.label}
              </Link>
            ) : n.href ? (
              <a href={n.href} target="_blank" rel="noopener noreferrer" className={cls}>
                {n.label} <ExternalLink size={12} aria-hidden className="ml-0.5 inline -translate-y-px" />
              </a>
            ) : (
              <span className="block px-2.5 py-1.5 text-sm font-bold text-[var(--text)]">{n.label}</span>
            )}
            {n.children && holds(n, current) && <NavTree nodes={n.children} slug={slug} current={current} depth={depth + 1} />}
          </li>
        );
      })}
    </ul>
  );
}

// Página de una sección con el texto copiado del portal actual: menú lateral, migas y contenido.
export function LegacySectionPage({ slug, ruta }: { slug: string; ruta: string[] }) {
  const section = getLegacySection(slug);
  if (!section) notFound();
  const key = ruta.length ? ruta.map((s) => decodeURIComponent(s)).join("/") : section.landing;
  const page = getLegacyPage(key);
  if (!page || !page.sections.includes(slug)) notFound();

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
  const photo = journeyPhotos[PHOTO_ID[slug] ?? slug];
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
      <Container className={`grid gap-8 py-5 sm:py-8 ${hasMenu ? "lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10" : ""}`}>
        {hasMenu && (
        <details className="rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)]">
            <Menu size={16} aria-hidden /> En esta sección
          </summary>
          <nav aria-label={`Menú de ${section.label}`} className="border-t border-[var(--border)] p-3">
            <NavTree nodes={section.tree} slug={slug} current={key} />
          </nav>
        </details>
        )}

        <article className="min-w-0 lg:order-first">
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
        <aside className="hidden lg:block">
          <div className="sticky top-36 flex max-h-[calc(100svh-10rem)] flex-col gap-3">
            <nav aria-label={`Menú de ${section.label}`} className="mx-card min-h-0 flex-1 overflow-y-auto !p-3">
              <p className="px-2.5 pb-2 pt-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[var(--fg-lime-500)]">{section.label}</p>
              <NavTree nodes={section.tree} slug={slug} current={key} />
            </nav>
            <QuickRail />
          </div>
        </aside>
        )}
      </Container>
    </>
  );
}

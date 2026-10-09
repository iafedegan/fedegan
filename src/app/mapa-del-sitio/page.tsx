import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { footerLinks, mainNav, pisos } from "@/content/site";

export const metadata: Metadata = { title: "Mapa del sitio" };

const groups = [
  { title: "Principal", accent: "216,181,88", links: mainNav },
  { title: "Locales del gremio", accent: "92,205,134", links: pisos.flatMap((p) => p.locales.map((l) => ({ label: l.nombre, href: l.href }))) },
  { title: "Servicios y medios", accent: "230,160,108", links: footerLinks.servicios },
  {
    title: "Más del portal",
    accent: "112,214,196",
    links: [
      { label: "Eventos", href: "/eventos" },
      { label: "Publicaciones", href: "/publicaciones" },
      { label: "Buscador", href: "/buscador" },
      { label: "Contacto", href: "/contacto" },
      { label: "Iniciar sesión", href: "/ingresar" },
    ],
  },
];

export default function MapaDelSitioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Navegación"
        title="Mapa del sitio"
        description="Todas las secciones del portal en un solo lugar."
        breadcrumbs={[{ label: "Mapa del sitio" }]}
        compact
      />
      <Container className="grid gap-6 py-10 sm:grid-cols-2 sm:py-14">
        {groups.map((g) => (
          <Card key={g.title} accent={g.accent} hover={false}>
            <div className="p-6 sm:p-8">
              <h2 className="mb-4 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{g.title}</h2>
              <ul className="flex flex-col">
                {g.links.map((l) => (
                  <li key={l.href} className="border-b border-[var(--border)] last:border-0">
                    <Link href={l.href} className="group flex min-h-11 items-center justify-between gap-3 text-[var(--text-muted)] transition-colors hover:text-[var(--fg-lime-400)]">
                      {l.label}
                      <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </Container>
    </>
  );
}

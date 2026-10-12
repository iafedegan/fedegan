import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LegacySectionPage } from "@/components/legacy/LegacySectionPage";
import { getLegacyPage, getLegacySection, legacyParams } from "@/content/legacy";

// Secciones aún sin contenido copiado del portal actual.
const pendientes: Record<string, { nombre: string; kicker: string; descripcion: string; image: string; pos: string }> = {
  "cartas-de-presidencia": { nombre: "Cartas de Presidencia", kicker: "Sala de prensa", descripcion: "Columnas y cartas del presidente ejecutivo de FEDEGÁN.", image: "/headers/prensa.jpg", pos: "60% 40%" },
  "seguridad-ganadera": { nombre: "Seguridad Ganadera", kicker: "Protección", descripcion: "Alertas, prevención del abigeato y seguridad rural.", image: "/headers/campo.jpg", pos: "50% 60%" },
};

type Params = { slug: string; ruta?: string[] };

export function generateStaticParams() {
  return [...legacyParams(), ...Object.keys(pendientes).map((slug) => ({ slug, ruta: [] as string[] }))];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, ruta = [] } = await params;
  const section = getLegacySection(slug);
  if (section) {
    const key = ruta.length ? ruta.map((s) => decodeURIComponent(s)).join("/") : section.landing;
    const page = getLegacyPage(key);
    return { title: ruta.length && page ? page.title : section.label };
  }
  return { title: pendientes[slug]?.nombre ?? "Sección" };
}

export default async function SeccionPage({ params }: { params: Promise<Params> }) {
  const { slug, ruta = [] } = await params;
  if (getLegacySection(slug)) return <LegacySectionPage slug={slug} ruta={ruta} />;

  const seccion = pendientes[slug];
  if (!seccion || ruta.length) notFound();
  return (
    <>
      <PageHeader
        eyebrow={seccion.kicker}
        title={seccion.nombre}
        description={seccion.descripcion}
        image={seccion.image}
        imagePos={seccion.pos}
        breadcrumbs={[{ label: "Directorio", href: "/directorio" }, { label: seccion.nombre }]}
      />
      <Container className="max-w-2xl py-8 sm:py-12">
        <Card hover={false}>
          <div className="flex flex-col items-start gap-5 p-8 sm:p-10">
            <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
              <Construction size={22} strokeWidth={1.6} />
            </span>
            <Badge tone="lime">Contenido por migrar</Badge>
            <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Esta sección está en preparación</h2>
            <p className="leading-relaxed text-[var(--text-muted)]">
              El contenido de {seccion.nombre} se migrará desde el portal actual de FEDEGÁN dentro de la fase de migración del proyecto. Mientras tanto puede consultarlo en el sitio vigente.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="https://www.fedegan.org.co/">Ver en el portal actual</Button>
              <Button href="/directorio" variant="secondary">Volver al directorio</Button>
            </div>
          </div>
        </Card>
      </Container>
    </>
  );
}

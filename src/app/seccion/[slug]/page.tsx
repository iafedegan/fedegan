import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { temas } from "@/content/site";

const dinamicos = temas.filter((t) => t.href.startsWith("/seccion/"));

export function generateStaticParams() {
  return dinamicos.map((t) => ({ slug: t.slug === "sig" ? "sistema-integrado-de-gestion" : t.slug }));
}

function findTema(slug: string) {
  return dinamicos.find((t) => t.href === `/seccion/${slug}`);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: findTema(slug)?.nombre ?? "Sección" };
}

export default async function SeccionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tema = findTema(slug);
  if (!tema) notFound();

  return (
    <>
      <PageHeader
        eyebrow={tema.kicker}
        title={tema.nombre}
        description={tema.descripcion}
        breadcrumbs={[{ label: "Directorio", href: "/directorio" }, { label: tema.nombre }]}
      />
      <Container className="max-w-2xl py-14">
        <div className="flex flex-col items-start gap-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] text-[var(--fg-green-700)]">
            <Construction size={22} />
          </span>
          <Badge tone="lime">Contenido por migrar</Badge>
          <h2 className="text-xl font-bold text-[var(--text)]">Este local está en preparación</h2>
          <p className="leading-relaxed text-[var(--text-muted)]">
            El contenido de {tema.nombre} se migrará desde el portal actual de FEDEGÁN dentro de la
            fase de migración del proyecto. Mientras tanto puede consultarlo en el sitio vigente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="https://www.fedegan.org.co/" variant="primary">Ver en el portal actual</Button>
            <Button href="/directorio" variant="secondary">Volver al directorio</Button>
          </div>
        </div>
      </Container>
    </>
  );
}

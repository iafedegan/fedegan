import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const secciones: Record<string, { nombre: string; kicker: string; descripcion: string }> = {
  "cartas-de-presidencia": {
    nombre: "Cartas de Presidencia",
    kicker: "Sala de prensa",
    descripcion: "Columnas y cartas del presidente ejecutivo de FEDEGÁN.",
  },
  "cifras-del-sector": { nombre: "Cifras del sector", kicker: "Datos", descripcion: "Inventario bovino y bufalino, precios y estadísticas del sector." },
  fng: { nombre: "FNG", kicker: "Fondo Nacional del Ganado", descripcion: "Recaudo de la cuota de fomento y su inversión en el sector." },
  fep: { nombre: "FEP", kicker: "Estabilización de precios", descripcion: "Fondo de Estabilización de Precios: mecanismo y resultados." },
  "sistema-integrado-de-gestion": { nombre: "Sistema Integrado de Gestión", kicker: "Calidad", descripcion: "Políticas, procesos y certificaciones de la entidad." },
  "seguridad-ganadera": {
    nombre: "Seguridad Ganadera",
    kicker: "Protección",
    descripcion: "Alertas, prevención del abigeato y seguridad rural.",
  },
};

export function generateStaticParams() {
  return Object.keys(secciones).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: secciones[slug]?.nombre ?? "Sección" };
}

export default async function SeccionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seccion = secciones[slug];
  if (!seccion) notFound();

  return (
    <>
      <PageHeader
        eyebrow={seccion.kicker}
        title={seccion.nombre}
        description={seccion.descripcion}
        breadcrumbs={[{ label: seccion.nombre }]}
      />
      <Container className="max-w-2xl py-14">
        <div className="flex flex-col items-start gap-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--bg-sunken)] text-[var(--fg-green-700)]">
            <Construction size={22} />
          </span>
          <Badge tone="lime">Contenido por migrar</Badge>
          <h2 className="text-xl font-bold text-[var(--text)]">Esta sección está en preparación</h2>
          <p className="leading-relaxed text-[var(--text-muted)]">
            El contenido de {seccion.nombre} se migrará desde el portal actual de FEDEGÁN dentro de la
            fase de migración del proyecto. Mientras tanto puede consultarlo en el sitio vigente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="https://www.fedegan.org.co/" variant="primary">Ver en el portal actual</Button>
            <Button href="/" variant="secondary">Volver al inicio</Button>
          </div>
        </div>
      </Container>
    </>
  );
}

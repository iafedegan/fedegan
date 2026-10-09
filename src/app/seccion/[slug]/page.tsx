import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const secciones: Record<string, { nombre: string; kicker: string; descripcion: string; image: string; pos: string }> = {
  "cartas-de-presidencia": { nombre: "Cartas de Presidencia", kicker: "Sala de prensa", descripcion: "Columnas y cartas del presidente ejecutivo de FEDEGÁN.", image: "/headers/prensa.jpg", pos: "60% 40%" },
  "cifras-del-sector": { nombre: "Cifras del sector", kicker: "Datos", descripcion: "Inventario bovino y bufalino, precios y estadísticas del sector.", image: "/locales/cifras.jpg", pos: "25% 50%" },
  fng: { nombre: "FNG", kicker: "Fondo Nacional del Ganado", descripcion: "Recaudo de la cuota de fomento y su inversión en el sector.", image: "/locales/fng.jpg", pos: "40% 50%" },
  fep: { nombre: "FEP", kicker: "Estabilización de precios", descripcion: "Fondo de Estabilización de Precios: mecanismo y resultados.", image: "/locales/fep.jpg", pos: "70% 50%" },
  "sistema-integrado-de-gestion": { nombre: "Sistema Integrado de Gestión", kicker: "Calidad", descripcion: "Políticas, procesos y certificaciones de la entidad.", image: "/locales/sig.jpg", pos: "45% 50%" },
  "seguridad-ganadera": { nombre: "Seguridad Ganadera", kicker: "Protección", descripcion: "Alertas, prevención del abigeato y seguridad rural.", image: "/headers/campo.jpg", pos: "50% 60%" },
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
        image={seccion.image}
        imagePos={seccion.pos}
        breadcrumbs={[{ label: "Directorio", href: "/directorio" }, { label: seccion.nombre }]}
      />
      <Container className="max-w-2xl py-14 sm:py-20">
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

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Target, Eye, HeartHandshake, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Quiénes somos" };

const pillars = [
  { icon: Target, title: "Misión", text: "Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana." },
  { icon: Eye, title: "Visión", text: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con el productor." },
  { icon: HeartHandshake, title: "Valores", text: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
  { icon: ShieldCheck, title: "Buen gobierno", text: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
];

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Quiénes somos"
        description="FEDEGÁN–FNG es la Federación Colombiana de Ganaderos, entidad gremial sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país desde 1963."
        breadcrumbs={[{ label: "Quiénes somos" }]}
      />
      <Container className="py-12 grid gap-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <Card key={p.title} hover={false}>
              <CardBody>
                <span className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center">
                  <p.icon size={20} />
                </span>
                <h3 className="font-bold text-[var(--text)]">{p.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{p.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="prose-block max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3">Nuestra historia</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Desde su fundación, FEDEGÁN–FNG ha acompañado la transformación de la ganadería
            colombiana: del fomento sanitario y la erradicación de la fiebre aftosa, al impulso de
            modelos de ganadería sostenible, la generación de información estratégica del sector y la
            representación gremial ante el Estado y los mercados internacionales.
          </p>
        </div>
      </Container>
    </>
  );
}

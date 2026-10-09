import type { Metadata } from "next";
import Image from "next/image";
import { Eye, HeartHandshake, ShieldCheck, Target } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Quiénes somos" };

const pillars = [
  { icon: Target, accent: "216,181,88", title: "Misión", text: "Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana." },
  { icon: Eye, accent: "92,205,134", title: "Visión", text: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con el productor." },
  { icon: HeartHandshake, accent: "230,160,108", title: "Valores", text: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
  { icon: ShieldCheck, accent: "190,222,203", title: "Buen gobierno", text: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
];

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Quiénes somos"
        description="FEDEGÁN–FNG es la Federación Colombiana de Ganaderos, entidad gremial sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país desde 1963."
        image="/locales/programas.jpg"
        imagePos="70% 50%"
        breadcrumbs={[{ label: "Quiénes somos" }]}
      />

      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading eyebrow="Identidad" title="Lo que nos guía" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <Card key={p.title} accent={p.accent}>
                <CardBody className="gap-3 p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                    <p.icon size={22} strokeWidth={1.6} />
                  </span>
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{p.text}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20 sm:pb-28">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <span className="eyebrow">Nuestra historia</span>
            <h2 className="mt-3 font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">
              Más de seis décadas junto al ganadero colombiano
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-lg leading-relaxed text-[var(--text-muted)]">
              <p>
                Desde su fundación, FEDEGÁN–FNG ha acompañado la transformación de la ganadería colombiana: del fomento sanitario y la erradicación de la fiebre aftosa, al impulso de modelos de ganadería sostenible.
              </p>
              <p>
                Hoy genera información estratégica del sector y ejerce la representación gremial ante el Estado y los mercados internacionales.
              </p>
            </div>
          </div>
          <div className="gl">
            <div className="gl-face">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src="/locales/fng.jpg" alt="Personal sanitario vacunando ganado en un corral" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: "40% 50%" }} />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,var(--card-b)_0%,transparent_55%)]" />
                <span className="absolute bottom-5 left-5 rounded-full border border-[var(--border-strong)] bg-[rgba(4,12,8,0.6)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-400)] backdrop-blur">
                  Desde 1963
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

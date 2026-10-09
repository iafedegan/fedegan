import type { Metadata } from "next";
import { Clock, GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Escuela Virtual" };

const courses = [
  { accent: "92,205,134", title: "Manejo sanitario del hato bovino", level: "Básico", duration: "6 horas" },
  { accent: "216,181,88", title: "Sistemas silvopastoriles aplicados", level: "Intermedio", duration: "10 horas" },
  { accent: "230,160,108", title: "Gestión financiera de la finca ganadera", level: "Intermedio", duration: "8 horas" },
];

export default function EscuelaVirtualPage() {
  return (
    <>
      <PageHeader
        eyebrow="Formación"
        title="Escuela Virtual FEDEGÁN"
        description="Capacitación técnica y gerencial para productores, técnicos y profesionales del sector ganadero colombiano."
        image="/locales/sig.jpg"
        imagePos="45% 50%"
        breadcrumbs={[{ label: "Escuela Virtual" }]}
      />
      <Container className="flex flex-col gap-14 py-14 sm:py-20">
        <Card hover={false}>
          <div className="flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
            <div className="flex items-center gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                <GraduationCap size={26} strokeWidth={1.6} />
              </span>
              <div>
                <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Acceda a la plataforma de formación</h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Este acceso lo dirige a la plataforma actual de la Escuela Virtual FEDEGÁN.</p>
              </div>
            </div>
            <Button>Ir a la plataforma →</Button>
          </div>
        </Card>

        <div>
          <SectionHeading eyebrow="Catálogo" title="Cursos destacados" />
          <div className="grid gap-6 sm:grid-cols-3">
            {courses.map((c) => (
              <Card key={c.title} accent={c.accent}>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className="text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[rgb(var(--acc-rgb))]">{c.level}</span>
                  <h3 className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">{c.title}</h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                    <Clock size={14} /> {c.duration}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}

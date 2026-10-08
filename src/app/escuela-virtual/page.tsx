import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Escuela Virtual" };

const courses = [
  { title: "Manejo sanitario del hato bovino", level: "Básico", duration: "6 horas" },
  { title: "Sistemas silvopastoriles aplicados", level: "Intermedio", duration: "10 horas" },
  { title: "Gestión financiera de la finca ganadera", level: "Intermedio", duration: "8 horas" },
];

export default function EscuelaVirtualPage() {
  return (
    <>
      <PageHeader
        eyebrow="Formación"
        title="Escuela Virtual FEDEGÁN"
        description="Capacitación técnica y gerencial para productores, técnicos y profesionales del sector ganadero colombiano."
        breadcrumbs={[{ label: "Escuela Virtual" }]}
      />
      <Container className="py-12 flex flex-col gap-8">
        <div className="rounded-[var(--radius-lg)] bg-[var(--fg-green-900)] text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <GraduationCap size={24} className="text-[var(--fg-lime-400)]" />
            </span>
            <div>
              <h2 className="font-bold text-lg">Acceda a la plataforma de formación</h2>
              <p className="text-sm text-white/70">Este acceso lo dirige a la plataforma actual de la Escuela Virtual FEDEGÁN.</p>
            </div>
          </div>
          <Button variant="lime">Ir a la plataforma →</Button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text)] mb-4">Cursos destacados</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {courses.map((c) => (
              <Card key={c.title} hover={false}>
                <CardBody>
                  <span className="text-xs font-bold uppercase tracking-wide text-[var(--fg-green-600)]">{c.level} · {c.duration}</span>
                  <h3 className="font-bold text-[var(--text)]">{c.title}</h3>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}

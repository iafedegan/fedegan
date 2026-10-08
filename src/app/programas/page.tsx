import type { Metadata } from "next";
import { Leaf, Syringe, Landmark, GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Programas" };

const programs = [
  { icon: Leaf, tag: "Sostenibilidad", title: "Ganadería Sostenible", text: "Sistemas silvopastoriles y buenas prácticas ambientales para una ganadería baja en carbono." },
  { icon: Syringe, tag: "Sanidad animal", title: "Ciclos de vacunación", text: "Campañas nacionales contra la fiebre aftosa y la brucelosis bovina." },
  { icon: Landmark, tag: "Gremio", title: "Fomento al consumo de carne", text: "Estrategia sectorial para fortalecer la demanda interna de carne bovina." },
  { icon: GraduationCap, tag: "Formación", title: "Escuela Virtual FEDEGÁN", text: "Capacitación técnica y gerencial para productores y técnicos del sector." },
];

export default function ProgramasPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Programas y proyectos"
        description="Iniciativas de FEDEGÁN–FNG para el desarrollo sanitario, ambiental y productivo del sector ganadero colombiano."
        breadcrumbs={[{ label: "Programas" }]}
      />
      <Container className="py-12 grid sm:grid-cols-2 gap-5">
        {programs.map((p) => (
          <Card key={p.title}>
            <CardBody>
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-full bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center">
                  <p.icon size={20} />
                </span>
                <Badge tone="teal">{p.tag}</Badge>
              </div>
              <h3 className="font-bold text-lg text-[var(--text)] mt-1">{p.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{p.text}</p>
            </CardBody>
          </Card>
        ))}
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Programas" };

const programs = [
  { image: "/locales/programas.jpg", pos: "70% 50%", accent: "92,205,134", tag: "Sostenibilidad", title: "Ganadería Sostenible", text: "Sistemas silvopastoriles y buenas prácticas ambientales para una ganadería baja en carbono." },
  { image: "/locales/fng.jpg", pos: "40% 50%", accent: "216,181,88", tag: "Sanidad animal", title: "Ciclos de vacunación", text: "Campañas nacionales contra la fiebre aftosa y la brucelosis bovina." },
  { image: "/headers/prensa.jpg", pos: "80% 70%", accent: "230,160,108", tag: "Gremio", title: "Fomento al consumo de carne", text: "Estrategia sectorial para fortalecer la demanda interna de carne bovina." },
  { image: "/locales/sig.jpg", pos: "45% 50%", accent: "190,222,203", tag: "Formación", title: "Escuela Virtual FEDEGÁN", text: "Capacitación técnica y gerencial para productores y técnicos del sector." },
];

export default function ProgramasPage() {
  return (
    <>
      <PageHeader
        eyebrow="El gremio"
        title="Programas y proyectos"
        description="Iniciativas de FEDEGÁN–FNG para el desarrollo sanitario, ambiental y productivo del sector ganadero colombiano."
        image="/headers/campo.jpg"
        imagePos="50% 60%"
        breadcrumbs={[{ label: "Programas" }]}
      />
      <Container className="grid gap-6 py-14 sm:grid-cols-2 sm:py-20">
        {programs.map((p) => (
          <PhotoCard
            key={p.title}
            image={p.image}
            imagePos={p.pos}
            accent={p.accent}
            kicker={p.tag}
            title={p.title}
            text={p.text}
            aspect="aspect-[16/9]"
            badge={<Badge tone="lime">{p.tag}</Badge>}
          />
        ))}
      </Container>
    </>
  );
}

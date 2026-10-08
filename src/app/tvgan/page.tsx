import type { Metadata } from "next";
import { Play, Tv } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "TVGAN" };

const programs = [
  { title: "Tu Vitrina Ganadera", schedule: "Lunes a viernes · 6:00 p. m." },
  { title: "Manual Práctico Ganadero", schedule: "Capítulo semanal" },
];

export default function TvganPage() {
  return (
    <>
      <PageHeader
        eyebrow="Medios"
        title="TVGAN"
        description="El canal del ganadero colombiano: programas, entrevistas y contenido audiovisual del sector."
        breadcrumbs={[{ label: "TVGAN" }]}
      />
      <Container className="py-12">
        <div className="aspect-video rounded-[var(--radius-lg)] bg-[var(--fg-green-900)] flex items-center justify-center relative overflow-hidden mb-8">
          <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(60% 80% at 50% 50%, rgba(141,198,63,0.25), transparent)" }} />
          <span className="relative w-16 h-16 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors cursor-pointer">
            <Play size={26} />
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {programs.map((p) => (
            <div key={p.title} className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] p-5">
              <span className="w-11 h-11 rounded-full bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center shrink-0">
                <Tv size={20} />
              </span>
              <div>
                <h3 className="font-bold text-[var(--text)]">{p.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{p.schedule}</p>
              </div>
            </div>
          ))}
        </div>
        <Button href="https://contexto-olive.vercel.app/" variant="secondary" className="mt-8">
          Ver más en Contexto Ganadero →
        </Button>
      </Container>
    </>
  );
}

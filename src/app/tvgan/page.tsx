import type { Metadata } from "next";
import Image from "next/image";
import { Play, Tv } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "TVGAN" };

const programs = [
  { accent: "216,181,88", title: "Tu Vitrina Ganadera", schedule: "Lunes a viernes · 6:00 p. m." },
  { accent: "92,205,134", title: "Manual Práctico Ganadero", schedule: "Capítulo semanal" },
];

export default function TvganPage() {
  return (
    <>
      <PageHeader
        eyebrow="Medios"
        title="TVGAN"
        description="El canal del ganadero colombiano: programas, entrevistas y contenido audiovisual del sector."
        image="/headers/prensa.jpg"
        imagePos="55% 40%"
        breadcrumbs={[{ label: "TVGAN" }]}
      />
      <Container className="flex flex-col gap-10 py-14 sm:py-20">
        <div className="gl">
          <div className="gl-face">
            <div className="relative aspect-video overflow-hidden">
              <Image src="/headers/prensa.jpg" alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" style={{ objectPosition: "55% 40%" }} />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,15,9,0.85)_0%,rgba(5,15,9,0.35)_55%,rgba(5,15,9,0.55)_100%)]" />
              <button
                type="button"
                aria-label="Reproducir"
                className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[rgba(216,181,88,0.2)] text-[var(--fg-lime-400)] backdrop-blur transition-transform duration-500 [transition-timing-function:var(--ease-lux)] hover:scale-110"
              >
                <Play size={30} className="translate-x-0.5" />
              </button>
              <span className="absolute bottom-5 left-6 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Tu Vitrina Ganadera</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.title} accent={p.accent} hover={false}>
              <div className="flex items-center gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                  <Tv size={20} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{p.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{p.schedule}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Button href="https://www.contextoganadero.com/" variant="secondary" className="self-start">
          Ver más en CONtexto Ganadero →
        </Button>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { ArrowUpRight, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Normatividad" };

const rules = [
  { tipo: "Ley", accent: "216,181,88", ref: "Ley 395 de 1997", title: "Erradicación de la fiebre aftosa en todo el territorio colombiano", fecha: "1997" },
  { tipo: "Ley", accent: "216,181,88", ref: "Ley 89 de 1993", title: "Conformación de la Junta Directiva del Fondo Nacional del Ganado", fecha: "1993" },
  { tipo: "Resolución", accent: "230,160,108", ref: "Res. ICA 3651", title: "Requisitos sanitarios para la movilización de bovinos y bufalinos", fecha: "2014" },
  { tipo: "Decreto", accent: "92,205,134", ref: "Decreto 1071", title: "Reglamentación del sector agropecuario, pesquero y de desarrollo rural", fecha: "2015" },
];

export default function NormatividadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Marco legal"
        title="Normatividad"
        description="Consulte las leyes, decretos y resoluciones que rigen la actividad ganadera y la gestión del Fondo Nacional del Ganado."
        image="/locales/normatividad.jpg"
        imagePos="50% 40%"
        breadcrumbs={[{ label: "Normatividad" }]}
      />
      <Container className="flex flex-col gap-4 py-14 sm:py-20">
        {rules.map((r) => (
          <a key={r.ref} href="#" className="group block">
            <Card accent={r.accent}>
              <div className="flex items-center gap-5 p-5 sm:p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                  <FileText size={20} strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge tone="neutral">{r.tipo}</Badge>
                    <span className="text-xs font-semibold text-[var(--text-faint)]">{r.fecha}</span>
                  </div>
                  <p className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)]">{r.ref}</p>
                  <p className="mt-0.5 text-sm text-[var(--text-muted)]">{r.title}</p>
                </div>
                <ArrowUpRight size={20} className="shrink-0 text-[var(--text-faint)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--acc-rgb))]" />
              </div>
            </Card>
          </a>
        ))}
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { FileText, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Normatividad" };

const rules = [
  { tipo: "Ley", ref: "Ley 395 de 1997", title: "Erradicación de la fiebre aftosa en todo el territorio colombiano", fecha: "1997" },
  { tipo: "Ley", ref: "Ley 89 de 1993", title: "Conformación de la Junta Directiva del Fondo Nacional del Ganado", fecha: "1993" },
  { tipo: "Resolución", ref: "Res. ICA 3651", title: "Requisitos sanitarios para la movilización de bovinos y bufalinos", fecha: "2014" },
  { tipo: "Decreto", ref: "Decreto 1071", title: "Reglamentación del sector agropecuario, pesquero y de desarrollo rural", fecha: "2015" },
];

export default function NormatividadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Marco legal"
        title="Normatividad"
        description="Consulte las leyes, decretos y resoluciones que rigen la actividad ganadera y la gestión del Fondo Nacional del Ganado."
        breadcrumbs={[{ label: "Normatividad" }]}
      />
      <Container className="py-12">
        <div className="flex flex-col divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface-solid)]">
          {rules.map((r) => (
            <a
              key={r.ref}
              href="#"
              className="flex items-center gap-4 p-5 hover:bg-[var(--bg-muted)] transition-colors group"
            >
              <span className="w-10 h-10 shrink-0 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center">
                <FileText size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone="neutral">{r.tipo}</Badge>
                  <span className="text-xs text-[var(--text-faint)]">{r.fecha}</span>
                </div>
                <p className="font-semibold text-[var(--text)] truncate">{r.ref} — {r.title}</p>
              </div>
              <ExternalLink size={16} className="text-[var(--text-faint)] group-hover:text-[var(--fg-green-700)] shrink-0" />
            </a>
          ))}
        </div>
      </Container>
    </>
  );
}

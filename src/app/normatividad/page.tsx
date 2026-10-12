import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { RulesExplorer, type RuleItem } from "@/components/blocks/RulesExplorer";

export const metadata: Metadata = { title: "Normatividad" };

const rules: RuleItem[] = [
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
        image="/headers/servicios.jpg"
        imagePos="45% 50%"
        meta={`${rules.length} normas`}
        breadcrumbs={[{ label: "Normatividad" }]}
      />
      <Container className="py-8 sm:py-12">
        <RulesExplorer rules={rules} />
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Planilla } from "@/components/pagos/Planilla";

export const metadata: Metadata = { title: "Planilla de recaudo" };

export default async function PlanillaPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Recaudo mensual"
        title="Planilla de recaudo"
        description="Diligencie el mes, los orígenes y los totales de leche o carne antes de pagar."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        breadcrumbs={[{ label: "Zona de pagos", href: "/pagos" }, { label: "Planilla" }]}
        compact
      />
      <Container className="py-8 sm:py-10">
        <Planilla initial={c === "carne" ? "carne" : "leche"} />
      </Container>
    </>
  );
}

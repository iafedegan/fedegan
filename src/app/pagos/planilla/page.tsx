import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Planilla } from "@/components/pagos/Planilla";

export const metadata: Metadata = { title: "Planilla de recaudo" };

export default function PlanillaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Recaudo mensual"
        title="Planilla de recaudo"
        description="Diligencie el mes, los orígenes y los totales de leche o carne antes de pagar."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        breadcrumbs={[{ label: "Pago en línea", href: "/pagos" }, { label: "Planilla" }]}
        compact
      />
      <Container className="py-8 sm:py-10">
        <Planilla />
      </Container>
    </>
  );
}

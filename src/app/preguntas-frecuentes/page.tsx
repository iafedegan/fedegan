import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqAccordion } from "@/components/blocks/FaqAccordion";
import { getFaqs } from "@/lib/cms/content";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

export default async function FaqPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHeader
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        description="Resuelva sus dudas más comunes sobre trámites, servicios y procesos de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Preguntas frecuentes" }]}
      />
      <Container className="max-w-3xl py-8 sm:py-12">
        <FaqAccordion items={faqs} />
      </Container>
    </>
  );
}

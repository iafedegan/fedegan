import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
        meta={`${faqs.length} preguntas`}
        image="/headers/campo.jpg"
        imagePos="50% 60%"
        breadcrumbs={[{ label: "Preguntas frecuentes" }]}
      />
      <Container className="grid items-start gap-8 py-5 sm:py-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
        <div className="min-w-0">
          <FaqAccordion items={faqs} />
        </div>
        <aside className="lg:sticky lg:top-36">
          <Card hover={false} accent="216,181,88">
            <div className="flex flex-col items-start gap-3 p-6">
              <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">¿No encontró su respuesta?</h2>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Escríbanos por PQRSD o llámenos al (601) 578 2020, de lunes a viernes de 8:00 a.m. a 5:00 p.m.
              </p>
              <Button href="/contacto" size="sm" variant="lime">Ir a contacto</Button>
            </div>
          </Card>
        </aside>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaqAccordion } from "@/components/blocks/FaqAccordion";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

const faqs = [
  {
    q: "¿Cómo consulto mi Registro Único de Vacunación (RUV)?",
    a: "Ingrese a la sección Servicios y seleccione “Consulta RUV”. Deberá ingresar su número de identificación o el código de su predio para ver el estado de su registro.",
  },
  {
    q: "¿Cómo radico una PQRS ante FEDEGÁN–FNG?",
    a: "Puede radicar peticiones, quejas, reclamos y sugerencias desde la sección Servicios > PQRS, o escribiendo directamente al correo de atención al ganadero.",
  },
  {
    q: "¿Dónde encuentro los precios del ganado por región?",
    a: "Los indicadores de precio del novillo gordo y otras variables se publican semanalmente en la home del portal y en Contexto Ganadero.",
  },
  {
    q: "¿Cómo me inscribo a la Escuela Virtual FEDEGÁN?",
    a: "Desde la sección Escuela Virtual puede consultar la oferta de cursos vigente y realizar su inscripción con su documento de identidad.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ayuda"
        title="Preguntas frecuentes"
        description="Resuelva sus dudas más comunes sobre trámites, servicios y procesos de FEDEGÁN–FNG."
        breadcrumbs={[{ label: "Preguntas frecuentes" }]}
      />
      <Container className="max-w-3xl py-14 sm:py-20">
        <FaqAccordion items={faqs} />
      </Container>
    </>
  );
}

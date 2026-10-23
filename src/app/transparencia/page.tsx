import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { legales, pqrsdForm } from "@/content/accesos";

export const metadata: Metadata = { title: "Transparencia y acceso a la información", alternates: { canonical: "/transparencia" } };

export default function TransparenciaPage() {
  return (
    <LegalPage
      crumb="Transparencia"
      eyebrow="Acceso a la información"
      title="Transparencia"
      description="Información institucional, normativa y canales de atención al ciudadano."
      docs={[{ label: "Formulario PQRSD", href: pqrsdForm }, ...legales]}
      sections={[
        { title: "Información institucional", body: ["Encuentre la misión, visión y estructura de la Federación en Quiénes somos, y las leyes y resoluciones del sector en Normatividad."] },
        { title: "Peticiones, quejas, reclamos, sugerencias y denuncias", body: ["Radique sus solicitudes por el formulario PQRSD o por los canales de la página de Contacto. Las respuestas se dan dentro de los términos legales."] },
        { title: "Control y buen gobierno", body: ["La gestión institucional se rige por el Código de Buen Gobierno y por el control ciudadano permanente."] },
      ]}
    />
  );
}

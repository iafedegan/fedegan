import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { legales } from "@/content/accesos";

export const metadata: Metadata = { title: "Política de privacidad y datos personales", alternates: { canonical: "/privacidad" } };

export default function PrivacidadPage() {
  return (
    <LegalPage
      crumb="Privacidad"
      eyebrow="Datos personales"
      title="Política de privacidad"
      description="Cómo FEDEGÁN–FNG trata sus datos personales en este portal, conforme a la Ley 1581 de 2012."
      docs={[legales[0], legales[1]]}
      sections={[
        { title: "Responsable del tratamiento", body: ["La Federación Colombiana de Ganaderos – FEDEGÁN y el Fondo Nacional del Ganado – FNG son responsables del tratamiento de los datos que usted entrega en este portal. Sus políticas completas están en los documentos oficiales de esta página."] },
        { title: "Qué datos recolectamos", body: ["Solo los que usted entrega al usar un servicio: formularios de contacto y PQRSD, suscripción al boletín e ingreso a Mi FEDEGÁN. No pedimos datos que el servicio no necesite."] },
        { title: "Cookies y analítica", body: ["Con su permiso usamos una cookie propia que cuenta qué secciones visita para ordenar el recorrido, y, si lo acepta, herramientas de analítica (Google Tag Manager / Google Analytics 4) para medir el uso del sitio de forma agregada. Sin su permiso no se carga ninguna de ellas.", "Puede cambiar su decisión en cualquier momento desde «Preferencias de privacidad», en el pie de página."] },
        { title: "Sus derechos", body: ["Puede conocer, actualizar, rectificar y suprimir sus datos, y revocar la autorización, escribiendo por los canales de la página de Contacto o por el formulario PQRSD."] },
      ]}
    />
  );
}

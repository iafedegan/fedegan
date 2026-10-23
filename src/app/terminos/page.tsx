import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";
import { legales } from "@/content/accesos";

export const metadata: Metadata = { title: "Términos y condiciones de uso", alternates: { canonical: "/terminos" } };

export default function TerminosPage() {
  return (
    <LegalPage
      crumb="Términos"
      eyebrow="Uso del portal"
      title="Términos y condiciones"
      description="Reglas de uso de este portal y de los contenidos de FEDEGÁN–FNG."
      docs={[legales[2], legales[3]]}
      sections={[
        { title: "Uso del portal", body: ["El acceso al portal implica la aceptación de los términos y condiciones oficiales publicados en los documentos de esta página. Use el sitio de forma lícita y sin afectar su disponibilidad."] },
        { title: "Contenidos y derechos de autor", body: ["Los textos, imágenes y publicaciones son de FEDEGÁN–FNG o de sus aliados. Su reproducción requiere autorización, según la política de derechos de autor."] },
        { title: "Enlaces a otros sitios", body: ["El portal enlaza con sitios de aliados (CONtexto Ganadero, TvGan y otros). FEDEGÁN–FNG no responde por sus contenidos ni por sus políticas de datos."] },
      ]}
    />
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { iconMap } from "@/components/ui/icon-map";
import { Landmark, ShieldCheck, Syringe, MapPinned } from "lucide-react";

export const metadata: Metadata = { title: "Servicios en línea" };

const services = [
  { icon: "help-circle", title: "PQRS Fedegán–FNG", text: "Radique peticiones, quejas, reclamos y sugerencias.", href: "/contacto" },
  { icon: "file-check", title: "Consulta RUV", text: "Verifique su inscripción en el Registro Único de Vacunación.", href: "/servicios" },
  { icon: "bar-chart", title: "Recaudo biológico", text: "Consulte y gestione el recaudo de la cuota de fomento ganadero.", href: "/servicios" },
];

const extra = [
  { icon: Landmark, title: "Oferta de tierras", text: "Explore el banco de tierras disponible para ganaderos." },
  { icon: ShieldCheck, title: "Sello ambiental", text: "Certifique su predio y acceda a incentivos por sostenibilidad." },
  { icon: Syringe, title: "Seguridad ganadera", text: "Reporte y consulte alertas de abigeato y seguridad rural." },
  { icon: MapPinned, title: "Cifras del inventario", text: "Consulte cifras regionales del inventario bovino y bufalino." },
];

export default function ServiciosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Autogestión"
        title="Servicios en línea"
        description="Trámites, consultas y accesos directos a los sistemas de FEDEGÁN–FNG para ganaderos y aliados del sector."
        breadcrumbs={[{ label: "Servicios" }]}
      />
      <Container className="py-12 flex flex-col gap-10">
        <div className="grid sm:grid-cols-3 gap-5">
          {services.map((s) => {
            const Icon = iconMap[s.icon];
            return (
              <Link key={s.title} href={s.href}>
                <Card>
                  <CardBody>
                    <span className="w-11 h-11 rounded-[var(--radius-sm)] bg-[var(--fg-green-700)] text-[var(--on-accent)] flex items-center justify-center">
                      <Icon size={20} />
                    </span>
                    <h3 className="font-bold text-[var(--text)]">{s.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--fg-green-700)]">
                      Ir al servicio <ArrowRight size={14} />
                    </span>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text)] mb-4">Otros accesos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {extra.map((e) => (
              <div key={e.title} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-5 flex flex-col gap-2">
                <e.icon size={20} className="text-[var(--fg-green-700)]" />
                <h3 className="font-bold text-sm text-[var(--text)]">{e.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}

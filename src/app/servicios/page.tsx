import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, MapPinned, ShieldCheck, Syringe } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card, CardBody } from "@/components/ui/Card";
import { iconMap } from "@/components/ui/icon-map";

export const metadata: Metadata = { title: "Servicios en línea" };

const services = [
  { icon: "help-circle", accent: "216,181,88", title: "PQRS Fedegán–FNG", text: "Radique peticiones, quejas, reclamos y sugerencias.", href: "/contacto" },
  { icon: "file-check", accent: "92,205,134", title: "Consulta RUV", text: "Verifique su inscripción en el Registro Único de Vacunación.", href: "/servicios" },
  { icon: "bar-chart", accent: "230,160,108", title: "Recaudo biológico", text: "Consulte y gestione el recaudo de la cuota de fomento ganadero.", href: "/servicios" },
];

const extra = [
  { icon: Landmark, accent: "216,181,88", title: "Oferta de tierras", text: "Explore el banco de tierras disponible para ganaderos." },
  { icon: ShieldCheck, accent: "190,222,203", title: "Sello ambiental", text: "Certifique su predio y acceda a incentivos por sostenibilidad." },
  { icon: Syringe, accent: "230,160,108", title: "Seguridad ganadera", text: "Reporte y consulte alertas de abigeato y seguridad rural." },
  { icon: MapPinned, accent: "112,214,196", title: "Cifras del inventario", text: "Consulte cifras regionales del inventario bovino y bufalino." },
];

export default function ServiciosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Autogestión"
        title="Servicios en línea"
        description="Trámites, consultas y accesos directos a los sistemas de FEDEGÁN–FNG para ganaderos y aliados del sector."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        breadcrumbs={[{ label: "Servicios" }]}
      />
      <Container className="flex flex-col gap-16 py-14 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {services.map((s) => {
            const Icon = iconMap[s.icon];
            return (
              <Link key={s.title} href={s.href} className="group block h-full">
                <Card accent={s.accent}>
                  <CardBody className="gap-3 p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">{s.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-[rgb(var(--acc-rgb))]">
                      Ir al servicio <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>

        <div>
          <SectionHeading eyebrow="Más accesos" title="Otros servicios" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {extra.map((e) => (
              <Card key={e.title} accent={e.accent} hover={false}>
                <CardBody className="gap-2.5 p-5">
                  <e.icon size={22} strokeWidth={1.6} className="text-[rgb(var(--acc-rgb))]" />
                  <h3 className="font-bold text-[var(--text)]">{e.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{e.text}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </>
  );
}

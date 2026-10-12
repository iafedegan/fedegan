import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCheck2, HelpCircle, Landmark, MapPinned, ShieldCheck, Syringe } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Servicios en línea" };

// Destinos tomados del menú del portal actual de FEDEGÁN.
const main = [
  { icon: FileCheck2, accent: "92,205,134", title: "Consulta RUV", text: "Verifique su inscripción en el Registro Único de Vacunación.", href: "https://sagari.fedegan-fng.org.co/?#/cnl1", external: true },
  { icon: HelpCircle, accent: "216,181,88", title: "PQRSD", text: "Radique peticiones, quejas, reclamos, sugerencias y denuncias.", href: "/contacto", external: false },
  { icon: ShieldCheck, accent: "230,160,108", title: "Seguridad Ganadera", text: "Consulte alertas y reporte situaciones de seguridad rural.", href: "https://sagari.fedegan-fng.org.co/?#/seguridadGanadera", external: true },
];

const more = [
  { icon: Landmark, accent: "216,181,88", title: "Oferta de tierras", text: "Banco de tierras disponible para ganaderos." },
  { icon: ShieldCheck, accent: "190,222,203", title: "Sello ambiental", text: "Certifique su predio y acceda a incentivos." },
  { icon: Syringe, accent: "230,160,108", title: "Recaudo biológico", text: "Consulta y gestión del recaudo de la cuota de fomento." },
  { icon: MapPinned, accent: "112,214,196", title: "Cifras del inventario", text: "Inventario bovino y bufalino por región.", href: "/seccion/cifras-del-sector" },
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
        meta="Trámites"
        breadcrumbs={[{ label: "Servicios" }]}
      />

      <Section eyebrow="Lo más usado" title="Trámites principales">
        <div className="grid gap-5 md:grid-cols-3">
          {main.map((s) => {
            const Icon = s.icon;
            const body = (
              <div
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)] p-6 transition-colors duration-300 hover:border-[rgb(var(--acc-rgb))] sm:p-7"
                style={{
                  ["--acc-rgb" as string]: s.accent,
                  background: "radial-gradient(90% 90% at 100% 0%, rgba(var(--acc-rgb),0.16), transparent 65%), var(--surface-solid)",
                } as React.CSSProperties}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.5)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                  <Icon size={22} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{s.text}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold uppercase tracking-[0.08em] text-[rgb(var(--acc-rgb))]">
                  Ir al servicio <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            );
            return s.external ? (
              <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                {body}
              </a>
            ) : (
              <Link key={s.title} href={s.href} className="block h-full">
                {body}
              </Link>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Más accesos" title="Otros servicios" tinted>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {more.map((m) => {
            const row = (
              <div className="group flex items-start gap-4 border-b border-[var(--border)] py-5">
                <span
                  className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[rgba(var(--acc-rgb),0.45)] bg-[rgba(var(--acc-rgb),0.1)] text-[rgb(var(--acc-rgb))]"
                  style={{ ["--acc-rgb" as string]: m.accent } as React.CSSProperties}
                >
                  <m.icon size={20} strokeWidth={1.6} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex flex-wrap items-center gap-2 font-bold text-[var(--text)]">
                    {m.title}
                    {!m.href && <Badge tone="neutral">Próximamente</Badge>}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{m.text}</p>
                </div>
                {m.href && <ArrowUpRight size={18} className="mt-1 shrink-0 text-[var(--text-faint)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg-lime-400)]" />}
              </div>
            );
            return <li key={m.title}>{m.href ? <Link href={m.href}>{row}</Link> : row}</li>;
          })}
        </ul>
      </Section>

      <CtaBand
        eyebrow="¿Necesita ayuda?"
        title="Resolvemos sus dudas sobre trámites y servicios"
        text="Revise las preguntas frecuentes o escríbanos y le responderemos."
        actions={[
          { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
          { label: "Contacto", href: "/contacto" },
        ]}
      />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { AccessHub } from "@/components/blocks/Accesos";
import { excerptOf, getLegacyPage, getLegacySection, legacyHref } from "@/content/legacy";

export const metadata: Metadata = { title: "Servicios en línea" };

const otros = [
  { label: "Atención y servicios a la ciudadanía", href: "/seccion/atencion-ciudadania", text: "Canales oficiales, correos y horarios de atención." },
  { label: "Sala de Prensa", href: "/seccion/sala-de-prensa", text: "Comunicados y boletines de prensa." },
  { label: "Políticas y reglamentos del SG-SST", href: "/seccion/sg-sst", text: "Seguridad y salud en el trabajo." },
];

export default function ServiciosPage() {
  const legacy = getLegacySection("servicios-fedegan");
  const catalogo = [
    ...(legacy?.tree.map((n) => ({ label: n.label, href: legacyHref("servicios-fedegan", n.key!), text: excerptOf(getLegacyPage(n.key!)!, 120) })) ?? []),
    ...otros,
  ];
  return (
    <>
      <PageHeader
        eyebrow="Autogestión"
        title="Servicios en línea"
        description="Pagos, trámites y consultas de FEDEGÁN–FNG para ganaderos y aliados del sector."
        image="/headers/servicios.jpg"
        imagePos="60% 40%"
        facts={["Pagos", "Trámites", "Consultas"]}
        breadcrumbs={[{ label: "Servicios" }]}
        compact
      />

      <AccessHub />

      <Section eyebrow="Catálogo" title="Más servicios de FEDEGÁN" tinted>
        <ul className="grid gap-x-14 border-t border-[var(--border-strong)] lg:grid-cols-2">
          {catalogo.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-[var(--border)] px-1 py-5 transition-colors hover:bg-[rgba(216,181,88,0.05)]">
                <span className="min-w-0">
                  <span className="block font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)]">{c.label}</span>
                  {c.text && <span className="mt-0.5 line-clamp-2 block text-sm leading-relaxed text-[var(--text-muted)]">{c.text}</span>}
                </span>
                <ArrowRight size={20} className="text-[var(--text-faint)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--fg-lime-400)]" />
              </Link>
            </li>
          ))}
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

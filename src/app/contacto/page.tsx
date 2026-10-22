import type { Metadata } from "next";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { contacto, pqrsdForm } from "@/content/accesos";

export const metadata: Metadata = { title: "Contacto" };

const channels = [
  { icon: Phone, label: "Teléfono", value: contacto.telefono, href: contacto.telefonoHref },
  { icon: Mail, label: "Correo", value: "fedegan@fedegan.org.co", href: "mailto:fedegan@fedegan.org.co" },
  {
    icon: MapPin,
    label: "Sede principal",
    value: contacto.direccion,
    href: "https://www.google.com/maps/search/?api=1&query=Calle+37+%23+14-31+Bogot%C3%A1",
  },
  { icon: Clock, label: "Horario", value: contacto.horario },
];

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Atención al ganadero"
        title="Contacto"
        description="Escríbanos por PQRSD o comuníquese directamente con la Federación Colombiana de Ganaderos."
        meta="PQRSD"
        image="/headers/servicios.jpg"
        imagePos="50% 45%"
        facts={["Lunes a viernes", "8:30 a.m. – 5:30 p.m.", "Bogotá D.C."]}
        breadcrumbs={[{ label: "Contacto" }]}
      />
      <Container className="grid gap-8 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <aside className="flex flex-col gap-6">
          <ul className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {channels.map((c) => {
              const inner = (
                <div className="group flex items-center gap-4 py-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[rgba(216,181,88,0.1)] text-[var(--fg-lime-400)]">
                    <c.icon size={19} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">{c.label}</span>
                    <span className="block font-semibold leading-snug text-[var(--text)]">{c.value}</span>
                  </span>
                  {c.href && (
                    <ArrowUpRight size={17} className="shrink-0 text-[var(--text-faint)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--fg-lime-400)]" />
                  )}
                </div>
              );
              return (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
          <Card hover={false} accent="92,205,134">
            <div className="flex flex-col items-start gap-3 p-6">
              <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">¿Primero una consulta rápida?</h2>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Muchas dudas sobre trámites, RUV y servicios ya tienen respuesta en nuestras preguntas frecuentes.
              </p>
              <Button href="/preguntas-frecuentes" size="sm" variant="secondary">Ver preguntas frecuentes</Button>
            </div>
          </Card>
        </aside>

        <div className="flex flex-col gap-5">
          <Card hover={false} accent="216,181,88">
            <div className="flex flex-col items-start gap-4 p-6 sm:p-8">
              <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Radique su solicitud</h2>
              <p className="leading-relaxed text-[var(--text-muted)]">
                Las peticiones, quejas, reclamos, sugerencias y denuncias se radican en el formulario oficial de FEDEGÁN-FNG. Recibirá un número de radicado para el seguimiento.
              </p>
              <Button href={pqrsdForm} external>Abrir el formulario PQRSD</Button>
            </div>
          </Card>
          <div>
            <h2 className="mb-3 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">O escriba al correo que corresponde</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {contacto.correos.map((c) => (
                <li key={c.email} className="mx-card flex flex-col gap-1.5 !p-5">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[var(--fg-lime-500)]">{c.label}</p>
                  <a href={`mailto:${c.email}`} className="break-all font-bold text-[var(--text)] hover:text-[var(--fg-lime-400)]">{c.email}</a>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </>
  );
}

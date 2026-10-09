import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "@/components/blocks/ContactForm";

export const metadata: Metadata = { title: "Contacto" };

const info = [
  { icon: MapPin, text: "Calle 37 # 14 - 31, Bogotá D.C., Colombia" },
  { icon: Phone, text: "(601) 578 2020" },
  { icon: Mail, text: "fedegan@fedegan.org.co" },
  { icon: Clock, text: "Lunes a viernes, 8:00 a.m. a 5:00 p.m." },
];

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Atención al ganadero"
        title="Contacto"
        description="Escríbanos por PQRS o comuníquese directamente con la Federación Colombiana de Ganaderos."
        breadcrumbs={[{ label: "Contacto" }]}
      />
      <Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <Card hover={false}>
          <div className="p-7 sm:p-10">
            <h2 className="mb-6 font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Escríbanos</h2>
            <ContactForm />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card hover={false} accent="92,205,134">
            <div className="p-7">
              <h2 className="mb-5 font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Sede principal</h2>
              <ul className="flex flex-col gap-4 text-sm text-[var(--text-muted)]">
                {info.map((i) => (
                  <li key={i.text} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[rgba(var(--acc-rgb),0.45)] bg-[rgba(var(--acc-rgb),0.12)] text-[rgb(var(--acc-rgb))]">
                      <i.icon size={16} />
                    </span>
                    <span className="pt-1.5">{i.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
          <Card hover={false}>
            <div className="flex flex-col items-start gap-3 p-7">
              <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">PQRS Fedegán–FNG</h2>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Radique peticiones, quejas, reclamos y sugerencias a través de nuestro sistema oficial de PQRS.
              </p>
              <Button href="/servicios" size="sm" className="mt-1">Ir a PQRS</Button>
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
}

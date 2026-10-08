import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ContactForm } from "@/components/blocks/ContactForm";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Atención al ganadero"
        title="Contacto"
        description="Escríbanos por PQRS o comuníquese directamente con la Federación Colombiana de Ganaderos."
        breadcrumbs={[{ label: "Contacto" }]}
      />
      <Container className="py-12 grid lg:grid-cols-[1fr_0.8fr] gap-10">
        <ContactForm />

        <div className="flex flex-col gap-5">
          <Card hover={false}>
            <CardBody>
              <h3 className="font-bold text-[var(--text)]">Sede principal</h3>
              <ul className="flex flex-col gap-3 text-sm text-[var(--text-muted)] mt-1">
                <li className="flex gap-2.5"><MapPin size={16} className="shrink-0 mt-0.5 text-[var(--fg-green-700)]" /> Calle 37 # 14 - 31, Bogotá D.C., Colombia</li>
                <li className="flex gap-2.5"><Phone size={16} className="shrink-0 mt-0.5 text-[var(--fg-green-700)]" /> (601) 578 2020</li>
                <li className="flex gap-2.5"><Mail size={16} className="shrink-0 mt-0.5 text-[var(--fg-green-700)]" /> fedegan@fedegan.org.co</li>
                <li className="flex gap-2.5"><Clock size={16} className="shrink-0 mt-0.5 text-[var(--fg-green-700)]" /> Lunes a viernes, 8:00 a.m. a 5:00 p.m.</li>
              </ul>
            </CardBody>
          </Card>
          <Card hover={false} className="bg-[var(--fg-green-900)] text-white">
            <CardBody>
              <h3 className="font-bold">PQRS Fedegán–FNG</h3>
              <p className="text-sm text-white/75 leading-relaxed">
                Radique peticiones, quejas, reclamos y sugerencias a través de nuestro sistema oficial de PQRS.
              </p>
              <Button href="/servicios" variant="lime" size="sm" className="self-start mt-1">
                Ir a PQRS
              </Button>
            </CardBody>
          </Card>
        </div>
      </Container>
    </>
  );
}

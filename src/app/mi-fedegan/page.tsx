import type { Metadata } from "next";
import { UserCircle2, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Mi FEDEGÁN" };

const bullets = [
  "Gestione sus trámites en línea",
  "Acceda a información personalizada",
  "Reciba comunicaciones y alertas",
  "Beneficios y autogestión por membresía",
];

export default function MiFedeganPage() {
  return (
    <>
      <PageHeader eyebrow="Área personal" title="Mi FEDEGÁN" breadcrumbs={[{ label: "Mi FEDEGÁN" }]} />
      <Container className="py-16 flex flex-col items-center text-center gap-5 max-w-xl">
        <span className="w-16 h-16 rounded-full bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center">
          <UserCircle2 size={32} />
        </span>
        <Badge tone="lime">Próximamente</Badge>
        <h2 className="text-2xl font-bold text-[var(--text)]">Su espacio personalizado está en construcción</h2>
        <p className="text-[var(--text-muted)] leading-relaxed">
          Mi FEDEGÁN será el área autenticada del ecosistema digital, preparada bajo el modelo de
          membresías definido en el TDR del proyecto: registro, perfilamiento y autogestión de
          servicios para afiliados y usuarios externos.
        </p>
        <ul className="flex flex-col gap-2 text-sm text-[var(--text-muted)] text-left self-stretch">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <Check size={15} className="text-[var(--fg-green-700)]" /> {b}
            </li>
          ))}
        </ul>
        <Button href="/servicios" variant="primary">Explorar servicios disponibles hoy</Button>
      </Container>
    </>
  );
}

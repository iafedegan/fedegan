import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LayoutSwitchDemo } from "@/components/blocks/LayoutSwitchDemo";

export const metadata: Metadata = { title: "Catálogo de componentes" };

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-[var(--radius-md)] border border-[var(--border)]"
        style={{ background: `var(${varName})` }}
      />
      <div className="text-xs">
        <p className="font-semibold text-[var(--text)]">{name}</p>
        <p className="text-[var(--text-faint)] font-mono">{varName}</p>
      </div>
    </div>
  );
}

const colorTokens = [
  { name: "Verde 900", varName: "--fg-green-900" },
  { name: "Verde 800", varName: "--fg-green-800" },
  { name: "Verde 700", varName: "--fg-green-700" },
  { name: "Verde 600", varName: "--fg-green-600" },
  { name: "Lima 500", varName: "--fg-lime-500" },
  { name: "Lima 400", varName: "--fg-lime-400" },
  { name: "Teal 600", varName: "--fg-teal-600" },
  { name: "Fondo mudo", varName: "--bg-muted" },
];

export default function ComponentesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gobernanza de diseño"
        title="Catálogo de componentes"
        description="Inventario navegable de tokens, componentes base y bloques de página del sistema de diseño de FEDEGÁN–FNG. Sirve como referencia de gobierno para el equipo editorial y de desarrollo, y como evidencia del entregable E1 del TDR."
        breadcrumbs={[{ label: "Catálogo de componentes" }]}
      />

      <Container className="py-12 flex flex-col gap-14">
        <section>
          <SectionHeading eyebrow="Tokens" title="Color de marca" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {colorTokens.map((c) => (
              <Swatch key={c.varName} {...c} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Tokens" title="Tipografía" />
          <div className="flex flex-col gap-4 border border-[var(--border)] rounded-[var(--radius-lg)] p-6 bg-[var(--surface-2)]">
            <div>
              <p className="text-xs text-[var(--text-faint)] font-mono mb-1">--font-display · Poppins</p>
              <p className="text-3xl font-extrabold text-[var(--text)]">Modernización del portal FEDEGÁN</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-faint)] font-mono mb-1">--font-body · Inter</p>
              <p className="text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
                Cuerpo de texto para artículos, descripciones y contenido editorial. Optimizado para
                lectura prolongada con line-height generoso.
              </p>
            </div>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Botones" />
          <div className="flex flex-wrap items-center gap-3 border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="lime">Lima</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">Primario sm</Button>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Badges / etiquetas" />
          <div className="flex flex-wrap gap-3 border border-[var(--border)] rounded-[var(--radius-lg)] p-6">
            <Badge tone="green">Verde</Badge>
            <Badge tone="lime">Lima</Badge>
            <Badge tone="teal">Teal</Badge>
            <Badge tone="neutral">Neutral</Badge>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Tarjeta (Card)" />
          <div className="grid sm:grid-cols-3 gap-5">
            <Card>
              <CardBody>
                <Badge tone="green">Ejemplo</Badge>
                <h3 className="font-bold text-[var(--text)]">Tarjeta estándar</h3>
                <p className="text-sm text-[var(--text-muted)]">Usada en noticias, programas y servicios.</p>
              </CardBody>
            </Card>
            <Card hover={false}>
              <CardBody>
                <Badge tone="neutral">Sin hover</Badge>
                <h3 className="font-bold text-[var(--text)]">Tarjeta estática</h3>
                <p className="text-sm text-[var(--text-muted)]">Para contenido informativo sin navegación.</p>
              </CardBody>
            </Card>
            <Card className="bg-[var(--fg-green-900)] text-white">
              <CardBody>
                <Badge tone="lime">Inversa</Badge>
                <h3 className="font-bold">Tarjeta sobre fondo de marca</h3>
                <p className="text-sm text-white/70">Para CTAs y bloques destacados.</p>
              </CardBody>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Formulario" />
          <div className="border border-[var(--border)] rounded-[var(--radius-lg)] p-6 max-w-sm flex flex-col gap-3">
            <Input id="demo-input" placeholder="Campo de texto" />
            <Button size="sm">Enviar</Button>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Composición · TDR 5.2"
            title="Demostración: cambio de layout sin desarrollo mayor"
          />
          <p className="text-sm text-[var(--text-muted)] mb-5 max-w-2xl">
            Los mismos bloques y el mismo contenido se pueden reorganizar en distintas
            composiciones (columnas, lista, vitrina) cambiando solo la configuración de layout,
            sin tocar los componentes ni el contenido — el requisito de composibilidad del TDR.
          </p>
          <LayoutSwitchDemo />
        </section>
      </Container>
    </>
  );
}

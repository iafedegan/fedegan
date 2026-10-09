import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LayoutSwitchDemo } from "@/components/blocks/LayoutSwitchDemo";

export const metadata: Metadata = { title: "Catálogo de componentes" };

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-16 rounded-[var(--radius-md)] border border-[var(--border-strong)]"
        style={{ background: `var(${varName})` }}
      />
      <div className="text-xs">
        <p className="font-semibold text-[var(--text)]">{name}</p>
        <p className="font-mono text-[var(--text-faint)]">{varName}</p>
      </div>
    </div>
  );
}

const colorTokens = [
  { name: "Fondo esmeralda", varName: "--bg" },
  { name: "Fondo secundario", varName: "--bg-muted" },
  { name: "Superficie", varName: "--surface-solid" },
  { name: "Tarjeta · inicio", varName: "--card-a" },
  { name: "Tarjeta · fin", varName: "--card-b" },
  { name: "Oro (acento)", varName: "--fg-lime-500" },
  { name: "Oro claro", varName: "--fg-lime-400" },
  { name: "Borde marcado", varName: "--border-strong" },
];

export default function ComponentesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gobernanza de diseño"
        title="Catálogo de componentes"
        description="Inventario navegable de tokens, componentes base y bloques de página del sistema de diseño de FEDEGÁN–FNG. Sirve como referencia de gobierno para el equipo editorial y de desarrollo, y como evidencia del entregable E1 del TDR."
        image="/headers/servicios.jpg"
        imagePos="50% 45%"
        breadcrumbs={[{ label: "Catálogo de componentes" }]}
      />

      <Container className="flex flex-col gap-16 py-14 sm:py-20">
        <section>
          <SectionHeading eyebrow="Tokens" title="Color de marca" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {colorTokens.map((c) => (
              <Swatch key={c.varName} {...c} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Tokens" title="Tipografía" />
          <Card hover={false}>
            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <p className="mb-1 font-mono text-xs text-[var(--text-faint)]">--font-display · Playfair Display</p>
                <p className="font-[var(--font-display)] text-3xl font-bold text-[var(--text)]">Modernización del portal FEDEGÁN</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-xs text-[var(--text-faint)]">--font-body · Inter Tight</p>
                <p className="max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
                  Cuerpo de texto para artículos, descripciones y contenido editorial. Optimizado para
                  lectura prolongada con line-height generoso.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Botones" />
          <Card hover={false}>
            <div className="flex flex-wrap items-center gap-3 p-6 sm:p-8">
              <Button variant="primary">Primario</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="lime">Oro</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" size="sm">Primario sm</Button>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Badges / etiquetas" />
          <Card hover={false}>
            <div className="flex flex-wrap gap-3 p-6 sm:p-8">
              <Badge tone="green">Verde</Badge>
              <Badge tone="lime">Oro</Badge>
              <Badge tone="teal">Teal</Badge>
              <Badge tone="neutral">Neutral</Badge>
              <Badge tone="alert">Última hora</Badge>
            </div>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Tarjeta de vidrio (Card)" />
          <div className="grid gap-6 sm:grid-cols-3">
            <Card>
              <CardBody>
                <Badge tone="lime">Oro</Badge>
                <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">Tarjeta estándar</h3>
                <p className="text-sm text-[var(--text-muted)]">Usada en servicios, programas y bloques informativos.</p>
              </CardBody>
            </Card>
            <Card hover={false}>
              <CardBody>
                <Badge tone="neutral">Sin hover</Badge>
                <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">Tarjeta estática</h3>
                <p className="text-sm text-[var(--text-muted)]">Para contenido informativo sin navegación.</p>
              </CardBody>
            </Card>
            <Card accent="92,205,134">
              <CardBody>
                <Badge tone="green">Acento verde</Badge>
                <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--text)]">Tarjeta con acento</h3>
                <p className="text-sm text-[var(--text-muted)]">El color de acento se define por tarjeta con <code className="font-mono text-xs">accent</code>.</p>
              </CardBody>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Tarjeta con foto (PhotoCard)" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PhotoCard
              image="/locales/programas.jpg"
              imagePos="70% 50%"
              accent="92,205,134"
              kicker="Programas"
              title="Tarjeta con imagen y acento"
              text="Imagen, etiqueta, título y llamado a la acción sobre el mismo vidrio."
              href="/programas"
              cta="Ver programas"
              badge={<Badge tone="lime">Ejemplo</Badge>}
            />
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Componentes" title="Formulario" />
          <div className="max-w-sm">
            <Card hover={false}>
              <div className="flex flex-col gap-3 p-6">
                <Input id="demo-input" placeholder="Campo de texto" />
                <Button size="sm">Enviar</Button>
              </div>
            </Card>
          </div>
        </section>

        <section>
          <SectionHeading
            eyebrow="Composición · TDR 5.2"
            title="Demostración: cambio de layout sin desarrollo mayor"
          />
          <p className="mb-5 max-w-2xl text-sm text-[var(--text-muted)]">
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

import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="Error 404"
        title="Página no encontrada"
        description="El enlace que busca no existe o cambió con la renovación del portal. Use el buscador o vuelva al inicio."
        image="/headers/campo.jpg"
        imagePos="50% 55%"
        breadcrumbs={[{ label: "Página no encontrada" }]}
      />
      <Container className="flex flex-wrap gap-3 py-14 sm:py-20">
        <Button href="/">Ir al inicio</Button>
        <Button href="/buscador" variant="secondary">Buscar en el portal</Button>
        <Button href="/noticias" variant="secondary">Ver noticias</Button>
        <Button href="/contacto" variant="ghost">Contacto</Button>
      </Container>
    </>
  );
}

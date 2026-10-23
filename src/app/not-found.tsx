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
        image="/headers/ia-404.jpg"
        imagePos="50% 50%"
        breadcrumbs={[{ label: "Página no encontrada" }]}
      />
      <Container className="flex flex-wrap gap-3 py-8 sm:py-12">
        <Button href="/">Ir al inicio</Button>
        <Button href="/buscador" variant="secondary">Buscar en el portal</Button>
        <Button href="/noticias" variant="secondary">Ver noticias</Button>
        <Button href="/contacto" variant="ghost">Contacto</Button>
      </Container>
    </>
  );
}

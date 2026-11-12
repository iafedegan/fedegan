import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormularioPublico } from "@/components/formularios/FormularioPublico";
import { formularioPublico } from "@/lib/cms/formularios";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = await formularioPublico(slug);
  return { title: f?.title ?? "Formulario", description: f?.description || undefined, robots: { index: false } };
}

export default async function FormularioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await formularioPublico(slug);
  if (!f || !f.published) notFound();
  return (
    <>
      <PageHeader eyebrow="Formulario" title={f.title} breadcrumbs={[{ label: f.title }]} />
      <Container className="py-5 sm:py-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#dcdcd6] bg-white p-6 shadow-sm sm:p-8">
          {f.description && <p className="mb-6 whitespace-pre-line leading-relaxed text-[#44564a]">{f.description}</p>}
          {f.status === "cerrado" ? (
            <div role="status" className="flex flex-col items-center gap-3 py-10 text-center">
              <Lock size={36} className="text-[#8a978f]" aria-hidden />
              <p className="text-lg font-bold text-[#10240f]">Este formulario ya no recibe respuestas.</p>
            </div>
          ) : (
            <FormularioPublico slug={f.slug} esquema={f.published} />
          )}
        </div>
      </Container>
    </>
  );
}

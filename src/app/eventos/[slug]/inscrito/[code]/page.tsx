import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getEvent } from "@/lib/cms/content";
import { inscripcionPorCodigo } from "@/lib/cms/inscripciones";
import { qrSvg } from "@/lib/lms/qr";

export const metadata: Metadata = { title: "Inscripción confirmada", robots: { index: false } };

export default async function InscritoPage({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const { slug, code } = await params;
  const [event, ins] = await Promise.all([getEvent(slug), inscripcionPorCodigo(code)]);
  if (!event || !ins || ins.event_slug !== slug) notFound();
  const qr = await qrSvg(ins.code);
  return (
    <>
      <PageHeader eyebrow={event.kind} title="¡Inscripción confirmada!" breadcrumbs={[{ label: "Eventos", href: "/eventos" }, { label: event.title, href: `/eventos/${slug}` }, { label: "Inscripción" }]} />
      <Container className="py-8">
        <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-[#dcdcd6] bg-white p-8 text-center shadow-sm">
          <CheckCircle2 size={36} className="text-[#3d7a22]" aria-hidden />
          <div>
            <p className="text-lg font-bold text-[#10240f]">{ins.name}</p>
            <p className="text-sm text-[#5d6e65]">{event.title} · {event.day} {event.month} · {event.time}</p>
          </div>
          <div className="w-48 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label={`Código QR ${ins.code}`} />
          <p className="font-mono text-2xl font-bold tracking-widest text-[#10240f]">{ins.code}</p>
          <p className="text-sm text-[#5d6e65]">Guarde esta página o tome una captura: presente el QR o el código al ingresar.</p>
          <Link href={`/eventos/${slug}`} className="text-sm font-semibold text-[#165a43] underline">Volver al evento</Link>
        </div>
      </Container>
    </>
  );
}

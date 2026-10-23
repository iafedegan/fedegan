import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/lms/PrintButton";
import { getCourse, getEnrollment, getLearner } from "@/lib/lms/queries";
import { qrSvg, siteOrigin } from "@/lib/lms/qr";

export const metadata: Metadata = { title: "Certificado", robots: { index: false } };

export default async function CertificatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course || !course.certificate) notFound();
  const me = await getLearner();
  if (!me) redirect(`/ingresar?callbackUrl=${encodeURIComponent(`/escuela-virtual/${slug}/certificado`)}`);
  const enrollment = await getEnrollment(course.id, me.key);
  if (!enrollment?.completedAt || !enrollment.code) redirect(`/escuela-virtual/${slug}`);
  const verifyUrl = `${await siteOrigin()}/escuela-virtual/verificar/${enrollment.code}`;
  const qr = await qrSvg(verifyUrl);
  const hours = course.minutes ? `${Math.floor(course.minutes / 60)} h ${course.minutes % 60} min` : "";
  const date = new Date(enrollment.completedAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-10">
      <div className="flex w-full items-center justify-between print:hidden">
        <Link href={`/escuela-virtual/${slug}`} className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]">← Volver al curso</Link>
        <PrintButton />
      </div>
      <article className="relative w-full overflow-hidden rounded-[0.5rem] border-[10px] border-double border-[#b08f4f] bg-[#fbf8ee] p-8 text-center text-[#11271d] shadow-[var(--shadow-lg)] sm:p-14 print:shadow-none">
        <Image src="/brand/ucg-escudo.svg" alt="Escudo UCG" width={1893} height={2385} unoptimized className="mx-auto h-24 w-auto" />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-[#8a6d2f]">Escuela Virtual · FEDEGÁN–FNG</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl font-bold sm:text-5xl">Certificado de finalización</h1>
        <p className="mt-8 text-lg text-[#4a5a52]">Se certifica que</p>
        <p className="mt-2 font-[var(--font-display)] text-3xl font-bold italic sm:text-4xl">{me.name}</p>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#4a5a52]">completó satisfactoriamente el curso</p>
        <p className="mx-auto mt-2 max-w-2xl font-[var(--font-display)] text-2xl font-bold sm:text-3xl">{course.title}</p>
        <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-6 border-t border-[#d8cfae] pt-6 text-sm">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a6d2f]">Fecha</p><p className="mt-1 font-semibold">{date}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a6d2f]">Código</p><p className="mt-1 font-mono font-semibold">{enrollment.code}</p></div>
        </div>
        {hours && <p className="mt-6 text-sm text-[#4a5a52]">Intensidad: {hours} de video · {course.lessons} lecciones</p>}
        <div className="mx-auto mt-6 flex max-w-xl items-center justify-between gap-4 text-left">
          <div>
            {course.instructor && <p className="text-sm text-[#4a5a52]">Instructor: {course.instructor}</p>}
            <p className="mt-1 text-xs text-[#4a5a52]">Verifique este certificado escaneando el código QR o con el código {enrollment.code} en {verifyUrl.replace(/\/[A-Z0-9-]+$/i, "")}</p>
          </div>
          <div className="h-20 w-20 shrink-0" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="Código QR de verificación" />
        </div>
      </article>
    </div>
  );
}

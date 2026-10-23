import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLearner, getMyCourses } from "@/lib/lms/queries";

export const metadata: Metadata = { title: "Mis cursos", robots: { index: false } };

export default async function MyCoursesPage() {
  const me = await getLearner();
  if (!me) redirect(`/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/mis-cursos")}`);
  const mine = await getMyCourses(me.key);
  return (
    <>
      <PageHeader eyebrow="Escuela Virtual" title="Mis cursos" description="Su avance, los cursos en marcha y los certificados que ya obtuvo." image="/locales/sig.jpg" breadcrumbs={[{ label: "Escuela Virtual", href: "/escuela-virtual" }, { label: "Mis cursos" }]} />
      <Container className="py-10">
        {mine.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] p-10 text-center">
            <p className="text-[var(--text-muted)]">Todavía no se ha inscrito a ningún curso.</p>
            <Link href="/escuela-virtual" className="mt-4 inline-block font-bold text-[var(--fg-lime-400)] hover:underline">Explorar los cursos →</Link>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {mine.map(({ course, percent, done, completedAt }) => (
              <li key={course.id} className="mx-card flex gap-4 !p-4">
                <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-[0.5rem]">{course.cover && <Image src={course.cover} alt="" fill sizes="9rem" className="object-cover" />}</div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link href={`/escuela-virtual/${course.slug}/aula`} className="font-[var(--font-display)] text-lg font-bold leading-snug text-[var(--text)] hover:text-[var(--fg-lime-400)]">{course.title}</Link>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]"><span className="block h-full bg-[var(--fg-lime-500)]" style={{ width: `${percent}%` }} /></div>
                  <p className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--text-faint)]">{done} de {course.lessons} lecciones · {percent} %
                    {completedAt && course.certificate && <Link href={`/escuela-virtual/${course.slug}/certificado`} className="inline-flex items-center gap-1 font-bold text-[var(--fg-lime-400)] hover:underline"><Award size={13} /> Certificado</Link>}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

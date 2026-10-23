import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";
import { CatalogExplorer, type CatalogCourse } from "@/components/lms/CatalogExplorer";
import { LEVELS, getCourses, getLearner } from "@/lib/lms/queries";
import { CtaBand, Section } from "@/components/ui/Editorial";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Escuela Virtual" };

const MPG_URL = "https://mpg.fedegan.org.co/";
const ACCENTS = ["92,205,134", "216,181,88", "230,160,108", "112,214,196"];

export default async function EscuelaVirtualPage() {
  const all = await getCourses();
  const courses: CatalogCourse[] = all.map((c, i) => ({
    slug: c.slug, title: c.title, subtitle: c.subtitle, category: c.category, level: c.level, levelLabel: LEVELS[c.level], cover: c.cover,
    href: c.externalUrl && !c.lessons ? c.externalUrl : `/escuela-virtual/${c.slug}`, external: Boolean(c.externalUrl && !c.lessons),
    lessons: c.lessons, minutes: c.minutes, videos: c.externalVideos, rating: c.rating, ratings: c.ratings, accent: ACCENTS[i % ACCENTS.length],
  }));
  const videos = all.reduce((a, c) => a + c.externalVideos + c.lessons, 0);
  const learner = await getLearner();
  return (
    <>
      <PageHeader
        eyebrow="Formación"
        title="Escuela Virtual FEDEGÁN"
        description="Capacitación técnica y gerencial para productores, técnicos y profesionales del sector ganadero colombiano."
        image="/locales/sig.jpg"
        imagePos="45% 50%"
        meta={`${courses.length} cursos${videos ? ` · ${videos} videos` : ""}`}
        breadcrumbs={[{ label: "Escuela Virtual" }]}
      />

      <Section>
        <div className="relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-strong)]">
          <Image src="/locales/publicaciones.jpg" alt="" fill sizes="(min-width: 1280px) 1200px, 100vw" className="-z-10 -scale-x-100 object-cover" style={{ objectPosition: "50% 100%" }} />
          <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,16,11,0.94)_0%,rgba(5,16,11,0.78)_50%,rgba(5,16,11,0.35)_100%)]" />
          <Image
            src="/brand/mascota-beto.svg"
            alt="Beto, la mascota de la UCG, saluda con un diploma bajo el brazo"
            width={1080}
            height={1455}
            unoptimized
            className="pointer-events-none absolute bottom-0 right-4 hidden h-[94%] w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] md:block lg:right-16"
          />
          <div className="flex flex-col items-start gap-6 p-7 sm:p-10 lg:max-w-2xl">
            <Image src="/brand/ucg-escudo.svg" alt="Escudo de la UCG" width={1893} height={2385} unoptimized className="h-24 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)]" />
            <div>
              <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl">Aprenda a su ritmo, desde la finca</h2>
              <p className="mt-3 text-lg leading-relaxed text-[var(--text-muted)]">
                Los 11 cursos del Manual Práctico Ganadero: más de 40 horas y 165 videos sobre ganadería bovina y bufalina tropical, con lenguaje sencillo y total rigurosidad técnica.
              </p>
            </div>
            <Button variant="lime" href={MPG_URL} external>Ir a la plataforma →</Button>
          </div>
        </div>
      </Section>

      <Section eyebrow="Catálogo" title={`Los ${courses.length} cursos`} tinted>
        {learner && (
          <p className="-mt-2 mb-6 text-sm">
            <Link href="/escuela-virtual/mis-cursos" className="font-bold text-[var(--fg-lime-400)] hover:underline">Ver mis cursos y mi avance →</Link>
          </p>
        )}
        <CatalogExplorer courses={courses} />
      </Section>

      <CtaBand
        eyebrow="Acompañamiento"
        title="¿Dudas sobre su inscripción o los cursos?"
        actions={[
          { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
          { label: "Contacto", href: "/contacto" },
        ]}
      />
    </>
  );
}

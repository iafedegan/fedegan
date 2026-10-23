import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";
import { CatalogExplorer, type CatalogCourse } from "@/components/lms/CatalogExplorer";
import { LEVELS, getCourses, getLearner } from "@/lib/lms/queries";
import { CtaBand, Section } from "@/components/ui/Editorial";

export const metadata: Metadata = { title: "Escuela Virtual" };

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

      <Section eyebrow="Catálogo" title={`Los ${courses.length} cursos`} tinted>
        {learner && (
          <p className="-mt-2 mb-6 text-sm">
            <Link href="/escuela-virtual/perfil" className="font-bold text-[var(--fg-lime-400)] hover:underline">Mi perfil y mi avance →</Link>
            <span className="mx-2 text-[var(--text-faint)]">·</span>
            <Link href="/escuela-virtual/carnet" className="font-bold text-[var(--fg-lime-400)] hover:underline">Mi carnet →</Link>
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

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { CatalogExplorer, type CatalogCourse } from "@/components/lms/CatalogExplorer";
import { LEVELS, getCourses, getLearner, getMyCourses } from "@/lib/lms/queries";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CtaBand, Section } from "@/components/ui/Editorial";

export const metadata: Metadata = { title: "Cursos" };

// Las categorías de cada curso se agrupan en pocas áreas para que el filtro no tenga una etiqueta por curso.
const AREAS: Record<string, string> = {
  Fundamentos: "Fundamentos y gestión", Administración: "Fundamentos y gestión", "Calidad y certificación": "Fundamentos y gestión",
  "Nutrición y praderas": "Alimentación y ambiente", Sostenibilidad: "Alimentación y ambiente",
  Sanidad: "Sanidad y genética", "Genética y reproducción": "Sanidad y genética", Razas: "Sanidad y genética",
  Producción: "Producción y mercados", Productos: "Producción y mercados", Bufalinos: "Producción y mercados",
};
const ACCENTS = ["92,205,134", "216,181,88", "230,160,108", "112,214,196"];

export default async function EscuelaVirtualPage() {
  const all = await getCourses();
  const learner = await getLearner();
  const mine = learner ? await getMyCourses(learner.key) : [];
  const courses: CatalogCourse[] = all.map((c, i) => ({
    slug: c.slug, title: c.title, subtitle: c.subtitle, category: c.category, area: AREAS[c.category] ?? c.category, progress: mine.find((m) => m.course.id === c.id)?.percent, level: c.level, levelLabel: LEVELS[c.level], cover: c.cover,
    href: c.externalUrl && !c.lessons ? c.externalUrl : `/escuela-virtual/${c.slug}`, external: Boolean(c.externalUrl && !c.lessons),
    lessons: c.lessons, minutes: c.minutes, videos: c.videos || c.externalVideos, rating: c.rating, ratings: c.ratings, accent: ACCENTS[i % ACCENTS.length],
  }));
  const videos = all.reduce((a, c) => a + (c.videos || c.externalVideos), 0);
  const hours = Math.round(all.reduce((a, c) => a + c.minutes, 0) / 60);
  return (
    <>
      <PageHeader
        eyebrow="Formación"
        title="Escuela Virtual UCG"
        image="/headers/ia-escuela.jpg"
        imagePos="50% 50%"
        meta={`${courses.length} cursos${videos ? ` · ${videos} videos` : ""}`}
        root={{ label: "UCG", href: "/escuela-virtual" }}
        breadcrumbs={[{ label: "Cursos" }]}
      />

      <section aria-labelledby="intro" className="relative overflow-hidden">
        <span aria-hidden className="pointer-events-none absolute -right-24 top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(216,181,88,0.16),transparent)]" />
        <Container className="relative grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div className="flex flex-col items-start gap-6">
            <Image src="/brand/ucg-escudo.svg" alt="Escudo de la UCG" width={1893} height={2385} unoptimized className="h-20 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)] sm:h-24" />
            <div>
              <h2 id="intro" className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)] sm:text-5xl">Aprenda a su ritmo, desde la finca</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">
                Los cursos del Manual Práctico Ganadero, en lenguaje sencillo y con total rigurosidad técnica: estudie desde el celular, evalúe lo aprendido, obtenga su certificado y su carnet de estudiante.
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-8 gap-y-3" aria-label="El programa en cifras">
              {[[courses.length, "cursos"], [videos, "videos"], [`${hours} h`, "de contenido"], ["Gratis", "con certificado"]].map(([n, l]) => (
                <li key={String(l)} className="flex items-baseline gap-2"><b className="font-[var(--font-display)] text-3xl font-bold text-[var(--fg-lime-400)]">{n}</b><span className="text-sm text-[var(--text-muted)]">{l}</span></li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="lime" href={learner ? "/escuela-virtual/perfil" : `/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/perfil")}`}>
                Entrar a la plataforma →
              </Button>
              <a href="#catalogo" className="inline-flex min-h-11 items-center px-3 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]">Ver los cursos ↓</a>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image src="/brand/mascota-beto.svg" alt="Beto, la mascota de la UCG, saluda con un diploma bajo el brazo" width={1080} height={1455} unoptimized priority className="h-64 w-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)] sm:h-80 lg:h-[26rem]" />
          </div>
        </Container>
      </section>

      <Section id="catalogo" eyebrow="Catálogo" title={`Los ${courses.length} cursos`} tinted>
        {!learner && (
          <p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-solid)] px-5 py-4 text-sm text-[var(--text-muted)]">
            <span>Puede explorar todos los cursos. Para estudiar, evaluarse y obtener su certificado, ingrese con su cuenta: es gratis.</span>
            <Link href={`/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/perfil")}`} className="font-bold uppercase tracking-[0.1em] text-[var(--fg-lime-400)] hover:underline">Ingresar →</Link>
          </p>
        )}
        <CatalogExplorer courses={courses} loggedIn={Boolean(learner)} />
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

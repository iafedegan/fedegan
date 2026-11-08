import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Award, BadgeCheck, BookOpen, Clock, GraduationCap, PlayCircle, Smartphone } from "lucide-react";
import { CatalogExplorer, type CatalogCourse } from "@/components/lms/CatalogExplorer";
import { LEVELS, getCourses, getLearner, getMyCourses } from "@/lib/lms/queries";
import { Container } from "@/components/ui/Container";
import { CtaBand } from "@/components/ui/Editorial";

export const metadata: Metadata = { title: "Cursos" };

// Las categorías de cada curso se agrupan en pocas áreas para que el filtro no tenga una etiqueta por curso.
const AREAS: Record<string, string> = {
  Fundamentos: "Fundamentos y gestión", Administración: "Fundamentos y gestión", "Calidad y certificación": "Fundamentos y gestión",
  "Nutrición y praderas": "Alimentación y ambiente", Sostenibilidad: "Alimentación y ambiente",
  Sanidad: "Sanidad y genética", "Genética y reproducción": "Sanidad y genética", Razas: "Sanidad y genética",
  Producción: "Producción y mercados", Productos: "Producción y mercados", Bufalinos: "Producción y mercados",
};
const ACCENTS = ["92,205,134", "216,181,88", "230,160,108", "112,214,196"];

const PASOS = [
  { Icono: BookOpen, titulo: "Elija un curso", texto: "Explore el catálogo por tema y nivel. Todos son gratuitos y se pueden ver sin registrarse." },
  { Icono: Smartphone, titulo: "Estudie a su ritmo", texto: "Videos y lecciones cortas en lenguaje sencillo, desde el celular y sin horarios." },
  { Icono: Award, titulo: "Evalúese y certifíquese", texto: "Presente la evaluación, descargue su certificado y obtenga su carnet de estudiante." },
];

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
  // «Continúe donde quedó»: los cursos empezados y sin terminar, el más reciente primero.
  const enCurso = mine.filter((m) => m.percent < 100).slice(0, 3);
  const entrar = learner ? "/escuela-virtual/perfil" : `/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/perfil")}`;
  const cifras = [
    { Icono: GraduationCap, valor: String(courses.length), texto: "cursos para elegir" },
    { Icono: PlayCircle, valor: String(videos), texto: "videos explicados" },
    { Icono: Clock, valor: `${hours} h`, texto: "de contenido" },
    { Icono: BadgeCheck, valor: "Gratis", texto: "con certificado" },
  ];

  return (
    <>
      {/* Portada */}
      <section aria-labelledby="intro" className="ev-hero relative overflow-hidden">
        <span aria-hidden className="ev-blob ev-blob-a" />
        <span aria-hidden className="ev-blob ev-blob-b" />
        <Container className="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:py-20">
          <div className="flex flex-col items-start gap-7">
            <span className="ev-pill">
              <Image src="/brand/ucg-escudo.svg" alt="" width={1893} height={2385} unoptimized className="h-6 w-auto" />
              Universidad Ganadera · Escuela Virtual
            </span>
            <div>
              <h1 id="intro" className="ev-title">
                Aprenda <span>a su ritmo,</span> desde la finca
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#3a4a38]">
                Los cursos del Manual Práctico Ganadero, en lenguaje sencillo y con total rigurosidad técnica: estudie desde el celular, evalúe lo aprendido, obtenga su certificado y su carnet de estudiante.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={entrar} className="ev-btn ev-btn-main">
                {learner ? "Ir a mi perfil" : "Entrar a la plataforma"} <ArrowRight size={18} aria-hidden />
              </Link>
              <a href="#catalogo" className="ev-btn ev-btn-ghost">
                Ver los cursos <ArrowDown size={18} aria-hidden />
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#2c3a2a]" aria-label="Lo que incluye">
              {["Sin costo", "Certificado al aprobar", "Carnet de estudiante", "Desde el celular"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5"><BadgeCheck size={16} className="text-[#3d7a22]" aria-hidden /> {t}</li>
              ))}
            </ul>
          </div>

          <div className="ev-mascota">
            <span aria-hidden className="ev-mascota-fondo" />
            <Image src="/brand/mascota-beto.svg" alt="Beto, la mascota de la UCG, saluda con un diploma bajo el brazo" width={1080} height={1455} unoptimized priority className="relative h-72 w-auto drop-shadow-[0_22px_30px_rgba(10,25,60,0.35)] sm:h-96 lg:h-[27rem]" />
            <span className="ev-flota ev-flota-a"><PlayCircle size={18} aria-hidden /> {videos} videos</span>
            <span className="ev-flota ev-flota-b"><Award size={18} aria-hidden /> Certificado</span>
          </div>
        </Container>

        <Container className="relative pb-10 sm:pb-12">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="El programa en cifras">
            {cifras.map(({ Icono, valor, texto }) => (
              <li key={texto} className="ev-cifra">
                <span className="ev-cifra-ico"><Icono size={20} aria-hidden /></span>
                <span><b>{valor}</b><small>{texto}</small></span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {enCurso.length > 0 && (
        <section aria-labelledby="continuar" className="bg-white pb-2 pt-10 sm:pt-12">
          <Container>
            <h2 id="continuar" className="font-[var(--font-display)] text-2xl font-bold text-[#10240f] sm:text-3xl">Continúe donde quedó</h2>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {enCurso.map((m) => (
                <li key={m.course.id}>
                  <Link href={`/escuela-virtual/${m.course.slug}`} className="ev-sigue">
                    <span className="ev-sigue-ico"><PlayCircle size={22} aria-hidden /></span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate font-[var(--font-display)] text-base font-bold text-[#10240f]">{m.course.title}</strong>
                      <span className="mt-2 flex items-center gap-3">
                        <span className="ev-sigue-barra" role="progressbar" aria-valuenow={m.percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Avance de ${m.course.title}`}><i style={{ width: `${Math.max(4, m.percent)}%` }} /></span>
                        <small className="text-xs font-bold text-[#3d7a22]">{m.percent} %</small>
                      </span>
                    </span>
                    <ArrowRight size={18} aria-hidden className="shrink-0 text-[#3d7a22]" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Cómo funciona */}
      <section aria-labelledby="como" className="bg-white py-12 sm:py-16">
        <Container>
          <header className="mx-auto mb-9 max-w-2xl text-center">
            <span className="ev-eyebrow">Cómo funciona</span>
            <h2 id="como" className="mt-2 font-[var(--font-display)] text-3xl font-bold leading-tight text-[#10240f] sm:text-4xl">Tres pasos para aprender y certificarse</h2>
          </header>
          <ol className="grid gap-5 md:grid-cols-3">
            {PASOS.map(({ Icono, titulo, texto }, i) => (
              <li key={titulo} className="ev-paso">
                <span className="ev-paso-num" aria-hidden>{i + 1}</span>
                <span className="ev-paso-ico"><Icono size={24} aria-hidden /></span>
                <h3 className="mt-4 font-[var(--font-display)] text-xl font-bold text-[#10240f]">{titulo}</h3>
                <p className="mt-2 leading-relaxed text-[#4a5a48]">{texto}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="ev-catalogo py-12 sm:py-16">
        <Container>
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="ev-eyebrow">Catálogo</span>
              <h2 className="mt-2 font-[var(--font-display)] text-3xl font-bold leading-tight text-[#10240f] sm:text-4xl">Los {courses.length} cursos</h2>
            </div>
            {!learner && (
              <p className="max-w-md text-sm leading-relaxed text-[#4a5a48]">
                Puede explorar todos los cursos. Para estudiar y obtener su certificado,{" "}
                <Link href={entrar} className="font-bold text-[#2c6a14] underline underline-offset-4">ingrese con su cuenta</Link>: es gratis.
              </p>
            )}
          </header>
          <CatalogExplorer courses={courses} loggedIn={Boolean(learner)} />
        </Container>
      </section>

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

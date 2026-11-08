"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Clock, PlayCircle, Search, SearchX, X } from "lucide-react";

export type CatalogCourse = {
  slug: string; title: string; subtitle: string; category: string; area: string; progress?: number; level: string; levelLabel: string; cover: string | null;
  href: string; external: boolean; lessons: number; minutes: number; videos: number; rating: number; ratings: number; accent: string;
};

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);
const NIVEL = [["basico", "Básico"], ["intermedio", "Intermedio"], ["avanzado", "Avanzado"]] as const;

/** Catálogo con buscador y filtros por área y nivel, en tarjetas con portada, datos del curso y avance. */
export function CatalogExplorer({ courses }: { courses: CatalogCourse[]; loggedIn?: boolean }) {
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [level, setLevel] = useState("");
  const areas = useMemo(() => [...new Set(courses.map((c) => c.area))], [courses]);
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const list = courses.filter((c) => (!area || c.area === area) && (!level || c.level === level) && (!q || norm(`${c.title} ${c.subtitle} ${c.category}`).includes(norm(q))));
  const hayFiltro = Boolean(q || area || level);
  const cuenta = (f: (c: CatalogCourse) => boolean) => courses.filter(f).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="ev-buscar">
        <Search size={20} aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué quiere aprender? Busque un curso…" aria-label="Buscar cursos" />
        {q && <button type="button" onClick={() => setQ("")} aria-label="Borrar la búsqueda"><X size={16} aria-hidden /></button>}
      </div>

      <div className="flex flex-col gap-3" role="group" aria-label="Filtros">
        <div className="ev-chips">
          <button type="button" onClick={() => setArea("")} className={`ev-chip ${!area ? "on" : ""}`}>Todas las áreas <small>{courses.length}</small></button>
          {areas.map((a) => (
            <button key={a} type="button" onClick={() => setArea(area === a ? "" : a)} className={`ev-chip ${area === a ? "on" : ""}`}>{a} <small>{cuenta((c) => c.area === a)}</small></button>
          ))}
        </div>
        <div className="ev-chips">
          <span className="ev-chips-t"><BarChart3 size={14} aria-hidden /> Nivel</span>
          {NIVEL.filter(([v]) => courses.some((c) => c.level === v)).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setLevel(level === v ? "" : v)} className={`ev-chip ev-chip-sm ${level === v ? "on" : ""}`}>{l}</button>
          ))}
          {hayFiltro && <button type="button" onClick={() => { setQ(""); setArea(""); setLevel(""); }} className="ev-limpiar">Limpiar filtros</button>}
        </div>
      </div>

      <p className="text-sm font-semibold text-[#5d6e65]" aria-live="polite">{list.length} {list.length === 1 ? "curso" : "cursos"}{hayFiltro ? " con esos filtros" : ""}</p>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-[#cfd8c8] bg-white px-6 py-14 text-center">
          <SearchX size={28} className="text-[#8a978f]" aria-hidden />
          <p className="font-semibold text-[#10240f]">No encontramos cursos con ese criterio</p>
          <button type="button" onClick={() => { setQ(""); setArea(""); setLevel(""); }} className="ev-limpiar">Ver todos los cursos</button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const inscrito = c.progress !== undefined;
            const terminado = inscrito && (c.progress ?? 0) >= 100;
            const cuerpo = (
              <>
                <span className="ev-curso-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.cover ?? "/locales/programas.jpg"} alt="" loading="lazy" />
                  <span className="ev-curso-nivel">{c.levelLabel}</span>
                  {terminado && <span className="ev-curso-ok"><CheckCircle2 size={14} aria-hidden /> Terminado</span>}
                  {inscrito && !terminado && <span className="ev-curso-ok ev-curso-ins">Inscrito</span>}
                </span>
                <span className="ev-curso-cuerpo">
                  <span className="ev-curso-area">{c.area}</span>
                  <strong className="ev-curso-titulo">{c.title}</strong>
                  <span className="ev-curso-texto">{c.subtitle}</span>
                  <span className="ev-curso-datos">
                    {c.videos > 0 && <span><PlayCircle size={14} aria-hidden /> {c.videos} videos</span>}
                    {c.lessons > 0 && <span><BookOpen size={14} aria-hidden /> {c.lessons} lecciones</span>}
                    {c.minutes > 0 && <span><Clock size={14} aria-hidden /> {fmtMin(c.minutes)}</span>}
                  </span>
                  {inscrito && !terminado && (
                    <span className="ev-curso-avance" aria-label={`Avance: ${c.progress} %`}>
                      <span><i style={{ width: `${Math.max(4, c.progress ?? 0)}%` }} /></span>
                      <small>Inscrito · {c.progress} %</small>
                    </span>
                  )}
                  <span className="ev-curso-cta">{inscrito ? (terminado ? "Repasar el curso" : "Continuar") : "Ver el curso"} <ArrowRight size={16} aria-hidden /></span>
                </span>
              </>
            );
            return (
              <li key={c.slug} className="h-full">
                {c.external ? (
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className="ev-curso">{cuerpo}</a>
                ) : (
                  <Link href={c.href} className="ev-curso">{cuerpo}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

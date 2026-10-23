"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PhotoCard } from "@/components/ui/PhotoCard";

export type CatalogCourse = {
  slug: string; title: string; subtitle: string; category: string; level: string; levelLabel: string; cover: string | null;
  href: string; external: boolean; lessons: number; minutes: number; videos: number; rating: number; ratings: number; accent: string;
};

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`);

/** Catálogo con buscador y filtros por categoría y nivel (como Udemy/Platzi). */
export function CatalogExplorer({ courses }: { courses: CatalogCourse[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [level, setLevel] = useState("");
  const cats = useMemo(() => [...new Set(courses.map((c) => c.category))], [courses]);
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const list = courses.filter((c) => (!cat || c.category === cat) && (!level || c.level === level) && (!q || norm(`${c.title} ${c.subtitle} ${c.category}`).includes(norm(q))));
  const chip = (on: boolean) => `rounded-full border px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.1em] transition-colors ${on ? "border-[var(--fg-lime-500)] bg-[var(--fg-lime-500)] text-[#0a1a11]" : "border-[var(--border-strong)] text-[var(--text-muted)] hover:text-[var(--text)]"}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-lime-500)]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué quiere aprender? Busque un curso…" aria-label="Buscar cursos" className="w-full rounded-full border border-[var(--border-strong)] bg-[var(--surface-solid)] py-3 pl-11 pr-4 text-[var(--text)] outline-none focus:border-[var(--fg-lime-500)]" />
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtros">
        <button type="button" onClick={() => { setCat(""); setLevel(""); }} className={chip(!cat && !level)}>Todos</button>
        {cats.map((c) => <button key={c} type="button" onClick={() => setCat(cat === c ? "" : c)} className={chip(cat === c)}>{c}</button>)}
        <span aria-hidden className="mx-1 h-5 w-px bg-[var(--border-strong)]" />
        {[["basico", "Básico"], ["intermedio", "Intermedio"], ["avanzado", "Avanzado"]].filter(([v]) => courses.some((c) => c.level === v)).map(([v, l]) => (
          <button key={v} type="button" onClick={() => setLevel(level === v ? "" : v)} className={chip(level === v)}>{l}</button>
        ))}
      </div>
      <p className="text-sm text-[var(--text-faint)]" aria-live="polite">{list.length} {list.length === 1 ? "curso" : "cursos"}</p>
      {list.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] p-10 text-center text-[var(--text-muted)]">No encontramos cursos con ese criterio.</p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => (
            <li key={c.slug} className="h-full">
              <PhotoCard
                image={c.cover ?? "/locales/programas.jpg"}
                accent={c.accent}
                kicker={[c.levelLabel, c.videos ? `${c.videos} videos` : c.lessons ? `${c.lessons} lecciones` : "", c.minutes ? fmtMin(c.minutes) : ""].filter(Boolean).join(" · ")}
                title={c.title}
                text={c.subtitle}
                href={c.href}
                external={c.external}
                cta="Ver el curso"
                badge={<span className="wc-badge wc-badge-glyph"><small>Curso</small>{String(i + 1).padStart(2, "0")}</span>}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

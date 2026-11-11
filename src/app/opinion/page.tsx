import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { NewsUnavailable } from "@/components/blocks/NewsUnavailable";
import { getOpinion } from "@/lib/contexto";

export const metadata: Metadata = { title: "Opinión", description: "Columnas, editoriales y columnistas de CONtexto Ganadero." };

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const PAGE = 24;

type Params = { autor?: string; anio?: string; mes?: string; n?: string };

export default async function OpinionPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { autor = "", anio = "", mes = "", n = "" } = await searchParams;
  const year = /^\d{4}$/.test(anio) ? Number(anio) : null;
  const month = /^(?:[1-9]|1[0-2])$/.test(mes) ? Number(mes) : null;
  const mostrar = Math.min(Math.max(Number(n) || PAGE, PAGE), 240);

  // Con año (y mes) se pide desde el final de ese periodo hacia atrás.
  let hasta: string | undefined;
  let desde: number | null = null;
  if (year) {
    const m0 = month ? month - 1 : 0;
    desde = Date.UTC(year, m0, 1);
    hasta = new Date(month ? Date.UTC(year, m0 + 1, 1) : Date.UTC(year + 1, 0, 1)).toISOString();
  }
  const { ok, items } = await getOpinion({ hasta, paginas: year ? 2 : autor ? 4 : 3 });

  const dentro = items.filter((x) => {
    if (!x.publishedAt) return false;
    const t = Date.parse(x.publishedAt);
    if (hasta && t >= Date.parse(hasta)) return false;
    if (desde !== null && t < desde) return false;
    return true;
  });
  const autores = [...new Set(dentro.map((x) => x.author))].sort((a, b) => a.localeCompare(b, "es"));
  const lista = autor ? dentro.filter((x) => x.author === autor) : dentro;
  const visibles = lista.slice(0, mostrar);
  const yearNow = new Date().getFullYear();
  const anios = Array.from({ length: yearNow - 2012 + 1 }, (_, i) => yearNow - i);

  const sel = "w-full rounded-[0.25rem] border border-[var(--border-strong)] bg-[var(--bg)] px-4 py-3 text-[var(--text)] outline-none focus:border-[var(--fg-lime-500)]";
  const lab = "mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--text-faint)]";

  return (
    <Container className="py-10 sm:py-14">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-[var(--fg-lime-400)]">◆ Sección</p>
      <h1 className="font-[var(--font-display)] text-5xl font-bold text-[var(--fg-lime-400)] sm:text-6xl">Opinión</h1>
      <p className="mt-3 text-lg text-[var(--text-muted)]">Columnas, editoriales y columnistas.</p>
      <div className="mt-6 border-t border-[var(--border)]" />

      <form method="get" action="/opinion" className="mt-8 grid gap-4 rounded-[0.25rem] border border-[var(--border)] bg-[var(--surface-2)] p-5 md:grid-cols-[1.6fr_1fr_1fr_auto] md:items-end">
        <label>
          <span className={lab}>Nombre autor</span>
          <select name="autor" defaultValue={autor} className={sel}>
            <option value="">Seleccione un autor</option>
            {autores.map((a) => <option key={a} value={a}>{a}</option>)}
            {autor && !autores.includes(autor) && <option value={autor}>{autor}</option>}
          </select>
        </label>
        <label>
          <span className={lab}>Año</span>
          <select name="anio" defaultValue={anio} className={sel}>
            <option value="">Año</option>
            {anios.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label>
          <span className={lab}>Mes</span>
          <select name="mes" defaultValue={mes} className={sel}>
            <option value="">Seleccione un mes</option>
            {MESES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
        <div className="flex gap-3">
          <button type="submit" className="rounded-full bg-[var(--fg-lime-500)] px-7 py-3 text-sm font-bold text-[#0a1a11] transition-opacity hover:opacity-90">Buscar</button>
          {(autor || anio || mes) && <Link href="/opinion" className="self-center text-sm font-semibold text-[var(--text-muted)] underline">Limpiar</Link>}
        </div>
      </form>

      {!ok ? (
        <div className="mt-10"><NewsUnavailable /></div>
      ) : visibles.length === 0 ? (
        <p className="mt-10 text-[var(--text-muted)]">No hay columnas para esa búsqueda.</p>
      ) : (
        <>
          <ul className="mt-10 grid gap-x-16 md:grid-cols-2">
            {visibles.map((x) => (
              <li key={x.slug} className="border-b border-[var(--border)] py-6">
                <Link href={`/noticias/${x.slug}`} className="group flex items-start gap-5">
                  {x.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={x.image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-full border border-[var(--border-strong)] object-cover" />
                  ) : (
                    <span aria-hidden className="h-20 w-20 shrink-0 rounded-full bg-[var(--surface-2)]" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--fg-lime-400)]">{x.author}</span>
                    <span className="mt-1 block font-[var(--font-display)] text-2xl font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)]">{x.title}</span>
                    <span className="mt-2 block text-sm text-[var(--text-muted)]">{x.date}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {lista.length > visibles.length && (
            <div className="mt-10 text-center">
              <Link
                href={`/opinion?${new URLSearchParams({ ...(autor && { autor }), ...(anio && { anio }), ...(mes && { mes }), n: String(mostrar + PAGE) })}`}
                className="inline-block rounded-full border border-[var(--border-strong)] px-7 py-3 text-sm font-bold text-[var(--text)] transition-colors hover:border-[var(--fg-lime-500)]"
              >
                Ver más columnas
              </Link>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

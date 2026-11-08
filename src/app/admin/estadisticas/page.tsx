import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight, CloudDownload, FileCode2, Trash2 } from "lucide-react";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { cmsWritable } from "@/lib/cms/client";
import { getEditor } from "@/lib/cms/guard";
import { getConjuntos, slugConjunto } from "@/lib/cms/estadisticas";
import { eliminarCifras, importarCifras } from "@/lib/cms/estadisticas-actions";

export const metadata: Metadata = { title: "Cifras del sector · Panel del portal", robots: { index: false } };

// El sistema de estadísticas anterior es lento (la página de Precios pesa más de 600 KB): se le da hasta un minuto.
export const maxDuration = 60;

const BASE = "https://estadisticas.fedegan.org.co/Indicadores";
// Páginas del sistema de estadísticas de FEDEGÁN (cada una es un conjunto de indicadores).
const SISTEMA = [
  { titulo: "General", n: 66, orden: 10 },
  { titulo: "Inventario ganadero", n: 11, orden: 20 },
  { titulo: "Producción", n: 12, orden: 30 },
  { titulo: "Precios", n: 13, orden: 40 },
  { titulo: "Costos de producción", n: 14, orden: 50 },
  { titulo: "Consumo", n: 15, orden: 60 },
  { titulo: "Importaciones y exportaciones", n: 16, orden: 70 },
  { titulo: "Indicadores económicos", n: 17, orden: 80 },
];
const fecha = (iso: string) => new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });

export default async function EstadisticasAdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const ed = await getEditor();
  if (!ed) notFound();
  const { ok, error } = await searchParams;
  const conjuntos = cmsWritable ? await getConjuntos() : [];
  const guardado = new Map(conjuntos.map((c) => [c.id, c]));
  const propios = conjuntos.filter((c) => !SISTEMA.some((s) => slugConjunto(s.titulo) === c.id));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Cifras del sector</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Cifras del sector</h1>
        <p className="mt-1.5 max-w-3xl text-[#5d6e65]">
          Estas son las únicas cifras que muestra el portal: no depende de CONtexto ni de otro sitio. Aquí trae o pega lo que envía FEDEGÁN (la página de su sistema de estadísticas o el iframe que entreguen) y el portal lo convierte en gráficas y tablas con su diseño en{" "}
          <Link href="/seccion/cifras-del-sector" className="font-semibold text-[#165a43] underline">Cifras del sector</Link>.
        </p>
      </header>

      {ok && <p role="status" className="flex items-center gap-2 rounded-xl border border-[#b9dcc7] bg-[#e5f3ea] px-4 py-3 text-sm text-[#14573a]"><CheckCircle2 size={18} /> {ok}. Ya se ve en el sitio.</p>}
      {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-[#f0b5b5] bg-[#fdecec] px-4 py-3 text-sm text-[#7a1f1f]"><AlertCircle size={18} /> {error}</p>}
      {!cmsWritable && <ConfigNotice compact />}

      <section className="ad-card" aria-labelledby="sis-t">
        <div className="border-b border-[#eceae0] px-5 py-4 sm:px-6">
          <h2 id="sis-t" className="flex items-center gap-2 text-lg font-bold"><CloudDownload size={18} /> Traer del sistema de estadísticas</h2>
          <p className="mt-1 text-sm text-[#5d6e65]">Un clic descarga la página, la convierte y reemplaza lo que había de ese conjunto. Úselo cada vez que FEDEGÁN actualice las cifras.</p>
        </div>
        <ul className="divide-y divide-[#eceae0]">
          {SISTEMA.map((s) => {
            const c = guardado.get(slugConjunto(s.titulo));
            return (
              <li key={s.n} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1 basis-56">
                  <p className="font-semibold">{s.titulo}</p>
                  <p className="truncate text-sm text-[#5d6e65]">{BASE.replace("https://", "")}/{s.n}</p>
                </div>
                {c ? (
                  <span className="ad-pill ad-pill-ok">{c.indicadores.length} indicadores · {fecha(c.actualizado)}</span>
                ) : (
                  <span className="ad-pill ad-pill-off">Sin traer</span>
                )}
                <form action={importarCifras}>
                  <input type="hidden" name="titulo" value={s.titulo} />
                  <input type="hidden" name="url" value={`${BASE}/${s.n}`} />
                  <input type="hidden" name="orden" value={s.orden} />
                  <button type="submit" disabled={!cmsWritable} className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcdcd6] px-3.5 py-2 text-sm font-medium text-[#165a43] hover:bg-[#eef6f1] disabled:opacity-50">
                    <CloudDownload size={15} /> {c ? "Actualizar" : "Traer"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="ad-card p-5 sm:p-6" aria-labelledby="html-t">
        <h2 id="html-t" className="flex items-center gap-2 text-lg font-bold"><FileCode2 size={18} /> Pegar el HTML o el iframe que envían</h2>
        <p className="mt-1 text-sm text-[#5d6e65]">Pegue el código completo de la página, el iframe tal como lo entregan (el portal trae la página a la que apunta) o suba el archivo .html. Si el nombre ya existe, se reemplaza.</p>
        <form action={importarCifras} className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">Nombre del conjunto
              <input name="titulo" required maxLength={80} list="nombres" placeholder="General" className="ad-input" />
              <datalist id="nombres">{[...SISTEMA, ...propios.map((p) => ({ titulo: p.titulo }))].map((s) => <option key={s.titulo} value={s.titulo} />)}</datalist>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">Posición en la página
              <input name="orden" type="number" min={1} max={99} defaultValue={50} className="ad-input" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-semibold lg:col-span-2">HTML
            <textarea name="html" rows={10} placeholder="<HTML> … </HTML>   o   <iframe src=&quot;https://…&quot;></iframe>" className="ad-input resize-y font-mono text-xs" spellCheck={false} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">…o suba el archivo
            <input name="archivo" type="file" accept=".html,.htm,text/html" className="ad-input" />
          </label>
          <div className="flex items-end">
            <button type="submit" disabled={!cmsWritable} className="ad-btn ad-btn-primary">Convertir y publicar</button>
          </div>
        </form>
      </section>

      {propios.length > 0 && (
        <section className="ad-card" aria-labelledby="otros-t">
          <h2 id="otros-t" className="border-b border-[#eceae0] px-5 py-4 text-lg font-bold sm:px-6">Otros conjuntos guardados</h2>
          <ul className="divide-y divide-[#eceae0]">
            {propios.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0 flex-1 basis-56"><p className="font-semibold">{c.titulo}</p><p className="text-sm text-[#5d6e65]">{c.indicadores.length} indicadores · {fecha(c.actualizado)}</p></div>
                <form action={eliminarCifras}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-[#dcdcd6] px-3.5 py-2 text-sm font-medium text-[#b3363a] hover:bg-[#fdecec]"><Trash2 size={15} /> Quitar</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm">
        <Link href="/seccion/cifras-del-sector" className="inline-flex items-center gap-1.5 font-semibold text-[#165a43] hover:underline">Ver Cifras del sector en el sitio <ArrowUpRight size={14} /></Link>
      </p>
    </div>
  );
}

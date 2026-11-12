import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Braces, CalendarClock, FileSpreadsheet, FileText, Inbox, Rows3, TrendingUp } from "lucide-react";
import { AreaChart } from "@/components/admin/charts";
import { FormularioPestanas } from "@/components/admin/FormularioPestanas";
import { formularioPorId, respuestasDe } from "@/lib/cms/formularios";
import { porDia, resumir, tablasExportables, type Conteo, type ResumenCampo, type ResumenColumna } from "@/lib/cms/formulario-resumen";

export const metadata: Metadata = { title: "Dashboard del formulario", robots: { index: false } };

const fmtN = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 1 });
const PALETA = ["#2c6a14", "#4f9a2a", "#86b85f", "#d8b558", "#b08f4f", "#165a43", "#6aa39a", "#c6532e", "#8a978f", "#3d5a80"];

// Barras horizontales con porcentaje: la forma más legible para comparar opciones.
function Barras({ conteos, total }: { conteos: Conteo[]; total: number }) {
  const max = Math.max(1, ...conteos.map((c) => c.n));
  if (conteos.every((c) => c.n === 0)) return <p className="text-sm text-[#8a978f]">Sin respuestas todavía.</p>;
  return (
    <ul className="flex flex-col gap-2.5">
      {conteos.map((c, i) => {
        const pct = total ? Math.round((c.n / total) * 100) : 0;
        return (
          <li key={c.etiqueta}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-[#22352a]" title={c.etiqueta}>{c.etiqueta}</span>
              <span className="shrink-0 tabular-nums text-[#5d6e65]"><b className="text-[#10240f]">{c.n}</b> · {pct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#eef1ea]">
              <div className="h-full rounded-full" style={{ width: `${(c.n / max) * 100}%`, background: PALETA[i % PALETA.length] }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Lista({ titulo, items }: { titulo: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#8a978f]">{titulo}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((t, i) => <li key={i} className="line-clamp-2 rounded-lg bg-[#f6f8f2] px-3 py-2 text-sm text-[#33463a]">{t}</li>)}
      </ul>
    </div>
  );
}

function Columna({ r }: { r: ResumenColumna }) {
  return (
    <div className="rounded-2xl border border-[#eef0ea] bg-[#fcfdfb] p-4">
      <p className="mb-3 flex items-baseline justify-between gap-2"><span className="font-semibold text-[#10240f]">{r.columna.etiqueta}</span><span className="text-xs text-[#8a978f]">{r.respondidas} con dato</span></p>
      {r.tipo === "conteo" && <Barras conteos={r.conteos} total={r.respondidas} />}
      {r.tipo === "numero" && <p className="text-sm text-[#33463a]">Suma <b className="text-lg text-[#10240f]">{fmtN(r.suma)}</b> · promedio <b>{fmtN(r.promedio)}</b></p>}
      {r.tipo === "texto" && (
        <div className="flex flex-col gap-3">
          {r.repetidos.length > 0 && <Barras conteos={r.repetidos} total={r.respondidas} />}
          {r.repetidos.length === 0 && <Lista titulo="Ejemplos" items={r.recientes} />}
        </div>
      )}
    </div>
  );
}

function Tarjeta({ r, total }: { r: ResumenCampo; total: number }) {
  const tasa = total ? Math.round((r.respondidas / total) * 100) : 0;
  return (
    <section className={`ad-card p-5 sm:p-6 ${r.tipo === "tabla" ? "lg:col-span-2" : ""}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-bold leading-snug text-[#10240f]">{r.campo.etiqueta}</h3>
        <span className="shrink-0 rounded-full bg-[#f1f3ec] px-2.5 py-1 text-xs font-semibold text-[#5d6e65]">{r.respondidas} de {total} · {tasa}%</span>
      </header>
      {r.tipo === "conteo" && (
        <>
          {r.promedio !== undefined && <p className="mb-3 text-sm text-[#5d6e65]">Promedio <b className="text-2xl text-[#10240f]">{fmtN(r.promedio)}</b> de {r.campo.max}</p>}
          <Barras conteos={r.conteos} total={r.multiple ? r.respondidas : r.conteos.reduce((a, c) => a + c.n, 0)} />
          {r.multiple && <p className="mt-2 text-xs text-[#8a978f]">Permite varias respuestas: los porcentajes son sobre quienes respondieron.</p>}
        </>
      )}
      {r.tipo === "numero" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Promedio", r.promedio], ["Suma", r.suma], ["Mínimo", r.minimo], ["Máximo", r.maximo]].map(([t, v]) => (
            <div key={String(t)} className="rounded-xl bg-[#f6f8f2] px-3 py-2.5"><p className="text-xs text-[#5d6e65]">{t}</p><p className="text-xl font-bold text-[#10240f]">{fmtN(Number(v))}</p></div>
          ))}
        </div>
      )}
      {r.tipo === "texto" && (
        <div className="flex flex-col gap-4">
          {r.repetidos.length > 0 && <div><p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#8a978f]">Lo que más se repite</p><Barras conteos={r.repetidos} total={r.respondidas} /></div>}
          <Lista titulo="Últimas respuestas" items={r.recientes} />
          {r.respondidas === 0 && <p className="text-sm text-[#8a978f]">Sin respuestas todavía.</p>}
        </div>
      )}
      {r.tipo === "tabla" && (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="rounded-xl bg-[#e5f3da] px-4 py-2.5"><p className="text-xs text-[#245611]">Filas registradas</p><p className="text-2xl font-bold text-[#10240f]">{r.filas}</p></div>
            <div className="rounded-xl bg-[#f6f8f2] px-4 py-2.5"><p className="text-xs text-[#5d6e65]">Promedio por persona</p><p className="text-2xl font-bold text-[#10240f]">{r.respondidas ? fmtN(r.filas / r.respondidas) : 0}</p></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">{r.columnas.map((k) => <Columna key={k.columna.id} r={k} />)}</div>
        </>
      )}
    </section>
  );
}

export default async function DashboardFormularioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await formularioPorId(id);
  if (!f) notFound();
  const respuestas = await respuestasDe(id);
  const esquema = f.published ?? f.schema;
  const resumen = resumir(esquema, respuestas);
  const hoy = new Date().toISOString().slice(0, 10);
  const serie = porDia(respuestas, hoy, 30);
  const semana = serie.slice(-7).reduce((a, d) => a + d.value, 0);
  const filasTabla = resumen.reduce((a, r) => a + (r.tipo === "tabla" ? r.filas : 0), 0);
  const ultima = respuestas[0]?.created_at;
  const hojas = tablasExportables(esquema, respuestas);
  const base = `/admin/formularios/${id}/exportar`;

  const kpis = [
    { t: "Respuestas", v: fmtN(respuestas.length), I: Inbox },
    { t: "Últimos 7 días", v: fmtN(semana), I: TrendingUp },
    ...(filasTabla ? [{ t: "Filas en tablas", v: fmtN(filasTabla), I: Rows3 }] : []),
    { t: "Última respuesta", v: ultima ? new Date(ultima).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "—", I: CalendarClock },
  ];

  return (
    <div className="flex flex-col gap-6">
      <FormularioPestanas id={id} titulo={f.title} slug={f.slug} publico={Boolean(f.published) && f.status !== "borrador"} activa="dashboard" />

      <div className={`grid gap-4 sm:grid-cols-2 ${kpis.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        {kpis.map(({ t, v, I }) => (
          <div key={t} className="ad-card flex items-center gap-4 px-5 py-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#e5f3da] text-[#2c6a14]"><I size={20} /></span>
            <div><p className="text-sm text-[#5d6e65]">{t}</p><p className="text-2xl font-bold text-[#10240f]">{v}</p></div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="ad-card p-5 sm:p-6">
          <h2 className="mb-1 font-bold text-[#10240f]">Respuestas por día</h2>
          <p className="mb-3 text-sm text-[#5d6e65]">Últimos 30 días</p>
          <AreaChart data={serie} />
        </section>
        <section className="ad-card flex flex-col gap-3 p-5 sm:p-6" aria-labelledby="dl">
          <h2 id="dl" className="font-bold text-[#10240f]">Descargar respuestas</h2>
          <a href={`${base}?formato=xlsx`} className="flex items-center gap-3 rounded-2xl border border-[#cfe0c2] bg-[#f3f9ee] p-3 transition hover:border-[#2c6a14]">
            <span className="grid size-10 place-items-center rounded-xl bg-[#2c6a14] text-white"><FileSpreadsheet size={19} /></span>
            <span><b className="block text-[#10240f]">Excel (.xlsx)</b><span className="text-xs text-[#5d6e65]">{hojas.length === 1 ? "Una hoja" : `${hojas.length} hojas: general${hojas.length > 1 ? " y detalle por tabla" : ""}`}</span></span>
          </a>
          {hojas.map((h, i) => (
            <a key={i} href={`${base}?formato=csv&hoja=${i}`} className="flex items-center gap-3 rounded-2xl border border-[#e6e9e0] p-3 transition hover:border-[#9cc47f]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#f1f3ec] text-[#2c6a14]"><FileText size={19} /></span>
              <span className="min-w-0"><b className="block text-[#10240f]">CSV · {i === 0 ? "general" : h.nombre}</b><span className="text-xs text-[#5d6e65]">{h.filas.length} filas · abre en Excel, Sheets o Power BI</span></span>
            </a>
          ))}
          <a href={`${base}?formato=json`} className="flex items-center gap-3 rounded-2xl border border-[#e6e9e0] p-3 transition hover:border-[#9cc47f]">
            <span className="grid size-10 place-items-center rounded-xl bg-[#f1f3ec] text-[#2c6a14]"><Braces size={19} /></span>
            <span><b className="block text-[#10240f]">JSON</b><span className="text-xs text-[#5d6e65]">Todo, para integraciones o análisis</span></span>
          </a>
        </section>
      </div>

      {respuestas.length === 0 ? (
        <p className="ad-card px-6 py-14 text-center text-[#8a978f]">Cuando lleguen respuestas, aquí verá el resumen de cada pregunta.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{resumen.map((r) => <Tarjeta key={r.campo.id} r={r} total={respuestas.length} />)}</div>
      )}
    </div>
  );
}

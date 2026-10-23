import Link from "next/link";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getObservatorio, OBSERVATORIO_URL, periodoLargo, type Indicador } from "@/lib/observatorio";
import { ObservatorioNav } from "./ObservatorioNav";
import { IndicatorTabs } from "./IndicatorTabs";
import { TerritorialExplorer } from "./TerritorialExplorer";
import { nf, signo, variacion } from "./format";

function Spark({ valores }: { valores: number[] }) {
  const v = valores.slice(-24).filter(Number.isFinite);
  if (v.length < 2) return null;
  const min = Math.min(...v);
  const max = Math.max(...v);
  const pts = v.map((n, i) => [(i / (v.length - 1)) * 200, 34 - ((n - min) / (max - min || 1)) * 30] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 200 38" preserveAspectRatio="none" className="mt-4 h-9 w-full" aria-hidden>
      <path d={`${d} L200 38 L0 38Z`} fill="var(--fg-lime-500)" fillOpacity="0.14" />
      <path d={d} fill="none" stroke="var(--fg-lime-500)" strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Kpi({ etiqueta, valor, delta, unidad, serie }: { etiqueta: string; valor: string; delta: number; unidad: string; serie: number[] }) {
  const sube = delta >= 0;
  return (
    <li className="rounded-[0.25rem] border border-[var(--border-strong)] border-t-2 border-t-[var(--fg-lime-500)] bg-[var(--surface-solid)] p-5">
      <p className="font-data text-[0.68rem] uppercase tracking-[0.12em] text-[var(--text-faint)]">{etiqueta}</p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5">
        <span className="font-[var(--font-display)] text-3xl font-bold leading-none tabular-nums text-[var(--text)] sm:text-[2.1rem]">{valor}</span>
        <span className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${sube ? "text-[#5ccd86]" : "text-[#f08a8a]"}`}>
          {sube ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {signo(delta)}
        </span>
      </p>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{unidad}</p>
      <Spark valores={serie} />
    </li>
  );
}

const last = <T,>(a: T[]) => a[a.length - 1];
const por = (o: Record<string, Indicador>, claves: string[]) => claves.map((c) => o[c]).filter(Boolean);

function Seccion({ id, n, titulo, texto, children }: { id: string; n: string; titulo: string; texto: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t first:border-t-0 border-[var(--border)] py-10 sm:py-14">
      <div className="mb-7 flex items-start gap-5">
        <span className="font-[var(--font-display)] text-4xl font-bold leading-none text-[var(--fg-lime-500)] sm:text-5xl">{n}</span>
        <div>
          <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)]">{titulo}</h2>
          <p className="mt-1 max-w-2xl text-[var(--text-muted)]">{texto}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Observatorio ganadero: cifras oficiales de FEDEGÁN que publica CONtexto, con el diseño del portal. */
export async function Observatorio() {
  const obs = await getObservatorio();
  if (!obs) {
    return (
      <Container className="py-14">
        <div className="rounded-[0.25rem] border border-dashed border-[var(--border-strong)] p-8">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Las cifras no están disponibles por ahora</h2>
          <p className="mt-2 max-w-xl text-[var(--text-muted)]">No pudimos leer el Observatorio de CONtexto en este momento. Puede consultarlo directamente mientras se restablece.</p>
          <a href={OBSERVATORIO_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
            Abrir el Observatorio en CONtexto <ArrowUpRight size={16} />
          </a>
        </div>
      </Container>
    );
  }

  const { indicadores: I, bovinos } = obs;
  const gordo = I.gordo?.series[0]?.valores ?? [];
  const mesActual = I.gordo ? last(I.gordo.periodos) : "";
  const sac = I.sacrificio?.series[0]?.valores ?? [];
  const consSerie = I["consumo-res"]?.series.find((s) => /total/i.test(s.nombre)) ?? I["consumo-res"]?.series[0];
  const cons = consSerie?.valores ?? [];
  const bov = bovinos?.nacional ?? [];

  const kpis = [
    bov.length > 1 && { etiqueta: `Inventario bovino · ${last(bovinos!.periodos)}`, valor: nf(last(bov)), delta: variacion(last(bov), bov[bov.length - 2]), unidad: "cabezas", serie: bov },
    gordo.length > 1 && { etiqueta: `Ganado gordo · ${mesActual.replace("/", "/")}`, valor: `$${nf(last(gordo))}`, delta: variacion(last(gordo), gordo[gordo.length - 2]), unidad: "por kilo en pie", serie: gordo },
    sac.length > 1 && { etiqueta: `Sacrificio formal · ${last(I.sacrificio.periodos)}`, valor: nf(last(sac)), delta: variacion(last(sac), sac[sac.length - 2]), unidad: "miles de cabezas", serie: sac },
    cons.length > 1 && { etiqueta: `Consumo de carne de res · ${last(I["consumo-res"].periodos)}`, valor: nf(last(cons), 1), delta: variacion(last(cons), cons[cons.length - 2]), unidad: "kg por habitante", serie: cons },
  ].filter(Boolean) as { etiqueta: string; valor: string; delta: number; unidad: string; serie: number[] }[];

  // «Lo que dicen los datos»: frases armadas con las últimas cifras.
  const dichos: string[] = [];
  if (gordo.length > 1) dichos.push(`El ganado gordo cerró ${periodoLargo(mesActual)} en $${nf(last(gordo))} por kilo en pie (${variacion(last(gordo), gordo[gordo.length - 2]) >= 0 ? "+" : "−"}${nf(Math.abs(variacion(last(gordo), gordo[gordo.length - 2])), 1)} % frente al mes anterior).`);
  const fm = I["flaco-machos"];
  if (fm) {
    const caro = fm.series.map((s) => ({ n: s.nombre, v: last(s.valores), p: s.valores[s.valores.length - 2] })).filter((s) => Number.isFinite(s.v)).sort((a, b) => b.v - a.v)[0];
    if (caro) dichos.push(`El flaco macho más caro está en ${caro.n}: $${nf(caro.v)} por kilo, ${variacion(caro.v, caro.p) >= 0 ? "+" : "−"}${nf(Math.abs(variacion(caro.v, caro.p)), 1)} % en el mes.`);
  }
  if (bovinos) {
    const i = bovinos.periodos.length - 1;
    const top = bovinos.departamentos.map((d) => ({ n: d.nombre, v: d.valores[i] ?? 0 })).sort((a, b) => b.v - a.v)[0];
    if (top) dichos.push(`${top.n} concentra el ${nf((top.v / bovinos.nacional[i]) * 100, 1)} % de los bovinos del país: ${nf(top.v / 1e6, 2)} de ${nf(bovinos.nacional[i] / 1e6, 1)} millones de cabezas.`);
  }
  if (cons.length) dichos.push(`Cada colombiano consume ${nf(last(cons), 1)} kg de carne de res al año (${last(I["consumo-res"].periodos)}).`);

  const secciones = [
    { id: "precios", n: "01", t: "Precios", d: "Precio del ganado en pie por región, mes a mes.", ind: por(I, ["gordo", "gordo-ceba", "flaco-machos", "flaco-hembras"]) },
    { id: "inventario", n: "02", t: "Inventario", d: "Cuántos bovinos y predios ganaderos hay en cada departamento, año tras año. Mueva la barra de años o dele reproducir." },
    { id: "produccion", n: "03", t: "Producción", d: "Sacrificio de bovinos y producción mundial de carne.", ind: por(I, ["sacrificio", "carne-mundo"]) },
    { id: "consumo", n: "04", t: "Consumo", d: "Cuánta carne y leche consume cada colombiano.", ind: por(I, ["consumo-res", "consumo-carnes", "consumo-leche"]) },
    { id: "internacional", n: "05", t: "Internacional", d: "Precios del novillo, la leche y la carne en otros países.", ind: por(I, ["novillo-paises", "leche-paises", "leche-polvo", "carne-deshuesada"]) },
    { id: "costos", n: "06", t: "Costos", d: "Índice de costos de producción.", ind: por(I, ["costos"]) },
  ];

  return (
    <>
      <section className="border-b border-[var(--border)] bg-[var(--bg-muted)] py-10 sm:py-14">
        <Container>
          <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface-solid)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[#34a868]" /> Datos oficiales de FEDEGÁN <span className="text-[var(--text)]">· {mesActual ? periodoLargo(mesActual) : "actualizado"}</span>
          </p>
          <h1 className="mt-5 font-[var(--font-display)] text-5xl font-bold leading-[1.02] text-[var(--text)] sm:text-6xl lg:text-7xl">
            Observatorio <span className="text-[var(--fg-lime-400)]">ganadero</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">Las cifras del sector en un solo lugar: precios, inventario por departamento, producción, consumo, mercado internacional y costos. Datos oficiales de FEDEGÁN, siempre al día.</p>

          <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Kpi key={k.etiqueta} {...k} />
            ))}
          </ul>

          {dichos.length > 0 && (
            <div className="mt-9">
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-500)]">Lo que dicen los datos</p>
              <ul className="grid gap-3 md:grid-cols-2">
                {dichos.map((d) => (
                  <li key={d} className="rounded-[0.25rem] border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 leading-relaxed text-[var(--text)]">{d}</li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      <Container className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <ObservatorioNav items={[...secciones.map((x) => ({ id: x.id, n: x.n, t: x.t })), { id: "documentos", n: "07", t: "Documentos" }]} />
        <div className="min-w-0">
        {secciones.map((s) => (
          <Seccion key={s.id} id={s.id} n={s.n} titulo={s.t} texto={s.d}>
            {s.id === "inventario" ? <TerritorialExplorer bovinos={obs.bovinos} predios={obs.predios} orientacion={obs.orientacion} /> : <IndicatorTabs indicadores={s.ind ?? []} />}
          </Seccion>
        ))}

        <Seccion id="documentos" n="07" titulo="Documentos" texto="Publicaciones y documentos de estadística del sector.">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold uppercase tracking-[0.1em]">
            <Link href="/seccion/cifras-del-sector/estadisticas/documentos-de-estadistica" className="text-[var(--fg-lime-400)] hover:text-[var(--text)]">Documentos de estadística →</Link>
            <Link href="/seccion/cifras-del-sector/coyuntura-ganadera" className="text-[var(--fg-lime-400)] hover:text-[var(--text)]">Coyuntura ganadera →</Link>
            <Link href="/seccion/cifras-del-sector/cifras-interactivas" className="text-[var(--fg-lime-400)] hover:text-[var(--text)]">Cifras interactivas →</Link>
            <a href={OBSERVATORIO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]">Ver en CONtexto Ganadero <ArrowUpRight size={14} /></a>
          </div>
          <p className="mt-6 text-xs text-[var(--text-faint)]">Fuente: FEDEGÁN · Sistema de información estadística, publicada por CONtexto Ganadero. Las cifras se actualizan cada pocas horas.</p>
        </Seccion>
        </div>
      </Container>
    </>
  );
}

import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { periodoLargo, type Indicador } from "@/lib/estadisticas/tipos";
import { observatorioDesdeConjuntos } from "@/lib/estadisticas/local";
import { ObservatorioNav } from "./ObservatorioNav";
import { IndicatorTabs } from "./IndicatorTabs";
import { TerritorialExplorer } from "./TerritorialExplorer";
import { nf, signo, variacion } from "./format";
import { CifrasFedegan } from "./CifrasFedegan";
import { getConjuntos, getCopiaContexto } from "@/lib/cms/estadisticas";
import { fusionarConCopia } from "@/lib/estadisticas/contexto";
import { codigosCubiertos, repartir } from "@/lib/estadisticas/reparto";

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
        <span className="font-[var(--font-display)] text-4xl font-bold leading-none text-[var(--fg-lime-400)] sm:text-5xl">{n}</span>
        <div>
          <h2 className="font-[var(--font-display)] text-3xl font-bold leading-tight text-[var(--text)]">{titulo}</h2>
          <p className="mt-1 max-w-2xl text-[var(--text-muted)]">{texto}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Cifras del sector: las del sistema de estadísticas de FEDEGÁN (el HTML que se carga en el panel) más la copia única del historial, con el diseño del portal. No consulta servicios externos al mostrarse. */
export async function Observatorio({ datos }: { datos?: Awaited<ReturnType<typeof getConjuntos>> } = {}) {
  const [conjuntos, copia] = await Promise.all([datos ?? getConjuntos().catch(() => []), getCopiaContexto().catch(() => null)]);
  // El historial (desde 2021) y los departamentos salen de la copia guardada una sola vez; lo más reciente, del HTML de FEDEGÁN.
  const obs = fusionarConCopia(observatorioDesdeConjuntos(conjuntos), copia?.observatorio ?? null);
  // Hay cifras cargadas, pero ninguna de las principales: se muestran todas en el catálogo.
  if (!obs && conjuntos.length > 0) {
    return (
      <>
        <PageHeader
          eyebrow="Cifras del sector"
          title="Cifras del sector"
          description="Todos los indicadores del sistema de estadísticas de FEDEGÁN: precios, inventario, producción, consumo, mercado internacional y costos."
          image="/journey/cifras.jpg"
          imagePos="50% 50%"
          facts={["Datos oficiales de FEDEGÁN"]}
          breadcrumbs={[{ label: "Cifras del sector" }]}
        />
        <Container className="py-10 sm:py-14">
          <CifrasFedegan conjuntos={conjuntos.map((c) => ({ id: c.id, titulo: c.titulo, indicadores: c.indicadores }))} />
        </Container>
      </>
    );
  }
  if (!obs) {
    return (
      <Container className="py-14">
        <div className="rounded-[0.25rem] border border-dashed border-[var(--border-strong)] p-8">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text)]">Las cifras se están cargando</h2>
          <p className="mt-2 max-w-xl text-[var(--text-muted)]">Estamos preparando las cifras del sector (precios, inventario, producción, consumo y mercado internacional). Vuelva en unos minutos.</p>
          <Link href="/contacto" className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--fg-lime-400)]">
            ¿Necesita una cifra ahora? Escríbanos
          </Link>
        </div>
      </Container>
    );
  }

  // Los indicadores del sistema de estadísticas se reparten dentro de cada sección (sin repetir lo que ya dibuja el Observatorio).
  const cubiertos = codigosCubiertos(obs);
  for (const i of obs.inventario) cubiertos.add(i.clave.replace(/^inv-/, ""));
  const { porSeccion, otras } = repartir(conjuntos, cubiertos);
  const { indicadores: I, bovinos } = obs;
  // El inventario nacional sale del explorador por departamento o, si el HTML no trae departamentos, de la serie «Nacional».
  const inv001 = obs.inventario.find((i) => i.clave === "inv-001");
  const invNac = inv001?.series.find((s) => /^(nacional|total)\b/i.test(s.nombre.trim()));
  const gordo = I.gordo?.series[0]?.valores ?? [];
  const mesActual = I.gordo ? last(I.gordo.periodos) : "";
  const sac = I.sacrificio?.series[0]?.valores ?? [];
  const consSerie = I["consumo-res"]?.series.find((s) => /total/i.test(s.nombre)) ?? I["consumo-res"]?.series[0];
  const cons = consSerie?.valores ?? [];
  const bov = bovinos?.nacional ?? invNac?.valores ?? [];
  const bovPeriodos = bovinos?.periodos ?? inv001?.periodos ?? [];

  const kpis = [
    bov.length > 1 && { etiqueta: `Inventario bovino · ${last(bovPeriodos)}`, valor: nf(last(bov)), delta: variacion(last(bov), bov[bov.length - 2]), unidad: "cabezas", serie: bov },
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
    { id: "inventario", n: "02", t: "Inventario", d: bovinos || obs.predios ? "Cuántos bovinos y predios ganaderos hay en cada departamento, año tras año. Mueva la barra de años o dele reproducir." : "Bovinos, bufalinos y predios ganaderos del país.", ind: obs.inventario },
    { id: "produccion", n: "03", t: "Producción", d: "Sacrificio de bovinos y producción mundial de carne.", ind: por(I, ["sacrificio", "carne-mundo"]) },
    { id: "consumo", n: "04", t: "Consumo", d: "Cuánta carne y leche consume cada colombiano.", ind: por(I, ["consumo-res", "consumo-carnes", "consumo-leche"]) },
    { id: "internacional", n: "05", t: "Internacional", d: "Precios del novillo, la leche y la carne en otros países.", ind: por(I, ["novillo-paises", "leche-paises", "leche-polvo", "carne-deshuesada"]) },
    { id: "costos", n: "06", t: "Costos", d: "Índice de costos de producción.", ind: por(I, ["costos"]) },
  ].filter((x) => (x.ind?.length ?? 0) > 0 || porSeccion[x.id] || (x.id === "inventario" && (bovinos || obs.predios)));

  return (
    <>
      <PageHeader
        eyebrow="Cifras del sector"
        title="Observatorio ganadero"
        description={`Las cifras del sector en un solo lugar: precios, inventario${bovinos || obs.predios ? " por departamento" : ""}, producción, consumo, mercado internacional y costos. Datos oficiales de FEDEGÁN.`}
        image="/journey/cifras.jpg"
        imagePos="50% 50%"
        facts={["Datos oficiales de FEDEGÁN", mesActual ? periodoLargo(mesActual) : "Actualizado"]}
        breadcrumbs={[{ label: "Cifras del sector" }]}
      />

      <section className="border-b border-[var(--border)] bg-[var(--bg-muted)] py-8 sm:py-10">
        <Container>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Kpi key={k.etiqueta} {...k} />
            ))}
          </ul>

          {dichos.length > 0 && (
            <div className="mt-9">
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[var(--fg-lime-400)]">Lo que dicen los datos</p>
              <ul className="grid gap-3 md:grid-cols-2">
                {dichos.map((d) => (
                  <li key={d} className="rounded-[0.25rem] border border-[var(--border)] bg-[var(--surface-solid)] px-4 py-3.5 leading-relaxed text-[var(--text)]">{d}</li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      <Container>
        <ObservatorioNav items={[...secciones.map((x) => ({ id: x.id, n: x.n, t: x.t })), ...(otras.length ? [{ id: "cifras-fedegan", n: "07", t: "Otras cifras" }] : []), { id: "documentos", n: otras.length ? "08" : "07", t: "Documentos" }]} />
        <div className="min-w-0">
        {secciones.map((s) => (
          <Seccion key={s.id} id={s.id} n={s.n} titulo={s.t} texto={s.d}>
            {s.id === "inventario" && (bovinos || obs.predios) ? <TerritorialExplorer bovinos={obs.bovinos} predios={obs.predios} orientacion={obs.orientacion} /> : <IndicatorTabs indicadores={s.ind ?? []} />}
            {porSeccion[s.id] && (
              <div className="mt-12 border-t border-[var(--border)] pt-8">
                <h3 className="font-[var(--font-display)] text-xl font-bold text-[var(--text)]">Más indicadores de {s.t.toLowerCase()}</h3>
                <p className="mb-5 mt-1 max-w-2xl text-sm text-[var(--text-muted)]">Del sistema de estadísticas de FEDEGÁN: elija uno para ver su gráfica, su tabla y su fuente.</p>
                <CifrasFedegan conjuntos={[{ id: porSeccion[s.id].id, titulo: porSeccion[s.id].titulo, indicadores: porSeccion[s.id].indicadores }]} />
              </div>
            )}
          </Seccion>
        ))}

        {otras.length > 0 && (
          <Seccion id="cifras-fedegan" n="07" titulo="Otras cifras" texto="Informes y otros indicadores del sistema de estadísticas de FEDEGÁN: elija un tema, busque el indicador y vea su gráfica, su tabla y su fuente.">
            <CifrasFedegan conjuntos={otras.map((c) => ({ id: c.id, titulo: c.titulo, indicadores: c.indicadores }))} />
          </Seccion>
        )}

        <Seccion id="documentos" n={otras.length ? "08" : "07"} titulo="Documentos" texto="Publicaciones y documentos de estadística del sector.">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold uppercase tracking-[0.1em]">
            <Link href="/seccion/cifras-del-sector/estadisticas/documentos-de-estadistica" className="text-[var(--fg-lime-400)] hover:text-[var(--text)]">Documentos de estadística →</Link>
            <Link href="/seccion/cifras-del-sector/coyuntura-ganadera" className="text-[var(--fg-lime-400)] hover:text-[var(--text)]">Coyuntura ganadera →</Link>
            <Link href="/seccion/cifras-del-sector/cifras-interactivas" className="text-[var(--fg-lime-400)] hover:text-[var(--text)]">Cifras interactivas →</Link>
          </div>
          <p className="mt-6 text-xs text-[var(--text-faint)]">Fuente: FEDEGÁN · Sistema de información estadística.</p>
        </Seccion>
        </div>
      </Container>
    </>
  );
}

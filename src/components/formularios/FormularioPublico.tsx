"use client";

import { useEffect, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Copy, Loader2, Paperclip, Plus, Search, Send, Trash2 } from "lucide-react";
import { enviarFormulario } from "@/lib/cms/formularios-actions";
import { MAX_FILAS, aplicarCatalogo, esFilas, opcionesForm, visibles, type CampoForm, type ColumnaTabla, type EsquemaForm, type Fila, type MapaCargos, type Valor } from "@/lib/cms/formulario-esquema";

// Tareas sugeridas para una tabla: las del cargo elegido (catálogo), para marcarlas en vez de escribirlas.
export type Sugerencias = { columna: string; catalogo: string; area: string; cargo: string; marca?: string };

function useTareas(s?: Sugerencias) {
  const catalogo = s?.catalogo ?? "", area = s?.area ?? "", cargo = s?.cargo ?? "";
  const clave = area && cargo ? `${catalogo}|${area}|${cargo}` : "";
  const [cache, setCache] = useState<Record<string, string[]>>({});
  const listo = clave ? clave in cache : true;
  useEffect(() => {
    if (!clave || listo) return;
    let vivo = true;
    (async () => {
      let tareas: string[] = [];
      try {
        const r = await fetch(`/api/formularios/catalogo?${new URLSearchParams({ c: catalogo, area, cargo })}`);
        tareas = ((await r.json()) as { tareas?: string[] }).tareas ?? [];
      } catch {}
      if (vivo) setCache((c) => ({ ...c, [clave]: tareas }));
    })();
    return () => { vivo = false; };
  }, [clave, listo, catalogo, area, cargo]);
  return { tareas: clave ? cache[clave] : undefined, activa: Boolean(clave) };
}

// Tabla de filas repetibles (p. ej. «una fila por actividad»): cada fila es una tarjeta con sus columnas, cómoda también en el móvil.
// Con `sugerencias`, arriba aparecen las tareas del cargo como casillas: cada una marcada es una fila ya llenada.
function TablaFilas({ etiqueta, ayuda, columnas, filas, onChange, sugerencias }: {
  etiqueta: ReactNode; ayuda: string; columnas: ColumnaTabla[]; filas: Fila[]; onChange: (f: Fila[]) => void; sugerencias?: Sugerencias;
}) {
  const [buscar, setBuscar] = useState("");
  const { tareas, activa } = useTareas(sugerencias);
  const poner = (i: number, k: string, x: string) => onChange(filas.map((f, j) => (j === i ? { ...f, [k]: x } : f)));
  const col = sugerencias?.columna ?? "";
  const lista = tareas ?? [];
  const delPerfil = new Set(lista);
  const marcadas = new Set(filas.map((f) => f[col]).filter((x) => x && delPerfil.has(x)));
  const alternar = (t: string) => {
    if (marcadas.has(t)) onChange(filas.filter((f) => f[col] !== t));
    else if (filas.length < MAX_FILAS) onChange([...filas.filter((f) => Object.values(f).some(Boolean)), { [col]: t, ...(sugerencias?.marca ? { [sugerencias.marca]: "Sí" } : {}) }]);
  };
  const term = buscar.trim().toLowerCase();
  const visiblesT = term ? lista.filter((t) => t.toLowerCase().includes(term)) : lista;
  const nueva = () => onChange([...filas, sugerencias?.marca && activa ? { [sugerencias.marca]: "No" } : {}]);

  return (
    <fieldset className="fm-set">
      <legend>{etiqueta}</legend>
      {ayuda && <span className="fm-ayuda mb-2 block">{ayuda}</span>}

      {sugerencias && (
        <div className="mb-4 rounded-2xl border border-[#cfe0c2] bg-[#f3f9ee] p-4">
          {!activa ? (
            <p className="text-sm text-[#44564a]">Elija arriba su <b>área</b> y su <b>cargo</b>: aquí aparecerán las tareas de su perfil para que solo las marque.</p>
          ) : tareas === undefined ? (
            <p className="flex items-center gap-2 text-sm text-[#44564a]"><Loader2 size={15} className="animate-spin" /> Cargando las tareas de su cargo…</p>
          ) : lista.length === 0 ? (
            <p className="text-sm text-[#44564a]">No tenemos tareas registradas para este cargo. Añada sus actividades con el botón de abajo.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#245611]">Tareas de su perfil de cargo · marque las que realiza <span className="font-normal text-[#5d6e65]">({marcadas.size} de {lista.length})</span></p>
                {lista.length > 8 && (
                  <label className="relative">
                    <span className="sr-only">Buscar tarea</span>
                    <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a978f]" aria-hidden />
                    <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar tarea" className="fm-in !py-1.5 !pl-8 text-sm" />
                  </label>
                )}
              </div>
              <ul className="mt-3 flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
                {visiblesT.map((t) => (
                  <li key={t}>
                    <label className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2 text-sm transition ${marcadas.has(t) ? "border-[#2c6a14] bg-white" : "border-transparent bg-white/60 hover:bg-white"}`}>
                      <input type="checkbox" checked={marcadas.has(t)} onChange={() => alternar(t)} className="mt-0.5 size-4 shrink-0 accent-[#2c6a14]" />
                      <span className="text-[#22352a]">{t}</span>
                    </label>
                  </li>
                ))}
                {visiblesT.length === 0 && <li className="px-1 text-sm text-[#667a6c]">Ninguna tarea coincide con «{buscar}».</li>}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filas.map((f, i) => {
          const deCatalogo = Boolean(col && f[col] && delPerfil.has(f[col]));
          return (
            <div key={i} className="rounded-2xl border border-[#e3ecdb] bg-[#fafcf7] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#2c6a14]">
                  <span className="grid size-6 place-items-center rounded-full bg-[#2c6a14] text-xs text-white">{i + 1}</span>
                  {sugerencias ? (deCatalogo ? "De su perfil de cargo" : "Actividad adicional") : `Fila ${i + 1}`}
                </span>
                <span className="flex gap-1">
                  {!deCatalogo && <button type="button" onClick={() => filas.length < MAX_FILAS && onChange([...filas.slice(0, i + 1), { ...f }, ...filas.slice(i + 1)])} aria-label={`Duplicar la fila ${i + 1}`} title="Duplicar" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-white"><Copy size={15} /></button>}
                  <button type="button" onClick={() => onChange(filas.length > 1 || sugerencias ? filas.filter((_, j) => j !== i) : [{}])} aria-label={`Quitar la fila ${i + 1}`} title="Quitar" className="grid size-8 place-items-center rounded-lg text-[#a02323] hover:bg-[#fdecec]"><Trash2 size={15} /></button>
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {columnas.map((k) => {
                  const x = f[k.id] ?? "";
                  const et = <span className="fm-et text-sm">{k.etiqueta}{k.requerido && <abbr title="Obligatoria" className="fm-req">*</abbr>}</span>;
                  if (deCatalogo && k.id === col) {
                    return <div key={k.id} className="flex flex-col gap-1 sm:col-span-2">{et}<p className="rounded-xl bg-white px-3.5 py-2.5 text-[0.95rem] text-[#10240f] ring-1 ring-[#e3ecdb]">{x}</p></div>;
                  }
                  return (
                    <label key={k.id} className={`flex flex-col gap-1 ${k.tipo === "parrafo" ? "sm:col-span-2" : ""}`}>
                      {et}
                      {k.tipo === "parrafo" ? (
                        <textarea rows={2} maxLength={2000} value={x} onChange={(e) => poner(i, k.id, e.target.value)} className="fm-in" />
                      ) : k.tipo === "lista" ? (
                        <select value={x} onChange={(e) => poner(i, k.id, e.target.value)} className="fm-in">
                          <option value="">Elija…</option>
                          {opcionesForm(k.opciones).map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={x} maxLength={300} inputMode={k.tipo === "numero" ? "decimal" : undefined} onChange={(e) => poner(i, k.id, e.target.value)} className="fm-in" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filas.length < MAX_FILAS && (
          <button type="button" onClick={nueva} className="inline-flex w-fit items-center gap-1.5 rounded-xl border-2 border-dashed border-[#b9cfa8] px-4 py-2.5 text-sm font-semibold text-[#2c6a14] transition hover:border-[#2c6a14] hover:bg-[#f3f9ee]">
            <Plus size={16} /> {sugerencias ? "Añadir una actividad que no está en la lista" : "Añadir otra fila"}
          </button>
        )}
      </div>
    </fieldset>
  );
}

// Formulario público (y vista previa del constructor): las preguntas con condición aparecen o se ocultan al responder.
// El envío no usa el reinicio automático de React: si hay un error, lo escrito se conserva.
export function FormularioPublico({ slug, esquema: base, preview = false, mapas = {} }: { slug: string; esquema: EsquemaForm; preview?: boolean; mapas?: Record<string, MapaCargos> }) {
  const [valores, setValores] = useState<Record<string, Valor>>({});
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(false);
  const [pending, start] = useTransition();
  // Las listas encadenadas (área → cargo) toman sus opciones de lo ya respondido.
  const esquema = aplicarCatalogo(base, mapas, valores);
  const ver = visibles(esquema.campos, valores);
  const poner = (id: string, v: Valor) =>
    setValores((p) => {
      const n: Record<string, Valor> = { ...p, [id]: v };
      // Al cambiar el área se borra el cargo (y así en cadena): sus opciones ya no son las mismas.
      const limpiar = (padre: string) => base.campos.filter((c) => c.catalogo?.padre === padre).forEach((c) => { delete n[c.id]; limpiar(c.id); });
      limpiar(id);
      return n;
    });
  const sugerenciasDe = (c: CampoForm): Sugerencias | undefined => {
    const k = (c.columnas ?? []).find((x) => x.catalogo?.nivel === "tarea");
    if (!k?.catalogo?.padre) return undefined;
    const campoCargo = base.campos.find((x) => x.id === k.catalogo!.padre);
    const cargo = valores[k.catalogo.padre];
    const area = campoCargo?.catalogo?.padre ? valores[campoCargo.catalogo.padre] : undefined;
    const marca = (c.columnas ?? []).find((x) => x.tipo === "lista" && /perfil/i.test(x.etiqueta) && opcionesForm(x.opciones).includes("Sí"))?.id;
    return { columna: k.id, catalogo: k.catalogo.id, area: typeof area === "string" ? area : "", cargo: typeof cargo === "string" ? cargo : "", ...(marca ? { marca } : {}) };
  };

  if (hecho) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 px-4 py-10 text-center">
        <CheckCircle2 size={44} className="text-[#2c6a14]" aria-hidden />
        <p className="text-xl font-bold text-[#10240f]">¡Gracias por responder!</p>
        {esquema.gracias && <p className="max-w-md text-[#44564a]">{esquema.gracias}</p>}
      </div>
    );
  }

  return (
    <form
      noValidate
      className="fm-form !p-0"
      onSubmit={(e) => {
        e.preventDefault();
        if (preview) {
          setError("Vista previa: aquí no se envía nada.");
          return;
        }
        const fd = new FormData(e.currentTarget);
        setError("");
        start(async () => {
          const r = await enviarFormulario(fd);
          if (r.ok) setHecho(true);
          else setError(r.error ?? "No se pudo enviar. Intente de nuevo.");
        });
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <div aria-hidden className="fm-trampa"><label>Sitio web <input name="sitio_web" tabIndex={-1} autoComplete="off" /></label></div>
      {esquema.campos.length === 0 && <p className="fm-ancho text-sm text-[#667a6c]">Este formulario todavía no tiene preguntas.</p>}
      {esquema.campos.map((c) => {
        if (!ver.has(c.id)) return null;
        const nombre = `c_${c.id}`;
        const opciones = opcionesForm(c.opciones);
        const v = valores[c.id];
        const texto = typeof v === "string" ? v : "";
        const marcadas = (Array.isArray(v) && !esFilas(v) ? v : []) as string[];
        const etiqueta = <span className="fm-et">{c.etiqueta}{c.requerido ? <abbr title="Obligatoria" className="fm-req">*</abbr> : <span className="fm-opc"> (opcional)</span>}</span>;
        const ancho = c.tipo === "parrafo" || c.tipo === "casillas" || c.tipo === "opcion" || c.tipo === "escala";
        if (c.tipo === "seccion") {
          return (
            <div key={c.id} className="fm-ancho mt-2 border-b-2 border-[#e3ecdb] pb-2">
              <h3 className="font-[var(--font-display)] text-xl font-bold text-[#10240f]">{c.etiqueta}</h3>
              {c.ayuda && <p className="mt-1 text-sm leading-relaxed text-[#5d6e65]">{c.ayuda}</p>}
            </div>
          );
        }
        if (c.tipo === "tabla") {
          const sugerencias = sugerenciasDe(c);
          const filas: Fila[] = esFilas(v) ? v : sugerencias ? [] : [{}];
          return (
            <div key={c.id} className="fm-campo fm-ancho">
              <input type="hidden" name={nombre} value={JSON.stringify(filas)} />
              <TablaFilas etiqueta={etiqueta} ayuda={c.ayuda} columnas={c.columnas ?? []} filas={filas} onChange={(f) => poner(c.id, f)} sugerencias={sugerencias} />
            </div>
          );
        }
        return (
          <div key={c.id} className={`fm-campo ${ancho ? "fm-ancho" : ""}`}>
            {c.tipo === "casillas" || c.tipo === "opcion" ? (
              <fieldset className="fm-set">
                <legend>{etiqueta}</legend>
                <div className="fm-opciones">
                  {opciones.map((o) => (
                    <label key={o} className="fm-opcion">
                      {c.tipo === "casillas" ? (
                        <input type="checkbox" name={nombre} value={o} checked={marcadas.includes(o)} onChange={(e) => poner(c.id, e.target.checked ? [...marcadas, o] : marcadas.filter((x) => x !== o))} />
                      ) : (
                        <input type="radio" name={nombre} value={o} checked={texto === o} onChange={() => poner(c.id, o)} />
                      )}{" "}
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : c.tipo === "escala" ? (
              <fieldset className="fm-set">
                <legend>{etiqueta}</legend>
                <div className="fm-opciones" style={{ flexDirection: "row", flexWrap: "wrap", gap: "0.5rem" }}>
                  {Array.from({ length: c.max }, (_, k) => String(k + 1)).map((n) => (
                    <label key={n} className="fm-opcion" style={{ minWidth: "2.6rem", justifyContent: "center" }}>
                      <input type="radio" name={nombre} value={n} checked={texto === n} onChange={() => poner(c.id, n)} /> <span>{n}</span>
                    </label>
                  ))}
                </div>
                <span className="fm-ayuda">1 = muy bajo · {c.max} = muy alto</span>
              </fieldset>
            ) : (
              <label>
                {etiqueta}
                {c.tipo === "parrafo" ? (
                  <textarea name={nombre} rows={4} maxLength={3000} value={texto} onChange={(e) => poner(c.id, e.target.value)} className="fm-in" />
                ) : c.tipo === "lista" ? (
                  <select name={nombre} value={texto} onChange={(e) => poner(c.id, e.target.value)} className="fm-in" disabled={Boolean(c.catalogo) && opciones.length === 0}>
                    <option value="" disabled>{c.catalogo && opciones.length === 0 ? `Primero elija «${base.campos.find((x) => x.id === c.catalogo?.padre)?.etiqueta ?? "la pregunta anterior"}»` : "Elija una opción…"}</option>
                    {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : c.tipo === "archivo" ? (
                  <span className="fm-archivo"><Paperclip size={16} aria-hidden /><input type="file" name={nombre} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" /></span>
                ) : (
                  <input
                    name={nombre} className="fm-in" maxLength={300} value={texto} onChange={(e) => poner(c.id, e.target.value)}
                    type={c.tipo === "correo" ? "email" : c.tipo === "telefono" ? "tel" : c.tipo === "fecha" ? "date" : "text"}
                    inputMode={c.tipo === "numero" ? "decimal" : undefined}
                    autoComplete={c.tipo === "correo" ? "email" : c.tipo === "telefono" ? "tel" : "off"}
                  />
                )}
              </label>
            )}
            {c.ayuda && <span className="fm-ayuda">{c.ayuda}</span>}
            {c.tipo === "archivo" && <span className="fm-ayuda">PDF, Word, Excel, JPG o PNG · hasta 10 MB.</span>}
          </div>
        );
      })}
      {esquema.campos.length > 0 && (
        <div className="fm-pie">
          <button type="submit" disabled={pending} className="fm-btn">
            {pending ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Send size={17} aria-hidden />} {pending ? "Enviando…" : "Enviar"}
          </button>
          {error && <p role="alert" className="fm-error">{error}</p>}
        </div>
      )}
    </form>
  );
}

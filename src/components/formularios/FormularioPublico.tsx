"use client";

import "./formulario.css";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { AlertCircle, Briefcase, Copy, Loader2, Paperclip, Plus, Search, Send, Sparkles, Trash2 } from "lucide-react";
import { enviarFormulario } from "@/lib/cms/formularios-actions";
import {
  MAX_FILAS, aplicarCatalogo, esFilas, esPregunta, opcionesForm, visibles,
  type CampoForm, type ColumnaTabla, type EsquemaForm, type Fila, type MapaCargos, type Valor,
} from "@/lib/cms/formulario-esquema";

// Formulario público (y vista previa del constructor), organizado en secciones con barra de progreso.
// Las preguntas con condición aparecen al responder; las listas encadenadas (área → cargo → tareas) se llenan solas.
// El envío no usa el reinicio automático de React: si hay un error, lo escrito se conserva.

const Visto = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

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

const respondida = (v: Valor | undefined) => (typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? (esFilas(v) ? v.some((f) => Object.values(f).some(Boolean)) : v.length > 0) : false);

function Etiqueta({ texto, requerido, chico = false }: { texto: string; requerido: boolean; chico?: boolean }) {
  return (
    <span className="fp-et" style={chico ? { fontSize: "0.86rem" } : undefined}>
      {texto}
      {requerido ? <span className="fp-req" title="Obligatoria" aria-label="obligatoria" /> : !chico && <span className="fp-opc">opcional</span>}
    </span>
  );
}

function Opcion({ tipo, nombre, valor, marcada, onChange, children, className = "" }: { tipo: "radio" | "checkbox"; nombre?: string; valor: string; marcada: boolean; onChange: () => void; children: ReactNode; className?: string }) {
  return (
    <label className={`fp-opcion ${tipo === "checkbox" ? "multi" : ""} ${className}`}>
      <input type={tipo} name={nombre} value={valor} checked={marcada} onChange={onChange} />
      <span className="fp-marca"><Visto /></span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

// Tabla de filas repetibles (p. ej. «una fila por actividad»). Con `sugerencias`, arriba aparecen las tareas del cargo
// como casillas: cada una marcada es una fila ya llenada.
function TablaFilas({ campo, columnas, filas, onChange, sugerencias }: {
  campo: CampoForm; columnas: ColumnaTabla[]; filas: Fila[]; onChange: (f: Fila[]) => void; sugerencias?: Sugerencias;
}) {
  const [buscar, setBuscar] = useState("");
  const { tareas, activa } = useTareas(sugerencias);
  const poner = (i: number, k: string, x: string) => onChange(filas.map((f, j) => (j === i ? { ...f, [k]: x } : f)));
  const col = sugerencias?.columna ?? "";
  const lista = tareas ?? [];
  const delPerfil = new Set(lista);
  const marcadas = new Set(filas.map((f) => f[col]).filter((x) => x && delPerfil.has(x)));
  const conDatos = filas.filter((f) => Object.values(f).some(Boolean));
  const nuevaDe = (t: string): Fila => ({ [col]: t, ...(sugerencias?.marca ? { [sugerencias.marca]: "Sí" } : {}) });
  const alternar = (t: string) => {
    if (marcadas.has(t)) onChange(filas.filter((f) => f[col] !== t));
    else if (filas.length < MAX_FILAS) onChange([...conDatos, nuevaDe(t)]);
  };
  const term = buscar.trim().toLowerCase();
  const visiblesT = term ? lista.filter((t) => t.toLowerCase().includes(term)) : lista;
  const todasMarcadas = visiblesT.length > 0 && visiblesT.every((t) => marcadas.has(t));
  const marcarTodas = () => {
    if (todasMarcadas) onChange(filas.filter((f) => !visiblesT.includes(f[col])));
    else onChange([...conDatos, ...visiblesT.filter((t) => !marcadas.has(t)).map(nuevaDe)].slice(0, MAX_FILAS));
  };
  const nueva = () => onChange([...filas, sugerencias?.marca && activa ? { [sugerencias.marca]: "No" } : {}]);

  return (
    <div className="flex flex-col gap-4">
      {sugerencias && (
        <div className="fp-tareas">
          {!activa ? (
            <p className="fp-vacio"><span className="fp-vacio-ico"><Briefcase size={19} /></span><span>Elija su <b>área</b> y su <b>cargo</b>: aquí aparecerán las tareas de su perfil para que solo las marque.</span></p>
          ) : tareas === undefined ? (
            <p className="fp-vacio"><span className="fp-vacio-ico"><Loader2 size={19} className="animate-spin" /></span><span>Cargando las tareas de su cargo…</span></p>
          ) : lista.length === 0 ? (
            <p className="fp-vacio"><span className="fp-vacio-ico"><Sparkles size={19} /></span><span>No tenemos tareas registradas para este cargo. Añada sus actividades con el botón de abajo.</span></p>
          ) : (
            <>
              <div className="fp-tareas-cab">
                <div>
                  <p className="font-bold text-[#10240f]">Tareas de su perfil de cargo</p>
                  <p className="text-sm text-[#6b7d71]">Marque las que realiza.</p>
                </div>
                <span key={marcadas.size} className="fp-contador pulsa"><Visto /> {marcadas.size} de {lista.length}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {lista.length > 6 && (
                  <label className="fp-buscar min-w-0 flex-1">
                    <span className="sr-only">Buscar tarea</span>
                    <Search size={15} aria-hidden />
                    <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar entre sus tareas" className="fp-in" />
                  </label>
                )}
                <button type="button" onClick={marcarTodas} className="fp-enlace">{todasMarcadas ? "Desmarcar" : "Marcar"} {term ? "las encontradas" : "todas"}</button>
              </div>
              <div className="fp-lista-tareas">
                {visiblesT.map((t) => (
                  <Opcion key={t} tipo="checkbox" valor={t} marcada={marcadas.has(t)} onChange={() => alternar(t)} className="fp-tarea">{t}</Opcion>
                ))}
                {visiblesT.length === 0 && (
                  <div className="flex flex-col items-start gap-2 px-1">
                    <p className="text-sm text-[#6b7d71]">Ninguna tarea coincide con «{buscar}».</p>
                    {filas.length < MAX_FILAS && (
                      <button type="button" onClick={() => { onChange([...conDatos, { [col]: buscar.trim(), ...(sugerencias?.marca ? { [sugerencias.marca]: "No" } : {}) }]); setBuscar(""); }} className="fp-boton-sec">
                        <Plus size={18} /> Añadir «{buscar.trim()}» como actividad
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {filas.map((f, i) => {
        const deCatalogo = Boolean(col && f[col] && delPerfil.has(f[col]));
        return (
          <div key={i} className={`fp-fila ${sugerencias && !deCatalogo ? "extra" : ""}`}>
            <div className="fp-fila-cab">
              <span className="fp-chip">{i + 1} · {sugerencias ? (deCatalogo ? "De su perfil" : "Actividad adicional") : campo.etiqueta}</span>
              <span className="flex gap-1">
                {!deCatalogo && <button type="button" onClick={() => filas.length < MAX_FILAS && onChange([...filas.slice(0, i + 1), { ...f }, ...filas.slice(i + 1)])} aria-label={`Duplicar la fila ${i + 1}`} title="Duplicar" className="fp-icono"><Copy size={16} /></button>}
                <button type="button" onClick={() => onChange(filas.length > 1 || sugerencias ? filas.filter((_, j) => j !== i) : [{}])} aria-label={`Quitar la fila ${i + 1}`} title="Quitar" className="fp-icono peligro"><Trash2 size={16} /></button>
              </span>
            </div>
            <div className="fp-grid">
              {columnas.map((k) => {
                const x = f[k.id] ?? "";
                if (deCatalogo && k.id === col) return <div key={k.id} className="fp-campo fp-ancho"><Etiqueta texto={k.etiqueta} requerido={false} chico /><p className="fp-fila-texto">{x}</p></div>;
                return (
                  <label key={k.id} className={`fp-campo ${k.tipo === "parrafo" ? "fp-ancho" : ""}`}>
                    <Etiqueta texto={k.etiqueta} requerido={k.requerido} chico />
                    {k.tipo === "parrafo" ? (
                      <textarea rows={2} maxLength={2000} value={x} onChange={(e) => poner(i, k.id, e.target.value)} className={`fp-in ${x ? "lleno" : ""}`} style={{ minHeight: "4.5rem" }} />
                    ) : k.tipo === "lista" ? (
                      <select value={x} onChange={(e) => poner(i, k.id, e.target.value)} className={`fp-in ${x ? "lleno" : ""}`}>
                        <option value="">Elija…</option>
                        {opcionesForm(k.opciones).map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={x} maxLength={300} inputMode={k.tipo === "numero" ? "decimal" : undefined} onChange={(e) => poner(i, k.id, e.target.value)} className={`fp-in ${x ? "lleno" : ""}`} />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {filas.length < MAX_FILAS && (
        <button type="button" onClick={nueva} className="fp-boton-sec self-start">
          <Plus size={18} /> {sugerencias ? "Añadir una actividad que no está en la lista" : "Añadir otra fila"}
        </button>
      )}
    </div>
  );
}

/** «1 = ninguno · 5 = avanzado» → ["ninguno", "avanzado"]. */
function extremos(ayuda: string): [string, string] {
  const m = ayuda.match(/1\s*=\s*([^·|,]+)[·|,]\s*\d+\s*=\s*(.+)/);
  return m ? [m[1].trim(), m[2].trim()] : ["Bajo", "Alto"];
}

function Gracias({ texto }: { texto: string }) {
  const colores = ["#2c6a14", "#8fd14f", "#d8b558", "#3f8f1f", "#f1d27a"];
  return (
    <div role="status" className="fp-gracias">
      <div className="fp-confeti" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colores[i % colores.length], animationDelay: `${(i % 7) * 0.12}s`, rotate: `${i * 23}deg` }} />
        ))}
      </div>
      <div className="fp-check"><span><Visto /></span></div>
      <p className="font-[var(--font-display)] text-3xl font-bold text-[#10240f]">¡Gracias por responder!</p>
      {texto && <p className="max-w-md text-lg leading-relaxed text-[#3a4d40]">{texto}</p>}
    </div>
  );
}

export function FormularioPublico({ slug, esquema: base, preview = false, mapas = {} }: { slug: string; esquema: EsquemaForm; preview?: boolean; mapas?: Record<string, MapaCargos> }) {
  const [valores, setValores] = useState<Record<string, Valor>>({});
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(false);
  const [pending, start] = useTransition();
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

  if (hecho) return <div className="fp"><Gracias texto={esquema.gracias} /></div>;

  // Secciones: cada «Título de sección» abre una tarjeta; lo que va antes del primero queda en una tarjeta sin título.
  const secciones: { cab?: CampoForm; campos: CampoForm[] }[] = [];
  for (const c of esquema.campos) {
    if (!ver.has(c.id)) continue;
    if (c.tipo === "seccion") secciones.push({ cab: c, campos: [] });
    else {
      if (secciones.length === 0) secciones.push({ campos: [] });
      secciones[secciones.length - 1].campos.push(c);
    }
  }
  const obligatorias = esquema.campos.filter((c) => ver.has(c.id) && esPregunta(c.tipo) && c.requerido);
  const hechas = obligatorias.filter((c) => respondida(valores[c.id])).length;
  const pct = obligatorias.length ? Math.round((hechas / obligatorias.length) * 100) : 0;
  const tieneObligatorias = (s: (typeof secciones)[number]) => s.campos.some((c) => c.requerido);
  const completa = (s: (typeof secciones)[number]) => s.campos.filter((c) => c.requerido).every((c) => respondida(valores[c.id]));
  const actual = Math.max(0, secciones.findIndex((s) => !completa(s)));

  const campo = (c: CampoForm) => {
    const nombre = `c_${c.id}`;
    const opciones = opcionesForm(c.opciones);
    const v = valores[c.id];
    const texto = typeof v === "string" ? v : "";
    const marcadas = (Array.isArray(v) && !esFilas(v) ? v : []) as string[];
    const etiqueta = <Etiqueta texto={c.etiqueta} requerido={c.requerido} />;
    const ancho = ["parrafo", "casillas", "opcion", "escala", "tabla", "archivo"].includes(c.tipo);
    const dos = opciones.length > 2 && opciones.every((o) => o.length <= 30);
    if (c.tipo === "tabla") {
      const sugerencias = sugerenciasDe(c);
      const filas: Fila[] = esFilas(v) ? v : sugerencias ? [] : [{}];
      return (
        <div key={c.id} className="fp-campo fp-ancho">
          <input type="hidden" name={nombre} value={JSON.stringify(filas)} />
          {!sugerencias && etiqueta}
          {c.ayuda && <span className="fp-ayuda">{c.ayuda}</span>}
          <TablaFilas campo={c} columnas={c.columnas ?? []} filas={filas} onChange={(f) => poner(c.id, f)} sugerencias={sugerencias} />
        </div>
      );
    }
    return (
      <div key={c.id} className={`fp-campo ${ancho ? "fp-ancho" : ""}`}>
        {c.tipo === "casillas" || c.tipo === "opcion" ? (
          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 p-0">{etiqueta}</legend>
            <div className={`fp-opciones ${dos ? "dos" : ""}`}>
              {opciones.map((o) => (
                <Opcion key={o} tipo={c.tipo === "casillas" ? "checkbox" : "radio"} nombre={nombre} valor={o}
                  marcada={c.tipo === "casillas" ? marcadas.includes(o) : texto === o}
                  onChange={() => poner(c.id, c.tipo === "casillas" ? (marcadas.includes(o) ? marcadas.filter((x) => x !== o) : [...marcadas, o]) : o)}>{o}</Opcion>
              ))}
            </div>
          </fieldset>
        ) : c.tipo === "escala" ? (
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2.5 p-0">{etiqueta}</legend>
            <div className="fp-escala" style={{ ["--n" as string]: c.max }}>
              {Array.from({ length: c.max }, (_, k) => String(k + 1)).map((n) => (
                <label key={n}><input type="radio" name={nombre} value={n} checked={texto === n} onChange={() => poner(c.id, n)} />{n}</label>
              ))}
            </div>
            <div className="fp-escala-pie"><span>{extremos(c.ayuda)[0]}</span><span>{extremos(c.ayuda)[1]}</span></div>
          </fieldset>
        ) : (
          <label className="flex flex-col gap-2">
            {etiqueta}
            {c.tipo === "parrafo" ? (
              <textarea name={nombre} rows={4} maxLength={3000} value={texto} onChange={(e) => poner(c.id, e.target.value)} className={`fp-in ${texto ? "lleno" : ""}`} placeholder="Escriba aquí…" />
            ) : c.tipo === "lista" ? (
              <select name={nombre} value={texto} onChange={(e) => poner(c.id, e.target.value)} className={`fp-in ${texto ? "lleno" : ""}`} disabled={Boolean(c.catalogo) && opciones.length === 0}>
                <option value="" disabled>{c.catalogo && opciones.length === 0 ? `Primero elija «${base.campos.find((x) => x.id === c.catalogo?.padre)?.etiqueta ?? "la pregunta anterior"}»` : "Elija una opción…"}</option>
                {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : c.tipo === "archivo" ? (
              <span className="fp-archivo"><Paperclip size={18} aria-hidden /><input type="file" name={nombre} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" /></span>
            ) : (
              <input
                name={nombre} className={`fp-in ${texto ? "lleno" : ""}`} maxLength={300} value={texto} onChange={(e) => poner(c.id, e.target.value)}
                type={c.tipo === "correo" ? "email" : c.tipo === "telefono" ? "tel" : c.tipo === "fecha" ? "date" : "text"}
                inputMode={c.tipo === "numero" ? "decimal" : undefined}
                autoComplete={c.tipo === "correo" ? "email" : c.tipo === "telefono" ? "tel" : c.tipo === "texto" && /nombre/i.test(c.etiqueta) ? "name" : "off"}
                placeholder={c.tipo === "correo" ? "nombre@correo.com" : undefined}
              />
            )}
          </label>
        )}
        {c.ayuda && c.tipo !== "escala" && <span className="fp-ayuda">{c.ayuda}</span>}
        {c.tipo === "archivo" && <span className="fp-ayuda">PDF, Word, Excel, JPG o PNG · hasta 10 MB.</span>}
      </div>
    );
  };

  return (
    <form
      noValidate
      className="fp"
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
          if (r.ok) {
            setHecho(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else setError(r.error ?? "No se pudo enviar. Intente de nuevo.");
        });
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <div aria-hidden style={{ position: "absolute", left: "-9999px" }}><label>Sitio web <input name="sitio_web" tabIndex={-1} autoComplete="off" /></label></div>

      {obligatorias.length > 0 && (
        <div className="fp-progreso" aria-live="polite">
          <span className="fp-progreso-txt">{secciones.length > 1 ? <>Sección <b>{actual + 1}</b> de {secciones.length}</> : "Progreso"}</span>
          <span className="fp-barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Preguntas obligatorias respondidas"><span style={{ width: `${pct}%` }} /></span>
          <span className="fp-progreso-txt"><b>{pct}%</b></span>
        </div>
      )}

      {esquema.campos.length === 0 && <div className="fp-seccion"><p className="text-[#6b7d71]">Este formulario todavía no tiene preguntas.</p></div>}

      {secciones.map((s, i) => {
        const lista = completa(s) && tieneObligatorias(s);
        return (
          <section key={s.cab?.id ?? `s${i}`} className="fp-seccion" style={{ ["--i" as string]: i }} aria-labelledby={s.cab ? `t-${s.cab.id}` : undefined}>
            {s.cab && (
              <header className="fp-seccion-cab">
                <span className={`fp-num ${lista ? "ok" : ""}`}>{lista ? <Visto /> : i + 1}</span>
                <div>
                  <h2 id={`t-${s.cab.id}`} className="fp-seccion-tit">{s.cab.etiqueta.replace(/^\d+[.)]\s*/, "")}</h2>
                  {s.cab.ayuda && <p className="fp-seccion-desc">{s.cab.ayuda}</p>}
                </div>
              </header>
            )}
            <div className="fp-grid">{s.campos.map(campo)}</div>
          </section>
        );
      })}

      {esquema.campos.length > 0 && (
        <div className="fp-pie">
          {error && <p role="alert" className="fp-error"><AlertCircle size={18} /> {error}</p>}
          <button type="submit" disabled={pending} className="fp-enviar">
            {pending ? <Loader2 size={19} className="animate-spin" aria-hidden /> : <Send size={19} aria-hidden />} {pending ? "Enviando…" : "Enviar respuestas"}
          </button>
          <p className="fp-legal">Sus respuestas llegan solo al equipo de FEDEGÁN que creó este formulario.</p>
        </div>
      )}
    </form>
  );
}

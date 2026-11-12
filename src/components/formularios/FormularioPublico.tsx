"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Copy, Loader2, Paperclip, Plus, Send, Trash2 } from "lucide-react";
import { enviarFormulario } from "@/lib/cms/formularios-actions";
import { MAX_FILAS, esFilas, opcionesForm, visibles, type ColumnaTabla, type EsquemaForm, type Fila, type Valor } from "@/lib/cms/formulario-esquema";

// Tabla de filas repetibles (p. ej. «una fila por actividad»): cada fila es una tarjeta con sus columnas, cómoda también en el móvil.
function TablaFilas({ etiqueta, ayuda, columnas, filas, onChange }: { etiqueta: ReactNode; ayuda: string; columnas: ColumnaTabla[]; filas: Fila[]; onChange: (f: Fila[]) => void }) {
  const poner = (i: number, k: string, x: string) => onChange(filas.map((f, j) => (j === i ? { ...f, [k]: x } : f)));
  return (
    <fieldset className="fm-set">
      <legend>{etiqueta}</legend>
      {ayuda && <span className="fm-ayuda mb-2 block">{ayuda}</span>}
      <div className="flex flex-col gap-3">
        {filas.map((f, i) => (
          <div key={i} className="rounded-2xl border border-[#e3ecdb] bg-[#fafcf7] p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[#2c6a14]"><span className="grid size-6 place-items-center rounded-full bg-[#2c6a14] text-xs text-white">{i + 1}</span> Fila {i + 1}</span>
              <span className="flex gap-1">
                <button type="button" onClick={() => filas.length < MAX_FILAS && onChange([...filas.slice(0, i + 1), { ...f }, ...filas.slice(i + 1)])} aria-label={`Duplicar la fila ${i + 1}`} title="Duplicar" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-white"><Copy size={15} /></button>
                <button type="button" onClick={() => onChange(filas.length > 1 ? filas.filter((_, j) => j !== i) : [{}])} aria-label={`Quitar la fila ${i + 1}`} title="Quitar" className="grid size-8 place-items-center rounded-lg text-[#a02323] hover:bg-[#fdecec]"><Trash2 size={15} /></button>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {columnas.map((k) => {
                const x = f[k.id] ?? "";
                const et = <span className="fm-et text-sm">{k.etiqueta}{k.requerido && <abbr title="Obligatoria" className="fm-req">*</abbr>}</span>;
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
        ))}
        {filas.length < MAX_FILAS && (
          <button type="button" onClick={() => onChange([...filas, {}])} className="inline-flex w-fit items-center gap-1.5 rounded-xl border-2 border-dashed border-[#b9cfa8] px-4 py-2.5 text-sm font-semibold text-[#2c6a14] transition hover:border-[#2c6a14] hover:bg-[#f3f9ee]">
            <Plus size={16} /> Añadir otra fila
          </button>
        )}
      </div>
    </fieldset>
  );
}

// Formulario público (y vista previa del constructor): las preguntas con condición aparecen o se ocultan al responder.
// El envío no usa el reinicio automático de React: si hay un error, lo escrito se conserva.
export function FormularioPublico({ slug, esquema, preview = false }: { slug: string; esquema: EsquemaForm; preview?: boolean }) {
  const [valores, setValores] = useState<Record<string, Valor>>({});
  const [error, setError] = useState("");
  const [hecho, setHecho] = useState(false);
  const [pending, start] = useTransition();
  const ver = visibles(esquema.campos, valores);
  const poner = (id: string, v: Valor) => setValores((p) => ({ ...p, [id]: v }));

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
          const filas: Fila[] = esFilas(v) ? v : [{}];
          return (
            <div key={c.id} className="fm-campo fm-ancho">
              <input type="hidden" name={nombre} value={JSON.stringify(filas)} />
              <TablaFilas etiqueta={etiqueta} ayuda={c.ayuda} columnas={c.columnas ?? []} filas={filas} onChange={(f) => poner(c.id, f)} />
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
                  <select name={nombre} value={texto} onChange={(e) => poner(c.id, e.target.value)} className="fm-in">
                    <option value="" disabled>Elija una opción…</option>
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

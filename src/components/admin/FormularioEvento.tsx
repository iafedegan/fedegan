"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, ClipboardList, Eye, Loader2, Plus, Save, Sparkles, Trash2, Webhook, XCircle } from "lucide-react";
import { guardarFormularioEvento, type GuardarFormEstado } from "@/lib/cms/inscripciones-actions";
import { FormInscripcion } from "@/components/eventos/FormInscripcion";
import { MAX_PREGUNTAS, SUGERENCIAS, TIPOS_CAMPO, type FormEvento, type Pregunta } from "@/lib/cms/inscripcion-form";

// Editor del formulario de inscripción de un evento: las preguntas se arman a la izquierda y la vista previa
// (la misma que verá el público) se actualiza al instante a la derecha. Nada se publica hasta pulsar «Guardar».
const ctl = "ad-input";

export function FormularioEvento({ id, slug, inicial, writable }: { id: string; slug: string; inicial: FormEvento; writable: boolean }) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>(inicial.preguntas);
  const [gracias, setGracias] = useState(inicial.gracias);
  const [webhook, setWebhook] = useState(inicial.webhook);
  const [abierta, setAbierta] = useState<number | null>(null);
  const [state, action, pending] = useActionState<GuardarFormEstado, FormData>(guardarFormularioEvento, {});

  const cambiar = (i: number, p: Partial<Pregunta>) => setPreguntas((l) => l.map((x, k) => (k === i ? { ...x, ...p } : x)));
  const mover = (i: number, d: -1 | 1) =>
    setPreguntas((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const quitar = (i: number) => {
    setPreguntas((l) => l.filter((_, k) => k !== i));
    setAbierta(null);
  };
  const añadir = (p: Pregunta) => {
    if (preguntas.length >= MAX_PREGUNTAS) return;
    setPreguntas((l) => [...l, { ...p }]);
    setAbierta(preguntas.length);
  };
  const usadas = new Set(preguntas.map((p) => p.etiqueta.toLowerCase()));
  const form: FormEvento = { preguntas: preguntas.filter((p) => p.etiqueta.trim()), gracias, webhook };

  return (
    <section className="ad-card overflow-hidden" aria-labelledby="fe-t">
      <header className="flex flex-wrap items-center gap-4 border-b border-[#eceae0] bg-gradient-to-r from-[#eef6e6] to-white px-5 py-5 sm:px-7">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#2c6a14] text-white shadow-md"><ClipboardList size={22} /></span>
        <div className="min-w-0 flex-1">
          <h2 id="fe-t" className="text-xl font-bold">Formulario de inscripción</h2>
          <p className="text-sm text-[#5d6e65]">Arme las preguntas que verá quien se inscriba. Nombre y correo se piden siempre, y cada inscrito recibe su código QR.</p>
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <form action={action} className="flex min-w-0 flex-col">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="form" value={JSON.stringify(form)} />

        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <ol className="flex flex-col gap-2.5">
            {preguntas.map((p, i) => {
              const abiertaEsta = abierta === i;
              const conOpciones = p.tipo === "lista" || p.tipo === "casillas";
              return (
                <li key={i} className={`rounded-2xl border bg-white transition ${abiertaEsta ? "border-[#4f9a2a] shadow-[0_8px_24px_-14px_rgba(44,106,20,.6)]" : "border-[#e1e5da] hover:border-[#b9cfa8]"}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button type="button" onClick={() => setAbierta(abiertaEsta ? null : i)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={abiertaEsta}>
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e5f3da] text-xs font-bold text-[#2c6a14]">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.etiqueta || "Pregunta sin nombre"}{p.requerido && <span className="text-[#89114c]"> *</span>}</span>
                        <span className="block text-xs text-[#667a6c]">{TIPOS_CAMPO.find((t) => t.valor === p.tipo)?.nombre}</span>
                      </span>
                    </button>
                    <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-[#eef6f1] disabled:opacity-30"><ArrowUp size={15} /></button>
                    <button type="button" onClick={() => mover(i, 1)} disabled={i === preguntas.length - 1} aria-label="Bajar" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-[#eef6f1] disabled:opacity-30"><ArrowDown size={15} /></button>
                    <button type="button" onClick={() => quitar(i)} aria-label="Quitar la pregunta" className="grid size-8 place-items-center rounded-lg text-[#a02323] hover:bg-[#fdecec]"><Trash2 size={15} /></button>
                  </div>
                  {abiertaEsta && (
                    <div className="grid gap-3 border-t border-[#eceae0] p-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Pregunta
                        <input className={ctl} value={p.etiqueta} maxLength={120} onChange={(e) => cambiar(i, { etiqueta: e.target.value })} placeholder="Por ejemplo: ¿Cuántas cabezas de ganado tiene?" />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm font-semibold">Tipo de respuesta
                        <select className={ctl} value={p.tipo} onChange={(e) => cambiar(i, { tipo: e.target.value as Pregunta["tipo"] })}>
                          {TIPOS_CAMPO.map((t) => <option key={t.valor} value={t.valor}>{t.nombre}</option>)}
                        </select>
                      </label>
                      <label className="flex items-center gap-2.5 self-end rounded-xl border border-[#dcdcd6] px-3.5 py-2.5 text-sm font-semibold">
                        <input type="checkbox" checked={p.requerido} onChange={(e) => cambiar(i, { requerido: e.target.checked })} className="size-4 accent-[#2c6a14]" /> Es obligatoria
                      </label>
                      {conOpciones && (
                        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Opciones <span className="font-normal text-[#667a6c]">(una por línea)</span>
                          <textarea className={ctl} rows={4} value={p.opciones} maxLength={600} onChange={(e) => cambiar(i, { opciones: e.target.value })} />
                        </label>
                      )}
                      <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Ayuda bajo la pregunta <span className="font-normal text-[#667a6c]">(opcional)</span>
                        <input className={ctl} value={p.ayuda} maxLength={160} onChange={(e) => cambiar(i, { ayuda: e.target.value })} />
                      </label>
                    </div>
                  )}
                </li>
              );
            })}
            {preguntas.length === 0 && <li className="rounded-2xl border border-dashed border-[#cfd8c4] px-4 py-8 text-center text-sm text-[#667a6c]">Solo se pedirán nombre y correo. Añada preguntas con los botones de abajo.</li>}
          </ol>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#5d6e65]"><Sparkles size={13} /> Añadir con un clic</p>
            <div className="flex flex-wrap gap-2">
              {SUGERENCIAS.filter((s) => !usadas.has(s.etiqueta.toLowerCase())).map((s) => (
                <button key={s.etiqueta} type="button" onClick={() => añadir(s)} disabled={preguntas.length >= MAX_PREGUNTAS} className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe0c2] bg-[#f3f9ee] px-3.5 py-1.5 text-sm font-medium text-[#2c6a14] transition hover:bg-[#e3f2d6] disabled:opacity-40">
                  <Plus size={14} /> {s.etiqueta}
                </button>
              ))}
              <button type="button" onClick={() => añadir({ etiqueta: "", tipo: "texto", opciones: "", ayuda: "", requerido: false })} disabled={preguntas.length >= MAX_PREGUNTAS} className="inline-flex items-center gap-1.5 rounded-full bg-[#2c6a14] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#245611] disabled:opacity-40">
                <Plus size={14} /> Pregunta nueva
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">Mensaje al inscribirse <span className="font-normal text-[#667a6c]">(opcional, sale junto al código QR)</span>
            <textarea className={ctl} rows={2} value={gracias} maxLength={300} onChange={(e) => setGracias(e.target.value)} placeholder="Por ejemplo: Lleve su cédula y llegue 20 minutos antes." />
          </label>

          <div className="rounded-2xl border border-[#dfe4d6] bg-[#f8faf4] p-4">
            <p className="flex items-center gap-2 font-bold"><Webhook size={17} /> Conectar con una API <span className="text-sm font-normal text-[#667a6c]">(opcional)</span></p>
            <p className="mt-1 text-sm text-[#5d6e65]">Cada inscripción se envía además, por POST en JSON, a esta dirección (su CRM, una hoja de cálculo, un flujo de automatización…). No se muestra a los visitantes. Si la API falla, la inscripción queda guardada igual.</p>
            <input className={`${ctl} mt-3 font-mono text-sm`} value={webhook} maxLength={400} onChange={(e) => setWebhook(e.target.value)} placeholder="https://api.suempresa.com/inscripciones" inputMode="url" />
          </div>
        </div>


        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-[#eceae0] bg-white/95 px-5 py-3.5 backdrop-blur sm:px-7 ">
          <button type="submit" disabled={pending || !writable} className="ad-btn ad-btn-primary">
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar formulario
          </button>
          {!writable && <span className="text-sm text-[#7a1f1f]">Sin conexión de escritura: no se puede guardar.</span>}
          {state.message && (
            <p role={state.ok ? "status" : "alert"} className={`flex items-center gap-1.5 text-sm font-semibold ${state.ok ? "text-[#14573a]" : "text-[#7a1f1f]"}`}>
              {state.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {state.message}
            </p>
          )}
        </div>
      </form>
        <aside className="border-t border-[#eceae0] bg-[#f6f8f2] p-5 sm:p-7 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#5d6e65]"><Eye size={13} /> Así lo verá el público</p>
            <div className="rounded-3xl border border-[#dcdcd6] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-xl font-bold text-[#10240f]">Inscríbase al evento</h3>
              <FormInscripcion key={JSON.stringify(form.preguntas)} slug={slug} preguntas={form.preguntas} preview />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

"use client";

import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Copy, Eye, GitBranch, Loader2, Plus, Rocket, Save, Trash2, XCircle } from "lucide-react";
import { guardarFormulario, type GuardarFormularioEstado } from "@/lib/cms/formularios-actions";
import { FormularioPublico } from "@/components/formularios/FormularioPublico";
import {
  MAX_CAMPOS, OPERADORES, TIPOS_CAMPO_FORM, campoNuevo, conOpciones, opcionesForm,
  type CampoForm, type EsquemaForm, type TipoCampoForm,
} from "@/lib/cms/formulario-esquema";

// Constructor de formularios: las preguntas se arman a la izquierda y la vista previa (la misma que verá el público)
// se actualiza al instante a la derecha. Nada llega al público hasta pulsar «Publicar».
const ctl = "ad-input";

const PLANTILLAS: { nombre: string; campos: [TipoCampoForm, string, string?][] }[] = [
  { nombre: "Contacto", campos: [["texto", "Nombre completo"], ["correo", "Correo electrónico"], ["telefono", "Celular"], ["parrafo", "Mensaje"]] },
  { nombre: "Satisfacción", campos: [["escala", "¿Qué tan satisfecho quedó con el servicio?"], ["opcion", "¿Nos recomendaría?", "Sí\nNo\nTal vez"], ["parrafo", "¿Qué podemos mejorar?"]] },
];

export function FormularioConstructor({
  id, estado, version, hayCambiosSinPublicar, inicial, writable,
}: {
  id: string;
  estado: "borrador" | "publicado" | "cerrado";
  version: number;
  hayCambiosSinPublicar: boolean;
  inicial: { title: string; description: string; slug: string; schema: EsquemaForm };
  writable: boolean;
}) {
  const [title, setTitle] = useState(inicial.title);
  const [description, setDescription] = useState(inicial.description);
  const [slug, setSlug] = useState(inicial.slug);
  const [campos, setCampos] = useState<CampoForm[]>(inicial.schema.campos);
  const [gracias, setGracias] = useState(inicial.schema.gracias);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [state, action, pending] = useActionState<GuardarFormularioEstado, FormData>(guardarFormulario, {});

  const cambiar = (cid: string, p: Partial<CampoForm>) => setCampos((l) => l.map((x) => (x.id === cid ? { ...x, ...p } : x)));
  const mover = (i: number, d: -1 | 1) =>
    setCampos((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      // Una condición solo puede mirar una pregunta anterior: si el orden la rompe, se quita.
      return n.map((c, k) => (c.si && !n.slice(0, k).some((p) => p.id === c.si!.campo) ? { ...c, si: undefined } : c));
    });
  const quitar = (cid: string) => {
    setCampos((l) => l.filter((x) => x.id !== cid).map((c) => (c.si?.campo === cid ? { ...c, si: undefined } : c)));
    setAbierta(null);
  };
  const duplicar = (i: number) =>
    setCampos((l) => {
      if (l.length >= MAX_CAMPOS) return l;
      const n = [...l];
      n.splice(i + 1, 0, { ...l[i], id: campoNuevo().id, si: undefined });
      return n;
    });
  const añadir = (tipo: TipoCampoForm) => {
    if (campos.length >= MAX_CAMPOS) return;
    const c = campoNuevo(tipo);
    setCampos((l) => [...l, c]);
    setAbierta(c.id);
  };
  const usarPlantilla = (p: (typeof PLANTILLAS)[number]) => {
    if (campos.length > 0 && !confirm("Esto reemplaza las preguntas actuales. ¿Continuar?")) return;
    setCampos(p.campos.map(([t, e, o]) => ({ ...campoNuevo(t, e), ...(o ? { opciones: o } : {}), requerido: false })));
    setAbierta(null);
  };

  const esquema: EsquemaForm = { campos: campos.filter((c) => c.etiqueta.trim()), gracias };
  const estadoTxt = estado === "publicado" ? "Publicado" : estado === "cerrado" ? "Cerrado" : "Borrador";

  return (
    <section className="ad-card overflow-hidden" aria-label="Constructor del formulario">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <form action={action} className="flex min-w-0 flex-col">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="schema" value={JSON.stringify(esquema)} />

          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Nombre del formulario
                <input name="title" className={ctl} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Descripción <span className="font-normal text-[#667a6c]">(opcional, sale arriba del formulario)</span>
                <textarea name="description" className={ctl} rows={2} value={description} maxLength={600} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Dirección pública
                <span className="flex items-center gap-1 rounded-xl border border-[#dcdcd6] bg-white pl-3 text-sm text-[#667a6c] focus-within:border-[#4f9a2a]">
                  /formularios/
                  <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} maxLength={60} className="min-w-0 flex-1 rounded-xl border-0 bg-transparent py-2.5 pr-3 font-mono text-[#10240f] outline-none" />
                </span>
              </label>
            </div>

            <ol className="flex flex-col gap-2.5">
              {campos.map((c, i) => {
                const abiertaEsta = abierta === c.id;
                const anteriores = campos.slice(0, i).filter((p) => p.etiqueta.trim());
                const objetivo = anteriores.find((p) => p.id === c.si?.campo);
                const opcionesObjetivo = objetivo ? (conOpciones(objetivo.tipo) ? opcionesForm(objetivo.opciones) : objetivo.tipo === "escala" ? Array.from({ length: objetivo.max }, (_, k) => String(k + 1)) : []) : [];
                return (
                  <li key={c.id} className={`rounded-2xl border bg-white transition ${abiertaEsta ? "border-[#4f9a2a] shadow-[0_8px_24px_-14px_rgba(44,106,20,.6)]" : "border-[#e1e5da] hover:border-[#b9cfa8]"}`}>
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button type="button" onClick={() => setAbierta(abiertaEsta ? null : c.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={abiertaEsta}>
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e5f3da] text-xs font-bold text-[#2c6a14]">{i + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{c.etiqueta || "Pregunta sin nombre"}{c.requerido && <span className="text-[#89114c]"> *</span>}</span>
                          <span className="flex items-center gap-1.5 text-xs text-[#667a6c]">{TIPOS_CAMPO_FORM.find((t) => t.valor === c.tipo)?.nombre}{c.si && <span className="inline-flex items-center gap-1 text-[#8a5a00]"><GitBranch size={11} /> con condición</span>}</span>
                        </span>
                      </button>
                      <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-[#eef6f1] disabled:opacity-30"><ArrowUp size={15} /></button>
                      <button type="button" onClick={() => mover(i, 1)} disabled={i === campos.length - 1} aria-label="Bajar" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-[#eef6f1] disabled:opacity-30"><ArrowDown size={15} /></button>
                      <button type="button" onClick={() => duplicar(i)} disabled={campos.length >= MAX_CAMPOS} aria-label="Duplicar la pregunta" className="grid size-8 place-items-center rounded-lg text-[#5d6e65] hover:bg-[#eef6f1] disabled:opacity-30"><Copy size={15} /></button>
                      <button type="button" onClick={() => quitar(c.id)} aria-label="Quitar la pregunta" className="grid size-8 place-items-center rounded-lg text-[#a02323] hover:bg-[#fdecec]"><Trash2 size={15} /></button>
                    </div>
                    {abiertaEsta && (
                      <div className="grid gap-3 border-t border-[#eceae0] p-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Pregunta
                          <input className={ctl} value={c.etiqueta} maxLength={160} onChange={(e) => cambiar(c.id, { etiqueta: e.target.value })} placeholder="Por ejemplo: ¿Cuántas cabezas de ganado tiene?" autoFocus />
                        </label>
                        <label className="flex flex-col gap-1.5 text-sm font-semibold">Tipo de respuesta
                          <select className={ctl} value={c.tipo} onChange={(e) => {
                            const tipo = e.target.value as TipoCampoForm;
                            cambiar(c.id, { tipo, ...(conOpciones(tipo) && !c.opciones.trim() ? { opciones: "Opción 1\nOpción 2" } : {}) });
                          }}>
                            {TIPOS_CAMPO_FORM.map((t) => <option key={t.valor} value={t.valor}>{t.nombre}</option>)}
                          </select>
                        </label>
                        <label className="flex items-center gap-2.5 self-end rounded-xl border border-[#dcdcd6] px-3.5 py-2.5 text-sm font-semibold">
                          <input type="checkbox" checked={c.requerido} onChange={(e) => cambiar(c.id, { requerido: e.target.checked })} className="size-4 accent-[#2c6a14]" /> Es obligatoria
                        </label>
                        {conOpciones(c.tipo) && (
                          <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Opciones <span className="font-normal text-[#667a6c]">(una por línea)</span>
                            <textarea className={ctl} rows={4} value={c.opciones} maxLength={1500} onChange={(e) => cambiar(c.id, { opciones: e.target.value })} />
                          </label>
                        )}
                        {c.tipo === "escala" && (
                          <label className="flex flex-col gap-1.5 text-sm font-semibold">Valores de la escala
                            <select className={ctl} value={c.max} onChange={(e) => cambiar(c.id, { max: Number(e.target.value) })}>
                              <option value={5}>De 1 a 5</option>
                              <option value={10}>De 1 a 10</option>
                            </select>
                          </label>
                        )}
                        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Ayuda bajo la pregunta <span className="font-normal text-[#667a6c]">(opcional)</span>
                          <input className={ctl} value={c.ayuda} maxLength={200} onChange={(e) => cambiar(c.id, { ayuda: e.target.value })} />
                        </label>

                        <div className="rounded-xl border border-[#dfe4d6] bg-[#f8faf4] p-3.5 sm:col-span-2">
                          <p className="flex items-center gap-2 text-sm font-bold"><GitBranch size={15} /> Lógica condicional</p>
                          {anteriores.length === 0 ? (
                            <p className="mt-1 text-sm text-[#667a6c]">Disponible desde la segunda pregunta: podrá mostrarla solo según lo que se responda antes.</p>
                          ) : !c.si ? (
                            <button type="button" onClick={() => cambiar(c.id, { si: { campo: anteriores[anteriores.length - 1].id, op: "es", valor: "" } })} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#cfe0c2] bg-white px-3 py-1.5 text-sm font-medium text-[#2c6a14] hover:bg-[#e3f2d6]">
                              <Plus size={14} /> Mostrar solo si…
                            </button>
                          ) : (
                            <div className="mt-2 grid gap-2 sm:grid-cols-3">
                              <label className="flex flex-col gap-1 text-xs font-semibold sm:col-span-3">Mostrar esta pregunta solo si
                                <select className={ctl} value={c.si.campo} onChange={(e) => cambiar(c.id, { si: { ...c.si!, campo: e.target.value, valor: "" } })}>
                                  {anteriores.map((p) => <option key={p.id} value={p.id}>{p.etiqueta}</option>)}
                                </select>
                              </label>
                              <select aria-label="Condición" className={ctl} value={c.si.op} onChange={(e) => cambiar(c.id, { si: { ...c.si!, op: e.target.value as NonNullable<CampoForm["si"]>["op"] } })}>
                                {OPERADORES.map((o) => <option key={o.valor} value={o.valor}>{o.nombre}</option>)}
                              </select>
                              {c.si.op !== "responde" && (opcionesObjetivo.length > 0 ? (
                                <select aria-label="Valor" className={ctl} value={c.si.valor} onChange={(e) => cambiar(c.id, { si: { ...c.si!, valor: e.target.value } })}>
                                  <option value="" disabled>Elija…</option>
                                  {opcionesObjetivo.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              ) : (
                                <input aria-label="Valor" className={ctl} value={c.si.valor} maxLength={100} placeholder="Valor" onChange={(e) => cambiar(c.id, { si: { ...c.si!, valor: e.target.value } })} />
                              ))}
                              <button type="button" onClick={() => cambiar(c.id, { si: undefined })} className="rounded-xl border border-[#dcdcd6] px-3 py-2 text-sm font-medium text-[#a02323] hover:bg-[#fdecec]">Quitar condición</button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
              {campos.length === 0 && (
                <li className="rounded-2xl border border-dashed border-[#cfd8c4] px-4 py-8 text-center text-sm text-[#667a6c]">
                  <p>Todavía no hay preguntas. Añádalas con los botones de abajo o parta de una plantilla.</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {PLANTILLAS.map((p) => <button key={p.nombre} type="button" onClick={() => usarPlantilla(p)} className="rounded-full border border-[#cfe0c2] bg-[#f3f9ee] px-3.5 py-1.5 text-sm font-medium text-[#2c6a14] hover:bg-[#e3f2d6]">Plantilla: {p.nombre}</button>)}
                  </div>
                </li>
              )}
            </ol>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5d6e65]">Añadir pregunta <span className="font-normal normal-case tracking-normal">({campos.length}/{MAX_CAMPOS})</span></p>
              <div className="flex flex-wrap gap-2">
                {TIPOS_CAMPO_FORM.map((t) => (
                  <button key={t.valor} type="button" onClick={() => añadir(t.valor)} disabled={campos.length >= MAX_CAMPOS} className="inline-flex items-center gap-1.5 rounded-full border border-[#cfe0c2] bg-[#f3f9ee] px-3.5 py-1.5 text-sm font-medium text-[#2c6a14] transition hover:bg-[#e3f2d6] disabled:opacity-40">
                    <Plus size={14} /> {t.nombre}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-semibold">Mensaje al enviar <span className="font-normal text-[#667a6c]">(opcional, sale tras responder)</span>
              <textarea className={ctl} rows={2} value={gracias} maxLength={400} onChange={(e) => setGracias(e.target.value)} placeholder="Por ejemplo: Nos pondremos en contacto en los próximos días." />
            </label>
          </div>

          <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-[#eceae0] bg-white/95 px-5 py-3.5 backdrop-blur sm:px-7">
            <button type="submit" name="intent" value="guardar" disabled={pending || !writable} className="ad-btn ad-btn-ghost">
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar borrador
            </button>
            <button type="submit" name="intent" value="publicar" disabled={pending || !writable} className="ad-btn ad-btn-primary">
              <Rocket size={16} /> {estado === "borrador" ? "Publicar" : "Publicar cambios"}
            </button>
            <span className="text-xs text-[#667a6c]">
              {estadoTxt}{version > 0 ? ` · versión ${version}` : ""}{hayCambiosSinPublicar && estado !== "borrador" ? " · hay cambios sin publicar" : ""}
            </span>
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
              <h3 className="text-xl font-bold text-[#10240f]">{title || "Formulario sin nombre"}</h3>
              {description && <p className="mb-4 mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#44564a]">{description}</p>}
              <div className={description ? "" : "mt-4"}>
                <FormularioPublico slug={slug} esquema={esquema} preview />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

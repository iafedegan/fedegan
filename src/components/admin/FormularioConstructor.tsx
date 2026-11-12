"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  AlignLeft, ArrowDown, ArrowUp, Calendar, CheckCircle2, CircleDot, Copy, Eye, GitBranch, GripVertical, Hash,
  List, ListChecks, Loader2, Mail, Monitor, Paperclip, Phone, Plus, Rocket, Save, Settings2, Smartphone, Sparkles, Star, Trash2, Type, X, XCircle,
  type LucideIcon,
} from "lucide-react";
import { guardarFormulario, type GuardarFormularioEstado } from "@/lib/cms/formularios-actions";
import { FormularioPublico } from "@/components/formularios/FormularioPublico";
import {
  MAX_CAMPOS, OPERADORES, TIPOS_CAMPO_FORM, campoNuevo, conOpciones, opcionesForm,
  type CampoForm, type EsquemaForm, type TipoCampoForm,
} from "@/lib/cms/formulario-esquema";

// Constructor de formularios: a la izquierda el lienzo (título y preguntas como tarjetas, al estilo de Google Forms y Tally),
// a la derecha la vista previa en vivo dentro de un marco de escritorio o móvil. Nada llega al público hasta pulsar «Publicar».

const ICONO: Record<TipoCampoForm, LucideIcon> = {
  texto: Type, parrafo: AlignLeft, numero: Hash, correo: Mail, telefono: Phone, fecha: Calendar,
  opcion: CircleDot, lista: List, casillas: ListChecks, escala: Star, archivo: Paperclip,
};
const GRUPOS: { titulo: string; tipos: TipoCampoForm[] }[] = [
  { titulo: "Texto y datos", tipos: ["texto", "parrafo", "numero", "correo", "telefono", "fecha"] },
  { titulo: "Opciones", tipos: ["opcion", "lista", "casillas", "escala"] },
  { titulo: "Otros", tipos: ["archivo"] },
];
const nombreTipo = (t: TipoCampoForm) => TIPOS_CAMPO_FORM.find((x) => x.valor === t)?.nombre ?? t;

const PLANTILLAS: { nombre: string; desc: string; icono: LucideIcon; campos: [TipoCampoForm, string, string?][] }[] = [
  { nombre: "Contacto", desc: "Nombre, correo, celular y mensaje", icono: Mail, campos: [["texto", "Nombre completo"], ["correo", "Correo electrónico"], ["telefono", "Celular"], ["parrafo", "Mensaje"]] },
  { nombre: "Satisfacción", desc: "Valoración, recomendación y mejoras", icono: Star, campos: [["escala", "¿Qué tan satisfecho quedó con el servicio?"], ["opcion", "¿Nos recomendaría?", "Sí\nNo\nTal vez"], ["parrafo", "¿Qué podemos mejorar?"]] },
  { nombre: "Registro ganadero", desc: "Datos del predio y del hato", icono: ListChecks, campos: [["texto", "Nombre del predio"], ["texto", "Municipio"], ["lista", "Tamaño del hato", "Menos de 50 cabezas\nDe 50 a 200\nMás de 200"], ["casillas", "Orientación", "Carne\nLeche\nDoble propósito\nCría"]] },
];

const input = "w-full rounded-xl border border-[#dfe3d8] bg-white px-3.5 py-2.5 text-[0.95rem] text-[#10240f] outline-none transition placeholder:text-[#9aa79e] focus:border-[#4f9a2a] focus:ring-4 focus:ring-[#4f9a2a]/10";

function Interruptor({ activo, onChange, children }: { activo: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={activo} onClick={() => onChange(!activo)} className="inline-flex items-center gap-2.5 text-sm font-medium text-[#33463a]">
      <span className={`relative h-6 w-11 rounded-full transition-colors ${activo ? "bg-[#2c6a14]" : "bg-[#d5dbcf]"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${activo ? "left-[1.375rem]" : "left-0.5"}`} />
      </span>
      {children}
    </button>
  );
}

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
  const [abierta, setAbierta] = useState<string | null>(inicial.schema.campos[0]?.id ?? null);
  const [pestaña, setPestaña] = useState<"preguntas" | "ajustes">("preguntas");
  const [dispositivo, setDispositivo] = useState<"escritorio" | "movil">("escritorio");
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
  const duplicar = (i: number) => {
    if (campos.length >= MAX_CAMPOS) return;
    const copia = { ...campos[i], id: campoNuevo().id, si: undefined };
    setCampos((l) => [...l.slice(0, i + 1), copia, ...l.slice(i + 1)]);
    setAbierta(copia.id);
  };
  const añadir = (tipo: TipoCampoForm) => {
    if (campos.length >= MAX_CAMPOS) return;
    const c = campoNuevo(tipo);
    setCampos((l) => [...l, c]);
    setAbierta(c.id);
    setPestaña("preguntas");
  };
  const usarPlantilla = (p: (typeof PLANTILLAS)[number]) => {
    const nuevos = p.campos.map(([t, e, o]) => ({ ...campoNuevo(t, e), ...(o ? { opciones: o } : {}) }));
    setCampos(nuevos);
    setAbierta(nuevos[0]?.id ?? null);
  };

  const esquema: EsquemaForm = { campos: campos.filter((c) => c.etiqueta.trim()), gracias };
  const ESTADO = {
    borrador: { txt: "Borrador", cls: "bg-[#f1efe6] text-[#6b6a5c]", punto: "bg-[#b4b29f]" },
    publicado: { txt: "Publicado", cls: "bg-[#e3f2d6] text-[#245611]", punto: "bg-[#3f8f1f]" },
    cerrado: { txt: "Cerrado", cls: "bg-[#fbe9e3] text-[#8a2f16]", punto: "bg-[#c6532e]" },
  }[estado];

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="schema" value={JSON.stringify(esquema)} />

      {/* Barra de trabajo: estado, pestañas y acciones (queda fija arriba al desplazarse). */}
      <div className="sticky top-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-[#e1e5da] bg-white/90 px-3 py-2.5 shadow-[0_10px_30px_-18px_rgba(16,36,15,.45)] backdrop-blur">
        <div role="tablist" aria-label="Secciones del constructor" className="flex rounded-xl bg-[#f1f3ec] p-1">
          {([["preguntas", "Preguntas", ListChecks], ["ajustes", "Ajustes", Settings2]] as const).map(([k, t, I]) => (
            <button key={k} type="button" role="tab" aria-selected={pestaña === k} onClick={() => setPestaña(k)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${pestaña === k ? "bg-white text-[#10240f] shadow-sm" : "text-[#5d6e65] hover:text-[#10240f]"}`}>
              <I size={15} /> {t}
            </button>
          ))}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${ESTADO.cls}`}>
          <span className={`size-1.5 rounded-full ${ESTADO.punto}`} /> {ESTADO.txt}{version > 0 ? ` · v${version}` : ""}
        </span>
        {hayCambiosSinPublicar && estado !== "borrador" && <span className="text-xs font-semibold text-[#8a5a00]">Cambios sin publicar</span>}
        <div className="ml-auto flex items-center gap-2">
          {state.message && (
            <span role={state.ok ? "status" : "alert"} className={`hidden items-center gap-1.5 text-sm font-semibold md:inline-flex ${state.ok ? "text-[#14573a]" : "text-[#7a1f1f]"}`}>
              {state.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {state.message}
            </span>
          )}
          <button type="submit" name="intent" value="guardar" disabled={pending || !writable} className="inline-flex items-center gap-1.5 rounded-xl border border-[#dcdcd6] bg-white px-3.5 py-2 text-sm font-semibold text-[#10240f] transition hover:bg-[#f6f8f2] disabled:opacity-50">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar
          </button>
          <button type="submit" name="intent" value="publicar" disabled={pending || !writable} className="inline-flex items-center gap-1.5 rounded-xl bg-[#2c6a14] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_-8px_rgba(44,106,20,.9)] transition hover:bg-[#245611] disabled:opacity-50">
            <Rocket size={15} /> {estado === "borrador" ? "Publicar" : "Publicar cambios"}
          </button>
        </div>
        {state.message && (
          <p role={state.ok ? "status" : "alert"} className={`flex w-full items-center gap-1.5 text-sm font-semibold md:hidden ${state.ok ? "text-[#14573a]" : "text-[#7a1f1f]"}`}>
            {state.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {state.message}
          </p>
        )}
        {!writable && <p className="w-full text-sm text-[#7a1f1f]">Sin conexión de escritura: no se puede guardar.</p>}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)]">
        <div className="flex min-w-0 flex-col gap-4">
          {pestaña === "preguntas" ? (
            <>
              {/* Portada del formulario: título y descripción se escriben directamente, como en un documento. */}
              <section className="overflow-hidden rounded-3xl border border-[#e1e5da] bg-white shadow-sm">
                <div className="h-2 bg-gradient-to-r from-[#2c6a14] via-[#4f9a2a] to-[#d8b558]" />
                <div className="px-6 pb-6 pt-5 sm:px-8">
                  <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} aria-label="Título del formulario" placeholder="Formulario sin título"
                    className="w-full border-0 border-b-2 border-transparent bg-transparent pb-1 font-[var(--font-display)] text-3xl font-bold text-[#10240f] outline-none transition placeholder:text-[#b9c2b8] hover:border-[#eceae0] focus:border-[#4f9a2a] sm:text-4xl" />
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={600} rows={2} aria-label="Descripción del formulario" placeholder="Añada una descripción para quien lo responda (opcional)"
                    className="mt-2 w-full resize-none border-0 border-b-2 border-transparent bg-transparent text-[1.02rem] leading-relaxed text-[#44564a] outline-none transition placeholder:text-[#a3aea6] hover:border-[#eceae0] focus:border-[#4f9a2a]" />
                </div>
              </section>

              {campos.length === 0 ? (
                <section className="rounded-3xl border-2 border-dashed border-[#d3dcc9] bg-[#fafbf7] p-6 text-center sm:p-8">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e5f3da] text-[#2c6a14]"><Sparkles size={26} /></span>
                  <h3 className="mt-3 text-lg font-bold text-[#10240f]">Empiece con una plantilla o desde cero</h3>
                  <p className="mt-1 text-sm text-[#5d6e65]">Puede cambiar todo después.</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {PLANTILLAS.map((p) => (
                      <button key={p.nombre} type="button" onClick={() => usarPlantilla(p)}
                        className="group flex flex-col items-start gap-2 rounded-2xl border border-[#e1e5da] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9cc47f] hover:shadow-[0_12px_28px_-18px_rgba(44,106,20,.7)]">
                        <span className="grid size-9 place-items-center rounded-xl bg-[#f3f9ee] text-[#2c6a14] transition group-hover:bg-[#2c6a14] group-hover:text-white"><p.icono size={18} /></span>
                        <span className="font-semibold text-[#10240f]">{p.nombre}</span>
                        <span className="text-xs leading-snug text-[#667a6c]">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ) : (
                <ol className="flex flex-col gap-3">
                  {campos.map((c, i) => (
                    <TarjetaPregunta
                      key={c.id} c={c} i={i} total={campos.length} abierta={abierta === c.id}
                      anteriores={campos.slice(0, i).filter((p) => p.etiqueta.trim())}
                      onAbrir={() => setAbierta(abierta === c.id ? null : c.id)}
                      onCambiar={(p) => cambiar(c.id, p)} onMover={(d) => mover(i, d)} onDuplicar={() => duplicar(i)} onQuitar={() => quitar(c.id)}
                      puedeDuplicar={campos.length < MAX_CAMPOS}
                    />
                  ))}
                </ol>
              )}

              {/* Paleta: cada tipo de pregunta como una ficha con su ícono. */}
              <section className="rounded-3xl border border-[#e1e5da] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-[#10240f]"><Plus size={17} className="text-[#2c6a14]" /> Añadir pregunta</h3>
                  <span className="text-xs font-semibold text-[#8a978f]">{campos.length} de {MAX_CAMPOS}</span>
                </div>
                <div className="flex flex-col gap-4">
                  {GRUPOS.map((g) => (
                    <div key={g.titulo}>
                      <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#8a978f]">{g.titulo}</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {g.tipos.map((t) => {
                          const I = ICONO[t];
                          return (
                            <button key={t} type="button" onClick={() => añadir(t)} disabled={campos.length >= MAX_CAMPOS}
                              className="group flex items-center gap-2.5 rounded-xl border border-[#e6e9e0] bg-[#fbfcf9] px-3 py-2.5 text-left text-sm font-medium text-[#22352a] transition hover:border-[#9cc47f] hover:bg-white hover:shadow-sm disabled:opacity-40">
                              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#2c6a14] ring-1 ring-[#e1e5da] transition group-hover:bg-[#2c6a14] group-hover:text-white group-hover:ring-[#2c6a14]"><I size={16} /></span>
                              <span className="truncate">{nombreTipo(t)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="flex flex-col gap-6 rounded-3xl border border-[#e1e5da] bg-white p-6 shadow-sm sm:p-8">
              <div>
                <h3 className="text-lg font-bold text-[#10240f]">Dirección pública</h3>
                <p className="mt-1 text-sm text-[#5d6e65]">Así se comparte el formulario. Solo letras minúsculas, números y guiones.</p>
                <div className="mt-3 flex items-center overflow-hidden rounded-xl border border-[#dfe3d8] bg-[#f6f8f2] focus-within:border-[#4f9a2a] focus-within:ring-4 focus-within:ring-[#4f9a2a]/10">
                  <span className="whitespace-nowrap px-3.5 text-sm text-[#667a6c]">/formularios/</span>
                  <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} maxLength={60} aria-label="Dirección pública"
                    className="min-w-0 flex-1 border-0 bg-white px-3 py-2.5 font-mono text-sm text-[#10240f] outline-none" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#10240f]">Mensaje al enviar</h3>
                <p className="mt-1 text-sm text-[#5d6e65]">Aparece junto al «¡Gracias por responder!».</p>
                <textarea className={`${input} mt-3`} rows={3} value={gracias} maxLength={400} onChange={(e) => setGracias(e.target.value)} placeholder="Por ejemplo: Nos pondremos en contacto en los próximos días." />
              </div>
            </section>
          )}
        </div>

        {/* Vista previa en vivo, en un marco de navegador o de teléfono. */}
        <aside className="xl:sticky xl:top-24">
          <div className="rounded-3xl border border-[#e1e5da] bg-gradient-to-b from-[#eef3e8] to-[#f6f8f2] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#5d6e65]"><Eye size={13} /> Vista previa</p>
              <div className="flex rounded-lg bg-white/80 p-0.5 ring-1 ring-[#e1e5da]">
                {([["escritorio", Monitor], ["movil", Smartphone]] as const).map(([k, I]) => (
                  <button key={k} type="button" onClick={() => setDispositivo(k)} aria-label={k === "movil" ? "Ver en móvil" : "Ver en escritorio"} aria-pressed={dispositivo === k}
                    className={`grid size-7 place-items-center rounded-md transition ${dispositivo === k ? "bg-[#2c6a14] text-white" : "text-[#5d6e65] hover:text-[#10240f]"}`}><I size={14} /></button>
                ))}
              </div>
            </div>
            <div className={`mx-auto overflow-hidden border border-[#d9ddd2] bg-white shadow-[0_24px_50px_-30px_rgba(16,36,15,.55)] transition-all duration-300 ${dispositivo === "movil" ? "max-w-[20rem] rounded-[2rem] border-[6px] border-[#1d2a20]" : "rounded-2xl"}`}>
              {dispositivo === "escritorio" ? (
                <div className="flex items-center gap-1.5 border-b border-[#eceae0] bg-[#f7f7f3] px-3 py-2">
                  <span className="size-2.5 rounded-full bg-[#f0a39a]" /><span className="size-2.5 rounded-full bg-[#f2cf7c]" /><span className="size-2.5 rounded-full bg-[#9fd08a]" />
                  <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 font-mono text-[0.68rem] text-[#8a978f] ring-1 ring-[#eceae0]">/formularios/{slug}</span>
                </div>
              ) : (
                <div className="mx-auto mt-2 h-1.5 w-16 rounded-full bg-[#1d2a20]/80" />
              )}
              <div className="max-h-[68vh] overflow-y-auto">
                <div className="h-1.5 bg-gradient-to-r from-[#2c6a14] via-[#4f9a2a] to-[#d8b558]" />
                <div className={dispositivo === "movil" ? "p-4" : "p-6"}>
                  <h3 className="font-[var(--font-display)] text-2xl font-bold leading-tight text-[#10240f]">{title || "Formulario sin título"}</h3>
                  {description && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#44564a]">{description}</p>}
                  <div className={`mt-5 ${dispositivo === "movil" ? "[&_.fm-form]:!grid-cols-1" : ""}`}>
                    <FormularioPublico slug={slug} esquema={esquema} preview />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}

function TarjetaPregunta({
  c, i, total, abierta, anteriores, onAbrir, onCambiar, onMover, onDuplicar, onQuitar, puedeDuplicar,
}: {
  c: CampoForm; i: number; total: number; abierta: boolean; anteriores: CampoForm[]; puedeDuplicar: boolean;
  onAbrir: () => void; onCambiar: (p: Partial<CampoForm>) => void; onMover: (d: -1 | 1) => void; onDuplicar: () => void; onQuitar: () => void;
}) {
  const I = ICONO[c.tipo];
  const opciones = c.opciones.split("\n");
  const ponerOpciones = (l: string[]) => onCambiar({ opciones: l.join("\n") });
  const objetivo = anteriores.find((p) => p.id === c.si?.campo);
  const opcionesObjetivo = objetivo ? (conOpciones(objetivo.tipo) ? opcionesForm(objetivo.opciones) : objetivo.tipo === "escala" ? Array.from({ length: objetivo.max }, (_, k) => String(k + 1)) : []) : [];
  const btn = "grid size-8 place-items-center rounded-lg text-[#5d6e65] transition hover:bg-[#eef3e8] hover:text-[#10240f] disabled:opacity-30";

  return (
    <li className={`group relative overflow-hidden rounded-2xl border bg-white transition-all ${abierta ? "border-[#cfe0c2] shadow-[0_18px_40px_-24px_rgba(44,106,20,.65)]" : "border-[#e6e9e0] shadow-sm hover:border-[#cfe0c2]"}`}>
      <span className={`absolute inset-y-0 left-0 w-1 transition-colors ${abierta ? "bg-[#2c6a14]" : "bg-transparent group-hover:bg-[#cfe0c2]"}`} aria-hidden />
      <div className="flex items-center gap-3 py-3 pl-4 pr-2 sm:pl-5">
        <GripVertical size={16} className="hidden shrink-0 text-[#c5ccc0] sm:block" aria-hidden />
        <button type="button" onClick={onAbrir} aria-expanded={abierta} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition ${abierta ? "bg-[#2c6a14] text-white" : "bg-[#f3f9ee] text-[#2c6a14]"}`}><I size={17} /></span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-[#10240f]">
              <span className="mr-1.5 text-[#9aa79e]">{i + 1}.</span>{c.etiqueta || <span className="italic text-[#9aa79e]">Pregunta sin título</span>}
              {c.requerido && <span className="text-[#b3261e]"> *</span>}
            </span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-[#667a6c]">
              {nombreTipo(c.tipo)}
              {c.si && <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4dc] px-1.5 py-px font-semibold text-[#8a5a00]"><GitBranch size={10} /> condicional</span>}
            </span>
          </span>
        </button>
        <div className={`flex items-center transition-opacity ${abierta ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
          <button type="button" onClick={() => onMover(-1)} disabled={i === 0} aria-label="Subir" title="Subir" className={btn}><ArrowUp size={15} /></button>
          <button type="button" onClick={() => onMover(1)} disabled={i === total - 1} aria-label="Bajar" title="Bajar" className={btn}><ArrowDown size={15} /></button>
          <button type="button" onClick={onDuplicar} disabled={!puedeDuplicar} aria-label="Duplicar la pregunta" title="Duplicar" className={btn}><Copy size={15} /></button>
          <button type="button" onClick={onQuitar} aria-label="Quitar la pregunta" title="Quitar" className={`${btn} hover:!bg-[#fdecec] hover:!text-[#b3261e]`}><Trash2 size={15} /></button>
        </div>
      </div>

      {abierta && (
        <div className="flex flex-col gap-4 border-t border-[#eef0ea] bg-[#fcfdfb] px-4 pb-5 pt-4 sm:px-6">
          <input className={`${input} text-base font-semibold`} value={c.etiqueta} maxLength={160} onChange={(e) => onCambiar({ etiqueta: e.target.value })} placeholder="Escriba la pregunta" aria-label="Pregunta" autoFocus={!c.etiqueta} />
          <input className={`${input} text-sm`} value={c.ayuda} maxLength={200} onChange={(e) => onCambiar({ ayuda: e.target.value })} placeholder="Texto de ayuda bajo la pregunta (opcional)" aria-label="Ayuda" />

          {conOpciones(c.tipo) && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a978f]">Opciones</p>
              {opciones.map((o, k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={`grid size-5 shrink-0 place-items-center border-2 border-[#b9c4b3] ${c.tipo === "casillas" ? "rounded-md" : "rounded-full"}`} aria-hidden>
                    {c.tipo === "lista" && <span className="text-[0.6rem] font-bold text-[#8a978f]">{k + 1}</span>}
                  </span>
                  <input className={`${input} py-2`} value={o} maxLength={100} onChange={(e) => ponerOpciones(opciones.map((x, j) => (j === k ? e.target.value : x)))} placeholder={`Opción ${k + 1}`} aria-label={`Opción ${k + 1}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        ponerOpciones([...opciones.slice(0, k + 1), "", ...opciones.slice(k + 1)].slice(0, 30));
                      }
                    }} />
                  <button type="button" onClick={() => ponerOpciones(opciones.filter((_, j) => j !== k))} disabled={opciones.length <= 1} aria-label={`Quitar la opción ${k + 1}`} className="grid size-8 shrink-0 place-items-center rounded-lg text-[#8a978f] hover:bg-[#fdecec] hover:text-[#b3261e] disabled:opacity-30"><X size={15} /></button>
                </div>
              ))}
              {opciones.length < 30 && (
                <button type="button" onClick={() => ponerOpciones([...opciones, ""])} className="ml-7 inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-[#2c6a14] hover:bg-[#eef3e8]"><Plus size={14} /> Añadir opción</button>
              )}
            </div>
          )}

          {c.tipo === "escala" && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a978f]">Escala</p>
              <div className="flex rounded-xl bg-[#f1f3ec] p-1 w-fit">
                {[5, 10].map((n) => (
                  <button key={n} type="button" onClick={() => onCambiar({ max: n })} aria-pressed={c.max === n}
                    className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${c.max === n ? "bg-white text-[#10240f] shadow-sm" : "text-[#5d6e65]"}`}>De 1 a {n}</button>
                ))}
              </div>
            </div>
          )}

          {/* Lógica condicional */}
          {anteriores.length > 0 && (
            c.si ? (
              <div className="rounded-2xl border border-[#f0dfb5] bg-[#fffaf0] p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-bold text-[#6b4700]"><GitBranch size={15} /> Mostrar solo si…</p>
                  <button type="button" onClick={() => onCambiar({ si: undefined })} className="text-xs font-semibold text-[#8a5a00] hover:underline">Quitar condición</button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <select aria-label="Pregunta de la que depende" className={`${input} py-2 text-sm`} value={c.si.campo} onChange={(e) => onCambiar({ si: { ...c.si!, campo: e.target.value, valor: "" } })}>
                    {anteriores.map((p) => <option key={p.id} value={p.id}>{p.etiqueta}</option>)}
                  </select>
                  <select aria-label="Condición" className={`${input} py-2 text-sm`} value={c.si.op} onChange={(e) => onCambiar({ si: { ...c.si!, op: e.target.value as NonNullable<CampoForm["si"]>["op"] } })}>
                    {OPERADORES.map((o) => <option key={o.valor} value={o.valor}>{o.nombre}</option>)}
                  </select>
                  {c.si.op !== "responde" && (opcionesObjetivo.length > 0 ? (
                    <select aria-label="Valor" className={`${input} py-2 text-sm`} value={c.si.valor} onChange={(e) => onCambiar({ si: { ...c.si!, valor: e.target.value } })}>
                      <option value="" disabled>Elija…</option>
                      {opcionesObjetivo.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input aria-label="Valor" className={`${input} py-2 text-sm`} value={c.si.valor} maxLength={100} placeholder="Valor" onChange={(e) => onCambiar({ si: { ...c.si!, valor: e.target.value } })} />
                  ))}
                </div>
              </div>
            ) : null
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0ea] pt-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-[#33463a]">
              <span className="sr-only">Tipo de respuesta</span>
              <select className={`${input} w-auto py-2 text-sm`} value={c.tipo} onChange={(e) => {
                const tipo = e.target.value as TipoCampoForm;
                onCambiar({ tipo, ...(conOpciones(tipo) && !c.opciones.trim() ? { opciones: "Opción 1\nOpción 2" } : {}) });
              }}>
                {TIPOS_CAMPO_FORM.map((t) => <option key={t.valor} value={t.valor}>{t.nombre}</option>)}
              </select>
            </label>
            <div className="flex items-center gap-4">
              {anteriores.length > 0 && !c.si && (
                <button type="button" onClick={() => onCambiar({ si: { campo: anteriores[anteriores.length - 1].id, op: "es", valor: "" } })}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a5a00] hover:underline"><GitBranch size={14} /> Añadir condición</button>
              )}
              <Interruptor activo={c.requerido} onChange={(v) => onCambiar({ requerido: v })}>Obligatoria</Interruptor>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

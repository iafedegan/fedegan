"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown, ArrowUp, ChevronDown, Ellipsis, ExternalLink, GripVertical, LayoutGrid, ListOrdered, Maximize2, Megaphone, MessageSquare, Minimize2, Monitor, Newspaper, Paintbrush,
  Redo2, RotateCcw, SlidersHorizontal, Smartphone, Tablet, Undo2, UploadCloud, type LucideIcon,
} from "lucide-react";
import {
  AD_ZONES, FONTS, FOOTERS, HEROES, NAVBARS, REGIONS,
  designCss, isEmptyDesign, normalizeDesign,
  type AdConfig, type DesignConfig, type LocalStyle, type RegionId, type RegionStyle,
} from "@/lib/design/regions";
import { publishDesign, saveDesignDraft, undoDesignPublish } from "@/lib/design/actions";

// Tamaño virtual de cada pantalla: el sitio se dibuja a ese ancho y se escala para caber en el marco.
const DEVICES = {
  desktop: { w: 1440, h: 900, name: "Mac", bezel: 16 },
  tablet: { w: 820, h: 1100, name: "Tableta", bezel: 14 },
  mobile: { w: 390, h: 800, name: "Celular", bezel: 11 },
} as const;
type Device = keyof typeof DEVICES;
type Tab = "zonas" | "piezas" | "recorrido" | "cintillo" | "popup" | "publicidad";
export type LocalRef = { id: string; label: string };

const same = (a: DesignConfig, b: DesignConfig) => JSON.stringify(normalizeDesign(a)) === JSON.stringify(normalizeDesign(b));
const clean = <T extends object>(o: T): T => {
  const c = { ...o } as Record<string, unknown>;
  Object.keys(c).forEach((k) => (c[k] === undefined || c[k] === "") && delete c[k]);
  return c as T;
};

function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      <span className="flex items-center justify-between">
        {label}
        <span className="font-normal text-[#5d6e65]">{value}{unit}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-[#165a43]" />
    </label>
  );
}

function ColorField({ label, value, fallback, onChange }: { label: string; value?: string; fallback: string; onChange: (v: string | undefined) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked ? fallback : undefined)} />
        {label}
      </label>
      <input type="color" aria-label={`Color: ${label}`} disabled={!value} value={value ?? fallback} onChange={(e) => onChange(e.target.value)} className="h-8 w-12 cursor-pointer rounded border border-[#d9d6cb] bg-white disabled:opacity-40" />
    </div>
  );
}

function FontSelect({ value, onChange }: { value?: string; onChange: (v: LocalStyle["titleFont"]) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      Tipografía de títulos
      <select className="ad-input" value={value ?? ""} onChange={(e) => onChange((e.target.value || undefined) as LocalStyle["titleFont"])}>
        <option value="">Predeterminada</option>
        {FONTS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
    </label>
  );
}

function Choice<T extends string>({ title, current, options, onPick }: { title: string; current: T; options: readonly { id: T; label: string; description: string }[]; onPick: (id: T) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="ad-eyebrow mb-1">{title}</legend>
      {options.map((o) => (
        <label key={o.id} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-sm ${current === o.id ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] bg-white hover:border-[#b08f4f]"}`}>
          <input type="radio" name={title} checked={current === o.id} onChange={() => onPick(o.id)} className="mt-1" />
          <span>
            <span className="block font-semibold">{o.label}</span>
            <span className="text-xs text-[#5d6e65]">{o.description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export function DesignEditor({ writable, initialPublished, initialDraft, canUndo, locals }: { writable: boolean; initialPublished: DesignConfig; initialDraft: DesignConfig; canUndo: boolean; locals: LocalRef[] }) {
  const [design, setDesign] = useState<DesignConfig>(initialDraft);
  const [published, setPublished] = useState<DesignConfig>(initialPublished);
  const [undoable, setUndoable] = useState(canUndo);
  const [tab, setTab] = useState<Tab | null>(null);
  const [region, setRegion] = useState<RegionId>("hero");
  const [localId, setLocalId] = useState(locals[0]?.id ?? "");
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [full, setFull] = useState(false);
  const [menu, setMenu] = useState<"vista" | "mas" | null>(null);
  const [resaltar, setResaltar] = useState(true);
  const [stageW, setStageW] = useState(900);
  const [vh, setVh] = useState(800);
  const [hist, setHist] = useState({ p: 0, f: 0 });
  const past = useRef<DesignConfig[]>([]);
  const future = useRef<DesignConfig[]>([]);
  const prevDesign = useRef<DesignConfig>(initialDraft);
  const fromHistory = useRef(false);
  const stage = useRef<HTMLDivElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  const css = useMemo(() => designCss(design), [design]);
  const dirty = !same(design, published);
  const order = useMemo(() => {
    const rank = (id: string) => {
      const i = design.order.indexOf(id);
      return i === -1 ? 999 : i;
    };
    return [...locals].sort((a, b) => rank(a.id) - rank(b.id));
  }, [design.order, locals]);

  const update = useCallback((fn: (d: DesignConfig) => DesignConfig) => setDesign((d) => fn(d)), []);

  // ---- vista previa real: hoja de estilos + atributos + mensaje al sitio incrustado
  const sync = useCallback(() => {
    const win = frame.current?.contentWindow;
    const doc = frame.current?.contentDocument;
    if (!win || !doc?.head) return;
    doc.getElementById("design-css")?.remove();
    let el = doc.getElementById("design-preview");
    if (!el) {
      el = doc.createElement("style");
      el.id = "design-preview";
      doc.head.appendChild(el);
    }
    const mark = resaltar && tab === "zonas" ? `\n[data-region="${region}"]{outline:3px solid #d8b558 !important;outline-offset:-3px}` : "";
    el.textContent = css + mark;
    const root = doc.documentElement;
    root.setAttribute("data-navbar", design.parts.navbar ?? "clasico");
    root.setAttribute("data-footer", design.parts.footer ?? "completo");
    root.setAttribute("data-hero", design.parts.hero ?? "izquierda");
    win.postMessage({ type: "design-draft", design }, window.location.origin);
  }, [css, region, tab, design, resaltar]);

  useEffect(sync, [sync]);

  const onFrameLoad = () => {
    sync();
    frame.current?.contentDocument?.addEventListener(
      "click",
      (e) => {
        const t = e.target as Element | null;
        const local = t?.closest?.("[data-local]")?.getAttribute("data-local");
        const hit = t?.closest?.("[data-region]")?.getAttribute("data-region") as RegionId | null;
        if (local && locals.some((l) => l.id === local)) {
          setLocalId(local);
          setTab("recorrido");
        } else if (hit && REGIONS.some((r) => r.id === hit)) {
          setRegion(hit);
          setTab("zonas");
        }
        e.preventDefault();
        e.stopPropagation();
      },
      true,
    );
  };

  // ---- autoguardado
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!writable) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const r = await saveDesignDraft(design);
      setStatus(r.error ? { kind: "err", text: r.error } : { kind: "info", text: "Borrador guardado." });
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [design, writable]);

  // ---- medidas del marco de la vista previa
  useEffect(() => {
    const el = stage.current;
    const measure = () => {
      if (el) setStageW(el.clientWidth);
      setVh(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (el) ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [full]);

  // ---- historial de ediciones del borrador (deshacer / rehacer)
  useEffect(() => {
    if (fromHistory.current) {
      fromHistory.current = false;
    } else if (prevDesign.current !== design) {
      past.current = [...past.current.slice(-49), prevDesign.current];
      future.current = [];
    }
    prevDesign.current = design;
    setHist({ p: past.current.length, f: future.current.length });
  }, [design]);
  const undoEdit = () => {
    const back = past.current.pop();
    if (!back) return;
    future.current.push(design);
    fromHistory.current = true;
    setDesign(back);
  };
  const redoEdit = () => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(design);
    fromHistory.current = true;
    setDesign(next);
  };
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [full]);

  // ---- parches
  const patchRegion = (p: Partial<RegionStyle>) =>
    update((d) => {
      const next = clean({ ...(d.regions[region] ?? {}), ...p });
      const regions = { ...d.regions };
      if (Object.keys(next).length) regions[region] = next;
      else delete regions[region];
      return { ...d, regions };
    });
  const patchLocal = (p: Partial<LocalStyle>) =>
    update((d) => {
      const next = clean({ ...(d.locals[localId] ?? {}), ...p });
      const l = { ...d.locals };
      if (Object.keys(next).length) l[localId] = next;
      else delete l[localId];
      return { ...d, locals: l };
    });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const ids = order.map((l) => l.id);
    const [m] = ids.splice(from, 1);
    ids.splice(to, 0, m);
    update((d) => ({ ...d, order: ids }));
  };

  const doPublish = () =>
    start(async () => {
      const r = await publishDesign(design);
      if (r.error) return setStatus({ kind: "err", text: r.error });
      setPublished(r.design!);
      setUndoable(true);
      setStatus({ kind: "ok", text: "Diseño publicado. El sitio lo mostrará en unos segundos." });
    });
  const doUndo = () =>
    start(async () => {
      const r = await undoDesignPublish();
      if (r.error) return setStatus({ kind: "err", text: r.error });
      setDesign(r.design!);
      setPublished(r.design!);
      setStatus({ kind: "ok", text: "Se restauró la publicación anterior." });
    });

  const rs: RegionStyle = design.regions[region] ?? {};
  const meta = REGIONS.find((r) => r.id === region)!;
  const has = (k: keyof RegionStyle) => meta.controls.includes(k);
  const ls: LocalStyle = design.locals[localId] ?? {};
  const ticker = design.ticker;
  const popup = design.popup;
  const patchTicker = (p: Partial<typeof ticker>) => update((d) => ({ ...d, ticker: { ...d.ticker, ...p } }));
  const patchPopup = (p: Partial<typeof popup>) => update((d) => ({ ...d, popup: { ...d.popup, ...p } }));
  const patchAd = (zone: (typeof AD_ZONES)[number]["id"], p: Partial<AdConfig>) => update((d) => ({ ...d, ads: { ...d.ads, [zone]: { ...(d.ads[zone] ?? {}), ...p } } }));

  const cuerpoZonas = (
    <>

                  <p className="text-xs text-[#8a978f]">{meta.hint}</p>
                  {has("bg") && <ColorField label="Fondo" value={rs.bg} fallback="#0a2a20" onChange={(v) => patchRegion({ bg: v })} />}
                  {has("fg") && <ColorField label="Texto" value={rs.fg} fallback="#f4f2e9" onChange={(v) => patchRegion({ fg: v })} />}
                  {has("accent") && <ColorField label="Acento" value={rs.accent} fallback="#d8b558" onChange={(v) => patchRegion({ accent: v })} />}
                  {has("titleFont") && <FontSelect value={rs.titleFont} onChange={(v) => patchRegion({ titleFont: v })} />}
                  {has("titleScale") && <Slider label="Tamaño de títulos" value={rs.titleScale ?? 100} min={70} max={160} unit="%" onChange={(n) => patchRegion({ titleScale: n })} />}
                  {has("textScale") && <Slider label="Tamaño del texto" value={rs.textScale ?? 100} min={80} max={140} unit="%" onChange={(n) => patchRegion({ textScale: n })} />}
                  {has("padY") && <Slider label="Espacio vertical" value={rs.padY ?? 0} min={0} max={8} step={0.25} unit=" rem" onChange={(n) => patchRegion({ padY: n })} />}
                  {has("maxWidth") && <Slider label="Ancho máximo" value={rs.maxWidth ?? 1376} min={720} max={1920} step={16} unit=" px" onChange={(n) => patchRegion({ maxWidth: n })} />}
                  {has("hidden") && (
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input type="checkbox" checked={Boolean(rs.hidden)} onChange={(e) => patchRegion({ hidden: e.target.checked || undefined })} /> Ocultar esta zona
                    </label>
                  )}
                  <button type="button" className="ad-btn ad-btn-ghost self-start" onClick={() => update((d) => { const regions = { ...d.regions }; delete regions[region]; return { ...d, regions }; })}>
                    <RotateCcw size={14} /> Restablecer zona
                  </button>
    </>
  );
  const cuerpoPiezas = (
    <>
                  <Choice title="Encabezado" current={design.parts.navbar ?? "clasico"} options={NAVBARS} onPick={(id) => update((d) => ({ ...d, parts: { ...d.parts, navbar: id } }))} />
                  <Choice title="Recorrido de portada" current={design.parts.hero ?? "izquierda"} options={HEROES} onPick={(id) => update((d) => ({ ...d, parts: { ...d.parts, hero: id } }))} />
                  <Choice title="Pie de página" current={design.parts.footer ?? "completo"} options={FOOTERS} onPick={(id) => update((d) => ({ ...d, parts: { ...d.parts, footer: id } }))} />
    </>
  );
  const cuerpoRecorrido = (
    <>
                  <div>
                    <p className="ad-eyebrow mb-2">Orden (arrastre o use las flechas)</p>
                    <ol className="flex flex-col gap-1">
                      {order.map((l, i) => (
                        <li
                          key={l.id}
                          draggable
                          onDragStart={() => setDragFrom(i)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => dragFrom !== null && (move(dragFrom, i), setDragFrom(null))}
                          className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-sm ${l.id === localId ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb]"}`}
                        >
                          <GripVertical size={14} className="cursor-grab text-[#8a978f]" aria-hidden />
                          <button type="button" className="flex-1 truncate text-left font-semibold" onClick={() => setLocalId(l.id)}>
                            {l.label}
                            {design.locals[l.id] && <span className="ml-1 text-[#b08f4f]">●</span>}
                          </button>
                          <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => move(i, i - 1)} className="ad-icon-btn !h-7 !w-7"><ArrowUp size={13} /></button>
                          <button type="button" aria-label="Bajar" disabled={i === order.length - 1} onClick={() => move(i, i + 1)} className="ad-icon-btn !h-7 !w-7"><ArrowDown size={13} /></button>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-xs text-[#8a978f]">El orden se aplica al publicar.</p>
                  </div>
                  {localId && (
                    <div className="flex flex-col gap-3 border-t border-[#e4e1d6] pt-4">
                      <p className="ad-eyebrow">Estilo de «{locals.find((l) => l.id === localId)?.label}»</p>
                      <FontSelect value={ls.titleFont} onChange={(v) => patchLocal({ titleFont: v })} />
                      <Slider label="Tamaño del título" value={ls.titleScale ?? 100} min={70} max={160} unit="%" onChange={(n) => patchLocal({ titleScale: n })} />
                      <ColorField label="Color del título" value={ls.color} fallback="#f7f4ea" onChange={(v) => patchLocal({ color: v })} />
                      <ColorField label="Color de acento" value={ls.accent} fallback="#d8b558" onChange={(v) => patchLocal({ accent: v })} />
                      <button type="button" className="ad-btn ad-btn-ghost self-start" onClick={() => update((d) => { const l = { ...d.locals }; delete l[localId]; return { ...d, locals: l }; })}>
                        <RotateCcw size={14} /> Restablecer este local
                      </button>
                    </div>
                  )}
    </>
  );
  const cuerpoCintillo = (
    <>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={Boolean(ticker.on)} onChange={(e) => patchTicker({ on: e.target.checked })} /> Mostrar el cintillo bajo el encabezado
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">
                    Mensajes (uno por línea, máximo 12)
                    <textarea
                      rows={6}
                      className="ad-input"
                      value={(ticker.messages ?? []).join("\n")}
                      onChange={(e) => patchTicker({ messages: e.target.value.split("\n").slice(0, 12) })}
                      placeholder={"Jornada nacional de vacunación\nNueva convocatoria del FEP"}
                    />
                  </label>
                  <Slider label="Velocidad" value={ticker.speed ?? 5} min={1} max={10} unit="" onChange={(n) => patchTicker({ speed: n })} />
    </>
  );
  const cuerpoPopup = (
    <>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={Boolean(popup.on)} onChange={(e) => patchPopup({ on: e.target.checked })} /> Mostrar la ventana emergente
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">Título<input className="ad-input" maxLength={90} value={popup.title ?? ""} onChange={(e) => patchPopup({ title: e.target.value })} /></label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">Texto<textarea rows={4} maxLength={400} className="ad-input" value={popup.text ?? ""} onChange={(e) => patchPopup({ text: e.target.value })} /></label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">Texto del botón<input className="ad-input" maxLength={40} value={popup.ctaLabel ?? ""} onChange={(e) => patchPopup({ ctaLabel: e.target.value })} /></label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">Enlace del botón<input className="ad-input" placeholder="/eventos o https://…" value={popup.ctaHref ?? ""} onChange={(e) => patchPopup({ ctaHref: e.target.value })} /></label>
                  <Slider label="Aparece tras" value={popup.delay ?? 3} min={0} max={60} unit=" s" onChange={(n) => patchPopup({ delay: n })} />
                  <p className="text-xs text-[#8a978f]">Se muestra una vez por visita. En la vista previa aparece de inmediato.</p>
    </>
  );
  const cuerpoPublicidad = (
    <>
                  {AD_ZONES.map((z) => {
                    const a = design.ads[z.id] ?? {};
                    return (
                      <fieldset key={z.id} className="flex flex-col gap-2 rounded-xl border border-[#d9d6cb] p-3">
                        <legend className="px-1 text-sm font-bold">{z.label}</legend>
                        <p className="text-xs text-[#8a978f]">{z.size}</p>
                        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(a.on)} onChange={(e) => patchAd(z.id, { on: e.target.checked })} /> Activa</label>
                        <input className="ad-input" placeholder="Imagen: /anuncios/banner.jpg o https://…" value={a.image ?? ""} onChange={(e) => patchAd(z.id, { image: e.target.value })} aria-label={`Imagen de ${z.label}`} />
                        <input className="ad-input" placeholder="Enlace del anuncio" value={a.href ?? ""} onChange={(e) => patchAd(z.id, { href: e.target.value })} aria-label={`Enlace de ${z.label}`} />
                        <input className="ad-input" placeholder="Texto alternativo" maxLength={120} value={a.alt ?? ""} onChange={(e) => patchAd(z.id, { alt: e.target.value })} aria-label={`Texto alternativo de ${z.label}`} />
                      </fieldset>
                    );
                  })}
    </>
  );

  const dev = DEVICES[device];
  const maxH = Math.max(360, vh * (full ? 0.78 : 0.66));
  const avail = Math.max(240, stageW - 2 * dev.bezel - 24);
  const scale = Math.min(1, avail / dev.w, maxH / dev.h);
  const viewW = Math.round(dev.w * scale);
  const viewH = Math.round(dev.h * scale);
  const nAnuncios = AD_ZONES.filter((z) => design.ads[z.id]?.on).length;
  const nEstilos = Object.keys(design.locals).length;
  const partLabel = (list: readonly { id: string; label: string }[], id: string) => list.find((o) => o.id === id)?.label ?? "";
  const abrir = (t: Tab) => setTab((cur) => (cur === t ? null : t));

  const secciones: { id: Tab; icon: LucideIcon; title: string; summary: string; body: React.ReactNode }[] = [
    { id: "zonas", icon: Paintbrush, title: "Colores y tamaños", summary: `Zona: ${meta.label}${design.regions[region] ? " · con cambios" : ""}`, body: cuerpoZonas },
    { id: "piezas", icon: LayoutGrid, title: "Plantilla", summary: `${partLabel(NAVBARS, design.parts.navbar ?? "clasico")} · ${partLabel(HEROES, design.parts.hero ?? "izquierda")}`, body: cuerpoPiezas },
    { id: "recorrido", icon: ListOrdered, title: "Orden y estilo de secciones", summary: `${locals.length} secciones${nEstilos ? ` · ${nEstilos} con estilo propio` : ""}`, body: cuerpoRecorrido },
    { id: "cintillo", icon: Newspaper, title: "Cintillo de titulares", summary: ticker.on ? `Activado · ${(ticker.messages ?? []).filter(Boolean).length} mensajes` : "Apagado", body: cuerpoCintillo },
    { id: "popup", icon: MessageSquare, title: "Ventana emergente", summary: popup.on ? "Activada" : "Apagada", body: cuerpoPopup },
    { id: "publicidad", icon: Megaphone, title: "Publicidad", summary: nAnuncios ? `${nAnuncios} anuncio${nAnuncios === 1 ? "" : "s"} activo${nAnuncios === 1 ? "" : "s"}` : "Sin anuncios activos", body: cuerpoPublicidad },
  ];

  const menuItem = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#2a3a32] hover:bg-[#f1efe6] disabled:opacity-40";

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      {/* Barra superior + vista previa */}
      <div className={full ? "fixed inset-0 z-50 overflow-y-auto bg-[#f4f2ea] p-4" : "min-w-0"}>
        <div className="ad-card relative mb-4 flex flex-wrap items-center gap-2 p-3">
          <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${dirty ? "border-[#e2c874] bg-[#fbf3d9] text-[#7c5f1f]" : "border-[#d9d6cb] bg-white text-[#11271d]"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${dirty ? "bg-[#d8a21f]" : "bg-[#1fa65a]"}`} />
            {dirty ? "Sin publicar" : "Publicado"}
          </span>
          <div className="flex gap-1.5">
            <button type="button" aria-label="Deshacer cambio" title="Deshacer cambio" disabled={!hist.p} onClick={undoEdit} className="ad-icon-btn disabled:opacity-40"><Undo2 size={16} /></button>
            <button type="button" aria-label="Rehacer cambio" title="Rehacer cambio" disabled={!hist.f} onClick={redoEdit} className="ad-icon-btn disabled:opacity-40"><Redo2 size={16} /></button>
          </div>
          <div role="group" aria-label="Pantalla" className="flex gap-1 rounded-full border border-[#d9d6cb] bg-white p-1">
            {([["desktop", Monitor, "Computador"], ["tablet", Tablet, "Tableta"], ["mobile", Smartphone, "Celular"]] as const).map(([d, Icon, label]) => (
              <button key={d} type="button" aria-label={label} title={label} aria-pressed={device === d} onClick={() => setDevice(d)} className={`flex h-9 w-11 items-center justify-center rounded-full transition-colors ${device === d ? "bg-[#165a43] text-white" : "text-[#5d6e65] hover:bg-[#f1efe6]"}`}>
                <Icon size={17} />
              </button>
            ))}
          </div>
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={menu === "vista"} onClick={() => setMenu(menu === "vista" ? null : "vista")} className="ad-icon-btn !w-auto gap-1 px-3">
              <SlidersHorizontal size={16} /> <ChevronDown size={14} />
            </button>
            {menu === "vista" && (
              <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-[#d9d6cb] bg-white p-1.5 shadow-xl">
                <label className={`${menuItem} cursor-pointer`}>
                  <input type="checkbox" checked={resaltar} onChange={(e) => setResaltar(e.target.checked)} /> Resaltar la zona elegida
                </label>
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" aria-label={full ? "Salir de pantalla completa" : "Pantalla completa"} title={full ? "Salir de pantalla completa" : "Pantalla completa"} onClick={() => setFull((v) => !v)} className="ad-icon-btn">
              {full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <a href="/" target="_blank" rel="noreferrer" aria-label="Abrir el sitio en otra pestaña" title="Abrir el sitio en otra pestaña" className="ad-icon-btn"><ExternalLink size={16} /></a>
            <button type="button" className="ad-btn ad-btn-primary" disabled={!writable || pending || !dirty} onClick={doPublish}>
              <UploadCloud size={15} /> {pending ? "Procesando…" : "Publicar"}
            </button>
            <div className="relative">
              <button type="button" aria-label="Más opciones" aria-haspopup="menu" aria-expanded={menu === "mas"} onClick={() => setMenu(menu === "mas" ? null : "mas")} className="ad-icon-btn"><Ellipsis size={16} /></button>
              {menu === "mas" && (
                <div role="menu" className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-[#d9d6cb] bg-white p-1.5 shadow-xl">
                  <button type="button" role="menuitem" className={menuItem} disabled={!writable || pending || !undoable} onClick={() => { setMenu(null); doUndo(); }}>
                    <Undo2 size={15} /> Deshacer la última publicación
                  </button>
                  <button type="button" role="menuitem" className={menuItem} disabled={!writable || pending || !dirty} onClick={() => { setMenu(null); setDesign(published); }}>
                    <RotateCcw size={15} /> Descartar cambios sin publicar
                  </button>
                </div>
              )}
            </div>
          </div>
          {menu && <button type="button" tabIndex={-1} aria-hidden className="fixed inset-0 z-20 cursor-default" onClick={() => setMenu(null)} />}
        </div>

        {status && (
          <p role="status" className={`mb-4 rounded-xl px-4 py-2 text-sm ${status.kind === "err" ? "bg-[#fde8e8] text-[#a12b2b]" : status.kind === "ok" ? "bg-[#e1f1e7] text-[#146040]" : "bg-[#f1efe6] text-[#5d6e65]"}`}>{status.text}</p>
        )}

        <div ref={stage} className="ad-card flex flex-col items-center px-3 pb-4 pt-6 sm:px-6">
          <div className="flex flex-col items-center" style={{ width: viewW + 2 * dev.bezel }}>
            <div className="bg-[#14171a] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]" style={{ padding: dev.bezel, borderRadius: device === "mobile" ? 36 : device === "tablet" ? 26 : 20, width: "100%" }}>
              <div className="relative overflow-hidden bg-[#05100b]" style={{ width: viewW, height: viewH, borderRadius: device === "mobile" ? 26 : device === "tablet" ? 14 : 8 }}>
                <iframe
                  ref={frame}
                  src="/"
                  title="Vista previa del sitio"
                  onLoad={onFrameLoad}
                  style={{ width: dev.w, height: dev.h, transform: `scale(${scale})`, transformOrigin: "top left" }}
                  className="absolute left-0 top-0 block max-w-none border-0 bg-[#05100b]"
                />
              </div>
            </div>
            {device === "desktop" && <div aria-hidden className="h-3.5 w-[112%] rounded-b-[1.4rem] bg-gradient-to-b from-[#c9ccd0] to-[#9da1a6]" />}
          </div>
          <p className="mt-4 text-sm text-[#5d6e65]">
            {dev.name} · {dev.w}px · {Math.round(scale * 100)} %{scale < 1 ? " (ajustado al ancho)" : ""}
          </p>
          <p className="mt-1 text-xs text-[#8a978f]">Haga clic en una zona o un local de la página para editarlo.</p>
        </div>
      </div>

      {/* Panel de propiedades */}
      <aside className={`flex flex-col gap-3 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1 ${full ? "hidden" : ""}`} aria-label="Propiedades del diseño">
        <section className="ad-card p-0">
          <h2 className="flex items-center gap-2.5 border-b border-[#e4e1d6] px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-[#165a43]">
            <SlidersHorizontal size={16} /> Propiedades
          </h2>
          <div className="p-5">
            <p className="text-lg font-bold text-[#11271d]">Elige qué quieres cambiar</p>
            <p className="mt-1 text-sm text-[#5d6e65]">Haz clic en la página o elige una parte:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={tab === "zonas" && r.id === region}
                  onClick={() => { setRegion(r.id); setTab("zonas"); }}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${tab === "zonas" && r.id === region ? "border-[#b08f4f] bg-[#f7edcf] text-[#7c5f1f]" : "border-[#d9d6cb] bg-white text-[#11271d] hover:border-[#b08f4f]"}`}
                >
                  {r.label}
                  {design.regions[r.id] && <span className="ml-1 text-[#b08f4f]">●</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        {secciones.map(({ id, icon: Icon, title, summary, body }) => {
          const abierto = tab === id;
          return (
            <section key={id} className="ad-card p-0">
              <button type="button" aria-expanded={abierto} aria-controls={`acc-${id}`} onClick={() => abrir(id)} className="flex w-full items-center gap-3.5 px-5 py-4 text-left">
                <Icon size={18} className="shrink-0 text-[#5d6e65]" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold uppercase tracking-[0.16em] text-[#11271d]">{title}</span>
                  <span className="block truncate text-sm text-[#5d6e65]">{summary}</span>
                </span>
                <ChevronDown size={18} className={`shrink-0 text-[#5d6e65] transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
              </button>
              {abierto && (
                <div id={`acc-${id}`} className="flex flex-col gap-4 border-t border-[#e4e1d6] p-5">
                  {body}
                </div>
              )}
            </section>
          );
        })}

        {isEmptyDesign(design) && <p className="px-1 text-xs text-[#8a978f]">Sin cambios respecto al diseño original.</p>}
      </aside>
    </div>
  );
}

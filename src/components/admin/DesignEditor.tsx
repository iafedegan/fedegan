"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical, Minus, Monitor, Plus, RotateCcw, Smartphone, Tablet, Undo2, UploadCloud } from "lucide-react";
import {
  AD_ZONES, FONTS, FOOTERS, HEROES, NAVBARS, REGIONS,
  designCss, isEmptyDesign, normalizeDesign,
  type AdConfig, type DesignConfig, type LocalStyle, type RegionId, type RegionStyle,
} from "@/lib/design/regions";
import { publishDesign, saveDesignDraft, undoDesignPublish } from "@/lib/design/actions";

const WIDTHS = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;
type Device = keyof typeof WIDTHS;
type Tab = "zonas" | "piezas" | "recorrido" | "cintillo" | "popup" | "publicidad";
const TABS: { id: Tab; label: string }[] = [
  { id: "zonas", label: "Zonas" },
  { id: "piezas", label: "Piezas" },
  { id: "recorrido", label: "Recorrido" },
  { id: "cintillo", label: "Cintillo" },
  { id: "popup", label: "Ventana" },
  { id: "publicidad", label: "Publicidad" },
];
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

const POS_KEY = "fedegan-design-panel";

export function DesignEditor({ writable, initialPublished, initialDraft, canUndo, locals }: { writable: boolean; initialPublished: DesignConfig; initialDraft: DesignConfig; canUndo: boolean; locals: LocalRef[] }) {
  const [design, setDesign] = useState<DesignConfig>(initialDraft);
  const [published, setPublished] = useState<DesignConfig>(initialPublished);
  const [undoable, setUndoable] = useState(canUndo);
  const [tab, setTab] = useState<Tab>("zonas");
  const [region, setRegion] = useState<RegionId>("hero");
  const [localId, setLocalId] = useState(locals[0]?.id ?? "");
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);
  const wrap = useRef<HTMLDivElement>(null);

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
    const mark = tab === "zonas" ? `\n[data-region="${region}"]{outline:3px solid #d8b558 !important;outline-offset:-3px}` : "";
    el.textContent = css + mark;
    const root = doc.documentElement;
    root.setAttribute("data-navbar", design.parts.navbar ?? "clasico");
    root.setAttribute("data-footer", design.parts.footer ?? "completo");
    root.setAttribute("data-hero", design.parts.hero ?? "izquierda");
    win.postMessage({ type: "design-draft", design }, window.location.origin);
  }, [css, region, tab, design]);

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

  // ---- panel flotante arrastrable
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(POS_KEY);
        if (raw) setPos(JSON.parse(raw));
      } catch {}
    });
  }, []);
  const clampPos = (x: number, y: number) => ({
    x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - 150)),
    y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - 90)),
  });
  const startDrag = (e: React.PointerEvent) => {
    const box = wrap.current!.getBoundingClientRect();
    const dx = e.clientX - box.left;
    const dy = e.clientY - box.top;
    const move = (ev: PointerEvent) => setPos(clampPos(ev.clientX - dx, ev.clientY - dy));
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      try {
        localStorage.setItem(POS_KEY, JSON.stringify(clampPos(ev.clientX - dx, ev.clientY - dy)));
      } catch {}
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

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

  const placeStyle = pos ? { left: pos.x, top: pos.y } : { right: 16, top: 16 };

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#5d6e65]">Vista previa con el borrador aplicado. Haga clic en una zona o un local para editarlo.</p>
        <div className="flex gap-1.5">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
            <button key={d} type="button" aria-label={d} aria-pressed={device === d} onClick={() => setDevice(d)} className={`ad-icon-btn ${device === d ? "!border-[#b08f4f] !text-[#165a43]" : ""}`}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="ad-card overflow-hidden bg-[#e4e1d6] p-2 sm:p-3">
        <iframe ref={frame} src="/" title="Vista previa del sitio" onLoad={onFrameLoad} style={{ width: WIDTHS[device], maxWidth: "100%" }} className="mx-auto block h-[82vh] min-h-[34rem] rounded-lg border-0 bg-[#05100b]" />
      </div>

      {/* Panel flotante */}
      <div ref={wrap} style={placeStyle} className="fixed z-40 w-[min(24rem,calc(100vw-1rem))] rounded-2xl border border-[#d9d6cb] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
        <div onPointerDown={startDrag} className="flex cursor-grab touch-none select-none items-center gap-2 rounded-t-2xl bg-[#0f3d2e] px-3 py-2.5 text-white active:cursor-grabbing">
          <GripVertical size={16} aria-hidden />
          <span className="flex-1 text-sm font-bold">Diseño del sitio</span>
          {dirty && <span className="rounded-full bg-[#d8b558] px-2 py-0.5 text-[0.65rem] font-bold text-[#11271d]">Sin publicar</span>}
          <button type="button" aria-label={collapsed ? "Expandir panel" : "Contraer panel"} onPointerDown={(e) => e.stopPropagation()} onClick={() => setCollapsed((c) => !c)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15">
            {collapsed ? <Plus size={15} /> : <Minus size={15} />}
          </button>
        </div>

        {!collapsed && (
          <div className="flex max-h-[calc(100vh-9rem)] flex-col">
            <div role="tablist" className="flex flex-wrap gap-1 border-b border-[#e4e1d6] p-2">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${tab === t.id ? "bg-[#f7edcf] text-[#7c5f1f]" : "text-[#5d6e65] hover:bg-[#f1efe6]"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto p-4">
              {tab === "zonas" && (
                <>
                  <div className="grid grid-cols-2 gap-1.5">
                    {REGIONS.map((r) => (
                      <button key={r.id} type="button" aria-pressed={r.id === region} onClick={() => setRegion(r.id)} className={`rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold ${r.id === region ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] hover:border-[#b08f4f]"}`}>
                        {r.label}
                        {design.regions[r.id] && <span className="ml-1 text-[#b08f4f]">●</span>}
                      </button>
                    ))}
                  </div>
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
              )}

              {tab === "piezas" && (
                <>
                  <Choice title="Encabezado" current={design.parts.navbar ?? "clasico"} options={NAVBARS} onPick={(id) => update((d) => ({ ...d, parts: { ...d.parts, navbar: id } }))} />
                  <Choice title="Recorrido de portada" current={design.parts.hero ?? "izquierda"} options={HEROES} onPick={(id) => update((d) => ({ ...d, parts: { ...d.parts, hero: id } }))} />
                  <Choice title="Pie de página" current={design.parts.footer ?? "completo"} options={FOOTERS} onPick={(id) => update((d) => ({ ...d, parts: { ...d.parts, footer: id } }))} />
                </>
              )}

              {tab === "recorrido" && (
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
              )}

              {tab === "cintillo" && (
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
              )}

              {tab === "popup" && (
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
              )}

              {tab === "publicidad" && (
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
              )}
            </div>

            <div className="flex flex-col gap-2 border-t border-[#e4e1d6] p-3">
              <div className="flex gap-2">
                <button type="button" className="ad-btn ad-btn-primary flex-1 justify-center" disabled={!writable || pending || !dirty} onClick={doPublish}>
                  <UploadCloud size={15} /> {pending ? "Procesando…" : "Publicar"}
                </button>
                <button type="button" className="ad-btn ad-btn-ghost justify-center" disabled={!writable || pending || !undoable} onClick={doUndo} title="Deshacer la última publicación">
                  <Undo2 size={15} />
                </button>
              </div>
              {status && (
                <p role="status" className={`rounded-lg px-3 py-1.5 text-xs ${status.kind === "err" ? "bg-[#fde8e8] text-[#a12b2b]" : status.kind === "ok" ? "bg-[#e1f1e7] text-[#146040]" : "bg-[#f1efe6] text-[#5d6e65]"}`}>{status.text}</p>
              )}
              {isEmptyDesign(design) && !status && <p className="text-xs text-[#8a978f]">Sin cambios respecto al diseño original.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

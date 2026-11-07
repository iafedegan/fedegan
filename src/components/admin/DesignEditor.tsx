"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowDown, ArrowUp, ChevronDown, Ellipsis, ExternalLink, GripVertical, LayoutGrid, ListOrdered, Maximize2, Megaphone, MessageSquare, Minimize2, Monitor, MousePointerClick, Newspaper, Paintbrush,
  Redo2, RotateCcw, SlidersHorizontal, Smartphone, Tablet, Undo2, UploadCloud, type LucideIcon,
} from "lucide-react";
import {
  AD_ZONES, FONTS, FOOTERS, HEROES, NAVBARS, REGIONS, TEMPLATES, TEMPLATE_BY_ID,
  designCss, elementKey, isEmptyDesign, normalizeDesign, splitElementKey,
  type AdConfig, type DesignConfig, type ElementEdit, type LocalStyle, type RegionId, type RegionStyle,
} from "@/lib/design/regions";
import { publishDesign, saveDesignDraft, subirImagenDiseno, undoDesignPublish } from "@/lib/design/actions";

// Tamaño virtual de cada pantalla: el sitio se dibuja a ese ancho y se escala para caber en el marco.
const DEVICES = {
  desktop: { w: 1440, h: 900, name: "Mac", bezel: 10, maxW: 1040 },
  tablet: { w: 820, h: 1100, name: "Tableta", bezel: 10, maxW: 520 },
  mobile: { w: 390, h: 800, name: "Celular", bezel: 8, maxW: 300 },
} as const;
type Device = keyof typeof DEVICES;
type Tab = "elemento" | "zonas" | "piezas" | "recorrido" | "cintillo" | "popup" | "publicidad";
export type LocalRef = { id: string; label: string };

const same = (a: DesignConfig, b: DesignConfig) => JSON.stringify(normalizeDesign(a)) === JSON.stringify(normalizeDesign(b));
const clean = <T extends object>(o: T): T => {
  const c = { ...o } as Record<string, unknown>;
  Object.keys(c).forEach((k) => (c[k] === undefined || c[k] === "") && delete c[k]);
  return c as T;
};

type Picked = { path: string; selector: string; tag: string; text: string | null; isImg: boolean; isLink: boolean; href: string; src: string };

// Selector CSS estable del elemento: se ancla al ancestro con id, región o local más cercano.
function selectorOf(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.tagName !== "BODY" && cur.tagName !== "HTML") {
    const reg = cur.getAttribute("data-region");
    const loc = cur.getAttribute("data-local");
    if (cur.id && /^[A-Za-z][\w-]*$/.test(cur.id)) {
      parts.unshift(`#${cur.id}`);
      return parts.join(" > ");
    }
    if (reg && /^[a-z-]+$/.test(reg)) {
      parts.unshift(`[data-region="${reg}"]`);
      return parts.join(" > ");
    }
    if (loc && /^[a-z0-9-]+$/.test(loc)) {
      parts.unshift(`[data-local="${loc}"]`);
      return parts.join(" > ");
    }
    const node: Element = cur;
    const tag = node.tagName.toLowerCase();
    const sibs = node.parentElement ? Array.from(node.parentElement.children).filter((c) => c.tagName === node.tagName) : [];
    parts.unshift(sibs.length > 1 ? `${tag}:nth-of-type(${sibs.indexOf(node) + 1})` : tag);
    cur = node.parentElement;
  }
  return `body > ${parts.join(" > ")}`;
}

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

// La vista previa de la portada de cada plantilla (/vista-previa/…) cuenta como la portada.
const canon = (p: string) => (p.startsWith("/vista-previa/") ? "/" : p);

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
  const [modo, setModo] = useState<"editar" | "navegar">("editar");
  const modoRef = useRef(modo);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [alcance, setAlcance] = useState<"page" | "site">("page");
  const [pagePath, setPagePath] = useState("/");
  const [ir, setIr] = useState("/");
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    modoRef.current = modo;
  }, [modo]);

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
    const edit =
      modo === "editar"
        ? `\n[data-edit-hover]{outline:2px dashed #d8b558 !important;outline-offset:-2px;cursor:crosshair !important}` +
          (picked && /^[A-Za-z0-9_\-.#:>()[\]="' *~+]{1,240}$/.test(picked.selector) ? `\n${picked.selector}{outline:3px solid #2f8cff !important;outline-offset:-2px}` : "")
        : "";
    el.textContent = css + mark + edit;
    const root = doc.documentElement;
    root.setAttribute("data-navbar", design.parts.navbar ?? "clasico");
    root.setAttribute("data-footer", design.parts.footer ?? "completo");
    root.setAttribute("data-hero", design.parts.hero ?? "izquierda");
    // La plantilla vive en el marco del sitio (no en <html>) para no tocar el panel; el tono lo fija ella.
    const marco = doc.querySelector("[data-site-chrome]");
    const tpl = design.template ? TEMPLATE_BY_ID[design.template] : null;
    if (tpl) {
      marco?.setAttribute("data-template", tpl.id);
      root.setAttribute("data-tpl-mode", tpl.mode);
      root.setAttribute("data-theme", tpl.mode === "oscuro" ? "esmeralda" : "institucional");
    } else {
      marco?.removeAttribute("data-template");
      root.removeAttribute("data-tpl-mode");
    }
    // Cada plantilla tiene su propia portada: si la que se ve no es la del borrador, se carga la vista previa de esa composición.
    const home = doc.querySelector("[data-home]")?.getAttribute("data-home");
    const want = design.template ?? "clasico";
    if (home && home !== want) {
      win.location.replace(`/vista-previa/${want}`);
      return;
    }
    win.postMessage({ type: "design-draft", design }, window.location.origin);
  }, [css, region, tab, design, resaltar, modo, picked]);

  useEffect(sync, [sync]);

  const onFrameLoad = () => {
    sync();
    const doc = frame.current?.contentDocument;
    const win = frame.current?.contentWindow;
    if (win) {
      setPagePath(canon(win.location.pathname));
      setIr(canon(win.location.pathname));
    }
    doc?.addEventListener(
      "mouseover",
      (e) => {
        if (modoRef.current !== "editar") return;
        doc.querySelectorAll("[data-edit-hover]").forEach((n) => n.removeAttribute("data-edit-hover"));
        const t = e.target as Element | null;
        if (t && t !== doc.body && t !== doc.documentElement) t.setAttribute("data-edit-hover", "");
      },
      true,
    );
    // En modo editar, el doble clic sobre un enlace entra a esa página (un clic solo lo selecciona para editarlo).
    doc?.addEventListener(
      "dblclick",
      (e) => {
        const a = (e.target as Element | null)?.closest?.("a[href]");
        const h = a?.getAttribute("href");
        if (h && /^\/[A-Za-z0-9_\-/.?=&%#]*$/.test(h)) {
          e.preventDefault();
          e.stopPropagation();
          setPicked(null);
          win?.location.assign(h);
        }
      },
      true,
    );
    doc?.addEventListener(
      "click",
      (e) => {
        if (modoRef.current === "navegar") return; // se navega con normalidad por el sitio
        const t = e.target as Element | null;
        e.preventDefault();
        e.stopPropagation();
        if (!t || t === doc.body || t === doc.documentElement) return;
        // El banner de portada se maneja completo desde Publicidad (no como elemento suelto).
        if (t.closest?.('[data-editor-panel="publicidad"]')) {
          setPicked(null);
          setTab("publicidad");
          window.setTimeout(() => document.getElementById("pub-carrusel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
          return;
        }
        const local = t.closest?.("[data-local]")?.getAttribute("data-local");
        const hit = t.closest?.("[data-region]")?.getAttribute("data-region") as RegionId | null;
        if (local && locals.some((l) => l.id === local)) setLocalId(local);
        else if (hit && REGIONS.some((r) => r.id === hit)) setRegion(hit);
        const clone = t as HTMLElement;
        const leaf = t.children.length === 0 && (t.textContent ?? "").trim() !== "";
        const link = t.closest("a");
        const selector = selectorOf(t);
        if (selector.length > 240) {
          setStatus({ kind: "err", text: "Este elemento está demasiado anidado para editarlo por separado; elija uno más externo." });
          return;
        }
        setPicked({
          path: canon(win?.location.pathname ?? "/"),
          selector,
          tag: t.tagName.toLowerCase(),
          text: leaf ? (clone.textContent ?? "") : null,
          isImg: t instanceof HTMLImageElement,
          isLink: Boolean(link && link === t),
          href: link?.getAttribute("href") ?? "",
          src: t instanceof HTMLImageElement ? t.currentSrc || t.src : "",
        });
        setTab("elemento");
      },
      true,
    );
  };

  // La página puede cambiar por dentro (navegación del sitio): se sigue su ruta.
  useEffect(() => {
    const id = window.setInterval(() => {
      try {
        const p = canon(frame.current?.contentWindow?.location.pathname ?? "");
        if (p) setPagePath((cur) => (cur === p ? cur : p));
      } catch {}
    }, 600);
    return () => window.clearInterval(id);
  }, []);

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

  const elKey = picked ? elementKey(alcance === "site" ? "*" : picked.path, picked.selector) : "";
  const es: ElementEdit = (elKey && design.elements[elKey]) || {};
  const patchEl = (p: Partial<ElementEdit>) => {
    if (!elKey) return;
    update((d) => {
      const next = clean({ ...(d.elements[elKey] ?? {}), ...p }) as ElementEdit;
      const els = { ...d.elements };
      if (Object.keys(next).length) els[elKey] = next;
      else delete els[elKey];
      return { ...d, elements: els };
    });
  };
  const nEditados = Object.keys(design.elements).length;
  const irA = (ruta: string) => {
    const r = ruta.trim();
    if (!/^\/[A-Za-z0-9_\-/.?=&%]*$/.test(r)) return setStatus({ kind: "err", text: "Escriba una ruta del sitio, por ejemplo /noticias." });
    setPicked(null);
    frame.current?.contentWindow?.location.assign(r);
  };

  const rs: RegionStyle = design.regions[region] ?? {};
  const meta = REGIONS.find((r) => r.id === region)!;
  const has = (k: keyof RegionStyle) => meta.controls.includes(k);
  const ls: LocalStyle = design.locals[localId] ?? {};
  const ticker = design.ticker;
  const popup = design.popup;
  const patchTicker = (p: Partial<typeof ticker>) => update((d) => ({ ...d, ticker: { ...d.ticker, ...p } }));
  const patchPopup = (p: Partial<typeof popup>) => update((d) => ({ ...d, popup: { ...d.popup, ...p } }));
  const patchBanner = (k: number, p: Partial<AdConfig>) => update((d) => ({ ...d, banners: (d.banners ?? []).map((b, x) => (x === k ? { ...b, ...p } : b)) }));
  const [msgAd, setMsgAd] = useState<Record<string, string>>({});
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
                  <fieldset className="flex flex-col gap-2">
                    <legend className="ad-eyebrow mb-1">Plantilla del sitio</legend>
                    <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-sm ${!design.template ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] bg-white"}`}>
                      <input type="radio" name="plantilla" checked={!design.template} onChange={() => update((d) => ({ ...d, template: undefined }))} />
                      <span><span className="block font-semibold">Actual</span><span className="text-xs text-[#5d6e65]">El diseño de siempre, sin plantilla.</span></span>
                    </label>
                    {TEMPLATES.map((t) => (
                      <label key={t.id} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-sm ${design.template === t.id ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] bg-white hover:border-[#b08f4f]"}`}>
                        <input type="radio" name="plantilla" checked={design.template === t.id} onChange={() => update((d) => ({ ...d, template: t.id, parts: { ...t.parts } }))} className="mt-1" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2"><span className="font-semibold">{t.label}</span><span className="flex shrink-0 overflow-hidden rounded-full border border-black/10">{t.swatch.map((c) => <i key={c} style={{ background: c, width: 14, height: 14 }} />)}</span></span>
                          <span className="text-xs text-[#5d6e65]">{t.description}</span>
                          <span className="mt-1.5 flex flex-wrap gap-1">{t.traits.map((x) => <span key={x} className="rounded-full border border-[#d9d6cb] bg-[#faf8f1] px-2 py-0.5 text-[0.66rem] font-semibold text-[#5d6e65]">{x}</span>)}</span>
                        </span>
                      </label>
                    ))}
                    <p className="text-xs text-[#5d6e65]">Cada plantilla cambia la estructura del sitio (barra, cabeceras, tarjetas, pie y portada), no solo los colores. Después puede ajustar colores y tipografías por zona, textos, imágenes y orden como siempre.</p>
                  </fieldset>
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
  const portadaAd = design.ads.portada ?? {};
  const subirA = async (f: File | undefined, done: (url: string) => void) => {
    if (!f) return;
    setMsgAd((m) => ({ ...m, portada: "Subiendo imagen…" }));
    const fd = new FormData();
    fd.set("archivo", f);
    const r = await subirImagenDiseno(fd);
    if (r.url) {
      done(r.url);
      setMsgAd((m) => ({ ...m, portada: "Imagen cargada. Recuerde publicar." }));
    } else setMsgAd((m) => ({ ...m, portada: r.error ?? "No se pudo subir la imagen." }));
  };
  const moverBanner = (k: number, d: -1 | 1) =>
    update((x) => {
      const l = [...(x.banners ?? [])];
      const t = k + d;
      if (t < 0 || t >= l.length) return x;
      [l[k], l[t]] = [l[t], l[k]];
      return { ...x, banners: l };
    });
  const camposDiapositiva = (s: AdConfig, patch: (p: Partial<AdConfig>) => void, n: number) => (
    <>
      <div className="flex items-start gap-3">
        {s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt="" className="h-16 w-28 shrink-0 rounded-lg border border-[#e4e1d6] object-cover" />
        ) : (
          <span className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-[#d9d6cb] text-[0.65rem] text-[#8a978f]">Sin imagen</span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input className="ad-input" placeholder="Imagen: /headers/foto.jpg o https://…" value={s.image ?? ""} onChange={(e) => patch({ image: e.target.value })} aria-label={`Imagen de la diapositiva ${n}`} />
          <label className="ad-btn ad-btn-primary w-fit cursor-pointer !min-h-0 !py-1.5 text-xs">
            Cargar imagen
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; subirA(f, (url) => patch({ image: url, on: true })); }} />
          </label>
        </div>
      </div>
      <input className="ad-input" placeholder="Título (p. ej. Segundo Ciclo)" maxLength={120} value={s.titulo ?? ""} onChange={(e) => patch({ titulo: e.target.value })} aria-label={`Título de la diapositiva ${n}`} />
      <input className="ad-input" placeholder="Segunda línea del título, en verde" maxLength={160} value={s.subtitulo ?? ""} onChange={(e) => patch({ subtitulo: e.target.value })} aria-label={`Subtítulo de la diapositiva ${n}`} />
      <textarea className="ad-input min-h-[4.5rem]" placeholder="Párrafo" maxLength={400} value={s.texto ?? ""} onChange={(e) => patch({ texto: e.target.value })} aria-label={`Párrafo de la diapositiva ${n}`} />
      <div className="grid grid-cols-2 gap-1.5">
        <input className="ad-input" placeholder="Botón 1: texto" maxLength={50} value={s.boton1 ?? ""} onChange={(e) => patch({ boton1: e.target.value })} aria-label={`Texto del botón 1, diapositiva ${n}`} />
        <input className="ad-input" placeholder="Botón 1: enlace" value={s.enlace1 ?? ""} onChange={(e) => patch({ enlace1: e.target.value })} aria-label={`Enlace del botón 1, diapositiva ${n}`} />
        <input className="ad-input" placeholder="Botón 2: texto" maxLength={50} value={s.boton2 ?? ""} onChange={(e) => patch({ boton2: e.target.value })} aria-label={`Texto del botón 2, diapositiva ${n}`} />
        <input className="ad-input" placeholder="Botón 2: enlace" value={s.enlace2 ?? ""} onChange={(e) => patch({ enlace2: e.target.value })} aria-label={`Enlace del botón 2, diapositiva ${n}`} />
      </div>
      <details className="text-xs text-[#5d6e65]">
        <summary className="cursor-pointer font-semibold">Solo imagen (sin texto) y accesibilidad</summary>
        <div className="mt-1.5 flex flex-col gap-1.5">
          <input className="ad-input" placeholder="Enlace de toda la imagen (si no lleva texto)" value={s.href ?? ""} onChange={(e) => patch({ href: e.target.value })} aria-label={`Enlace de la imagen, diapositiva ${n}`} />
          <input className="ad-input" placeholder="Texto del botón sobre la imagen (p. ej. Ver más)" maxLength={40} value={s.label ?? ""} onChange={(e) => patch({ label: e.target.value })} aria-label={`Botón sobre la imagen, diapositiva ${n}`} />
          <input className="ad-input" placeholder="Texto alternativo: qué muestra la imagen" maxLength={120} value={s.alt ?? ""} onChange={(e) => patch({ alt: e.target.value })} aria-label={`Texto alternativo, diapositiva ${n}`} />
        </div>
      </details>
    </>
  );
  const nDiapositivas = (portadaAd.on && portadaAd.image ? 1 : 0) + (design.banners ?? []).filter((b) => b.on !== false && b.image).length;
  const cuerpoCarrusel = (
    <fieldset id="pub-carrusel" className="flex flex-col gap-3 rounded-xl border-2 border-[#72bf44] p-3">
      <legend className="px-1 text-sm font-bold">Carrusel de portada</legend>
      <p className="text-xs text-[#5d6e65]">{nDiapositivas} diapositiva{nDiapositivas === 1 ? "" : "s"} activa{nDiapositivas === 1 ? "" : "s"}. Imágenes anchas (1920×700 aprox.). Todo lo del banner se ajusta aquí; en la vista previa, un clic sobre el banner abre este bloque.</p>

      <div className="flex flex-col gap-2.5 rounded-lg bg-[#f6faf2] p-2.5">
        <p className="text-xs font-bold text-[#11271d]">Tamaño y apariencia</p>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#5d6e65]">Ancho: {portadaAd.width ?? 100} % del contenido
          <input type="range" min={40} max={100} step={5} value={portadaAd.width ?? 100} onChange={(e) => patchAd("portada", { width: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#5d6e65]">Alto en computador: {portadaAd.height ?? 460} px
          <input type="range" min={240} max={900} step={10} value={portadaAd.height ?? 460} onChange={(e) => patchAd("portada", { height: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#5d6e65]">Alto en celular: {portadaAd.heightMobile ?? 420} px
          <input type="range" min={200} max={800} step={10} value={portadaAd.heightMobile ?? 420} onChange={(e) => patchAd("portada", { heightMobile: Number(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#5d6e65]">Oscurecer la imagen detrás del texto: {portadaAd.oscuro ?? 55} %
          <input type="range" min={0} max={90} step={5} value={portadaAd.oscuro ?? 55} onChange={(e) => patchAd("portada", { oscuro: Number(e.target.value) })} />
        </label>
        <label className="flex items-center justify-between gap-2 text-xs font-semibold text-[#5d6e65]">Posición del texto
          <select className="ad-input !w-auto !py-1 text-xs" value={portadaAd.alinear ?? "izquierda"} onChange={(e) => patchAd("portada", { alinear: e.target.value as AdConfig["alinear"] })}>
            <option value="izquierda">Izquierda</option>
            <option value="centro">Centro</option>
            <option value="derecha">Derecha</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-2 text-xs font-semibold text-[#5d6e65]">Cambiar de diapositiva cada (segundos; 0 = no cambia sola)
          <input className="ad-input !w-20 !py-1 text-xs" type="number" min={0} max={30} value={portadaAd.segundos ?? 7} onChange={(e) => patchAd("portada", { segundos: e.target.value === "" ? undefined : Number(e.target.value) })} />
        </label>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={portadaAd.flechas !== false} onChange={(e) => patchAd("portada", { flechas: e.target.checked ? undefined : false })} /> Flechas</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={portadaAd.puntos !== false} onChange={(e) => patchAd("portada", { puntos: e.target.checked ? undefined : false })} /> Puntos</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={portadaAd.redondo !== false} onChange={(e) => patchAd("portada", { redondo: e.target.checked ? undefined : false })} /> Esquinas redondeadas</label>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg border border-[#e4e1d6] p-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#11271d]">Diapositiva 1 <span className="font-normal text-[#5d6e65]">· lo que deje vacío no se muestra (si no escribe nada de texto, se usa el de siempre)</span></p>
          <label className="flex items-center gap-1.5 text-xs font-semibold"><input type="checkbox" checked={Boolean(portadaAd.on)} onChange={(e) => patchAd("portada", { on: e.target.checked })} /> Activa</label>
        </div>
        {camposDiapositiva(portadaAd, (p) => patchAd("portada", p), 1)}
      </div>

      {(design.banners ?? []).map((b, k) => (
        <div key={k} className="flex flex-col gap-1.5 rounded-lg border border-[#e4e1d6] p-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[#11271d]">Diapositiva {k + 2}</p>
            <div className="flex items-center gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold"><input type="checkbox" checked={b.on !== false} onChange={(e) => patchBanner(k, { on: e.target.checked })} /> Activa</label>
              <button type="button" className="ad-btn ad-btn-ghost !min-h-0 !px-2 !py-1 !text-xs" disabled={k === 0} onClick={() => moverBanner(k, -1)} aria-label={`Subir la diapositiva ${k + 2}`}>↑</button>
              <button type="button" className="ad-btn ad-btn-ghost !min-h-0 !px-2 !py-1 !text-xs" disabled={k === (design.banners ?? []).length - 1} onClick={() => moverBanner(k, 1)} aria-label={`Bajar la diapositiva ${k + 2}`}>↓</button>
              <button type="button" className="ad-btn ad-btn-ghost !min-h-0 !px-2.5 !py-1 !text-xs" onClick={() => update((d) => ({ ...d, banners: (d.banners ?? []).filter((_, x) => x !== k) }))}>Quitar</button>
            </div>
          </div>
          {camposDiapositiva(b, (p) => patchBanner(k, p), k + 2)}
        </div>
      ))}
      {(design.banners ?? []).length < 8 && (
        <button type="button" className="ad-btn ad-btn-ghost w-fit" onClick={() => update((d) => ({ ...d, banners: [...(d.banners ?? []), { on: true, image: "", href: "", alt: "", label: "" }] }))}>+ Agregar diapositiva</button>
      )}
      {msgAd.portada && <span role="status" className="text-xs font-semibold text-[#165a43]">{msgAd.portada}</span>}
    </fieldset>
  );
  const cuerpoPublicidad = (
    <>
                  {cuerpoCarrusel}
                  {AD_ZONES.filter((z) => z.id !== "portada").map((z) => {
                    const a = design.ads[z.id] ?? {};
                    return (
                      <fieldset key={z.id} className="flex flex-col gap-2 rounded-xl border border-[#d9d6cb] p-3">
                        <legend className="px-1 text-sm font-bold">{z.label}</legend>
                        <p className="text-xs text-[#8a978f]">{z.size}</p>
                        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(a.on)} onChange={(e) => patchAd(z.id, { on: e.target.checked })} /> Activa</label>
                        <input className="ad-input" placeholder="Imagen: /anuncios/banner.jpg o https://…" value={a.image ?? ""} onChange={(e) => patchAd(z.id, { image: e.target.value })} aria-label={`Imagen de ${z.label}`} />
                        <div className="flex flex-col gap-1.5">
                          <label className="ad-btn ad-btn-primary w-fit cursor-pointer">
                            Cargar imagen desde mi computador
                            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={async (e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (!f) return;
                              setMsgAd((m) => ({ ...m, [z.id]: "Subiendo…" }));
                              const fd = new FormData();
                              fd.set("archivo", f);
                              const r = await subirImagenDiseno(fd);
                              if (r.url) {
                                patchAd(z.id, { image: r.url, on: true });
                                setMsgAd((m) => ({ ...m, [z.id]: "Imagen cargada. Recuerde guardar y publicar." }));
                              } else setMsgAd((m) => ({ ...m, [z.id]: r.error ?? "No se pudo subir la imagen." }));
                            }} />
                          </label>
                          <span className="text-xs text-[#5d6e65]">JPG, PNG, WebP, AVIF o GIF, máx. 5 MB. También puede pegar una dirección arriba.</span>
                          {msgAd[z.id] && <span role="status" className="text-xs font-semibold text-[#165a43]">{msgAd[z.id]}</span>}
                        </div>
                        <input className="ad-input" placeholder="Enlace del anuncio" value={a.href ?? ""} onChange={(e) => patchAd(z.id, { href: e.target.value })} aria-label={`Enlace de ${z.label}`} />
                        <input className="ad-input" placeholder="Texto alternativo" maxLength={120} value={a.alt ?? ""} onChange={(e) => patchAd(z.id, { alt: e.target.value })} aria-label={`Texto alternativo de ${z.label}`} />
                      </fieldset>
                    );
                  })}
    </>
  );

  const cuerpoElemento = !picked ? (
    <p className="text-[#5d6e65]">
      Haga clic sobre cualquier título, texto, imagen, fondo o tarjeta de la vista previa para editarlo. Para entrar a otra página: doble clic en un enlace, «Ir a esta página», la barra de ruta o el modo «Navegar».
    </p>
  ) : (
    <>
      <div className="rounded-lg bg-[#f1efe6] px-3 py-2 text-[#2a3a32]">
        <span className="font-bold">&lt;{picked.tag}&gt;</span> en <span className="font-mono">{alcance === "site" ? "todo el sitio" : picked.path}</span>
        {picked.text ? <span className="mt-0.5 block truncate text-[#5d6e65]">«{picked.text}»</span> : null}
      </div>
      <fieldset className="flex gap-3 font-semibold">
        <label className="flex items-center gap-1.5"><input type="radio" name="alcance" checked={alcance === "page"} onChange={() => setAlcance("page")} /> Solo esta página</label>
        <label className="flex items-center gap-1.5"><input type="radio" name="alcance" checked={alcance === "site"} onChange={() => setAlcance("site")} /> Todo el sitio</label>
      </fieldset>
      {/^\/[A-Za-z0-9_\-/.?=&%#]*$/.test(picked.href) && (
        <button type="button" className="ad-btn ad-btn-primary justify-center" onClick={() => irA(picked.href)}>
          <ExternalLink size={14} /> Ir a esta página ({picked.href})
        </button>
      )}
      {picked.text !== null && (
        <label className="flex flex-col gap-1 font-semibold">
          Texto
          <textarea rows={3} maxLength={3000} className="ad-input" value={es.text ?? picked.text} onChange={(e) => patchEl({ text: e.target.value })} />
        </label>
      )}
      {picked.isLink && (
        <label className="flex flex-col gap-1 font-semibold">
          Enlace
          <input className="ad-input" placeholder="/pagina o https://…" value={es.href ?? picked.href} onChange={(e) => patchEl({ href: e.target.value })} />
        </label>
      )}
      <label className="flex flex-col gap-1 font-semibold">
        {picked.isImg ? "Imagen (dirección)" : "Imagen de fondo (dirección)"}
        <input className="ad-input" placeholder="/imagenes/foto.jpg o https://…" value={es.image ?? (picked.isImg ? picked.src : "")} onChange={(e) => patchEl({ image: e.target.value })} />
      </label>
      <ColorField label="Color de fondo" value={es.bg} fallback="#0a2a20" onChange={(v) => patchEl({ bg: v })} />
      <ColorField label="Color del texto" value={es.color} fallback="#f4f2e9" onChange={(v) => patchEl({ color: v })} />
      <Slider label="Tamaño" value={es.scale ?? 100} min={40} max={250} unit="%" onChange={(n) => patchEl({ scale: n })} />
      <label className="flex items-center gap-2 font-semibold">
        <input type="checkbox" checked={Boolean(es.hidden)} onChange={(e) => patchEl({ hidden: e.target.checked || undefined })} /> Ocultar este elemento
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="ad-btn ad-btn-ghost" onClick={() => update((d) => { const els = { ...d.elements }; delete els[elKey]; return { ...d, elements: els }; })}>
          <RotateCcw size={14} /> Restablecer elemento
        </button>
        <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setPicked(null)}>Elegir otro</button>
      </div>
    </>
  );
  const listaEdiciones =
    nEditados > 0 ? (
      <div className="flex flex-col gap-1.5 border-t border-[#e4e1d6] pt-3">
        <p className="ad-eyebrow">Elementos editados ({nEditados})</p>
        <ul className="flex flex-col gap-1">
          {Object.keys(design.elements).map((k) => {
            const sp = splitElementKey(k);
            return (
              <li key={k} className="flex items-center gap-2 rounded-lg border border-[#d9d6cb] px-2 py-1">
                <span className="min-w-0 flex-1 truncate font-mono text-[0.68rem] text-[#5d6e65]" title={k}>{sp?.path === "*" ? "Todo el sitio" : sp?.path} · {sp?.selector.split(" > ").slice(-2).join(" > ")}</span>
                <button type="button" aria-label="Quitar edición" className="text-[#a12b2b]" onClick={() => update((d) => { const els = { ...d.elements }; delete els[k]; return { ...d, elements: els }; })}>×</button>
              </li>
            );
          })}
        </ul>
      </div>
    ) : null;

  const dev = DEVICES[device];
  const maxH = Math.max(360, vh * (full ? 0.78 : 0.66));
  const avail = Math.max(240, stageW - 2 * dev.bezel - 24);
  const scale = Math.min(1, avail / dev.w, maxH / dev.h, dev.maxW / dev.w);
  const viewW = Math.round(dev.w * scale);
  const viewH = Math.round(dev.h * scale);
  const nAnuncios = AD_ZONES.filter((z) => design.ads[z.id]?.on).length;
  const nEstilos = Object.keys(design.locals).length;
  const partLabel = (list: readonly { id: string; label: string }[], id: string) => list.find((o) => o.id === id)?.label ?? "";
  const abrir = (t: Tab) => setTab((cur) => (cur === t ? null : t));

  const secciones: { id: Tab; icon: LucideIcon; title: string; summary: string; body: React.ReactNode }[] = [
    { id: "elemento", icon: MousePointerClick, title: "Elemento de la página", summary: picked ? `<${picked.tag}> · ${nEditados} editado${nEditados === 1 ? "" : "s"}` : `Elija uno en la página · ${nEditados} editado${nEditados === 1 ? "" : "s"}`, body: <>{cuerpoElemento}{listaEdiciones}</> },
    { id: "zonas", icon: Paintbrush, title: "Colores y tamaños", summary: `Zona: ${meta.label}${design.regions[region] ? " · con cambios" : ""}`, body: cuerpoZonas },
    { id: "piezas", icon: LayoutGrid, title: "Plantilla", summary: `${partLabel(NAVBARS, design.parts.navbar ?? "clasico")} · ${partLabel(HEROES, design.parts.hero ?? "izquierda")}`, body: cuerpoPiezas },
    { id: "recorrido", icon: ListOrdered, title: "Orden y estilo de secciones", summary: `${locals.length} secciones${nEstilos ? ` · ${nEstilos} con estilo propio` : ""}`, body: cuerpoRecorrido },
    { id: "cintillo", icon: Newspaper, title: "Cintillo de titulares", summary: ticker.on ? `Activado · ${(ticker.messages ?? []).filter(Boolean).length} mensajes` : "Apagado", body: cuerpoCintillo },
    { id: "popup", icon: MessageSquare, title: "Ventana emergente", summary: popup.on ? "Activada" : "Apagada", body: cuerpoPopup },
    { id: "publicidad", icon: Megaphone, title: "Publicidad", summary: nAnuncios ? `${nAnuncios} anuncio${nAnuncios === 1 ? "" : "s"} activo${nAnuncios === 1 ? "" : "s"}` : "Sin anuncios activos", body: cuerpoPublicidad },
  ];

  const menuItem = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#2a3a32] hover:bg-[#f1efe6] disabled:opacity-40";

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {/* Barra superior + vista previa */}
      <div className={full ? "fixed inset-0 z-50 overflow-y-auto bg-[#f4f2ea] p-4" : "min-w-0"}>
        <div className="ad-card relative mb-3 flex flex-wrap items-center gap-1.5 p-2 [&_.ad-icon-btn]:!h-8 [&_.ad-icon-btn]:!min-w-8 [&_.ad-icon-btn]:!w-8 [&_.ad-btn]:!min-h-8 [&_.ad-btn]:!px-3 [&_.ad-btn]:!py-1 [&_.ad-btn]:!text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${dirty ? "border-[#e2c874] bg-[#fbf3d9] text-[#7c5f1f]" : "border-[#d9d6cb] bg-white text-[#11271d]"}`}>
            <span className={`h-2 w-2 rounded-full ${dirty ? "bg-[#d8a21f]" : "bg-[#1fa65a]"}`} />
            {dirty ? "Sin publicar" : "Publicado"}
          </span>
          <div className="flex gap-1.5">
            <button type="button" aria-label="Deshacer cambio" title="Deshacer cambio" disabled={!hist.p} onClick={undoEdit} className="ad-icon-btn disabled:opacity-40"><Undo2 size={14} /></button>
            <button type="button" aria-label="Rehacer cambio" title="Rehacer cambio" disabled={!hist.f} onClick={redoEdit} className="ad-icon-btn disabled:opacity-40"><Redo2 size={14} /></button>
          </div>
          <div role="group" aria-label="Pantalla" className="flex gap-1 rounded-full border border-[#d9d6cb] bg-white p-1">
            {([["desktop", Monitor, "Computador"], ["tablet", Tablet, "Tableta"], ["mobile", Smartphone, "Celular"]] as const).map(([d, Icon, label]) => (
              <button key={d} type="button" aria-label={label} title={label} aria-pressed={device === d} onClick={() => setDevice(d)} className={`flex h-7 w-9 items-center justify-center rounded-full transition-colors ${device === d ? "bg-[#165a43] text-white" : "text-[#5d6e65] hover:bg-[#f1efe6]"}`}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <div role="group" aria-label="Modo" className="flex gap-0.5 rounded-full border border-[#d9d6cb] bg-white p-0.5 text-[0.7rem] font-bold">
            {(["editar", "navegar"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={modo === m} onClick={() => setModo(m)} className={`rounded-full px-2.5 py-1.5 capitalize transition-colors ${modo === m ? "bg-[#165a43] text-white" : "text-[#5d6e65] hover:bg-[#f1efe6]"}`}>
                {m}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); irA(ir); }} className="flex items-center gap-1 rounded-full border border-[#d9d6cb] bg-white py-0.5 pl-2.5 pr-0.5" title="Página que se está editando">
            <label className="sr-only" htmlFor="ruta-editor">Página</label>
            <input id="ruta-editor" list="rutas-editor" value={ir} onChange={(e) => setIr(e.target.value)} className="w-24 bg-transparent text-xs font-semibold outline-none" spellCheck={false} />
            <datalist id="rutas-editor">
              {["/", "/noticias", "/nosotros", "/sala-de-prensa", "/preguntas-frecuentes", "/pagos", "/buscador"].map((r) => <option key={r} value={r} />)}
            </datalist>
            <button type="submit" className="rounded-full bg-[#f1efe6] px-2.5 py-1 text-[0.7rem] font-bold text-[#165a43] hover:bg-[#e4e1d6]">Ir</button>
          </form>
          <div className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={menu === "vista"} onClick={() => setMenu(menu === "vista" ? null : "vista")} className="ad-icon-btn !w-auto gap-1 px-2">
              <SlidersHorizontal size={14} /> <ChevronDown size={12} />
            </button>
            {menu === "vista" && (
              <div role="menu" className="absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-[#d9d6cb] bg-white p-1.5 shadow-xl">
                <label className={`${menuItem} cursor-pointer`}>
                  <input type="checkbox" checked={resaltar} onChange={(e) => setResaltar(e.target.checked)} /> Resaltar la zona elegida
                </label>
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button type="button" aria-label={full ? "Salir de pantalla completa" : "Pantalla completa"} title={full ? "Salir de pantalla completa" : "Pantalla completa"} onClick={() => setFull((v) => !v)} className="ad-icon-btn">
              {full ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <a href="/" target="_blank" rel="noreferrer" aria-label="Abrir el sitio en otra pestaña" title="Abrir el sitio en otra pestaña" className="ad-icon-btn"><ExternalLink size={14} /></a>
            <button type="button" className="ad-btn ad-btn-primary" disabled={!writable || pending || !dirty} onClick={doPublish}>
              <UploadCloud size={14} /> {pending ? "Procesando…" : "Publicar"}
            </button>
            <div className="relative">
              <button type="button" aria-label="Más opciones" aria-haspopup="menu" aria-expanded={menu === "mas"} onClick={() => setMenu(menu === "mas" ? null : "mas")} className="ad-icon-btn"><Ellipsis size={14} /></button>
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

        <div ref={stage} className="ad-card flex flex-col items-center overflow-hidden px-3 pb-3 pt-5 sm:px-6">
          <div className="flex flex-col items-center" style={{ width: viewW + 2 * dev.bezel }}>
            <div className="bg-[#14171a] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]" style={{ padding: dev.bezel, borderRadius: device === "mobile" ? 30 : device === "tablet" ? 20 : 14, width: "100%" }}>
              <div className="relative overflow-hidden bg-[#05100b]" style={{ width: viewW, height: viewH, borderRadius: device === "mobile" ? 22 : device === "tablet" ? 11 : 5 }}>
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
            {device === "desktop" && <div aria-hidden className="h-2.5 w-[106%] rounded-b-[1rem] bg-gradient-to-b from-[#c9ccd0] to-[#9da1a6]" />}
          </div>
          <p className="mt-4 text-sm text-[#5d6e65]">
            {dev.name} · {dev.w}px · {Math.round(scale * 100)} %{scale < 1 ? " (ajustado al ancho)" : ""}
          </p>
          <p className="mt-1 text-xs text-[#8a978f]">{modo === "editar" ? `Haga clic en cualquier elemento de la página para editarlo. Página: ${pagePath}` : `Modo navegar: use los enlaces del sitio. Página: ${pagePath}`}</p>
        </div>
      </div>

      {/* Panel de propiedades */}
      <aside className={`flex flex-col gap-2 xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:pr-1 ${full ? "hidden" : ""}`} aria-label="Propiedades del diseño">
        <section className="ad-card p-0">
          <h2 className="flex items-center gap-2 border-b border-[#e4e1d6] px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#165a43]">
            <SlidersHorizontal size={14} /> Propiedades
          </h2>
          <div className="p-4">
            <p className="text-sm font-bold text-[#11271d]">Elige qué quieres cambiar</p>
            <p className="mt-0.5 text-xs text-[#5d6e65]">Haz clic en la página o elige una parte:</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={tab === "zonas" && r.id === region}
                  onClick={() => { setRegion(r.id); setTab("zonas"); }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${tab === "zonas" && r.id === region ? "border-[#b08f4f] bg-[#f7edcf] text-[#7c5f1f]" : "border-[#d9d6cb] bg-white text-[#11271d] hover:border-[#b08f4f]"}`}
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
              <button type="button" aria-expanded={abierto} aria-controls={`acc-${id}`} onClick={() => abrir(id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                <Icon size={16} className="shrink-0 text-[#5d6e65]" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#11271d]">{title}</span>
                  <span className="block truncate text-xs text-[#5d6e65]">{summary}</span>
                </span>
                <ChevronDown size={16} className={`shrink-0 text-[#5d6e65] transition-transform duration-300 ${abierto ? "rotate-180" : ""}`} />
              </button>
              {abierto && (
                <div id={`acc-${id}`} className="flex flex-col gap-3 border-t border-[#e4e1d6] p-4 text-xs [&_.text-sm]:!text-xs">
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

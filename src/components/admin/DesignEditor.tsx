"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Monitor, RotateCcw, Smartphone, Tablet, Undo2, UploadCloud } from "lucide-react";
import { FONTS, REGIONS, designCss, normalizeDesign, type DesignConfig, type RegionId, type RegionStyle } from "@/lib/design/regions";
import { publishDesign, saveDesignDraft, undoDesignPublish } from "@/lib/design/actions";

const WIDTHS = { desktop: "100%", tablet: "820px", mobile: "390px" } as const;
type Device = keyof typeof WIDTHS;

const same = (a: DesignConfig, b: DesignConfig) => JSON.stringify(a) === JSON.stringify(b);

function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (n: number | undefined) => void }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
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
      <input
        type="color"
        aria-label={`Color: ${label}`}
        disabled={!value}
        value={value ?? fallback}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-14 cursor-pointer rounded border border-[#d9d6cb] bg-white disabled:opacity-40"
      />
    </div>
  );
}

export function DesignEditor({ writable, initialPublished, initialDraft, canUndo }: { writable: boolean; initialPublished: DesignConfig; initialDraft: DesignConfig; canUndo: boolean }) {
  const [design, setDesign] = useState<DesignConfig>(initialDraft);
  const [published, setPublished] = useState<DesignConfig>(initialPublished);
  const [undoable, setUndoable] = useState(canUndo);
  const [region, setRegion] = useState<RegionId>("hero");
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const frame = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  const css = useMemo(() => designCss(design), [design]);
  const dirty = !same(normalizeDesign(design), published);

  // Vista previa real: el mismo sitio con el borrador aplicado como una hoja de estilos en el iframe.
  const paint = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc?.head) return;
    doc.getElementById("design-css")?.remove();
    let el = doc.getElementById("design-preview");
    if (!el) {
      el = doc.createElement("style");
      el.id = "design-preview";
      doc.head.appendChild(el);
    }
    el.textContent = `${css}\n[data-region="${region}"]{outline:3px solid #d8b558 !important;outline-offset:-3px}`;
  }, [css, region]);

  useEffect(paint, [paint]);

  const onFrameLoad = () => {
    paint();
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    doc.addEventListener(
      "click",
      (e) => {
        const hit = (e.target as Element | null)?.closest?.("[data-region]");
        const id = hit?.getAttribute("data-region") as RegionId | null;
        if (id && REGIONS.some((r) => r.id === id)) setRegion(id);
        e.preventDefault();
        e.stopPropagation();
      },
      true,
    );
  };

  // Autoguardado del borrador.
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

  const style: RegionStyle = design.regions[region] ?? {};
  const meta = REGIONS.find((r) => r.id === region)!;
  const has = (k: keyof RegionStyle) => meta.controls.includes(k);

  const patch = (p: Partial<RegionStyle>) =>
    setDesign((d) => {
      const next = { ...(d.regions[region] ?? {}), ...p };
      (Object.keys(next) as (keyof RegionStyle)[]).forEach((k) => next[k] === undefined && delete next[k]);
      const regions = { ...d.regions };
      if (Object.keys(next).length) regions[region] = next;
      else delete regions[region];
      return { v: 1, regions };
    });

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

  return (
    <div className="grid gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className="ad-card flex flex-col gap-5 p-5 xl:sticky xl:top-6 xl:self-start">
        <div>
          <p className="ad-eyebrow">Zona</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRegion(r.id)}
                aria-pressed={r.id === region}
                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${r.id === region ? "border-[#b08f4f] bg-[#f7edcf]" : "border-[#d9d6cb] bg-white hover:border-[#b08f4f]"}`}
              >
                {r.label}
                {design.regions[r.id] && <span className="ml-1 text-[#b08f4f]">●</span>}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[#8a978f]">{meta.hint} También puede hacer clic en la vista previa.</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#e4e1d6] pt-5">
          {has("bg") && <ColorField label="Color de fondo" value={style.bg} fallback="#0a2a20" onChange={(v) => patch({ bg: v })} />}
          {has("fg") && <ColorField label="Color del texto" value={style.fg} fallback="#f4f2e9" onChange={(v) => patch({ fg: v })} />}
          {has("accent") && <ColorField label="Color de acento" value={style.accent} fallback="#d8b558" onChange={(v) => patch({ accent: v })} />}
          {has("titleFont") && (
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Tipografía de títulos
              <select className="ad-input" value={style.titleFont ?? ""} onChange={(e) => patch({ titleFont: (e.target.value || undefined) as RegionStyle["titleFont"] })}>
                <option value="">Predeterminada</option>
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </label>
          )}
          {has("titleScale") && <Slider label="Tamaño de títulos" value={style.titleScale ?? 100} min={70} max={160} unit="%" onChange={(n) => patch({ titleScale: n })} />}
          {has("textScale") && <Slider label="Tamaño del texto" value={style.textScale ?? 100} min={80} max={140} unit="%" onChange={(n) => patch({ textScale: n })} />}
          {has("padY") && (
            <div className="flex flex-col gap-2">
              <Slider label="Espacio vertical" value={style.padY ?? 0} min={0} max={8} step={0.25} unit=" rem" onChange={(n) => patch({ padY: n })} />
              {style.padY !== undefined && (
                <button type="button" className="self-start text-xs font-semibold text-[#165a43] underline" onClick={() => patch({ padY: undefined })}>
                  Quitar espacio propio
                </button>
              )}
            </div>
          )}
          {has("maxWidth") && (
            <div className="flex flex-col gap-2">
              <Slider label="Ancho máximo" value={style.maxWidth ?? 1376} min={720} max={1920} step={16} unit=" px" onChange={(n) => patch({ maxWidth: n })} />
              {style.maxWidth !== undefined && (
                <button type="button" className="self-start text-xs font-semibold text-[#165a43] underline" onClick={() => patch({ maxWidth: undefined })}>
                  Volver al ancho predeterminado
                </button>
              )}
            </div>
          )}
          {has("hidden") && (
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={Boolean(style.hidden)} onChange={(e) => patch({ hidden: e.target.checked || undefined })} />
              Ocultar esta zona
            </label>
          )}
          <button
            type="button"
            className="ad-btn ad-btn-ghost self-start"
            onClick={() => setDesign((d) => { const regions = { ...d.regions }; delete regions[region]; return { v: 1, regions }; })}
          >
            <RotateCcw size={15} /> Restablecer esta zona
          </button>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-[#e4e1d6] pt-5">
          <button type="button" className="ad-btn ad-btn-primary justify-center" disabled={!writable || pending || !dirty} onClick={doPublish}>
            <UploadCloud size={16} /> {pending ? "Procesando…" : "Publicar diseño"}
          </button>
          <button type="button" className="ad-btn ad-btn-ghost justify-center" disabled={!writable || pending || !undoable} onClick={doUndo}>
            <Undo2 size={16} /> Deshacer la última publicación
          </button>
          <p className="text-xs text-[#8a978f]">
            {dirty ? "Hay cambios sin publicar." : "El borrador coincide con lo publicado."}
          </p>
          {status && (
            <p role="status" className={`rounded-lg px-3 py-2 text-sm ${status.kind === "err" ? "bg-[#fde8e8] text-[#a12b2b]" : status.kind === "ok" ? "bg-[#e1f1e7] text-[#146040]" : "bg-[#f1efe6] text-[#5d6e65]"}`}>
              {status.text}
            </p>
          )}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#5d6e65]">Vista previa con el borrador aplicado</p>
          <div className="flex gap-1.5">
            {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([d, Icon]) => (
              <button key={d} type="button" aria-label={d} aria-pressed={device === d} onClick={() => setDevice(d)} className={`ad-icon-btn ${device === d ? "!border-[#b08f4f] !text-[#165a43]" : ""}`}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        <div className="ad-card overflow-hidden bg-[#e4e1d6] p-2 sm:p-3">
          <iframe
            ref={frame}
            src="/"
            title="Vista previa del sitio"
            onLoad={onFrameLoad}
            style={{ width: WIDTHS[device], maxWidth: "100%" }}
            className="mx-auto block h-[78vh] min-h-[32rem] rounded-lg border-0 bg-[#05100b]"
          />
        </div>
      </section>
    </div>
  );
}

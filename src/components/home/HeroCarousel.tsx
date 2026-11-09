"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { AdConfig } from "@/lib/design/regions";
import { useLiveDesign } from "@/components/design/live";
import { canOptimize } from "@/lib/image-host";
import { HERO_DEFAULTS } from "./HeroText";

type Slide = AdConfig;

function Boton({ href, children, cls }: { href: string; children: ReactNode; cls: string }) {
  return href.startsWith("/") ? (
    <Link href={href} className={cls}>{children}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{children}</a>
  );
}

// Carrusel de la portada. Todo se maneja en Admin → Diseño → Publicidad → «Carrusel de portada»:
// diapositivas (imagen, títulos, texto, botones, enlace) y el carrusel (ancho, alto, oscurecido, posición del texto,
// cambio automático, flechas, puntos y esquinas). Sin diapositivas con imagen se muestra `fallback`.
export function HeroCarousel({ initial, fallback }: { initial: Slide[]; fallback: ReactNode }) {
  const { value } = useLiveDesign<Slide[]>(initial, (d) => [d.ads.portada, ...(d.banners ?? [])].filter((b): b is Slide => Boolean(b)));
  const conf = value[0] ?? {};
  // La diapositiva 1 (banner de portada) usa el texto de siempre solo si no se ha escrito nada de texto en ella;
  // en cuanto se escribe algo, lo que quede vacío no se muestra (por ejemplo, un botón sin rellenar).
  const conDefecto = (b: Slide): Slide => {
    const claves = Object.keys(HERO_DEFAULTS) as (keyof typeof HERO_DEFAULTS)[];
    if (claves.some((k) => String(b[k] ?? "").trim())) return b;
    return { ...b, ...HERO_DEFAULTS };
  };
  const slides = value.filter((b) => b.on !== false && b.image && (b !== value[0] || b.on)).map((b) => (b === value[0] ? conDefecto(b) : b));
  const n = slides.length;
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const [detenido, setDetenido] = useState(false);
  const toque = useRef<number | null>(null);
  const segundos = conf.segundos ?? 7;
  const ir = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || pausa || detenido || segundos <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), segundos * 1000);
    return () => window.clearInterval(t);
  }, [n, pausa, detenido, segundos]);

  if (!n) return <>{fallback}</>;
  const act = Math.min(i, n - 1);
  const flechas = conf.flechas !== false && n > 1;
  const puntos = conf.puntos !== false && n > 1;
  const style = {
    "--car-h": `${conf.height ?? 460}px`,
    "--car-hm": `${conf.heightMobile ?? 420}px`,
    "--car-w": `${conf.width ?? 100}%`,
    "--car-veil": String((conf.oscuro ?? 55) / 100),
  } as CSSProperties;

  return (
    <section
      className="car"
      data-editor-panel="publicidad"
      data-align={conf.alinear ?? "izquierda"}
      data-round={conf.redondo === false ? "no" : "si"}
      style={style}
      aria-roledescription="carrusel"
      aria-label="Destacados de FEDEGÁN–FNG"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={() => setPausa(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") ir(act - 1);
        if (e.key === "ArrowRight") ir(act + 1);
      }}
      onPointerDown={(e) => (toque.current = e.clientX)}
      onPointerUp={(e) => {
        if (toque.current === null) return;
        const dx = e.clientX - toque.current;
        toque.current = null;
        if (Math.abs(dx) > 50) ir(act + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="car-track">
        {slides.map((s, k) => {
          const conTexto = Boolean(s.titulo || s.subtitulo || s.texto || s.boton1 || s.boton2);
          const Titulo = k === 0 ? "h1" : "h2";
          return (
            <div key={`${s.image}-${k}`} className="car-slide" data-on={k === act ? "si" : "no"} aria-hidden={k !== act} inert={k !== act} role="group" aria-roledescription="diapositiva" aria-label={`${k + 1} de ${n}`}>
              {/* Las imágenes subidas desde el panel pasan por el optimizador: el tamaño de pantalla justo, en AVIF o WebP y con caché larga
                  (sin esto, una foto de 2 MB se descargaba completa en cada visita y la portada tardaba varios segundos). */}
              <Image src={s.image as string} alt={s.alt || ""} fill sizes="(min-width: 1536px) 1536px, 100vw" quality={72} priority={k === 0} unoptimized={!canOptimize(s.image as string)} className="car-img" />
              {conTexto && <div className="car-veil" aria-hidden />}
              {conTexto ? (
                <div className="car-text">
                  {(s.titulo || s.subtitulo) && <Titulo>{s.titulo}{s.subtitulo && <span>{s.subtitulo}</span>}</Titulo>}
                  {s.texto && <p>{s.texto}</p>}
                  {(s.boton1 || s.boton2) && (
                    <div className="hi-btns">
                      {s.boton1 && <Boton href={s.enlace1 || s.href || "/"} cls="hi-btn">{s.boton1} <ArrowRight size={16} aria-hidden /></Boton>}
                      {s.boton2 && <Boton href={s.enlace2 || "/"} cls="hi-btn hi-ghost">{s.boton2} <ArrowRight size={16} aria-hidden /></Boton>}
                    </div>
                  )}
                </div>
              ) : (
                s.href && (
                  <Boton href={s.href} cls="car-link">
                    <span className="sr-only">{s.alt || s.label || "Ver más"}</span>
                    {s.label && <span className="portada-btn">{s.label}</span>}
                  </Boton>
                )
              )}
            </div>
          );
        })}
      </div>
      {flechas && (
        <>
          <button type="button" className="car-arrow car-prev" onClick={() => ir(act - 1)} aria-label="Diapositiva anterior"><ChevronLeft size={22} aria-hidden /></button>
          <button type="button" className="car-arrow car-next" onClick={() => ir(act + 1)} aria-label="Diapositiva siguiente"><ChevronRight size={22} aria-hidden /></button>
        </>
      )}
      {(puntos || (n > 1 && segundos > 0)) && (
        <div className="car-bar">
          {n > 1 && segundos > 0 && (
            <button type="button" className="car-play" onClick={() => setDetenido(!detenido)} aria-label={detenido ? "Reanudar el carrusel" : "Detener el carrusel"}>
              {detenido ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
            </button>
          )}
          {puntos && slides.map((_, k) => (
            <button key={k} type="button" className={`car-dot ${k === act ? "on" : ""}`} onClick={() => ir(k)} aria-label={`Ir a la diapositiva ${k + 1}`} aria-current={k === act} />
          ))}
        </div>
      )}
    </section>
  );
}

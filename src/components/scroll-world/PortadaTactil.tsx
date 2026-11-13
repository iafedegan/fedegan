import "./portada-tactil.css";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LayoutGrid, Search } from "lucide-react";
import { canOptimize } from "@/lib/image-host";
import { registrarUso } from "@/lib/uso";
import { AccesosRapidos } from "@/components/layout/AccesosRapidos";
import type { JourneyScene } from "./ScrollWorld";

// Portada para celular y tableta (menos de 1024 px): foto de apertura con buscador y la noticia del día, y los
// accesos de un toque. Todo lo demás vive en un solo lugar, el menú (barra inferior → «Menú»): aquí solo se le da paso.
export function PortadaTactil({ scenes }: { scenes: JourneyScene[] }) {
  const inicio = scenes[0];
  const noticias = scenes.find((s) => s.id === "noticias");
  const nota = noticias?.extra;

  return (
    <div className="pt">
      <div className="pt-hero">
        {/* Misma foto y mismos tamaños que la primera escena de escritorio: el navegador la baja una sola vez. */}
        <Image src={inicio.image} alt={inicio.alt} fill sizes="100vw" preload unoptimized={!canOptimize(inicio.image)} className="pt-hero-img" style={{ objectPosition: inicio.pos }} />
        <div className="pt-hero-shade" aria-hidden />
        <div className="pt-hero-in">
          <p className="pt-kicker"><i aria-hidden />Federación Colombiana de Ganaderos</p>
          <h2 className="pt-title">Todo el gremio ganadero, <em>en su mano</em></h2>
          <Link href="/buscador" className="pt-search">
            <Search size={18} aria-hidden />
            <span>¿Qué está buscando?</span>
          </Link>
          {nota && noticias && (
            <Link href={nota.href ?? noticias.href} className="pt-news" onClick={() => registrarUso("noticias")}>
              <span className="pt-news-img">
                <Image src={noticias.image} alt="" fill sizes="88px" unoptimized={!canOptimize(noticias.image)} />
              </span>
              <span className="pt-news-txt">
                <small>{nota.etiqueta}</small>
                <b>{nota.texto}</b>
              </span>
              <ArrowUpRight size={18} aria-hidden className="pt-news-go" />
            </Link>
          )}
        </div>
      </div>

      <div className="pt-hoja">
        <AccesosRapidos className="pt-accesos" />
        <button type="button" className="pt-todo" aria-haspopup="dialog" onClick={() => window.dispatchEvent(new Event("fedegan:menu"))}>
          <LayoutGrid size={18} aria-hidden />
          Ver todas las secciones
        </button>
      </div>
    </div>
  );
}

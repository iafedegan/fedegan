"use client";

import "./menu-movil.css";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowUpRight, ChevronRight, LogIn, LogOut, Search, UserCircle2, X } from "lucide-react";
import type { MenuGrupo } from "@/lib/menu-movil";
import { AccesosRapidos } from "./AccesosRapidos";
import { ThemeToggle } from "./ThemeToggle";

const activa = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

// El menú único de celular y tableta: una hoja que sube desde abajo con el buscador, los accesos de un toque,
// todas las secciones agrupadas (sin repetir) y la cuenta. Reemplaza a «Secciones» y a «Más».
export function MenuMovil({ grupos, onClose }: { grupos: MenuGrupo[]; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [q, setQ] = useState("");
  const cerrar = useRef<HTMLButtonElement>(null);

  // Al abrir, el foco pasa a la hoja (teclado y lectores de pantalla).
  useEffect(() => { cerrar.current?.focus(); }, []);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    onClose();
    router.push(t ? `/buscador?q=${encodeURIComponent(t)}` : "/buscador");
  };

  return createPortal(
    <div className="mm" id="menu-movil">
      <button type="button" className="mm-fondo" aria-label="Cerrar el menú" tabIndex={-1} onClick={onClose} />
      <div className="mm-hoja" role="dialog" aria-modal="true" aria-label="Menú del portal">
        <div className="mm-cab">
          <span className="mm-asa" aria-hidden />
          <p>Menú</p>
          <button ref={cerrar} type="button" onClick={onClose} aria-label="Cerrar el menú" className="mm-cerrar"><X size={19} /></button>
        </div>

        <div className="mm-cuerpo">
          <form role="search" onSubmit={buscar} className="mm-busca">
            <Search size={18} aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="¿Qué está buscando?" aria-label="Buscar en el portal" enterKeyHint="search" />
          </form>

          <section>
            <h3 className="mm-rotulo">Lo más usado</h3>
            <AccesosRapidos onPick={onClose} className="mm-accesos" />
          </section>

          <div className="mm-grupos">
            {grupos.map((g) => (
              <section key={g.id}>
                <h3 className="mm-rotulo">{g.titulo}</h3>
                <ul className="mm-lista">
                  {g.items.map((it) => (
                    <li key={it.href + it.label}>
                      {it.external ? (
                        <a href={it.href} target="_blank" rel="noopener noreferrer" className="mm-fila" onClick={onClose}>
                          {it.label}
                          <ArrowUpRight size={17} className="mm-ir" aria-label="(abre otro sitio)" />
                        </a>
                      ) : (
                        <Link href={it.href} className="mm-fila" onClick={onClose} aria-current={activa(pathname, it.href) ? "page" : undefined}>
                          {it.label}
                          <ChevronRight size={17} className="mm-ir" aria-hidden />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            <section>
              <h3 className="mm-rotulo">Su cuenta</h3>
              <ul className="mm-lista">
                <li>
                  <Link href={user ? "/mi-fedegan" : "/ingresar"} className="mm-fila" onClick={onClose}>
                    {user ? <UserCircle2 size={19} className="mm-pre" aria-hidden /> : <LogIn size={19} className="mm-pre" aria-hidden />}
                    {user ? "Mi FEDEGÁN" : "Iniciar sesión"}
                    <ChevronRight size={17} className="mm-ir" aria-hidden />
                  </Link>
                </li>
                {user && (
                  <li>
                    <button type="button" className="mm-fila" onClick={() => signOut({ redirectTo: "/" })}>
                      <LogOut size={19} className="mm-pre" aria-hidden />
                      Cerrar sesión
                    </button>
                  </li>
                )}
                <li>
                  <div className="mm-fila mm-fila-fija">
                    Tono claro u oscuro
                    <ThemeToggle className="mm-tono" />
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

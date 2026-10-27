"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays, FileStack, FileText, GraduationCap, Users, Globe, HelpCircle, History, LayoutDashboard, Link2, LogOut, Menu, Newspaper, Store, BarChart3, Palette, PanelLeftClose, PanelLeftOpen, Plug, X,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup } from "@/lib/cms/nav";

const icons: Record<string, LucideIcon> = {
  layout: LayoutDashboard, store: Store, chart: BarChart3, link: Link2, file: FileText, calendar: CalendarDays,
  help: HelpCircle, pages: FileStack, plug: Plug, palette: Palette, menu: Menu, history: History, globe: Globe, newspaper: Newspaper, graduation: GraduationCap, users: Users,
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ user, groups }: { user: { name: string; email: string; role: string }; groups: AdminNavGroup[] }) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // En escritorio la barra es un riel de íconos que se despliega al acercar el mouse (o al enfocarla con el teclado);
  // el botón de anclar la deja abierta. En móvil se muestra completa.
  const lbl = (rail: boolean) =>
    rail
      ? "whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/side:opacity-100 group-focus-within/side:opacity-100 group-data-[pinned=true]/side:opacity-100"
      : "";

  const brand = (rail: boolean) => (
    <Link href="/admin" className="flex items-center gap-3 pl-1">
      <Image src="/brand/fedegan-icon-round.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
      <span className={`font-[var(--font-display)] text-lg font-semibold leading-tight text-white ${lbl(rail)}`}>Panel del portal</span>
    </Link>
  );

  const body = (rail: boolean) => (
    <>
      <div className={`flex items-center gap-3 rounded-2xl bg-white/10 ${rail ? "p-1.5 transition-[padding] duration-300 group-hover/side:p-3 group-focus-within/side:p-3 group-data-[pinned=true]/side:p-3" : "p-3.5"}`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d8b558] font-bold text-[#11271d]">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <div className={`min-w-0 leading-tight ${lbl(rail)}`}>
          <p className="truncate font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-[#a9c4b6]">{user.role}</p>
        </div>
      </div>

      <nav aria-label="Menú del panel" className={`mt-6 flex flex-1 flex-col gap-5 pr-1 ${rail ? "overflow-x-hidden overflow-y-auto" : "overflow-y-auto"}`}>
        {groups.map((g) => (
          <div key={g.group}>
            <p className={`mb-2 px-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#7fa392] ${lbl(rail)}`}>{g.group}</p>
            <ul className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const Icon = icons[it.icon] ?? FileText;
                const active = !it.external && isActive(pathname, it.href);
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      target={it.external ? "_blank" : undefined}
                      rel={it.external ? "noreferrer" : undefined}
                      aria-current={active ? "page" : undefined}
                      aria-label={it.label}
                      title={rail ? it.label : undefined}
                      onClick={() => setOpenAt(null)}
                      className="ad-navlink"
                    >
                      <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                      <span className={lbl(rail)}>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ redirectTo: "/" })}
        aria-label="Salir"
        title={rail ? "Salir" : undefined}
        className="ad-navlink mt-4 w-full border-t border-white/10 pt-0 text-left"
      >
        <LogOut size={18} strokeWidth={1.8} className="shrink-0" /> <span className={lbl(rail)}>Salir</span>
      </button>
    </>
  );

  return (
    <>
      {/* Escritorio: el hueco reserva el ancho del riel; la barra se despliega encima del contenido */}
      <div className={`hidden shrink-0 transition-[width] duration-300 lg:block ${pinned ? "w-72" : "w-[4.75rem]"}`}>
        <aside
          data-pinned={pinned}
          className={`ad-side group/side fixed inset-y-0 left-0 z-40 flex flex-col gap-6 overflow-hidden px-2.5 py-6 transition-[width,box-shadow] duration-300 ${
            pinned ? "w-72" : "w-[4.75rem] hover:w-72 hover:shadow-[24px_0_60px_-24px_rgba(7,40,29,0.65)] focus-within:w-72 focus-within:shadow-[24px_0_60px_-24px_rgba(7,40,29,0.65)]"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            {brand(true)}
            <button
              type="button"
              onClick={() => setPinned((v) => !v)}
              aria-pressed={pinned}
              aria-label={pinned ? "Soltar la barra lateral" : "Mantener abierta la barra lateral"}
              title={pinned ? "Soltar" : "Mantener abierta"}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#a9c4b6] transition-opacity hover:bg-white/10 hover:text-white ${lbl(true)}`}
            >
              {pinned ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
          </div>
          {body(true)}
        </aside>
      </div>

      {/* Móvil */}
      <div className="ad-side sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        {brand(false)}
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpenAt(open ? null : pathname)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="ad-side fixed inset-x-0 bottom-0 top-[4.5rem] z-20 flex flex-col px-5 pb-6 pt-4 lg:hidden">{body(false)}</div>
      )}
    </>
  );
}

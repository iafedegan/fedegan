"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays, FileText, Globe, HelpCircle, History, LayoutDashboard, Link2, LogOut, Menu, Newspaper, Store, BarChart3, X,
  type LucideIcon,
} from "lucide-react";
import type { AdminNavGroup } from "@/lib/cms/nav";

const icons: Record<string, LucideIcon> = {
  layout: LayoutDashboard, store: Store, chart: BarChart3, link: Link2, file: FileText, calendar: CalendarDays,
  help: HelpCircle, menu: Menu, history: History, globe: Globe, newspaper: Newspaper,
};

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ user, groups }: { user: { name: string; email: string; role: string }; groups: AdminNavGroup[] }) {
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

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

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <Image src="/brand/fedegan-icon-round.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
      <span className="font-[var(--font-display)] text-lg font-semibold leading-tight text-white">Panel del portal</span>
    </Link>
  );

  const body = (
    <>
      <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d8b558] font-bold text-[#11271d]">
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-[#a9c4b6]">{user.role}</p>
        </div>
      </div>

      <nav aria-label="Menú del panel" className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="mb-2 px-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#7fa392]">{g.group}</p>
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
                      onClick={() => setOpenAt(null)}
                      className="ad-navlink"
                    >
                      <Icon size={18} strokeWidth={1.8} />
                      {it.label}
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
        className="ad-navlink mt-4 w-full border-t border-white/10 pt-0 text-left"
      >
        <LogOut size={18} strokeWidth={1.8} /> Salir
      </button>
    </>
  );

  return (
    <>
      {/* Escritorio */}
      <aside className="ad-side sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-6 px-5 py-6 lg:flex">
        {brand}
        {body}
      </aside>

      {/* Móvil */}
      <div className="ad-side sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden">
        {brand}
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
        <div className="ad-side fixed inset-x-0 bottom-0 top-[4.5rem] z-20 flex flex-col px-5 pb-6 pt-4 lg:hidden">{body}</div>
      )}
    </>
  );
}

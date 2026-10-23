import Link from "next/link";
import { BookOpen, ListTree, Users } from "lucide-react";

const TABS = [
  { key: "info", label: "Información", icon: BookOpen, href: (id: string) => `/admin/cursos/${id}` },
  { key: "curriculo", label: "Currículo", icon: ListTree, href: (id: string) => `/admin/cursos/${id}/curriculo` },
  { key: "estudiantes", label: "Estudiantes", icon: Users, href: (id: string) => `/admin/cursos/${id}/estudiantes` },
] as const;

/** Pestañas del curso en el panel: datos, currículo y estudiantes. */
export function CourseTabs({ id, active }: { id: string; active: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="Secciones del curso" className="flex flex-wrap gap-1 border-b border-[#e4e2d6]">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={t.href(id)}
          aria-current={t.key === active ? "page" : undefined}
          className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${t.key === active ? "border-[#165a43] text-[#165a43]" : "border-transparent text-[#5d6e65] hover:text-[#165a43]"}`}
        >
          <t.icon size={16} /> {t.label}
        </Link>
      ))}
    </nav>
  );
}

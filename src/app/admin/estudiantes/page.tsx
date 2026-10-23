import type { Metadata } from "next";
import Link from "next/link";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { adminDb } from "@/lib/cms/client";

export const metadata: Metadata = { title: "Estudiantes", robots: { index: false } };
type Row = Record<string, unknown>;

export default async function StudentsPage() {
  const db = adminDb();
  if (!db) return <ConfigNotice />;
  const [{ data: es }, { data: cs }] = await Promise.all([
    db.from("lms_enrollments").select("*").order("enrolled_at", { ascending: false }).limit(500),
    db.from("lms_courses").select("id,title,slug"),
  ]);
  const courses = new Map(((cs ?? []) as Row[]).map((c) => [c.id as string, c]));
  const rows = (es ?? []) as Row[];
  const people = new Set(rows.map((r) => r.user_key));
  const fmt = (d: unknown) => (typeof d === "string" ? new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—");
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Estudiantes</h1>
        <p className="mt-1.5 text-[#5d6e65]">{people.size} personas · {rows.length} inscripciones en la Escuela Virtual.</p>
      </header>
      <div className="ad-card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead><tr className="border-b border-[#eceae0] text-xs font-bold uppercase tracking-[0.12em] text-[#8a978f]"><th className="px-5 py-3">Estudiante</th><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Inscripción</th><th className="px-5 py-3">Terminó</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-[#8a978f]">Todavía no hay inscripciones.</td></tr>}
            {rows.map((e) => {
              const c = courses.get(e.course_id as string);
              return (
                <tr key={e.id as string} className="border-b border-[#eceae0] last:border-0">
                  <td className="px-5 py-3"><p className="font-semibold">{String(e.user_name || e.user_key)}</p><p className="text-xs text-[#8a978f]">{String(e.user_key)}</p></td>
                  <td className="px-5 py-3">{c ? <Link href={`/admin/cursos/${String(c.id)}/estudiantes`} className="text-[#165a43] hover:underline">{String(c.title)}</Link> : "—"}</td>
                  <td className="px-5 py-3">{fmt(e.enrolled_at)}</td>
                  <td className="px-5 py-3">{fmt(e.completed_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

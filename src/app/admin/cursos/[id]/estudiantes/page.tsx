import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CourseTabs } from "@/components/admin/CourseTabs";
import { ConfigNotice } from "@/components/admin/ConfigNotice";
import { adminDb } from "@/lib/cms/client";

export const metadata: Metadata = { title: "Estudiantes del curso", robots: { index: false } };
type Row = Record<string, unknown>;

export default async function CourseStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = adminDb();
  if (!db) return <ConfigNotice />;
  const { data: course } = await db.from("lms_courses").select("id,title").eq("id", id).maybeSingle();
  if (!course) notFound();
  const [{ data: es }, { data: ps }, { count: total }, { data: rs }] = await Promise.all([
    db.from("lms_enrollments").select("*").eq("course_id", id).order("enrolled_at", { ascending: false }),
    db.from("lms_progress").select("user_key,completed_at").eq("course_id", id),
    db.from("lms_lessons").select("id", { count: "exact", head: true }).eq("course_id", id),
    db.from("lms_reviews").select("rating").eq("course_id", id),
  ]);
  const enrolls = (es ?? []) as Row[];
  const progress = (ps ?? []) as Row[];
  const ratings = (rs ?? []) as Row[];
  const avg = ratings.length ? (ratings.reduce((a, r) => a + Number(r.rating), 0) / ratings.length).toFixed(1) : "—";
  const finished = enrolls.filter((e) => e.completed_at).length;
  const fmt = (d: unknown) => (typeof d === "string" ? new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <nav aria-label="Ruta" className="flex items-center gap-1.5 text-xs text-[#8a978f]">
          <Link href="/admin" className="hover:text-[#165a43]">Panel</Link><ChevronRight size={12} />
          <Link href="/admin/cursos" className="hover:text-[#165a43]">Cursos</Link><ChevronRight size={12} />
          <span className="font-medium text-[#5d6e65]">Estudiantes</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{String(course.title)}</h1>
      </header>
      <CourseTabs id={id} active="estudiantes" />
      <dl className="grid gap-4 sm:grid-cols-4">
        {[["Inscritos", enrolls.length], ["Terminaron", finished], ["Tasa de finalización", enrolls.length ? `${Math.round((finished / enrolls.length) * 100)} %` : "—"], ["Valoración", avg]].map(([k, v]) => (
          <div key={String(k)} className="ad-card p-5"><dt className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a978f]">{k}</dt><dd className="mt-2 font-[var(--font-display)] text-3xl font-bold">{v}</dd></div>
        ))}
      </dl>
      <div className="ad-card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead><tr className="border-b border-[#eceae0] text-xs font-bold uppercase tracking-[0.12em] text-[#8a978f]"><th className="px-5 py-3">Estudiante</th><th className="px-5 py-3">Inscripción</th><th className="px-5 py-3">Avance</th><th className="px-5 py-3">Terminó</th><th className="px-5 py-3">Certificado</th></tr></thead>
          <tbody>
            {enrolls.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-[#8a978f]">Todavía no hay estudiantes inscritos.</td></tr>}
            {enrolls.map((e) => {
              const done = progress.filter((p) => p.user_key === e.user_key).length;
              const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
              return (
                <tr key={e.id as string} className="border-b border-[#eceae0] last:border-0">
                  <td className="px-5 py-3"><p className="font-semibold">{String(e.user_name || e.user_key)}</p><p className="text-xs text-[#8a978f]">{String(e.user_key)}</p></td>
                  <td className="px-5 py-3">{fmt(e.enrolled_at)}</td>
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><span className="h-2 w-28 overflow-hidden rounded-full bg-[#e8e6da]"><span className="block h-full bg-[#165a43]" style={{ width: `${pct}%` }} /></span><span className="tabular-nums">{pct} %</span></div></td>
                  <td className="px-5 py-3">{fmt(e.completed_at)}</td>
                  <td className="px-5 py-3 font-mono text-xs">{String(e.certificate_code ?? "—")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

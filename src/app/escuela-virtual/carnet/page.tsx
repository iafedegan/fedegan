import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/lms/PrintButton";
import { StudentCard } from "@/components/lms/StudentCard";
import { ensureStudent, getLearner, getStudentStats } from "@/lib/lms/queries";
import { qrSvg, siteOrigin } from "@/lib/lms/qr";

export const metadata: Metadata = { title: "Mi carnet de estudiante", robots: { index: false } };

export default async function StudentCardPage() {
  const me = await getLearner();
  if (!me) redirect(`/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/carnet")}`);
  const student = await ensureStudent(me);
  const stats = await getStudentStats(me.key);
  const year = new Date().getFullYear();
  const since = student ? new Date(student.since).toLocaleDateString("es-CO", { month: "long", year: "numeric" }) : "";
  const verifyUrl = student ? `${await siteOrigin()}/escuela-virtual/verificar/${student.code}` : "";
  const qr = student ? await qrSvg(verifyUrl) : "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-10">
      <div className="flex w-full items-center justify-between print:hidden">
        <Link href="/escuela-virtual/mis-cursos" className="text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--fg-lime-400)]">← Mis cursos</Link>
        {student && <PrintButton />}
      </div>

      {!student ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] p-8 text-center text-[var(--text-muted)]">El carnet aún no está disponible. Intente de nuevo en unos minutos.</p>
      ) : (
        <>
          <StudentCard d={{ name: me.name, email: me.key, code: student.code, since, year, enrolled: stats.enrolled, certificates: stats.certificates, qr }} />
          <p className="text-center text-xs text-[var(--text-faint)] print:hidden">Verificación pública: {verifyUrl}</p>
        </>
      )}
    </div>
  );
}

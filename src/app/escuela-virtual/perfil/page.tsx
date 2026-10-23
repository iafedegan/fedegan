import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/lms/ProfileView";
import { qrSvg, siteOrigin } from "@/lib/lms/qr";
import { ensureStudent, getLearner, getMyCourses, getStudentStats } from "@/lib/lms/queries";

export const metadata: Metadata = { title: "Mi perfil de estudiante", robots: { index: false } };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ inscrito?: string }> }) {
  const me = await getLearner();
  if (!me) redirect(`/escuela-virtual/ingresar?callbackUrl=${encodeURIComponent("/escuela-virtual/perfil")}`);
  const { inscrito } = await searchParams;
  const [mine, student, stats, origin] = await Promise.all([getMyCourses(me.key), ensureStudent(me), getStudentStats(me.key), siteOrigin()]);
  const carnetQr = student ? await qrSvg(`${origin}/escuela-virtual/verificar/${student.code}`) : "";
  return <ProfileView me={me} student={student} stats={stats} mine={mine} origin={origin} carnetQr={carnetQr} inscrito={inscrito} />;
}

import { notFound, redirect } from "next/navigation";
import { flatLessons, getCourse, getEnrollment, getLearner, getProgress } from "@/lib/lms/queries";

export const metadata = { robots: { index: false } };

/** Lleva a la primera lección sin terminar (o a la primera si ya terminó todo). */
export default async function ClassroomEntry({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const me = await getLearner();
  if (!me) redirect(`/ingresar?callbackUrl=${encodeURIComponent(`/escuela-virtual/${slug}/aula`)}`);
  if (!(await getEnrollment(course.id, me.key))) redirect(`/escuela-virtual/${slug}`);
  const lessons = flatLessons(course);
  if (!lessons.length) redirect(`/escuela-virtual/${slug}`);
  const progress = await getProgress(course.id, me.key);
  const next = lessons.find((l) => !progress.has(l.id)) ?? lessons[0];
  redirect(`/escuela-virtual/${slug}/aula/${next.id}`);
}

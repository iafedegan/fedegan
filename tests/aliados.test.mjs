import test from "node:test";
import assert from "node:assert/strict";
import { aliadoAutenticado, claveEstudiante, detalleCurso } from "../src/lib/lms/aliados.ts";
import { enrollLearner, gradeQuiz, markLessonDone, submitQuizFor } from "../src/lib/lms/servicio.ts";

const CLAVE = "clave-de-prueba-con-mas-de-24-caracteres";
const hdr = (o) => ({ get: (k) => o[k.toLowerCase()] ?? null });

test("solo entra el aliado con su clave correcta", () => {
  const env = { ALIADO_GESTIONGANADERA_CLAVE: CLAVE };
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "gestionganadera", authorization: `Bearer ${CLAVE}` }), env), "gestionganadera");
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "GestionGanadera", authorization: `Bearer ${CLAVE}` }), env), "gestionganadera");
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "gestionganadera", authorization: "Bearer otra" }), env), null);
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "gestionganadera" }), env), null);
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "gestionganadera", authorization: `Bearer ${CLAVE}` }), {}), null, "sin clave configurada nadie entra");
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "otro", authorization: `Bearer ${CLAVE}` }), env), null, "la clave de un aliado no sirve para otro");
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "../x", authorization: `Bearer ${CLAVE}` }), env), null);
  assert.equal(aliadoAutenticado(hdr({ "x-aliado": "gestionganadera", authorization: "Bearer corta" }), { ALIADO_GESTIONGANADERA_CLAVE: "corta" }), null, "claves débiles se rechazan");
});

test("la clave de estudiante lleva el aliado y nunca es un correo", () => {
  assert.equal(claveEstudiante("gestionganadera", "u_0192abcdef"), "gestionganadera:u_0192abcdef");
  assert.equal(claveEstudiante("gestionganadera", "ana@correo.com"), null);
  assert.equal(claveEstudiante("gestionganadera", "corto"), null);
  assert.equal(claveEstudiante("gestionganadera", 12345678), null);
});

const leccion = (id, extra = {}) => ({
  id, title: `L ${id}`, kind: "video", videoUrl: `https://youtu.be/${id}`, content: "texto", minutes: 5, freePreview: false,
  resourceUrl: null, resourceLabel: "", passScore: 70, ...extra,
});
const curso = {
  id: "c1", slug: "salud", title: "Salud", subtitle: "", description: "d", learnPoints: ["a"], category: "Sanidad", level: "basico",
  instructor: "Dr", instructorBio: "", cover: null, certificate: true, externalUrl: null, lessons: 3, minutes: 15, rating: 0, ratings: 0,
  modules: [{ id: "m1", title: "Bloque", summary: "", lessons: [leccion("l1", { freePreview: true }), leccion("l2"), leccion("l3", { kind: "quiz", videoUrl: null })] }],
};
const embed = (u) => ({ tipo: "iframe", src: u });

test("sin inscripción solo se abre la vista previa y no se filtra el video del resto", () => {
  const d = detalleCurso(curso, null, new Map(), embed, "https://x.co");
  const [l1, l2, l3] = d.modulos[0].lecciones;
  assert.equal(l1.disponible, true);
  assert.ok(l1.video);
  assert.equal(l2.disponible, false);
  assert.equal(l2.video, undefined);
  assert.equal(l2.contenido, undefined);
  assert.equal(l3.notaMinima, 70);
  assert.equal(d.inscripcion, null);
  assert.ok(!JSON.stringify(d).includes("youtu.be/l2"));
});

test("inscrita, ve todo, su avance y el certificado al terminar", () => {
  const ins = { enrolledAt: "2026-11-01", completedAt: null, code: null };
  const d = detalleCurso(curso, ins, new Map([["l1", null]]), embed, "https://x.co");
  assert.ok(d.modulos[0].lecciones[1].video);
  assert.deepEqual(d.inscripcion.avance, { hechas: 1, total: 3, porcentaje: 33 });
  assert.equal(d.inscripcion.certificado, null);
  const fin = detalleCurso(curso, { enrolledAt: "2026-11-01", completedAt: "2026-11-20", code: "FED-2026-ABC123" }, new Map([["l1", null], ["l2", null], ["l3", 90]]), embed, "https://x.co");
  assert.equal(fin.inscripcion.certificado.verificar, "https://x.co/escuela-virtual/verificar/FED-2026-ABC123");
  assert.equal(fin.modulos[0].lecciones[2].nota, 90);
});

test("califica la evaluación y pide la nota mínima", () => {
  const qs = [{ id: "q1", question: "a", correct_index: 1, explanation: "e1" }, { id: "q2", question: "b", correct_index: 0 }];
  assert.deepEqual(gradeQuiz(qs, { q1: 1, q2: 0 }, 70), { score: 100, passed: true, wrong: [] });
  const r = gradeQuiz(qs, { q1: "1", q2: 3 }, 70);
  assert.equal(r.score, 50);
  assert.equal(r.passed, false);
  assert.deepEqual(r.wrong, [{ question: "b", explanation: "" }]);
  assert.equal(gradeQuiz(qs, {}, 70).score, 0);
});

/** Base en memoria con la parte de la interfaz de Supabase que usan estas reglas. */
function fakeDb(tables) {
  let seq = 0;
  class Q {
    constructor(t) { this.t = t; this.f = []; this.op = "select"; }
    select(_c, o) { this.o = o ?? {}; return this; }
    eq(c, v) { this.f.push([c, v]); return this; }
    order() { return this; }
    maybeSingle() { this.single = true; return this; }
    upsert(row, o) { this.op = "upsert"; this.row = row; this.opt = o ?? {}; return this; }
    update(row) { this.op = "update"; this.row = row; return this; }
    rows() { return (tables[this.t] ??= []).filter((r) => this.f.every(([c, v]) => r[c] === v)); }
    then(res, rej) {
      try {
        const all = (tables[this.t] ??= []);
        if (this.op === "upsert") {
          const keys = String(this.opt.onConflict ?? "id").split(",");
          const hit = all.find((r) => keys.every((k) => r[k] === this.row[k]));
          if (!hit) all.push({ id: `id${++seq}`, ...this.row });
          else if (!this.opt.ignoreDuplicates) Object.assign(hit, this.row);
          return Promise.resolve({ data: null, error: null }).then(res, rej);
        }
        if (this.op === "update") { for (const r of this.rows()) Object.assign(r, this.row); return Promise.resolve({ error: null }).then(res, rej); }
        const rows = this.rows();
        const out = this.o?.head ? { count: rows.length, data: null } : this.single ? { data: rows[0] ?? null, error: null } : { data: rows, count: rows.length };
        return Promise.resolve(out).then(res, rej);
      } catch (e) { return Promise.reject(e).then(res, rej); }
    }
  }
  return { from: (t) => new Q(t) };
}

test("inscribir es idempotente y terminar todas las lecciones emite el certificado una sola vez", async () => {
  const t = { lms_lessons: [{ id: "l1", course_id: "c1" }, { id: "l2", course_id: "c1" }] };
  const db = fakeDb(t);
  const key = "gestionganadera:u_0192abcdef";
  await enrollLearner(db, "c1", key, "Ana Pérez");
  await enrollLearner(db, "c1", key, "Otro Nombre");
  assert.equal(t.lms_enrollments.length, 1);
  assert.equal(t.lms_enrollments[0].user_name, "Ana Pérez");

  await markLessonDone(db, "c1", "l1", key, null);
  assert.equal(t.lms_enrollments[0].completed_at, undefined);
  await markLessonDone(db, "c1", "l1", key, null);
  assert.equal(t.lms_progress.length, 1, "repetir una lección no duplica el avance");
  await markLessonDone(db, "c1", "l2", key, null);
  const code = t.lms_enrollments[0].certificate_code;
  assert.match(code, /^FED-\d{4}-[A-Z0-9]{1,6}$/);
  assert.ok(t.lms_enrollments[0].completed_at);
  await markLessonDone(db, "c1", "l2", key, null);
  assert.equal(t.lms_enrollments[0].certificate_code, code, "el certificado no se vuelve a emitir");
});

test("la evaluación exige inscripción, califica y solo aprobada cuenta como avance", async () => {
  const t = {
    lms_lessons: [{ id: "q", course_id: "c1", pass_score: 70 }],
    lms_quiz_questions: [{ id: "a", lesson_id: "q", question: "?", correct_index: 2, sort_order: 0 }],
  };
  const db = fakeDb(t);
  const key = "gestionganadera:u_0192abcdef";
  const sin = await submitQuizFor(db, { courseId: "c1", lessonId: "q", key, answers: { a: 2 } });
  assert.match(sin.error, /Inscríbase/);
  await enrollLearner(db, "c1", key, "Ana Pérez");
  const mal = await submitQuizFor(db, { courseId: "c1", lessonId: "q", key, answers: { a: 0 } });
  assert.equal(mal.passed, false);
  assert.equal((t.lms_progress ?? []).length, 0);
  const bien = await submitQuizFor(db, { courseId: "c1", lessonId: "q", key, answers: { a: 2 } });
  assert.deepEqual([bien.score, bien.passed], [100, true]);
  assert.equal(t.lms_progress[0].score, 100);
  assert.ok(t.lms_enrollments[0].completed_at, "era la única lección: el curso queda terminado");
});

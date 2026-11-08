-- Materiales del Studio de la Escuela Virtual (resumen, guía, mapa mental, tarjetas, cuestionario, preguntas frecuentes,
-- línea de tiempo, glosario e informe), generados una sola vez y guardados aquí para que cada estudiante los vea al instante.
-- Una fila por lección («leccion:<id>») y una por curso («curso:<id>»). El contenido es JSON con una clave por material.
-- Ejecutar en Supabase → SQL Editor. Es seguro repetirlo.

create table if not exists public.lms_studio (
  clave        text primary key,
  course_id    uuid not null references public.lms_courses(id) on delete cascade,
  lesson_id    uuid references public.lms_lessons(id) on delete cascade,
  contenido    jsonb not null default '{}'::jsonb,
  modelo       text,
  generado_en  timestamptz not null default now()
);

create index if not exists lms_studio_curso on public.lms_studio (course_id);

alter table public.lms_studio enable row level security;

-- Lectura pública solo de cursos publicados (igual que las lecciones). Escribe únicamente el servidor del portal (clave de servicio).
drop policy if exists "materiales de cursos publicados" on public.lms_studio;
create policy "materiales de cursos publicados" on public.lms_studio
  for select using (
    exists (
      select 1 from public.lms_courses c
      where c.id = lms_studio.course_id
        and c.published
        and (c.publish_on is null or c.publish_on <= (now() at time zone 'America/Bogota')::date)
    )
  );

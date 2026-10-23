-- Asistente de estudio con IA: registro de uso para limitar preguntas por persona. Sin política pública: solo el servidor.
create table if not exists public.lms_ai_log (
  id bigint generated always as identity primary key,
  user_key text not null,
  course_id uuid,
  lesson_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists lms_ai_log_user on public.lms_ai_log(user_key, created_at desc);
alter table public.lms_ai_log enable row level security;

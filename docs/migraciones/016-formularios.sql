-- Respuestas de los formularios que se arman en el constructor de páginas (elemento «Formulario»).
-- Con RLS activo y sin políticas: solo el servidor (clave de servicio) lee y escribe.
create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_key text not null,
  form_title text not null default '',
  page text not null default '',
  answers jsonb not null default '[]'::jsonb,
  webhook text,
  created_at timestamptz not null default now()
);
create index if not exists form_responses_key on public.form_responses (form_key, created_at desc);
alter table public.form_responses enable row level security;

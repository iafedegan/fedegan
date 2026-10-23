-- Carnet del estudiante: un código único por persona (se crea al abrir el carnet). Sin política pública: solo el servidor.
create table if not exists public.lms_students (
  user_key text primary key,
  code text not null unique,
  name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.lms_students enable row level security;

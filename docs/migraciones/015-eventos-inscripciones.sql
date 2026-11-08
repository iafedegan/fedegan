-- Inscripciones a eventos: cada persona recibe un código (y su QR) para el registro de asistencia.
-- Con RLS activo y sin políticas: solo el servidor (clave de servicio) lee y escribe.
create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  code text not null unique,
  name text not null,
  email text not null,
  phone text,
  document text,
  organization text,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists event_registrations_event_email on public.event_registrations (event_id, lower(email));
create index if not exists event_registrations_event on public.event_registrations (event_id, created_at desc);
alter table public.event_registrations enable row level security;

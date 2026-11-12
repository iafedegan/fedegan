-- Zona de formularios: formularios propios (constructor) y sus respuestas.
-- `schema` es el borrador que edita el equipo; `published` es la copia que ve el público (se actualiza al publicar y sube `version`).
-- Con RLS activo y sin políticas: solo el servidor (clave de servicio) lee y escribe.
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  status text not null default 'borrador' check (status in ('borrador', 'publicado', 'cerrado')),
  schema jsonb not null default '{"campos":[],"gracias":""}'::jsonb,
  published jsonb,
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);
create index if not exists forms_status on public.forms (status, updated_at desc);

-- Cada respuesta guarda la pregunta junto a la respuesta ([{ "id", "e", "v" }]), así se sigue leyendo aunque el formulario cambie después.
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  version integer not null default 1,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists form_submissions_form on public.form_submissions (form_id, created_at desc);

alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;

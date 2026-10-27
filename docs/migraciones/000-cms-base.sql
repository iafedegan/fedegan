-- Base del CMS del portal: contenido editable desde /admin (locales, cifras, publicaciones, eventos,
-- preguntas frecuentes, portales aliados y menú), registro de actividad y bucket de archivos.
-- Idempotente: se puede ejecutar varias veces. Ejecutar PRIMERO (antes de 001, 002, 003…).
-- La lectura pública solo ve filas con published = true; escribir requiere la clave de servicio (solo servidor).

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.locales (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  numero text not null,
  nombre text not null,
  rubro text not null default '',
  descripcion text not null default '',
  href text not null,
  icon text not null default 'building',
  status text not null default 'abierto' check (status in ('abierto','proximamente')),
  ancla boolean not null default false,
  external boolean not null default false,
  tags text[] not null default '{}',
  accent text not null default '216,181,88',
  imagen text,
  imagen_pos text not null default '50% 50%',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  unit text not null default '',
  delta text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type text not null default 'Informe',
  title text not null,
  dek text not null default '',
  file_url text,
  cover_image text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind text not null default 'Webinar',
  title text not null,
  starts_on date not null,
  time_text text not null default '',
  place text not null default '',
  description text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  detail text not null default '',
  href text not null,
  logo text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.nav_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  entity text not null,
  entity_id text,
  summary text
);

do $$
declare t text;
begin
  foreach t in array array['locales','stats','publications','events','faqs','partners','nav_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "lectura publica" on public.%I', t);
    execute format('create policy "lectura publica" on public.%I for select to anon, authenticated using (published)', t);
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Sin políticas: solo la clave de servicio (servidor) puede leer o escribir el registro de actividad.
alter table public.audit_log enable row level security;

-- Archivos subidos desde el panel (fotos y PDF, hasta 5 MB). Lectura pública, escritura solo servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif','application/pdf'])
on conflict (id) do nothing;

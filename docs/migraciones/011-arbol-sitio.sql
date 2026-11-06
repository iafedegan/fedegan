-- Árbol del sitio (/admin/arbol): secciones, subsecciones y páginas nuevas, a cualquier nivel,
-- junto a las que se copiaron del portal actual (src/content/legacy/portal.json).
-- Lectura pública solo de lo publicado; escribir solo con la clave de servicio. Idempotente.
-- Requiere 000-cms-base.sql (función set_updated_at).
create table if not exists public.site_nodes (
  id uuid primary key default gen_random_uuid(),
  -- Sección donde vive (una de las copiadas, como «programas», o una sección nueva).
  section text not null,
  -- Dónde cuelga: clave de la página padre; «~0.2» = grupo sin página propia, por su camino en el menú original; null = primer nivel de la sección.
  parent text,
  -- Ruta de la página dentro de la sección (/seccion/<section>/<key>). En una sección nueva, la portada usa key = section.
  key text not null unique,
  label text not null,
  title text not null,
  blocks jsonb not null default '[]'::jsonb,
  -- Si es un enlace (interno o https://) en lugar de una página con texto.
  href text,
  -- true = portada de una sección nueva (no tiene padre).
  is_section boolean not null default false,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists site_nodes_section_idx on public.site_nodes (section, parent, sort_order);

alter table public.site_nodes enable row level security;

drop policy if exists "lectura publica" on public.site_nodes;
create policy "lectura publica" on public.site_nodes for select to anon, authenticated using (published);

drop trigger if exists set_updated_at on public.site_nodes;
create trigger set_updated_at before update on public.site_nodes
  for each row execute function public.set_updated_at();

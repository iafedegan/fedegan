-- Páginas migradas editables desde /admin/paginas (TDR §5.3: «garantizando edición posterior»).
-- Cada fila reemplaza el texto de una página de src/content/legacy/portal.json; sin fila, se usa la copia original.
-- Lectura pública (es contenido publicado); escribir solo con la clave de servicio. Idempotente.
-- Requiere 000-cms-base.sql (función set_updated_at).
create table if not exists public.legacy_pages (
  key text primary key,
  title text not null,
  blocks jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.legacy_pages enable row level security;

drop policy if exists "lectura publica" on public.legacy_pages;
create policy "lectura publica" on public.legacy_pages for select to anon, authenticated using (true);

drop trigger if exists set_updated_at on public.legacy_pages;
create trigger set_updated_at before update on public.legacy_pages
  for each row execute function public.set_updated_at();

-- Ajustes del sitio (diseño editable desde /admin/diseno). Idempotente: se puede ejecutar varias veces.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.site_settings enable row level security;

-- El público solo lee el diseño publicado; borradores e instantáneas quedan para la clave de servicio.
drop policy if exists "diseno publicado es publico" on public.site_settings;
create policy "diseno publicado es publico" on public.site_settings
  for select using (key = 'design_layout');

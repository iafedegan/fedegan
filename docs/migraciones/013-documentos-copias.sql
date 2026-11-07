-- 013 · Copia de los documentos migrados a Supabase (depósito «documentos», creado en 012).
-- Cada fila dice qué documento del sitio actual (origen) ya está copiado y dónde (ruta). El portal usa la copia
-- en lugar del enlace original; si un documento no tiene fila, el enlace sigue apuntando al original.
-- Solo el servidor (clave de servicio) escribe; el público solo puede leer.

create table if not exists public.documentos_copias (
  origen text primary key,
  ruta text,
  bytes bigint,
  estado text not null default 'copiado' check (estado in ('copiado', 'omitido')),
  detalle text,
  actualizado timestamptz not null default now()
);

alter table public.documentos_copias enable row level security;

drop policy if exists "documentos_copias lectura publica" on public.documentos_copias;
create policy "documentos_copias lectura publica" on public.documentos_copias
  for select to anon, authenticated using (true);

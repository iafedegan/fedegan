-- Imagen de portada para los eventos (se sube desde /admin/eventos).
alter table public.events add column if not exists cover_image text;

-- Publicación programada: fecha desde la cual un contenido es público (null = publicado ya). Idempotente.
alter table public.publications add column if not exists publish_on date;
alter table public.events add column if not exists publish_on date;

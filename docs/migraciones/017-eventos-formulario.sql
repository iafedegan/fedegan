-- Formulario de inscripción configurable por evento (preguntas, mensaje de gracias y API opcional)
-- y las respuestas de cada inscrito. Reemplaza a 016-formularios.sql (que ya no se usa).
alter table public.events add column if not exists reg_form jsonb;
alter table public.event_registrations add column if not exists answers jsonb not null default '[]'::jsonb;
alter table public.event_registrations add column if not exists webhook text;

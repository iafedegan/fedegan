-- 012 · Depósito «documentos» para los archivos de las páginas (PDF, Excel, Word, PowerPoint, CSV, ZIP, MP3).
-- El depósito «media» solo acepta imágenes y PDF de hasta 5 MB; este admite documentos de hasta 50 MB.
-- Es público para lectura (los enlaces se ven en el sitio); la subida solo se hace con una dirección firmada
-- que entrega el servidor del portal a un editor con sesión iniciada.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos',
  'documentos',
  true,
  52428800,
  array[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'application/zip',
    'audio/mpeg',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

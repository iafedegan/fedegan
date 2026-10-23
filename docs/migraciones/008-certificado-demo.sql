-- Certificados de demostración: se marcan para que la verificación pública y el certificado lo indiquen. Idempotente.
alter table public.lms_enrollments add column if not exists demo boolean not null default false;

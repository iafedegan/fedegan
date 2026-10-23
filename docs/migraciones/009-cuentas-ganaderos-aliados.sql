-- Cuentas de ganaderos y aliados para la Escuela Virtual (ingreso propio con correo y contraseña). Sin política pública: solo el servidor.
create table if not exists public.lms_accounts (
  email text primary key,
  name text not null,
  kind text not null check (kind in ('ganadero','aliado')),
  password_hash text not null,
  failed_count int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
alter table public.lms_accounts enable row level security;

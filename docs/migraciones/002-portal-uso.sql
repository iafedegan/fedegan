-- Uso del portal por lector: cuántas veces entra cada visitante (anónimo, con su permiso) a cada sección.
-- Ya aplicada en el proyecto FEDEGANWEB; se deja aquí como registro.
create table if not exists public.portal_uso (
  visitor_id uuid not null,
  seccion text not null check (char_length(seccion) between 1 and 40),
  visitas integer not null default 0,
  primera_visita timestamptz not null default now(),
  ultima_visita timestamptz not null default now(),
  primary key (visitor_id, seccion)
);

create index if not exists portal_uso_seccion_idx on public.portal_uso (seccion);

-- Sin políticas: el público no lee ni escribe; solo el servidor con la clave de servicio.
alter table public.portal_uso enable row level security;

create or replace function public.registrar_uso(p_visitor uuid, p_seccion text)
returns void
language sql
security invoker
as $$
  insert into public.portal_uso (visitor_id, seccion, visitas)
  values (p_visitor, p_seccion, 1)
  on conflict (visitor_id, seccion)
  do update set visitas = public.portal_uso.visitas + 1, ultima_visita = now();
$$;

revoke all on function public.registrar_uso(uuid, text) from public, anon, authenticated;
grant execute on function public.registrar_uso(uuid, text) to service_role;
revoke all on table public.portal_uso from anon, authenticated;

-- Consulta útil: secciones más usadas.
-- select seccion, count(distinct visitor_id) lectores, sum(visitas) visitas from portal_uso group by 1 order by 3 desc;

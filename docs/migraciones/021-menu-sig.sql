-- Menú principal: el Sistema Integrado de Gestión pasa a la barra como «SIG», justo después de Opinión. Idempotente.
do $$
declare op int;
begin
  select sort_order into op from public.nav_items where href = '/opinion' limit 1;
  if op is null then op := 9; end if;
  if not exists (select 1 from public.nav_items where href = '/seccion/sistema-integrado-de-gestion' and sort_order = op + 1) then
    update public.nav_items set sort_order = sort_order + 1 where sort_order > op and href <> '/seccion/sistema-integrado-de-gestion';
    update public.nav_items set label = 'SIG', sort_order = op + 1 where href = '/seccion/sistema-integrado-de-gestion';
  end if;
end $$;

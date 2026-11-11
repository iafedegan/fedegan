-- Menú principal: FNG, FEP y Opinión (Columna del Presidente) como opciones de la barra, justo después de «Servicios». Idempotente.
do $$
begin
  if not exists (select 1 from public.nav_items where href = '/seccion/fng') then
    update public.nav_items set sort_order = sort_order + 3 where sort_order >= 7;
    insert into public.nav_items (label, href, sort_order, published) values
      ('FNG', '/seccion/fng', 7, true),
      ('FEP', '/seccion/fep', 8, true),
      ('Opinión', '/seccion/columna-presidente', 9, true);
  end if;
end $$;

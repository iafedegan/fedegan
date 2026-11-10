-- Menú principal según el TDR: las siete opciones institucionales primero y, después, las que ya existían como accesos secundarios («Más»).
-- Reemplaza las opciones actuales. Se puede volver a ordenar desde Panel → Menú principal. Idempotente: se puede ejecutar más de una vez.
delete from public.nav_items;
insert into public.nav_items (label, href, sort_order, published) values
  ('Quiénes somos', '/quienes-somos', 1, true),
  ('Programas', '/seccion/programas', 2, true),
  ('Noticias', '/noticias', 3, true),
  ('Publicaciones', '/seccion/publicaciones', 4, true),
  ('Eventos', '/eventos', 5, true),
  ('Servicios', '/servicios', 6, true),
  ('Contacto', '/contacto', 7, true),
  ('Zona de pagos', '/pagos', 8, true),
  ('Consulta RUV', '/servicios', 9, true),
  ('Cifras del sector', '/seccion/cifras-del-sector', 10, true),
  ('Sistema Integrado de Gestión', '/seccion/sistema-integrado-de-gestion', 11, true),
  ('Escuela Virtual', '/escuela-virtual', 12, true);

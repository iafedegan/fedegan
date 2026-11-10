// Genera docs/migraciones/019-paginas-del-navbar.sql: las páginas «Quiénes somos» y «Contacto» como secciones editables del Árbol del sitio,
// con el contenido que hoy está escrito en el código (así el equipo puede editarlas en el constructor). Valida con el mismo saneado del servidor.
// Uso: node --experimental-strip-types --import ./tests/registrar-ts.mjs scripts/sembrar-paginas.mjs
import { writeFileSync } from "node:fs";
import { sanearBloques } from "../src/lib/cms/bloques.ts";
import { contacto, pqrsdForm } from "../src/content/accesos.ts";

const p = (text) => ({ t: "p", text });
const h2 = (text) => ({ t: "h2", text });
const h3 = (text) => ({ t: "h3", text });

const quienes = [
  p("Federación Colombiana de Ganaderos: gremio sin ánimo de lucro que administra el Fondo Nacional del Ganado y representa a los productores bovinos del país."),
  { t: "cifras", data: { titulo: "", columnas: "3", items: [{ valor: "1963", etiqueta: "Año de fundación", nota: "" }, { valor: "4", etiqueta: "Frentes del gremio", nota: "" }, { valor: "2009", etiqueta: "País libre de aftosa", nota: "" }] } },
  h2("Lo que nos guía"),
  { t: "cita", data: { texto: "Representar y promover el desarrollo sostenible y competitivo de la ganadería bovina colombiana.", autor: "Misión", cargo: "", imagen: "" } },
  { t: "caracteristicas", data: { columnas: "3", items: [
    { icono: "crecimiento", titulo: "Visión", texto: "Ser el gremio referente de la ganadería en Colombia, reconocido por su gestión, innovación y cercanía con los productores." },
    { icono: "corazon", titulo: "Valores", texto: "Transparencia, servicio, sostenibilidad y compromiso con las comunidades ganaderas del país." },
    { icono: "balanza", titulo: "Buen gobierno", texto: "Gestión institucional bajo el Código de Buen Gobierno y control ciudadano permanente." },
  ] } },
  h2("Nuestra historia"),
  { t: "cronologia", data: { estilo: "linea", items: [
    { fecha: "1963", titulo: "Nace FEDEGÁN", texto: "Por decisión del IX Congreso Nacional de Ganaderos se crea la Federación como gremio sin ánimo de lucro." },
    { fecha: "1993", titulo: "Leyes 89 y 101", texto: "Nacen la cuota de fomento ganadero y lechero, el Fondo Nacional del Ganado y la base de los fondos de estabilización." },
    { fecha: "1995", titulo: "Fomento al consumo", texto: "Comienzan las donaciones de carne y leche a instituciones que atienden población vulnerable." },
    { fecha: "1997", titulo: "Erradicación de la aftosa", texto: "La Ley 395 declara de interés nacional la erradicación de la fiebre aftosa." },
    { fecha: "2006", titulo: "PEGA 2019", texto: "FEDEGÁN pone en marcha el Plan Estratégico de la Ganadería y se celebra el primer Día Nacional del Ganadero." },
    { fecha: "2009", titulo: "País libre de aftosa", texto: "La última certificación completa el estatus de libre con vacunación en todo el territorio." },
  ] } },
  h2("Lo que hacemos"),
  { t: "cards", data: { columnas: 4, items: [
    { titulo: "FEDEGÁN", texto: "Representación gremial, fortalecimiento regional y cámaras ganaderas.", imagen: "/locales/programas.jpg", enlace: "/seccion/programas/programa/fedegan", boton: "Conocer" },
    { titulo: "Fondo Nacional del Ganado", texto: "Cuota de fomento invertida en sanidad, ciencia y consumo.", imagen: "/locales/fng.jpg", enlace: "/seccion/fng", boton: "Conocer" },
    { titulo: "Fondo de Estabilización (FEP)", texto: "Exportaciones de carne, leche y derivados.", imagen: "/headers/campo.jpg", enlace: "/seccion/fep", boton: "Conocer" },
    { titulo: "Fundagán", texto: "Ganadería y derechos humanos, y responsabilidad social.", imagen: "/locales/publicaciones.jpg", enlace: "/seccion/programas/programa/fundagan", boton: "Conocer" },
  ] } },
  { t: "callout", data: { titulo: "Conozca el directorio del portal o escríbanos", texto: "Cada servicio, medio y línea de valor del ecosistema tiene su propio espacio.", boton: "Directorio", enlace: "/directorio", tono: "verde" } },
];

const contactoBloques = [
  p("Escríbanos por PQRSD o comuníquese directamente con la Federación Colombiana de Ganaderos."),
  { t: "fila", data: { division: "5-7", fondo: "ninguno", imagen: "", espaciado: "ninguno", alinear: "arriba", cols: [
    [
      { t: "contacto", data: { titulo: "Sede principal", cargo: "Federación Colombiana de Ganaderos", telefono: contacto.telefono, correo: "fedegan@fedegan.org.co", direccion: contacto.direccion, horario: contacto.horario } },
      { t: "callout", data: { titulo: "¿Primero una consulta rápida?", texto: "Muchas dudas sobre trámites, RUV y servicios ya tienen respuesta en nuestras preguntas frecuentes.", boton: "Ver preguntas frecuentes", enlace: "/preguntas-frecuentes", tono: "claro" } },
    ],
    [
      { t: "callout", data: { titulo: "Radique su solicitud", texto: "Las peticiones, quejas, reclamos, sugerencias y denuncias se radican en el formulario oficial de FEDEGÁN-FNG. Recibirá un número de radicado para el seguimiento.", boton: "Abrir el formulario PQRSD", enlace: pqrsdForm, tono: "verde" } },
      h3("O escriba al correo que corresponde"),
      { t: "enlaces", data: { items: contacto.correos.map((c) => ({ titulo: c.label, texto: `${c.email} · ${c.text}`.slice(0, 200), enlace: `mailto:${c.email}` })) } },
    ],
  ] } },
];

const paginas = [
  { slug: "quienes-somos", label: "Quiénes somos", bloques: quienes },
  { slug: "contacto", label: "Contacto", bloques: contactoBloques },
];

let sql = `-- Las páginas «Quiénes somos» y «Contacto» pasan al Árbol del sitio: se editan en el constructor (Panel → Árbol del sitio).
-- Generado por scripts/sembrar-paginas.mjs con el contenido que tenían en el código. Idempotente: no pisa lo que ya exista.
`;
for (const pg of paginas) {
  const r = sanearBloques(pg.bloques);
  if (!r.ok) throw new Error(`${pg.slug}: ${r.message}`);
  const json = JSON.stringify(r.bloques);
  sql += `
insert into public.site_nodes (section, parent, key, label, title, blocks, is_section, sort_order, published)
select '${pg.slug}', null, '${pg.slug}', '${pg.label}', '${pg.label}', $json$${json}$json$::jsonb, true, 0, true
where not exists (select 1 from public.site_nodes where key = '${pg.slug}');
`;
}
sql += `
-- El menú principal apunta a las páginas nuevas.
update public.nav_items set href = '/seccion/quienes-somos' where href = '/quienes-somos';
update public.nav_items set href = '/seccion/contacto' where href = '/contacto';
`;
writeFileSync(new URL("../docs/migraciones/019-paginas-del-navbar.sql", import.meta.url), sql);
console.log("ok", sql.length, "bytes");

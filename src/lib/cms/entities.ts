// Definición de los tipos de contenido editables desde /admin. Es la única fuente de verdad:
// de aquí salen las listas, los formularios y la validación de las acciones del servidor.

export type FieldType = "text" | "textarea" | "number" | "bool" | "tags" | "select" | "date" | "image" | "file" | "slug";

export type Field = {
  name: string; // columna en la base de datos
  label: string;
  type: FieldType;
  required?: boolean;
  max?: number;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
};

export type Entity = {
  key: string;
  table: string;
  label: string; // singular
  plural: string;
  description: string;
  titleField: string;
  subtitleField?: string;
  ordered: boolean; // se ordena a mano con subir/bajar
  orderBy: { column: string; ascending: boolean };
  slugFrom?: string; // campo del que se deriva el slug
  thumbField?: string; // campo de imagen para la miniatura en la lista
  fields: Field[];
};

export const ACCENTS = [
  { value: "216,181,88", label: "Dorado" },
  { value: "92,205,134", label: "Verde" },
  { value: "230,160,108", label: "Naranja" },
  { value: "112,214,196", label: "Turquesa" },
  { value: "190,222,203", label: "Menta" },
];

export const ICONS = [
  { value: "users", label: "Personas" },
  { value: "scale", label: "Balanza" },
  { value: "newspaper", label: "Periódico" },
  { value: "database", label: "Datos" },
  { value: "building", label: "Edificio" },
  { value: "bar-chart", label: "Gráfico de barras" },
  { value: "file-check", label: "Documento verificado" },
  { value: "graduation-cap", label: "Formación" },
  { value: "tv", label: "Televisión" },
  { value: "store", label: "Tienda" },
  { value: "help-circle", label: "Ayuda" },
];

export const entities: Entity[] = [
  {
    key: "locales",
    table: "locales",
    label: "local",
    plural: "Locales del gremio",
    description: "Las tarjetas de la cinta 3D del home y del directorio del portal.",
    titleField: "nombre",
    subtitleField: "rubro",
    thumbField: "imagen",
    ordered: true,
    orderBy: { column: "sort_order", ascending: true },
    slugFrom: "nombre",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true, max: 80 },
      { name: "slug", label: "Identificador", type: "slug", help: "Se genera del nombre y no cambia después de creado." },
      { name: "numero", label: "Número de local", type: "text", required: true, max: 6, placeholder: "108" },
      { name: "rubro", label: "Rubro", type: "text", max: 60, placeholder: "Proyectos del gremio" },
      { name: "descripcion", label: "Descripción", type: "textarea", max: 220 },
      { name: "href", label: "Enlace", type: "text", required: true, max: 200, help: "Ruta interna (/programas) o dirección completa (https://…)." },
      { name: "icon", label: "Ícono", type: "select", options: ICONS },
      { name: "status", label: "Estado", type: "select", options: [{ value: "abierto", label: "Abierto" }, { value: "proximamente", label: "Próximamente" }] },
      { name: "tags", label: "Etiquetas", type: "tags", help: "Separadas por coma, máximo 6." },
      { name: "accent", label: "Color de acento", type: "select", options: ACCENTS },
      { name: "imagen", label: "Foto", type: "image", help: "Horizontal, mínimo 1200 px de ancho." },
      { name: "imagen_pos", label: "Enfoque de la foto", type: "text", max: 20, placeholder: "50% 50%", help: "Posición del recorte: horizontal y vertical en %." },
      { name: "ancla", label: "Local ancla (destacado)", type: "bool" },
      { name: "external", label: "Abre en otra pestaña", type: "bool" },
    ],
  },
  {
    key: "cifras",
    table: "stats",
    label: "cifra",
    plural: "Cifras del sector",
    description: "Los indicadores que se muestran en la franja de cifras del home.",
    titleField: "label",
    subtitleField: "value",
    ordered: true,
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "label", label: "Indicador", type: "text", required: true, max: 80, placeholder: "Leche al productor" },
      { name: "value", label: "Valor", type: "text", required: true, max: 20, placeholder: "$1.870" },
      { name: "unit", label: "Unidad", type: "text", max: 12, placeholder: "/L" },
      { name: "delta", label: "Nota", type: "text", max: 60, placeholder: "Promedio nacional" },
    ],
  },
  {
    key: "publicaciones",
    table: "publications",
    label: "publicación",
    plural: "Publicaciones",
    description: "Informes, manuales y boletines con su portada y su archivo PDF.",
    titleField: "title",
    subtitleField: "type",
    thumbField: "cover_image",
    ordered: true,
    orderBy: { column: "sort_order", ascending: true },
    slugFrom: "title",
    fields: [
      { name: "title", label: "Título", type: "text", required: true, max: 140 },
      { name: "slug", label: "Identificador", type: "slug", help: "Forma la dirección web de la publicación; no cambia después de creada." },
      { name: "type", label: "Tipo", type: "select", options: [{ value: "Informe", label: "Informe" }, { value: "Documento", label: "Documento" }, { value: "Boletín", label: "Boletín" }] },
      { name: "dek", label: "Resumen", type: "textarea", max: 260 },
      { name: "cover_image", label: "Portada", type: "image", help: "Opcional; si falta se usa una foto según el tipo." },
      { name: "file_url", label: "Archivo PDF", type: "file", help: "Suba el PDF (máx. 5 MB) o pegue su dirección." },
    ],
  },
  {
    key: "eventos",
    table: "events",
    label: "evento",
    plural: "Eventos",
    description: "La agenda de webinars, seminarios y foros.",
    titleField: "title",
    subtitleField: "kind",
    ordered: false,
    orderBy: { column: "starts_on", ascending: true },
    slugFrom: "title",
    fields: [
      { name: "title", label: "Título", type: "text", required: true, max: 140 },
      { name: "slug", label: "Identificador", type: "slug", help: "Forma la dirección web del evento; no cambia después de creado." },
      { name: "kind", label: "Tipo", type: "select", options: [{ value: "Webinar", label: "Webinar" }, { value: "Seminario", label: "Seminario" }, { value: "Foro", label: "Foro" }] },
      { name: "starts_on", label: "Fecha", type: "date", required: true },
      { name: "time_text", label: "Horario", type: "text", max: 60, placeholder: "10:00 a. m. – 12:00 m." },
      { name: "place", label: "Lugar", type: "text", max: 80, placeholder: "Virtual" },
      { name: "description", label: "Descripción", type: "textarea", max: 600 },
    ],
  },
  {
    key: "preguntas",
    table: "faqs",
    label: "pregunta",
    plural: "Preguntas frecuentes",
    description: "Las preguntas y respuestas de la página de ayuda.",
    titleField: "question",
    ordered: true,
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "question", label: "Pregunta", type: "text", required: true, max: 200 },
      { name: "answer", label: "Respuesta", type: "textarea", required: true, max: 1200 },
    ],
  },
  {
    key: "portales",
    table: "partners",
    label: "portal aliado",
    plural: "Portales aliados",
    description: "Los logos enlazados de la franja «Portales aliados».",
    titleField: "name",
    subtitleField: "detail",
    thumbField: "logo",
    ordered: true,
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, max: 60 },
      { name: "detail", label: "Descripción corta", type: "text", max: 60 },
      { name: "href", label: "Enlace", type: "text", required: true, max: 200, help: "Dirección completa (https://…)." },
      { name: "logo", label: "Logo", type: "image", required: true, help: "Cuadrado, mínimo 300 px." },
    ],
  },
  {
    key: "menu",
    table: "nav_items",
    label: "opción de menú",
    plural: "Menú principal",
    description: "Las opciones de la barra de navegación del portal.",
    titleField: "label",
    subtitleField: "href",
    ordered: true,
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { name: "label", label: "Texto", type: "text", required: true, max: 40 },
      { name: "href", label: "Enlace", type: "text", required: true, max: 200, help: "Ruta interna (/noticias) o dirección completa (https://…)." },
    ],
  },
];

export function getEntity(key: string): Entity | undefined {
  return entities.find((e) => e.key === key);
}

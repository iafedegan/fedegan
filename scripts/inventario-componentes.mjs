// Genera docs/inventario-componentes.md: lista de componentes por carpeta, con su archivo y la primera
// línea de comentario que lo describe (TDR §5.2: «inventario documentado de componentes»).
//   npm run inventario
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";


// Descripciones de los componentes que no traen un comentario en su archivo (clave: primer nombre exportado).
const DESCRIPCIONES = {
  AdminSidebar: "Menú lateral del panel: riel de íconos que se despliega al acercar el mouse; cajón en móvil.",
  ApiTestButton: "Botón de prueba de conexión y formulario de cambio de clave de las APIs (panel).",
  ConfigNotice: "Aviso de modo solo lectura que indica qué variables de entorno detecta el servidor.",
  CourseTabs: "Pestañas de administración de un curso (currículo, estudiantes).",
  DeleteButton: "Botón de eliminar con confirmación.",
  DesignEditor: "Editor visual de diseño con borrador, vista previa, publicar y deshacer.",
  PaginaForm: "Formulario de edición del texto de una página migrada.",
  RecordForm: "Formulario genérico de edición de contenido, generado desde la definición de cada tipo.",
  AccountPicker: "Selector de cuentas de ejemplo del modo demostración.",
  ContactChannels: "Canales de contacto (teléfonos, correos y sede).",
  ContactForm: "Formulario de contacto / PQRSD.",
  EventsExplorer: "Agenda de eventos con filtros y búsqueda.",
  EventsGrid: "Cuadrícula de eventos próximos.",
  FaqAccordion: "Acordeón de preguntas frecuentes.",
  HeroNews: "Cabecera con las noticias de portada de CONtexto.",
  InfoLinksRow: "Fila de tres accesos informativos con ícono.",
  LayoutSwitchDemo: "Demostración de cambio de layout (vitrina, lista, destacado) sin tocar el contenido.",
  MallRibbon: "Cinta de locales del gremio con tarjetas.",
  MembershipBanner: "Banner de invitación a Mi FEDEGÁN / membresía.",
  NewsCarousel: "Carrusel de noticias con avance automático y control de pausa.",
  NewsUnavailable: "Estado de «noticias no disponibles» cuando CONtexto no responde.",
  NewsletterForm: "Formulario de suscripción al boletín.",
  PortalesAliados: "Franja de portales aliados con logos enlazados.",
  PublicationsExplorer: "Biblioteca de publicaciones con filtros por tipo y búsqueda.",
  PublicationsGrid: "Cuadrícula de publicaciones destacadas.",
  RulesExplorer: "Listado buscable de normatividad con insignias por tipo de norma.",
  SearchClient: "Buscador del portal con resultados ordenados por relevancia.",
  SignInPanel: "Panel de ingreso: cuenta institucional (Microsoft) y acceso de ganaderos y aliados.",
  StatsStrip: "Franja de cifras del sector.",
  BackToTop: "Botón flotante «volver arriba».",
  Footer: "Pie de página: enlaces, contacto, boletín, redes y avisos legales.",
  LoginMenu: "Acceso de cuenta del encabezado (ingreso o menú de aplicaciones).",
  Logo: "Logo institucional enlazado al inicio.",
  PrivacyButton: "Botón para abrir y cambiar el consentimiento de cookies.",
  Providers: "Proveedores de contexto del cliente (sesión).",
  SignOutButton: "Botón de cerrar sesión.",
  CatalogExplorer: "Catálogo de cursos con filtros.",
  CourseAssistant: "Ayuda contextual dentro del aula de un curso.",
  PrintButton: "Botón de imprimir.",
  ProfileView: "Perfil de la persona estudiante.",
  QuizForm: "Formulario de evaluación de una lección.",
  Rich: "Renderiza el contenido enriquecido de una lección.",
  StudentCard: "Carnet de la persona estudiante con código verificable.",
  StudioPanel: "Panel de creación y edición de cursos.",
  UniversityLogin: "Ingreso a la Escuela Virtual.",
  Observatorio: "Observatorio ganadero: indicadores y gráficas por periodo.",
  Badge: "Etiqueta de estado o categoría (variantes de tono).",
  Button: "Botón y enlace con aspecto de botón (variantes primario, secundario, fantasma, oro).",
  Card: "Tarjeta de vidrio con acento de color y efecto al pasar el mouse.",
  Container: "Contenedor centrado con ancho máximo y márgenes responsivos.",
  Input: "Campo de texto con el estilo del sistema.",
  SectionHeading: "Encabezado de sección con rótulo, título y enlace de acción.",
  FacebookIcon: "Íconos de redes sociales (Facebook, X, Instagram, YouTube, LinkedIn).",
};

const RAIZ = "src/components";
const archivos = [];
const recorrer = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) recorrer(ruta);
    else if (e.name.endsWith(".tsx")) archivos.push(ruta);
  }
};
recorrer(RAIZ);

const porCarpeta = new Map();
for (const f of archivos.sort()) {
  const src = readFileSync(f, "utf8");
  const nombres = [...src.matchAll(/^export (?:async )?(?:function|const) ([A-Z][A-Za-z0-9]*)/gm)].map((m) => m[1]);
  if (!nombres.length) continue;
  const comentario = src.split("\n").find((l) => /^\/\/ ?\S/.test(l))?.replace(/^\/\/ ?/, "").trim() || DESCRIPCIONES[nombres[0]] || "";
  const carpeta = relative(RAIZ, join(f, ".."));
  if (!porCarpeta.has(carpeta)) porCarpeta.set(carpeta, []);
  porCarpeta.get(carpeta).push({ nombres, f, comentario });
}

const titulos = {
  ui: "Base (`ui`): piezas reutilizables del sistema de diseño",
  blocks: "Bloques (`blocks`): secciones de página componibles",
  layout: "Estructura (`layout`): encabezado, pie y marco del sitio",
  admin: "Panel de administración (`admin`)",
  design: "Diseño editable (`design`): ticker, anuncios y ventana emergente",
  legacy: "Contenido migrado (`legacy`)",
  lms: "Escuela Virtual (`lms`)",
  pagos: "Zona de pagos (`pagos`)",
  observatorio: "Observatorio ganadero (`observatorio`)",
  "scroll-world": "Recorrido de la portada (`scroll-world`)",
};

let md = `# Inventario de componentes\n\n> Generado con \`npm run inventario\` a partir de \`src/components\`. No editar a mano: edite el comentario de la primera línea de cada componente y vuelva a generar. Catálogo visual interactivo: ruta \`/componentes\`. Reglas de uso: [\`sistema-de-diseno.md\`](sistema-de-diseno.md).\n\n`;
let total = 0;
for (const [carpeta, items] of [...porCarpeta].sort(([a], [b]) => a.localeCompare(b))) {
  md += `## ${titulos[carpeta.split("/")[0]] ?? carpeta}\n\n| Componente | Archivo | Descripción |\n|---|---|---|\n`;
  for (const { nombres, f, comentario } of items) {
    md += `| ${nombres.map((n) => `\`${n}\``).join(", ")} | \`${f}\` | ${comentario.replace(/\|/g, "/")} |\n`;
    total += nombres.length;
  }
  md += "\n";
}
md += `**Total:** ${total} componentes en ${porCarpeta.size} carpetas.\n`;
writeFileSync("docs/inventario-componentes.md", md);
console.log(`docs/inventario-componentes.md: ${total} componentes`);

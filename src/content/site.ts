// Contenido de ejemplo para validar arquitectura, layout y componentes.
// En producción esto se reemplaza por consultas al CMS headless (Fase 1-E1/E3 del TDR).

export const mainNav = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Sala de Prensa", href: "/noticias" },
  { label: "Cartas de Presidencia", href: "/seccion/cartas-de-presidencia" },
  { label: "Seguridad Ganadera", href: "/seccion/seguridad-ganadera" },
  { label: "Preguntas Frecuentes", href: "/preguntas-frecuentes" },
  { label: "PQRSD", href: "/contacto" },
  { label: "Consulta RUV", href: "/servicios" },
];

export const quickAccess = [
  {
    label: "Trámites y servicios",
    description: "Gestione aquí sus trámites y solicitudes.",
    href: "/servicios",
    icon: "file-check" as const,
  },
  {
    label: "Escuela Virtual",
    description: "Capacitación y formación para el sector ganadero.",
    href: "/escuela-virtual",
    icon: "graduation-cap" as const,
  },
  {
    label: "Contexto Ganadero",
    description: "Información estratégica y periodismo del sector.",
    href: "https://contexto-olive.vercel.app/",
    icon: "bar-chart" as const,
    external: true,
  },
  {
    label: "TVGAN",
    description: "El canal del ganadero colombiano.",
    href: "/tvgan",
    icon: "tv" as const,
  },
  {
    label: "Mi FEDEGÁN",
    description: "Su espacio personalizado (próximamente).",
    href: "/mi-fedegan",
    icon: "user-circle" as const,
    comingSoon: true,
  },
];

export const featuredNews = [
  {
    slug: "escasez-ganado-estados-unidos-oportunidad",
    section: "Sector",
    date: "28 de agosto de 2026",
    title: "“Gobierno no puede seguir patinando con trámites y estudios y debe acelerar la admisibilidad de la carne a Estados Unidos”: Lafaurie",
    dek: "El país del norte atraviesa una escasez de ganado y de proteína animal sin precedentes; Colombia tiene con qué suplir esa demanda.",
    author: "José Félix Lafaurie",
    body: [
      "Estados Unidos, uno de los grandes consumidores de carne bovina del mundo, atraviesa una escasez de ganado sin precedentes en su historia reciente, con un inventario que cayó a 86,2 millones de cabezas, el nivel más bajo en 75 años.",
      "José Félix Lafaurie, presidente ejecutivo de FEDEGÁN, advirtió en su más reciente columna que el país del norte tiene una necesidad que no es de poca monta: satisfacer la demanda de consumo de 150 hamburguesas por habitante al año, es decir, algo más de 50 mil millones de hamburguesas.",
      "“El Gobierno no puede seguir patinando con trámites y estudios y debe acelerar la admisibilidad de la carne bovina colombiana a Estados Unidos”, señaló Lafaurie, quien insistió en que Colombia cuenta con la oferta sanitaria y productiva para responder a esa demanda si se agilizan los procesos de admisibilidad.",
    ],
  },
  {
    slug: "inventario-bovino-bufalino-ciclo-1-2026",
    section: "Cifras",
    date: "25 de agosto de 2026",
    title: "Ya se encuentran publicados los resultados de la Operación Estadística Inventario Bovino y Bufalino Ciclo 1-2026",
    dek: "Consulta los resultados específicos para tu región y las cifras clave que fortalecen el desarrollo del sector.",
    author: "Redacción Fedegán",
    body: [
      "Ya se encuentran publicados los resultados de la Operación Estadística Inventario Bovino y Bufalino correspondientes al Ciclo 1 de 2026, con información desagregada por departamento y municipio.",
      "El ejercicio estadístico, adelantado por FEDEGÁN–FNG en el marco del Sistema Nacional de Identificación e Información Ganadera, permite dimensionar el hato bovino y bufalino del país y orientar la política sanitaria y comercial del sector.",
      "Los productores pueden consultar los resultados específicos para su región a través del portal, y acceder a las variables clave que soportan la toma de decisiones del gremio y de las autoridades sanitarias.",
    ],
  },
  {
    slug: "el-antojo-finca-bufalina-santander",
    section: "Historias del campo",
    date: "17 de junio de 2026",
    title: "El Antojo: la finca donde medir cada decisión convirtió un capricho en un referente bufalino",
    dek: "La producción pasó de 1.000 a 2.200 litros por búfala en lactancias ajustadas a 250 días.",
    author: "Redacción Fedegán",
    body: [
      "Lo que comenzó como una apuesta personal en una tierra de baja productividad terminó transformándose en una experiencia reconocida de la cultura bufalina santandereana.",
      "La producción de El Antojo pasó de 1.000 a 2.200 litros por búfala en lactancias ajustadas a 250 días, gracias a un manejo riguroso de indicadores productivos y decisiones basadas en datos.",
      "Hoy la finca es referente para otros productores de la región que buscan replicar su modelo de gestión y mejoramiento genético.",
    ],
  },
];

export const publications = [
  {
    slug: "informe-gestion-2026",
    type: "Informe",
    title: "Informe de Gestión FEDEGÁN–FNG 2026",
    dek: "Resultados, logros y gestión institucional del último año.",
  },
  {
    slug: "manual-buenas-practicas-ganaderas",
    type: "Documento",
    title: "Manual de Buenas Prácticas Ganaderas",
    dek: "Lineamientos para una ganadería competitiva y sostenible.",
  },
  {
    slug: "boletin-contexto-ganadero-septiembre",
    type: "Boletín",
    title: "Boletín Contexto Ganadero – Septiembre 2026",
    dek: "Indicadores, análisis y cifras del sector ganadero.",
  },
];

export const events = [
  {
    slug: "webinar-perspectivas-economicas-2026",
    month: "OCT",
    day: "14",
    kind: "Webinar",
    title: "Perspectivas económicas del sector ganadero 2026",
    time: "10:00 a. m. – 12:00 m.",
    place: "Virtual",
  },
  {
    slug: "seminario-bienestar-animal",
    month: "OCT",
    day: "22",
    kind: "Seminario",
    title: "Bienestar animal: un compromiso de todos",
    time: "8:00 a. m. – 1:00 p. m.",
    place: "Bogotá D.C.",
  },
  {
    slug: "foro-innovacion-sostenibilidad",
    month: "NOV",
    day: "05",
    kind: "Foro",
    title: "Innovación y sostenibilidad en la ganadería colombiana",
    time: "7:30 a. m. – 2:00 p. m.",
    place: "Medellín, Antioquia",
  },
];

export const infoLinks = [
  {
    icon: "users" as const,
    title: "Programas y proyectos",
    description: "Conozca nuestras iniciativas para el desarrollo y competitividad del sector.",
    href: "/programas",
  },
  {
    icon: "scale" as const,
    title: "Normatividad",
    description: "Consulte la normatividad vigente que aplica al sector ganadero.",
    href: "/normatividad",
  },
  {
    icon: "help-circle" as const,
    title: "Preguntas frecuentes",
    description: "Resuelva sus dudas sobre trámites, servicios y procesos.",
    href: "/preguntas-frecuentes",
  },
];

export const footerLinks = {
  enlaces: [
    { label: "Quiénes somos", href: "/quienes-somos" },
    { label: "Programas", href: "/programas" },
    { label: "Noticias", href: "/noticias" },
    { label: "Publicaciones", href: "/publicaciones" },
    { label: "Eventos", href: "/eventos" },
    { label: "Contacto", href: "/contacto" },
  ],
  servicios: [
    { label: "Trámites y servicios", href: "/servicios" },
    { label: "Escuela Virtual", href: "/escuela-virtual" },
    { label: "Contexto Ganadero", href: "https://contexto-olive.vercel.app/" },
    { label: "TVGAN", href: "/tvgan" },
    { label: "Normatividad", href: "/normatividad" },
    { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  ],
};

export const stats = [
  { label: "Novillo gordo · Medellín", value: "$9.940", unit: "/kg", delta: "▲ 4% en septiembre" },
  { label: "Inventario bovino y bufalino", value: "28,4M", unit: "", delta: "Ciclo 1 · 2026" },
  { label: "Leche al productor", value: "$1.870", unit: "/L", delta: "Promedio nacional" },
  { label: "Cobertura vacunación aftosa", value: "96,2%", unit: "", delta: "Segundo ciclo 2026" },
];

// Modelo "centro comercial" (TDR: portal como vitrina común, cada línea de valor es un "local").
export type LocalStatus = "abierto" | "proximamente";

export type Local = {
  id: string;
  numero: string;
  nombre: string;
  rubro: string;
  descripcion: string;
  href: string;
  icon: string;
  status: LocalStatus;
  ancla?: boolean;
  external?: boolean;
  tags?: string[];
  accent?: string;
  imagen?: string;
  imagenPos?: string;
};

export type Piso = {
  id: string;
  nombre: string;
  descripcion: string;
  locales: Local[];
};

export const pisos: Piso[] = [
  {
    id: "locales",
    nombre: "Locales del gremio",
    descripcion: "Cada línea de valor de FEDEGÁN–FNG tiene su propio local dentro del portal.",
    locales: [
      { id: "programas", numero: "101", nombre: "Programas", rubro: "Proyectos del gremio", descripcion: "Ganadería sostenible, sanidad animal y fomento al consumo.", href: "/programas", icon: "users", status: "abierto", ancla: true, tags: ["Sostenibilidad", "Sanidad", "Consumo"], accent: "92,205,134", imagen: "/locales/programas.jpg", imagenPos: "70% 50%" },
      { id: "normatividad", numero: "102", nombre: "Normatividad", rubro: "Marco legal", descripcion: "Leyes, decretos y resoluciones del sector ganadero.", href: "/normatividad", icon: "scale", status: "abierto", ancla: true, tags: ["Leyes", "Decretos", "Resoluciones"], accent: "216,181,88", imagen: "/locales/normatividad.jpg", imagenPos: "50% 50%" },
      { id: "publicaciones", numero: "103", nombre: "Publicaciones", rubro: "Biblioteca", descripcion: "Informes, manuales, boletines y documentos técnicos.", href: "/publicaciones", icon: "newspaper", status: "abierto", ancla: true, tags: ["Informes", "Manuales", "Boletines"], accent: "230,160,108", imagen: "/locales/publicaciones.jpg", imagenPos: "65% 55%" },
      { id: "cifras", numero: "104", nombre: "Cifras del sector", rubro: "Datos", descripcion: "Inventario bovino y bufalino, precios y estadísticas.", href: "/seccion/cifras-del-sector", icon: "database", status: "abierto", ancla: true, tags: ["Inventario", "Precios", "Estadísticas"], accent: "112,214,196", imagen: "/locales/cifras.jpg", imagenPos: "25% 50%" },
      { id: "fng", numero: "105", nombre: "FNG", rubro: "Fondo Nacional del Ganado", descripcion: "Recaudo de la cuota de fomento y su inversión en el sector.", href: "/seccion/fng", icon: "building", status: "abierto", ancla: true, tags: ["Cuota de fomento", "Inversión"], accent: "216,181,88", imagen: "/locales/fng.jpg", imagenPos: "40% 50%" },
      { id: "fep", numero: "106", nombre: "FEP", rubro: "Estabilización de precios", descripcion: "Fondo de Estabilización de Precios: mecanismo y resultados.", href: "/seccion/fep", icon: "bar-chart", status: "abierto", ancla: true, tags: ["Mecanismo", "Resultados"], accent: "92,205,134", imagen: "/locales/fep.jpg", imagenPos: "70% 50%" },
      { id: "sig", numero: "107", nombre: "Sistema Integrado de Gestión", rubro: "Calidad", descripcion: "Políticas, procesos y certificaciones de la entidad.", href: "/seccion/sistema-integrado-de-gestion", icon: "file-check", status: "abierto", ancla: true, tags: ["Políticas", "Procesos", "Certificaciones"], accent: "190,222,203", imagen: "/locales/sig.jpg", imagenPos: "45% 50%" },
    ],
  },
];

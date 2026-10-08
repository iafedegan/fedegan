// Contenido de ejemplo para validar arquitectura, layout y componentes.
// En producción esto se reemplaza por consultas al CMS headless (Fase 1-E1/E3 del TDR).

export const mainNav = [
  { label: "Directorio", href: "/directorio" },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Programas", href: "/programas" },
  { label: "Noticias", href: "/noticias" },
  { label: "Publicaciones", href: "/publicaciones" },
  { label: "Eventos", href: "/eventos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Normatividad", href: "/normatividad" },
  { label: "Contacto", href: "/contacto" },
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
};

export type Piso = {
  id: string;
  nombre: string;
  descripcion: string;
  locales: Local[];
};

export const pisos: Piso[] = [
  {
    id: "piso-1",
    nombre: "Piso 1 · Plaza institucional",
    descripcion: "El gremio, su gobierno y la información pública.",
    locales: [
      { id: "institucional", numero: "101", nombre: "Institucional", rubro: "Gremio y gobierno", descripcion: "Quiénes somos, programas, normatividad y transparencia.", href: "/quienes-somos", icon: "building", status: "abierto", ancla: true },
      { id: "editorial", numero: "102", nombre: "Editorial", rubro: "Noticias y publicaciones", descripcion: "Noticias, publicaciones, eventos y la columna del presidente.", href: "/noticias", icon: "newspaper", status: "abierto", ancla: true },
      { id: "normatividad", numero: "103", nombre: "Normatividad", rubro: "Marco legal", descripcion: "Leyes, decretos y resoluciones del sector.", href: "/normatividad", icon: "scale", status: "abierto" },
      { id: "ayuda", numero: "104", nombre: "Atención al ganadero", rubro: "PQRS y ayuda", descripcion: "Preguntas frecuentes, contacto y radicación de PQRS.", href: "/preguntas-frecuentes", icon: "help-circle", status: "abierto" },
    ],
  },
  {
    id: "piso-2",
    nombre: "Piso 2 · Servicios y formación",
    descripcion: "Trámites, capacitación y accesos a los sistemas del gremio.",
    locales: [
      { id: "servicios", numero: "201", nombre: "Trámites y servicios", rubro: "Autogestión", descripcion: "RUV, recaudo biológico, sello ambiental y oferta de tierras.", href: "/servicios", icon: "file-check", status: "abierto", ancla: true },
      { id: "formacion", numero: "202", nombre: "Escuela Virtual", rubro: "Formación", descripcion: "Cursos para productores, técnicos y profesionales.", href: "/escuela-virtual", icon: "graduation-cap", status: "abierto", ancla: true },
      { id: "programas", numero: "203", nombre: "Programas", rubro: "Proyectos del gremio", descripcion: "Ganadería sostenible, sanidad animal y fomento al consumo.", href: "/programas", icon: "users", status: "abierto" },
    ],
  },
  {
    id: "piso-3",
    nombre: "Piso 3 · Medios y datos",
    descripcion: "Contenido audiovisual, periodismo y cifras del sector.",
    locales: [
      { id: "medios", numero: "301", nombre: "TVGAN", rubro: "Medios", descripcion: "El canal del ganadero: programas y streaming.", href: "/tvgan", icon: "tv", status: "abierto", ancla: true },
      { id: "contexto", numero: "302", nombre: "Contexto Ganadero", rubro: "Periodismo", descripcion: "Información estratégica y periodismo del sector ganadero.", href: "https://contexto-olive.vercel.app/", icon: "bar-chart", status: "abierto", external: true },
      { id: "datos", numero: "303", nombre: "Datos del sector", rubro: "Cifras y tableros", descripcion: "Inventario bovino, precios y tableros especializados.", href: "/datos", icon: "database", status: "proximamente" },
    ],
  },
  {
    id: "piso-vip",
    nombre: "Zona de membresía",
    descripcion: "Espacio autenticado para afiliados y usuarios registrados.",
    locales: [
      { id: "mi-fedegan", numero: "VIP", nombre: "Mi FEDEGÁN", rubro: "Membresía", descripcion: "Perfil, beneficios, trámites personalizados y alertas.", href: "/mi-fedegan", icon: "user-circle", status: "proximamente", ancla: true },
    ],
  },
];

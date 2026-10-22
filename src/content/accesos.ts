// Accesos, pagos, campañas y datos de contacto que el portal actual (fedegan.org.co) muestra en sus
// columnas laterales y en el pie de página. Las imágenes se copiaron optimizadas a /public/accesos.

import type { PictogramName } from "@/components/ui/Pictogram";

export type Acceso = {
  id: string;
  title: string;
  text: string;
  href: string;
  external?: boolean;
  icon: PictogramName;
  acc: string;
  /** Texto del enlace (por defecto «Ir al servicio»). */
  cta?: string;
};

const PQRSD = "/seccion/servicios-fedegan/servicios/peticiones-quejas-reclamos-sugerencias-y-denuncias";

/** Pagos y trámites: lo más usado por ganaderos y aportantes. */
export const pagos: Acceso[] = [
  { id: "pago", title: "Pago en línea", text: "Pague la cuota de fomento ganadero y lechero por PSE, con las fechas límite del año.", href: "/pagos", icon: "pago", acc: "92,205,134", cta: "Pagar ahora" },
  { id: "biologico", title: "Recaudo biológico", text: "Recaudo de dosis aplicadas: aftosa, aftosa más rabia y brucelosis (BR51).", href: "https://micrositios.goupagos.com.co/fedegan-ma", external: true, icon: "biologico", acc: "216,181,88", cta: "Pagar recaudo" },
];

export const tramites: Acceso[] = [
  { id: "ruv", title: "Consulta RUV", text: "Verifique su inscripción en el Registro Único de Vacunación.", href: "https://sagari.fedegan-fng.org.co/#/cnl1", external: true, icon: "arete", acc: "112,214,196" },
  { id: "pqrsd", title: "PQRSD", text: "Peticiones, quejas, reclamos, sugerencias y denuncias a FEDEGÁN-FNG.", href: PQRSD, icon: "sobre", acc: "230,160,108", cta: "Radicar solicitud" },
  { id: "inventario", title: "Cifras del inventario", text: "Inventario bovino y bufalino, datos e indicadores del sector.", href: "/seccion/pagos-y-campanas/datos-e-indicadores", icon: "res", acc: "92,205,134", cta: "Ver cifras" },
  { id: "seguridad", title: "Seguridad Ganadera", text: "Cartilla ABC y frentes solidarios de seguridad y paz.", href: "/seccion/pagos-y-campanas/abc-seguridad-ganadera-frentes-solidarios-de-seguridad-y-paz", icon: "porton", acc: "230,160,108", cta: "Ver cartilla" },
  { id: "solidaridad", title: "Solidaridad Ganadera", text: "Inscripción a los frentes solidarios de seguridad.", href: "https://docs.google.com/forms/d/e/1FAIpQLScgMr4PoH4PBvJgcJz-vlk5HMz0APCiBU9LlEsBf0PZbko_Xg/viewform", external: true, icon: "brotes", acc: "216,181,88", cta: "Inscribirse" },
  { id: "sello", title: "Sello Ambiental", text: "Cartilla del Sello Ambiental Colombiano para su predio.", href: "https://storage.googleapis.com/static-fedegan/banners/bnn-2026/bnn-cartilla-sello-ambiental/Sello-Ambiental.pdf", external: true, icon: "sello", acc: "112,214,196", cta: "Descargar cartilla" },
  { id: "sac", title: "Metodología SAC", text: "Metodología para la autoevaluación del Sello Ambiental Colombiano.", href: "/seccion/pagos-y-campanas/metodologia-para-la-autoevaluacion-del-sello-ambiental-colombiano", icon: "libro", acc: "92,205,134", cta: "Ver metodología" },
  { id: "buen-gobierno", title: "Código de Buen Gobierno", text: "Principios y reglas de gestión institucional de FEDEGÁN.", href: "https://storage.fedegan.org.co/s3fs-public/codigo_buen_gobierno_fedeganv75.pdf", external: true, icon: "balanza", acc: "216,181,88", cta: "Descargar PDF" },
];

export type Campana = {
  id: string;
  title: string;
  kicker: string;
  image: string;
  /** Proporción de la tarjeta (ancho / alto). */
  ratio: string;
  href: string;
  external?: boolean;
  /** Banners comerciales de aliados: llevan la etiqueta «Publicidad». */
  ad?: boolean;
  group: "recaudo" | "campanas" | "aliados";
  alt: string;
};

/** Campañas, avisos y convocatorias que el portal actual destaca con banners. */
export const campanas: Campana[] = [
  { id: "gira", group: "aliados", title: "Gira técnica Magdalena Medio 2026", kicker: "Evento", image: "/accesos/gira-magdalena-medio.webp", ratio: "230 / 300", href: "/eventos", alt: "Gira Técnica Ganadera Magdalena Medio 2026" },
  { id: "remate", group: "aliados", title: "Remate de la Gira", kicker: "Aliados", image: "/accesos/remate-gira.webp", ratio: "1 / 2", href: "https://bit.ly/INFOIGREMATE", external: true, ad: true, alt: "Remate de la Gira Ganadera" },
  { id: "tvgan", group: "aliados", title: "Compra y venta bovina con TvGan", kicker: "Aliados", image: "/accesos/compra-venta-tvgan.webp", ratio: "1 / 2", href: "https://bit.ly/VERLOTESAQUI", external: true, ad: true, alt: "Compra y venta bovina con TvGan" },
  { id: "cuota", group: "recaudo", title: "La cuota de fomento se mantiene", kicker: "Comunicado", image: "/accesos/cuota-se-mantiene.webp", ratio: "960 / 1200", href: "https://storage.googleapis.com/static-fedegan/banners/bnn-2026/bnn-cfgl-se-mantiene/Comunicado-recaudadores.jpg", external: true, alt: "Comunicado a recaudadores: la cuota se mantiene" },
  { id: "aviso", group: "recaudo", title: "Aviso importante sobre la cuota 2026", kicker: "Importante", image: "/accesos/aviso-cuota.webp", ratio: "960 / 1690", href: "https://storage.googleapis.com/static-fedegan/recaudo_cfgl/aviso_cuota_fgl-2026.jpg", external: true, alt: "Aviso importante sobre la cuota de fomento 2026" },
  { id: "fechas", group: "recaudo", title: "Fechas límite de la cuota", kicker: "Recaudo", image: "/accesos/fechas-limite.webp", ratio: "960 / 1408", href: "https://storage.googleapis.com/static-fedegan/recaudo_cfgl/tabla_cfgl_2026-home.jpg", external: true, alt: "Tabla de fechas límite de pago de la cuota de fomento 2026" },
  { id: "convenios", group: "campanas", title: "Convenios FEDEGÁN", kicker: "Beneficios", image: "/accesos/convenios.webp", ratio: "960 / 1566", href: "/seccion/pagos-y-campanas/noticias/convenios-fedegan", alt: "Convenios FEDEGÁN" },
  { id: "carne", group: "campanas", title: "Fomento al consumo de carne", kicker: "Campaña", image: "/accesos/fomento-carne.webp", ratio: "774 / 538", href: "/seccion/pagos-y-campanas/campana-de-fomento-al-consumo-de-carne", alt: "Campaña de fomento al consumo de carne" },
  { id: "leche", group: "campanas", title: "Fomento al consumo de leche", kicker: "Campaña", image: "/accesos/fomento-leche.webp", ratio: "774 / 538", href: "/seccion/pagos-y-campanas/campana-de-fomento-al-consumo-de-leche", alt: "Campaña de fomento al consumo de leche" },
  { id: "precio-leche", group: "campanas", title: "Reporte aquí irregularidades en el precio de la leche", kicker: "Denuncia", image: "/accesos/reporte-precio-leche.webp", ratio: "220 / 300", href: "/seccion/pagos-y-campanas/reporte-aqui-situaciones-irregulares-en-el-precio-de-la-leche", alt: "Reporte aquí situaciones irregulares en el precio de la leche" },
];

/** Formulario oficial de PQRSD (mesa de ayuda de FEDEGÁN-FNG). */
export const pqrsdForm = "https://helpdesk.fedegan-fng.org.co/glpi/Form/Render/5?token=HUxXV3QPOfYdfwLaa5l7yk86yOkk2qXDDPvGRGTq";

export const gruposAvisos: { id: Campana["group"]; titulo: string; texto: string }[] = [
  { id: "recaudo", titulo: "Recaudo de la cuota", texto: "Comunicados, valores y fechas para los recaudadores." },
  { id: "campanas", titulo: "Campañas y beneficios", texto: "Fomento al consumo, convenios y reportes del sector." },
  { id: "aliados", titulo: "Eventos y aliados", texto: "Gira técnica, remate y servicios de aliados." },
];

/** Los cuatro avisos que se muestran en la portada. */
export const avisosPortada = ["gira", "cuota", "convenios", "carne"];

export const contacto = {
  direccion: "Calle 37 N° 14 - 31, Bogotá, Colombia",
  telefono: "+57 (601) 578 2020",
  telefonoHref: "tel:+576015782020",
  horario: "Lunes a viernes, 8:30 a.m. a 5:30 p.m.",
  correos: [
    { label: "Correo institucional", email: "fedegan@fedegan.org.co", text: "Para comunicaciones de carácter general e informativo." },
    { label: "Notificaciones judiciales", email: "dramos@fedegan.org.co", text: "Exclusivo para notificaciones de carácter judicial o requerimientos de entidades competentes." },
    { label: "Correo PQRSD", email: "pqrs@fedegan-fng.org.co", text: "Para radicar peticiones, quejas, reclamos, sugerencias y denuncias de cualquier tipo de usuario." },
    { label: "Correo Anticorrupción", email: "anticorrupcion@fedegan-fng.org.co", text: "Para reportar posibles situaciones de fraude o corrupción." },
  ],
};

export const redes = [
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/FedeganColombia" },
  { id: "x", label: "X (Twitter)", href: "https://twitter.com/fedegan" },
  { id: "youtube", label: "YouTube", href: "http://www.youtube.com/user/FEDEGANFNG" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/fedegan_col/" },
];

/** Documentos legales del pie de página del portal actual. */
export const legales = [
  { label: "Política de Tratamiento de Datos FEDEGÁN", href: "https://storage.googleapis.com/static-fedegan/publicaciones/Politica-Tratamiento-Proteccion-Datos-FEDEGAN.pdf" },
  { label: "Política de Tratamiento de Datos del Fondo Nacional del Ganado", href: "https://storage.googleapis.com/static-fedegan/publicaciones/Politica-Tratamiento-de-proteccion-de-datos-personales-FNG.pdf" },
  { label: "Términos y condiciones de uso de la web", href: "https://storage.googleapis.com/static-fedegan/SIG/Metadatos/Terminos-y-condiciones-uso-web-FEDEGAN-FNG.pdf" },
  { label: "Política de derechos de autor y autorización de uso de contenidos", href: "https://storage.googleapis.com/static-fedegan/FNG-Update-04012022/NORMATIVA/GM-DG04%20Poli%CC%81tica%20de%20derechos%20de%20autor%20.pdf" },
];

export const aliados = [
  { label: "TvGan", href: "http://www.tvgan.com.co/" },
  { label: "Fundagán", href: "http://www.fundagan.org.co" },
  { label: "Friogán", href: "https://friogan.com/" },
  { label: "Bursagán", href: "http://www.bursagan.com.co/" },
  { label: "CONtexto Ganadero", href: "https://www.contextoganadero.com/" },
];

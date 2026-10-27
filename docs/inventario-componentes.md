# Inventario de componentes

> Generado con `npm run inventario` a partir de `src/components`. No editar a mano: edite el comentario de la primera línea de cada componente y vuelva a generar. Catálogo visual interactivo: ruta `/componentes`. Reglas de uso: [`sistema-de-diseno.md`](sistema-de-diseno.md).

## Panel de administración (`admin`)

| Componente | Archivo | Descripción |
|---|---|---|
| `AdminSidebar` | `src/components/admin/AdminSidebar.tsx` | Menú lateral del panel: riel de íconos que se despliega al acercar el mouse; cajón en móvil. |
| `ApiTestButton`, `ApiKeyForm` | `src/components/admin/ApiForms.tsx` | Botón de prueba de conexión y formulario de cambio de clave de las APIs (panel). |
| `ConfigNotice` | `src/components/admin/ConfigNotice.tsx` | Aviso de modo solo lectura que indica qué variables de entorno detecta el servidor. |
| `CourseTabs` | `src/components/admin/CourseTabs.tsx` | Pestañas de administración de un curso (currículo, estudiantes). |
| `DeleteButton` | `src/components/admin/DeleteButton.tsx` | Botón de eliminar con confirmación. |
| `DesignEditor` | `src/components/admin/DesignEditor.tsx` | Editor visual de diseño con borrador, vista previa, publicar y deshacer. |
| `PaginaForm` | `src/components/admin/PaginaForm.tsx` | Formulario de edición del texto de una página migrada. |
| `RecordForm` | `src/components/admin/RecordForm.tsx` | Formulario genérico de edición de contenido, generado desde la definición de cada tipo. |
| `AreaChart`, `Donut` | `src/components/admin/charts.tsx` | Gráficas SVG sencillas, renderizadas en el servidor (sin librerías). |

## Bloques (`blocks`): secciones de página componibles

| Componente | Archivo | Descripción |
|---|---|---|
| `AccessHub`, `CampaignWall`, `AvisosGrouped`, `PresidentQuote`, `PresidentColumn`, `QuickRail` | `src/components/blocks/Accesos.tsx` | Aviso: ficha vertical de tamaño fijo; el cartel completo se abre al hacer clic. |
| `AccountPicker` | `src/components/blocks/AccountPicker.tsx` | Selector de cuentas de ejemplo del modo demostración. |
| `AccountStrip` | `src/components/blocks/AccountStrip.tsx` | Invitación breve a Mi FEDEGÁN, en lugar de un banner grande con maqueta. |
| `ContactChannels` | `src/components/blocks/ContactChannels.tsx` | Canales de contacto (teléfonos, correos y sede). |
| `ContactForm` | `src/components/blocks/ContactForm.tsx` | Formulario de contacto / PQRSD. |
| `EventCard` | `src/components/blocks/EventCard.tsx` | Evento como ficha con ola: la fecha en grande arriba; al pasar el cursor, la hora y el lugar. |
| `EventsExplorer` | `src/components/blocks/EventsExplorer.tsx` | Agenda de eventos con filtros y búsqueda. |
| `EventsGrid` | `src/components/blocks/EventsGrid.tsx` | Cuadrícula de eventos próximos. |
| `FaqAccordion` | `src/components/blocks/FaqAccordion.tsx` | Acordeón de preguntas frecuentes. |
| `HeroNews` | `src/components/blocks/HeroNews.tsx` | Cabecera con las noticias de portada de CONtexto. |
| `InfoLinksRow` | `src/components/blocks/InfoLinksRow.tsx` | Fila de tres accesos informativos con ícono. |
| `LayoutSwitchDemo` | `src/components/blocks/LayoutSwitchDemo.tsx` | Demostración de cambio de layout (vitrina, lista, destacado) sin tocar el contenido. |
| `MallArt` | `src/components/blocks/MallArt.tsx` | Curva cerrada y orgánica (tipo curva de nivel) suavizada con Catmull-Rom. |
| `MallDirectory` | `src/components/blocks/MallDirectory.tsx` | Directorio: cada local del portal como una ficha con foto, descripción y entrada directa. |
| `MallRibbon` | `src/components/blocks/MallRibbon.tsx` | Cinta de locales del gremio con tarjetas. |
| `MembershipBanner` | `src/components/blocks/MembershipBanner.tsx` | Banner de invitación a Mi FEDEGÁN / membresía. |
| `NewsCarousel` | `src/components/blocks/NewsCarousel.tsx` | Carrusel de noticias con avance automático y control de pausa. |
| `NewsGrid` | `src/components/blocks/NewsGrid.tsx` | Últimas noticias en formato editorial: una nota grande y una lista con las siguientes. |
| `NewsUnavailable` | `src/components/blocks/NewsUnavailable.tsx` | Estado de «noticias no disponibles» cuando CONtexto no responde. |
| `NewsletterForm` | `src/components/blocks/NewsletterForm.tsx` | Formulario de suscripción al boletín. |
| `NoticiaCard` | `src/components/blocks/NoticiaCard.tsx` | Nota de CONtexto como ficha con foto y ola: la sección y el título abajo; al pasar el cursor, la bajada. |
| `PaymentsBand` | `src/components/blocks/PaymentsBand.tsx` | Portada: una sola franja con todo lo que se paga, en lugar de un banner por cada pago. |
| `PortalJourney` | `src/components/blocks/PortalJourney.tsx` | Recorrido scroll por los locales del directorio y las noticias, con fotos reales de finca. |
| `PortalesAliados` | `src/components/blocks/PortalesAliados.tsx` | Franja de portales aliados con logos enlazados. |
| `PublicationsExplorer` | `src/components/blocks/PublicationsExplorer.tsx` | Biblioteca de publicaciones con filtros por tipo y búsqueda. |
| `PublicationsGrid` | `src/components/blocks/PublicationsGrid.tsx` | Cuadrícula de publicaciones destacadas. |
| `RulesExplorer` | `src/components/blocks/RulesExplorer.tsx` | Listado buscable de normatividad con insignias por tipo de norma. |
| `SearchClient` | `src/components/blocks/SearchClient.tsx` | Buscador del portal con resultados ordenados por relevancia. |
| `SignInPanel` | `src/components/blocks/SignInPanel.tsx` | Panel de ingreso: cuenta institucional (Microsoft) y acceso de ganaderos y aliados. |
| `StatsStrip` | `src/components/blocks/StatsStrip.tsx` | Franja de cifras del sector. |
| `VoiceAndAgenda` | `src/components/blocks/VoiceAndAgenda.tsx` | Dos voces en una sola franja: la columna del presidente y los próximos eventos. |

## Diseño editable (`design`): ticker, anuncios y ventana emergente

| Componente | Archivo | Descripción |
|---|---|---|
| `AdSlot` | `src/components/design/AdSlot.tsx` | Zona de publicidad: imagen enlazada a un anuncio. Los anuncios llevan etiqueta «Publicidad». |
| `CountUp` | `src/components/design/CountUp.tsx` | Cifra que sube hasta su valor al entrar en pantalla (sin animación si se prefiere menos movimiento). |
| `ScrollRail` | `src/components/design/ScrollRail.tsx` | Carril horizontal con ajuste por tarjeta y botones; en pantallas táctiles se desliza con el dedo. |
| `SitePopup` | `src/components/design/SitePopup.tsx` | Ventana emergente: una vez por sesión, con retardo configurable, cierre con Esc y devolución del foco. |
| `Spotlight` | `src/components/design/Spotlight.tsx` | Brillo que sigue al cursor sobre las tarjetas .mx-card hijas (delegación de eventos). |
| `Ticker` | `src/components/design/Ticker.tsx` | Cintillo de titulares con mensajes propios del editor. Se detiene si hay preferencia de movimiento reducido. |

## Estructura (`layout`): encabezado, pie y marco del sitio

| Componente | Archivo | Descripción |
|---|---|---|
| `Analytics` | `src/components/layout/Analytics.tsx` | Google Tag Manager (que a su vez despliega GA4) se inyecta solo con consentimiento; si la persona lo |
| `BackToTop` | `src/components/layout/BackToTop.tsx` | Botón flotante «volver arriba». |
| `ChromeGate` | `src/components/layout/ChromeGate.tsx` | Oculta el pie de página en las pantallas de acceso, que caben completas en una sola vista. |
| `ConsentBanner` | `src/components/layout/ConsentBanner.tsx` | Permiso para personalizar el orden del recorrido según el uso. Se pregunta una vez y puede cambiarse en |
| `Footer` | `src/components/layout/Footer.tsx` | Pie de página: enlaces, contacto, boletín, redes y avisos legales. |
| `FooterAccess` | `src/components/layout/FooterAccess.tsx` | Acceso a la cuenta como un enlace más del pie: «Ingresar», o «Mi FEDEGÁN» con la sesión iniciada. |
| `Header` | `src/components/layout/Header.tsx` | Primeras opciones visibles según el ancho; el resto va en «Más». |
| `LoginMenu` | `src/components/layout/LoginMenu.tsx` | Acceso de cuenta del encabezado (ingreso o menú de aplicaciones). |
| `Logo` | `src/components/layout/Logo.tsx` | Logo institucional enlazado al inicio. |
| `Masthead` | `src/components/layout/Masthead.tsx` | Cabecera de periódico: nombre en serif con degradado dorado, lema y fecha, entre filetes finos. |
| `MastheadTools` | `src/components/layout/MastheadTools.tsx` | Accesos pequeños de la cabecera en móvil: tono claro/oscuro y cuenta. |
| `MobileTabBar` | `src/components/layout/MobileTabBar.tsx` | Barra de pestañas flotante tipo app, solo en móvil. "Más" abre el menú completo del encabezado. |
| `PrivacyButton` | `src/components/layout/PrivacyButton.tsx` | Botón para abrir y cambiar el consentimiento de cookies. |
| `Providers` | `src/components/layout/Providers.tsx` | Proveedores de contexto del cliente (sesión). |
| `PwaRegister` | `src/components/layout/PwaRegister.tsx` | Registra el service worker (solo en producción) y avisa cuando no hay conexión. |
| `SignOutButton` | `src/components/layout/SignOutButton.tsx` | Botón de cerrar sesión. |
| `SiteChrome` | `src/components/layout/SiteChrome.tsx` | Encabezado, pie y barra móvil del sitio público. El panel /admin trae su propio marco. |
| `ThemeScript` | `src/components/layout/ThemeScript.tsx` | Aplica el tono guardado antes del primer pintado para evitar el parpadeo. |
| `ThemeToggle` | `src/components/layout/ThemeToggle.tsx` | Cambio de tono claro / oscuro. La elección se recuerda; el script del <head> la aplica antes de pintar. |
| `UniversityShell` | `src/components/layout/UniversityShell.tsx` | Marco propio de la Escuela Virtual (UCG): se ve como un sitio aparte, sin el encabezado, el menú ni el pie del portal de |
| `UsageTracker` | `src/components/layout/UsageTracker.tsx` | Cuenta una visita cada vez que la persona entra a una sección del recorrido (solo con su permiso). |
| `WebVitals` | `src/components/layout/WebVitals.tsx` | Mide LCP, INP, CLS, FCP y TTFB de visitantes reales y las envía a /api/vitals (y al dataLayer de GTM si existe). |

## Contenido migrado (`legacy`)

| Componente | Archivo | Descripción |
|---|---|---|
| `EntryExplorer` | `src/components/legacy/EntryExplorer.tsx` | Ficha de publicación: año en grande, título, autores y un extracto; toda la ficha es el enlace. |
| `LegacyContent` | `src/components/legacy/LegacyContent.tsx` | Celdas con varias líneas: los enlaces sueltos van como lista y el resto como párrafos. |
| `LegacySectionPage` | `src/components/legacy/LegacySectionPage.tsx` | Página de una sección con el texto copiado del portal actual: menú lateral, migas y contenido. |

## Escuela Virtual (`lms`)

| Componente | Archivo | Descripción |
|---|---|---|
| `CatalogExplorer` | `src/components/lms/CatalogExplorer.tsx` | Catálogo de cursos con filtros. |
| `CourseAssistant` | `src/components/lms/CourseAssistant.tsx` | Ayuda contextual dentro del aula de un curso. |
| `PrintButton` | `src/components/lms/PrintButton.tsx` | Botón de imprimir. |
| `ProfileView` | `src/components/lms/ProfileView.tsx` | Perfil de la persona estudiante. |
| `QuizForm` | `src/components/lms/QuizForm.tsx` | Formulario de evaluación de una lección. |
| `Rich` | `src/components/lms/Rich.tsx` | Renderiza el contenido enriquecido de una lección. |
| `StudentCard` | `src/components/lms/StudentCard.tsx` | Carnet de la persona estudiante con código verificable. |
| `StudioPanel` | `src/components/lms/StudioPanel.tsx` | Panel de creación y edición de cursos. |
| `UniversityLogin` | `src/components/lms/UniversityLogin.tsx` | Ingreso a la Escuela Virtual. |

## Observatorio ganadero (`observatorio`)

| Componente | Archivo | Descripción |
|---|---|---|
| `IndicatorChart` | `src/components/observatorio/IndicatorChart.tsx` | Gráfica interactiva de un indicador: periodo, tipo de gráfica, series, tabla y exportación a CSV. |
| `IndicatorTabs` | `src/components/observatorio/IndicatorTabs.tsx` | Varios indicadores de un mismo tema con pestañas; cada uno con su propia gráfica interactiva. |
| `Observatorio` | `src/components/observatorio/Observatorio.tsx` | Observatorio ganadero: indicadores y gráficas por periodo. |
| `ObservatorioNav` | `src/components/observatorio/ObservatorioNav.tsx` | Menú «En esta página»: vertical y fijo a la izquierda en pantallas grandes (resalta la sección que se está |
| `TerritorialExplorer` | `src/components/observatorio/TerritorialExplorer.tsx` | Inventario por departamento, año tras año: barra de años con reproducción, puesto de cada departamento y hato por orientación. |

## Zona de pagos (`pagos`)

| Componente | Archivo | Descripción |
|---|---|---|
| `FechasLimite` | `src/components/pagos/FechasLimite.tsx` | Fechas límite de consignación: la próxima por vencer queda resaltada y las pasadas se atenúan. |
| `InstructivoTabs` | `src/components/pagos/InstructivoTabs.tsx` | Instructivo paso a paso del botón de pago PSE, uno para leche y otro para carne. |
| `NextDeadline` | `src/components/pagos/NextDeadline.tsx` | Próxima fecha límite de consignación con los días que faltan. |
| `PaymentLogin` | `src/components/pagos/PaymentLogin.tsx` | Acceso al sistema de pago. Aún no está conectado al sistema de recaudo: no envía las credenciales a ninguna parte. |
| `Planilla` | `src/components/pagos/Planilla.tsx` | Planilla de recaudo mensual: leche (litros) o carne (cabezas). Calcula los totales de lo digitado y |
| `Field`, `PrimaryButton` | `src/components/pagos/ui.tsx` | Piezas de formulario compartidas por las pantallas del sistema de pago. |

## Recorrido de la portada (`scroll-world`)

| Componente | Archivo | Descripción |
|---|---|---|
| `ScrollWorld` | `src/components/scroll-world/ScrollWorld.tsx` | Recorrido a pantalla completa por los locales del portal: el scroll conduce una cámara que |

## Base (`ui`): piezas reutilizables del sistema de diseño

| Componente | Archivo | Descripción |
|---|---|---|
| `Badge` | `src/components/ui/Badge.tsx` | Etiqueta de estado o categoría (variantes de tono). |
| `Button` | `src/components/ui/Button.tsx` | Botón y enlace con aspecto de botón (variantes primario, secundario, fantasma, oro). |
| `Card`, `CardBody` | `src/components/ui/Card.tsx` | Tarjeta de vidrio con acento de color y efecto al pasar el mouse. |
| `Container` | `src/components/ui/Container.tsx` | Contenedor centrado con ancho máximo y márgenes responsivos. |
| `Section`, `PrincipleList`, `Timeline`, `PhotoTile`, `CtaBand` | `src/components/ui/Editorial.tsx` | Piezas editoriales compartidas por las páginas interiores. |
| `FilterToolbar`, `EmptyResults` | `src/components/ui/FilterToolbar.tsx` | Barra de filtros de las listas: chips por categoría y, opcionalmente, un buscador. |
| `Input` | `src/components/ui/Input.tsx` | Campo de texto con el estilo del sistema. |
| `LegalPage` | `src/components/ui/LegalPage.tsx` | Plantilla de las páginas legales del pie: texto resumido + enlace a los documentos oficiales. |
| `PageHeader` | `src/components/ui/PageHeader.tsx` | Cabecera de las páginas interiores: foto a sangre con velo de color, ruta en cápsula, |
| `PhotoCard` | `src/components/ui/PhotoCard.tsx` | "r,g,b" → versión más oscura para el degradado de la ola. |
| `Pictogram` | `src/components/ui/Pictogram.tsx` | Pictogramas propios del campo colombiano, dibujados a línea con un toque de relleno dorado. |
| `SectionHeading`, `Eyebrow` | `src/components/ui/SectionHeading.tsx` | Encabezado de sección con rótulo, título y enlace de acción. |
| `FacebookIcon`, `XIcon`, `InstagramIcon`, `YoutubeIcon`, `LinkedinIcon` | `src/components/ui/SocialIcons.tsx` | Íconos de redes sociales (Facebook, X, Instagram, YouTube, LinkedIn). |
| `WaveCard` | `src/components/ui/WaveCard.tsx` | Colores de marca (manual de CONtexto): esmeralda, oro y niebla verde. |

**Total:** 125 componentes en 10 carpetas.

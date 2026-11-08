# Manual del editor de contenido

Para quien publica en el portal desde `/admin` (se ingresa con una cuenta con rol de editor).

## Contenidos que se editan
| Menú | Qué controla |
|---|---|
| Publicaciones | Informes, manuales y boletines (portada + PDF) |
| Eventos | Agenda de webinars, seminarios y foros |
| Preguntas frecuentes | Página de ayuda |
| Páginas migradas | El texto de las 305 páginas copiadas del portal anterior (programas, normatividad, FNG, FEP…) |
| Directorio / Cifras | Locales del recorrido y cifras del sector |
| Diseño | Bloques de la portada, ticker, anuncios y ventana emergente |

## Publicar y programar
1. Entre al tipo de contenido y pulse **Nuevo**.
2. Complete los campos; los obligatorios están marcados.
3. **Publicar desde** (publicaciones y eventos): déjelo vacío para publicar ya, o ponga una fecha futura. El contenido aparece solo ese día (hora de Bogotá, renovación automática a las 00:05).
4. Guarde. Para retirar algo, bórrelo o ponga una fecha futura.

## Páginas migradas
Las páginas copiadas del portal anterior se editan con el mismo constructor que las páginas nuevas (siguiente sección): desde el lápiz del árbol del sitio (`/admin/arbol`) o desde `/admin/paginas` (busque por título o filtre por sección). Cada título, párrafo, lista, video y documento aparece como un elemento; la negrita y los enlaces se ven como son, sin símbolos que escribir (en un texto, seleccione las palabras y use los botones **B** y de enlace). En una lista, cada enlace tiene su nombre y su dirección en campos aparte. Las tablas del original se conservan: se pueden mover o quitar, pero no se editan. **Vista previa** muestra la página tal como la verá el público. Al pulsar **Publicar cambios** el cambio se ve en el sitio; **Restaurar el original** descarta lo editado.

## Páginas nuevas: constructor de arrastrar y soltar
`/admin/arbol` crea secciones, subsecciones y páginas nuevas a cualquier nivel. Al crear una página (**Crear y armar la página**) se abre el constructor:

Una página en blanco ofrece diez plantillas de arranque (informativa, servicios con tarjetas, documentos y descargas, preguntas frecuentes, con portada, programa o campaña, informe con cifras, convocatoria o comunicado, equipo y contacto, galería y aliados); después se puede cambiar todo.

- **Elementos** (a la izquierda, 35 en siete grupos que se pliegan):
  - *Texto*: título, subtítulo, párrafo, lista, aviso (información, éxito, advertencia o importante), cita y columnas de texto.
  - *Acciones*: botón, destacado, botones (varios en una fila), banner con imagen de fondo y redes sociales.
  - *Medios*: imagen, video o tablero, imagen y texto, galería de fotos, audio y logos de aliados.
  - *Contenido*: tarjetas, carrusel, preguntas (acordeón), pestañas, cifras, pasos, línea de tiempo, características (con iconos), lista de enlaces, tabla y ficha de tema (una ficha más en la cuadrícula de temas de una sección o de una página con subpáginas; lleva título, descripción y enlace).
  - *Personas*: personas (foto, cargo, correo y teléfono) y contacto (teléfono, correo, dirección con «Cómo llegar» y horario).
  - *Archivos*: documentos y recibir archivos.
  - *Diseño*: separador y espacio.

  Se arrastran a la página o se pulsan para añadirlos debajo del elemento que se está editando. El buscador de la paleta filtra por nombre o por lo que hace («foto», «teléfono», «descarga»…).
- **Armar la página**: pulse un elemento para abrir sus opciones y ver cómo queda al instante. Las flechas lo suben o bajan, el icono de la hoja lo duplica y el de la papelera lo quita (pide confirmación). **Vista previa** muestra la página completa.
- **Deshacer y rehacer**: los botones de arriba (o `Ctrl/⌘ + Z` y `Ctrl/⌘ + Mayús + Z`) devuelven o repiten los cambios, incluso añadir o quitar un elemento. Lo escrito seguido en un mismo campo cuenta como un solo paso.
- **Documentos**: se ven como **tarjetas** (ícono del tipo de archivo, nombre, *Vista previa* y *Descargar*), igual que en las páginas ya publicadas. Se suben varios a la vez con **Subir documentos**, o se añade un enlace a mano. Si dos archivos seguidos tienen el mismo nombre (el Excel y el PDF del mismo informe, por ejemplo), comparten tarjeta. Una *Lista* en la que todos los puntos son enlaces a documentos (dos o más) también se ve como tarjetas.
- **Tablas**: se editan como una cuadrícula (hasta 40 filas y 8 columnas); también se puede pegar un rango de celdas copiado desde Excel.
- **Galería y logos**: **Subir varias imágenes** crea una foto por cada archivo (JPG o PNG); cada foto admite un pie.
- **Enlaces**: acepte `https://…`, una página del portal como `/pagos` o un correo. Si escribe `fedegan.org.co` se completa solo; un enlace de YouTube se convierte en video.
- **Archivos**: imágenes (JPG o PNG) y documentos (PDF, Excel, Word, PowerPoint, CSV, ZIP o MP3, hasta 50 MB) se suben desde el propio elemento. *Recibir archivos* pone un botón para que los visitantes carguen PDF, Word, Excel, JPG o PNG (hasta 5 de 10 MB); llegan a la carpeta `recibidos` del almacenamiento.
- **Publicar**: nada llega al sitio hasta pulsar **Publicar cambios**. Un elemento incompleto (un botón sin enlace, una galería sin fotos…) queda marcado y no se publica; la barra de abajo cuenta cuántos hay. Las partes vacías de una lista (una foto o una pestaña sin llenar) se ignoran. Si cierra la página con cambios sin publicar, el navegador avisa.

Para agregar un elemento nuevo al catálogo basta describir sus campos en `src/lib/cms/elementos.ts` (el editor, la validación del servidor y los datos guardados salen de esa descripción) y dibujarlo en `src/components/legacy/ElementosExtra.tsx`.

## Diseño de la portada
`/admin/diseno` trabaja en **borrador**: cambie, use *Vista previa*, y solo al pulsar **Publicar** lo ve el público. *Deshacer* vuelve a la versión anterior.

## Archivos
PDF hasta 5 MB y fotos horizontales de al menos 1200 px de ancho.

## Plan de capacitación sugerido
| Sesión | Duración | Contenido |
|---|---|---|
| 1. Contenido | 2 h | Publicaciones, eventos, FAQ, programación |
| 2. Diseño | 2 h | Borrador, vista previa, publicar y deshacer |
| 3. Operación | 2 h | Monitoreo, respaldos y despliegues (ver `operacion.md`) |

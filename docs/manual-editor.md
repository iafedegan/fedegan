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
`/admin/paginas` lista las páginas copiadas del portal anterior (busque por título o filtre por sección). Al abrir una, el contenido se edita como texto: una línea en blanco separa párrafos, `## Título` es un encabezado, `- elemento` una lista, `**negrita**` y `[texto](https://…)` para enlaces, `@video https://…` para incrustar un video o documento. Las tablas del original se conservan como `{{tabla 1}}`. Al guardar, el cambio se ve en el sitio; **Restaurar el original** descarta lo editado.

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

# Escuela Virtual (LMS): funciones y estado

Comparativo con las plataformas de referencia (Udemy, Platzi, Coursera, Moodle, Teachable) y qué tiene ya la Escuela Virtual de FEDEGÁN.

| Función de un LMS | Referencia | Estado |
|---|---|---|
| Catálogo con buscador y filtros (categoría, nivel) | Udemy, Platzi | ✅ `/escuela-virtual` |
| Página de venta/presentación del curso: qué aprenderá, contenido, requisitos, instructor, valoraciones | Udemy | ✅ `/escuela-virtual/[curso]` |
| Video de presentación del curso | Udemy | ✅ (YouTube, Vimeo o archivo) |
| Currículo en módulos y lecciones, con duración y orden | Todas | ✅ Admin → Cursos → Currículo |
| Lecciones de video, lectura y evaluación | Todas | ✅ |
| Vista previa gratuita de lecciones | Udemy | ✅ |
| Recursos descargables por lección | Udemy, Platzi | ✅ |
| Inscripción (gratuita) con la cuenta del portal | Todas | ✅ |
| Aula: reproductor, menú del curso, anterior/siguiente | Platzi | ✅ |
| Progreso por lección y por curso, «continuar donde iba» | Platzi, Udemy | ✅ |
| Evaluaciones con nota mínima, corrección y explicación | Moodle, Coursera | ✅ (calificadas en el servidor) |
| Certificado imprimible con código al terminar | Platzi, Coursera | ✅ |
| Valoraciones y comentarios del curso | Udemy | ✅ |
| Mis cursos (avance y certificados) | Todas | ✅ `/escuela-virtual/mis-cursos` |
| Panel del editor: crear/editar/ocultar cursos, publicación programada | Todas | ✅ |
| Estudiantes por curso: inscritos, avance, finalización, valoración | Todas | ✅ |
| Cursos externos (alojados en otra plataforma) | — | ✅ (los 11 del Manual Práctico Ganadero apuntan a mpg.fedegan.org.co) |
| Notas del estudiante junto al video | Platzi | ⏳ pendiente |
| Foro de preguntas y respuestas por lección | Udemy, Platzi | ⏳ pendiente |
| Rutas de aprendizaje (varios cursos en secuencia) | Platzi | ⏳ pendiente |
| Verificación pública del certificado por código | Coursera | ⏳ pendiente |
| Anuncios y mensajes del instructor | Udemy | ⏳ pendiente |
| Subida de video propio (hoy se enlaza YouTube/Vimeo/archivo) | Todas | ⏳ pendiente |
| Pagos / cupones | Udemy | No aplica: los cursos son gratuitos |
| Seguimiento SCORM/xAPI | Moodle | ⏳ si se requiere |

## Datos
Migración `docs/migraciones/004-lms.sql`: `lms_courses`, `lms_modules`, `lms_lessons`, `lms_quiz_questions`, `lms_enrollments`, `lms_progress`, `lms_reviews`. El público solo lee cursos publicados; las respuestas correctas, inscripciones y avance solo las lee el servidor.

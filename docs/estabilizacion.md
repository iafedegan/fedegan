# Periodo de estabilización (propuesta)

> Propuesta de alcance y tiempos para el periodo posterior al lanzamiento (TDR §15). Los valores son una base para acordar por contrato; no son compromisos hasta que FEDEGÁN–FNG los apruebe.

## Duración

30 días calendario desde el lanzamiento en el dominio institucional.

## Qué cubre

- Corrección de errores del portal entregado (funcionamiento distinto a lo descrito en los manuales).
- Ajustes de contenido migrado que no se vea igual que en el sitio original.
- Apoyo a las personas editoras con dudas de uso del panel.
- Vigilancia de disponibilidad, errores y Core Web Vitals.

## Qué no cubre (soporte evolutivo)

Funcionalidades nuevas, módulos opcionales no contratados, rediseños, contenido nuevo masivo, integraciones dentro de aplicaciones de terceros. Se pactan aparte.

## Severidad y tiempos de respuesta (horario hábil, lunes a viernes 8:00 a 17:00)

| Severidad | Ejemplo | Primera respuesta | Meta de solución |
|---|---|---|---|
| Crítica | El portal no carga, el panel no permite publicar | 2 horas | 1 día hábil |
| Alta | Una sección o formulario no funciona; fallan redirecciones importantes | 4 horas | 3 días hábiles |
| Media | Error visual o de texto con alternativa | 1 día hábil | 5 días hábiles |
| Baja | Mejora menor o duda | 2 días hábiles | Siguiente ajuste |

## Canales

Correo del equipo de soporte acordado y las alertas automáticas de GitHub (`salud.yml`). Cada solicitud queda con número, severidad y fecha.

## Criterios de cierre

- 7 días seguidos sin incidencias críticas ni altas.
- Disponibilidad ≥ 99,5 % (según `/api/salud` y el monitor).
- Core Web Vitals en móvil dentro de las metas: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 (informe de `rendimiento.yml`).
- Equipo editorial capacitado y manuales entregados ([`manual-editor.md`](manual-editor.md)).
- Acta de cierre firmada y accesos traspasados ([`traspaso.md`](traspaso.md)).

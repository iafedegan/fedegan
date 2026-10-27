# Arquitectura del portal

Portal institucional de FEDEGÁN–FNG como **hub del ecosistema digital**: una entrada común (navegación, búsqueda e identidad centralizadas) donde cada línea de valor es un «local». Este documento resume cómo está construido y por qué (TDR §7).

## Vista general

```
Navegador / PWA ──► Vercel (CDN + Next.js 16, App Router)
                       │  Páginas estáticas/ISR  ·  Server Components  ·  Server Actions  ·  Route handlers
                       ├──► Supabase (Postgres + Storage)   contenido editable, diseño, actividad, Escuela Virtual
                       ├──► API de CONtexto Ganadero        noticias (solo lectura, clave en el servidor)
                       ├──► Microsoft Entra ID              acceso de funcionarios y roles (modo demostración mientras tanto)
                       └──► Google Tag Manager              solo con consentimiento de cookies
GitHub ──► CI (lint + pruebas + build) ──► despliegue automático a Vercel
```

## Principios

- **Contenido separado de presentación**: los textos y listados viven en la base (CMS) o en el código de respaldo; los componentes solo los pintan.
- **Nunca vacío**: si el CMS no responde, el portal usa el contenido de respaldo de `src/content/` y se sigue viendo.
- **Estático donde se pueda**: las páginas se pre-renderizan y se revalidan al editar (`updateTag('cms')`) o por tiempo.
- **Seguridad por capas**: lectura pública restringida por RLS (solo `published`), escritura solo desde el servidor con la clave de servicio, roles por Entra ID, claves de API cifradas (AES-256-GCM), cabeceras CSP/HSTS.
- **Sin dependencia de un proveedor**: todo es estándar (Next.js, Postgres, SQL en `docs/migraciones/`). Ver el plan de salida en [`traspaso.md`](traspaso.md).

## Estructura del código

| Ruta | Contenido |
|---|---|
| `src/app/` | Páginas y rutas (App Router). `admin/` es el panel; `api/` los endpoints; `seccion/[slug]/[[...ruta]]` las secciones migradas |
| `src/components/ui` | Piezas base del sistema de diseño (Button, Card, Badge, Input…) |
| `src/components/blocks` | Bloques de página componibles (home, listados, formularios) |
| `src/components/{layout,admin,design,lms,pagos,observatorio,legacy,scroll-world}` | Marco del sitio, panel, diseño editable, Escuela Virtual, pagos, observatorio, contenido migrado, recorrido |
| `src/lib/cms` | Cliente de Supabase, lectura con respaldo (`content.ts`), definición de tipos editables (`entities.ts`), acciones, claves cifradas |
| `src/lib/design` | Motor de diseño editable (regiones, piezas, ticker, anuncios) con borrador/publicar/deshacer |
| `src/lib/contexto.ts` | Cliente de la API de CONtexto (reintento, última respuesta buena, clave del panel o de entorno) |
| `src/content/` | Contenido de respaldo (`site.ts`) y copia migrada del portal actual (`legacy/portal.json`) |
| `docs/` | Documentación; `docs/migraciones/` el SQL de Supabase en orden |
| `scripts/` | Utilidades: exportar contenido, verificar redirecciones, inventario de componentes |
| `tests/` | Pruebas automáticas (`npm test`) |

Inventario de componentes: [`inventario-componentes.md`](inventario-componentes.md) · Reglas de uso: [`sistema-de-diseno.md`](sistema-de-diseno.md).

## Modelo de datos (Supabase)

| Tabla | Para qué | Migración |
|---|---|---|
| `locales`, `stats`, `publications`, `events`, `faqs`, `partners`, `nav_items` | Contenido editable (lectura pública solo `published`) | 000 y 003 |
| `audit_log` | Quién cambió qué (solo servidor) | 000 |
| `legacy_pages` | Texto editado de las páginas migradas (reemplaza a `portal.json` página por página) | 010 |
| `site_settings` | Diseño publicado, borradores y claves de API cifradas (solo `design_layout` es público) | 001 |
| `portal_uso` | Uso anónimo del portal, con consentimiento | 002 |
| `lms_*` | Escuela Virtual: cursos, estudiantes, cuentas, certificados | 004 a 009 |
| Storage `media` | Fotos y PDF subidos desde el panel (5 MB) | 000 |

## Roles

Definidos en `src/lib/access.ts` y leídos del token de Entra ID: `funcionario`, `portal.editor`, `portal.admin`, `contexto.editor`, `contexto.admin`. Solo `portal.admin` cambia claves de API; `portal.editor` edita contenido.

## Endpoints

| Ruta | Función |
|---|---|
| `/api/salud` | Estado del portal y del CMS (200/503), para el monitor |
| `/api/vitals` | Recibe Core Web Vitals reales del navegador |
| `/api/uso` | Registro de uso con consentimiento |
| `/api/estado-contexto` | Diagnóstico de la conexión con CONtexto |
| `/api/cron/publicar` | Tarea diaria que activa el contenido con fecha programada |
| `/api/auth/*` | Autenticación (Auth.js) |

## Variables de entorno

Ver `.env.example` y la tabla completa en [`traspaso.md`](traspaso.md).

## Calidad y entrega continua

- `npm run lint`, `npm test` (pruebas de búsqueda, cifrado, saneado del diseño y redirecciones) y `npm run build` corren en cada cambio (`.github/workflows/ci.yml`).
- `salud.yml` vigila `/api/salud` cada 30 minutos; `rendimiento.yml` mide Core Web Vitals cada semana; Dependabot propone actualizaciones.
- Cada despliegue de Vercel se puede revertir con *Instant Rollback*.

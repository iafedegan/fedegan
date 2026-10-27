# Operación, entornos y respaldos

## Entornos
- **Producción**: rama `main` → despliegue automático en Vercel.
- **Staging**: cada rama/PR genera una URL de preview en Vercel. Para un staging fijo, cree en Vercel un entorno personalizado `staging` ligado a la rama `staging` y use un proyecto Supabase aparte.
- **CI**: `.github/workflows/ci.yml` corre lint y build en cada PR y en `main`. Active en GitHub la regla de rama «exigir CI» para bloquear merges que fallen.

## Variables de entorno
Ver `.env.example`. Claves: `SUPABASE_*`, `GEMINI_API_KEY` (asistente de estudio de la Escuela Virtual; ponerla en Vercel → Settings → Environment Variables y redesplegar), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `CRON_SECRET`, `AUTH_*`.

## Monitoreo y alertas
- `GET /api/salud` devuelve 200/503. El flujo `.github/workflows/salud.yml` lo consulta cada 30 minutos y GitHub avisa por correo si falla; para alertas por minuto use además un monitor externo (UptimeRobot, Better Stack).
- `.github/workflows/rendimiento.yml` mide Core Web Vitals (Lighthouse móvil) cada lunes y guarda el informe como artefacto.
- Core Web Vitals reales llegan a los logs de Vercel (`[vitals]`) y al `dataLayer` de GTM (evento `web_vitals`).
- En Vercel active *Alerts* por errores y picos de latencia.

## Respaldos
- **Base de datos (Supabase)**: respaldos diarios automáticos en planes pagos (retención según plan); para mayor garantía, programe `pg_dump` semanal a un bucket externo.
- **Archivos (Storage)**: copie el bucket periódicamente (`supabase storage cp` / rclone).
- **Código**: Git en GitHub; cada despliegue de Vercel es recuperable con *Instant Rollback*.
- **Prueba de restauración**: trimestral, en el proyecto de staging.

## Exportar el contenido
`npm run exportar` guarda el contenido del CMS en `exportacion/<fecha>/` (con `-- --archivos` también los archivos subidos). Programarlo cada semana junto con el respaldo de la base.

## Pruebas
`npm test` corre las pruebas automáticas (búsqueda, cifrado de claves, saneado del diseño y redirecciones). También corren en el CI.

## Más documentación
[`arquitectura.md`](arquitectura.md) · [`traspaso.md`](traspaso.md) · [`lanzamiento.md`](lanzamiento.md) · [`estabilizacion.md`](estabilizacion.md)

## Migraciones SQL
En `docs/migraciones/`, en orden (000, 001, 002, 003…), idempotentes. Ejecutar en el SQL Editor de Supabase.

## Antes de salir a producción (pendientes que no son de código)
1. Apuntar el dominio y poner `NEXT_PUBLIC_SITE_URL`.
2. Conectar Azure real y **quitar `AUTH_DEMO_MODE`** del entorno de producción.
3. Las redirecciones 301 de las páginas migradas se generan solas (`src/content/legacy/redirects.ts`); cargar además el inventario de URLs del Drupal actual en `legacyRedirects` (`next.config.ts`) y comprobar con `npm run verificar:redirecciones -- <url>`.
4. Crear el contenedor de GTM y poner `NEXT_PUBLIC_GTM_ID`.
5. Fijar `CRON_SECRET` en Vercel.

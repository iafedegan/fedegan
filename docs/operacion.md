# Operación, entornos y respaldos

## Entornos
- **Producción**: rama `main` → despliegue automático en Vercel.
- **Staging**: cada rama/PR genera una URL de preview en Vercel. Para un staging fijo, cree en Vercel un entorno personalizado `staging` ligado a la rama `staging` y use un proyecto Supabase aparte.
- **CI**: `.github/workflows/ci.yml` corre lint y build en cada PR y en `main`. Active en GitHub la regla de rama «exigir CI» para bloquear merges que fallen.

## Variables de entorno
Ver `.env.example`. Claves: `SUPABASE_*`, `GEMINI_API_KEY` (asistente de estudio de la Escuela Virtual; ponerla en Vercel → Settings → Environment Variables y redesplegar), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `CRON_SECRET`, `AUTH_*`.

## Monitoreo y alertas
- `GET /api/salud` devuelve 200/503. Apúntele un monitor externo (UptimeRobot, Better Stack) cada minuto con alerta por correo.
- Core Web Vitals reales llegan a los logs de Vercel (`[vitals]`) y al `dataLayer` de GTM (evento `web_vitals`).
- En Vercel active *Alerts* por errores y picos de latencia.

## Respaldos
- **Base de datos (Supabase)**: respaldos diarios automáticos en planes pagos (retención según plan); para mayor garantía, programe `pg_dump` semanal a un bucket externo.
- **Archivos (Storage)**: copie el bucket periódicamente (`supabase storage cp` / rclone).
- **Código**: Git en GitHub; cada despliegue de Vercel es recuperable con *Instant Rollback*.
- **Prueba de restauración**: trimestral, en el proyecto de staging.

## Migraciones SQL
En `docs/migraciones/`, en orden (001, 002, 003…), idempotentes. Ejecutar en el SQL Editor de Supabase.

## Antes de salir a producción (pendientes que no son de código)
1. Apuntar el dominio y poner `NEXT_PUBLIC_SITE_URL`.
2. Conectar Azure real y **quitar `AUTH_DEMO_MODE`** del entorno de producción.
3. Cargar el inventario de URLs del Drupal actual para completar las redirecciones 301 (`next.config.ts`).
4. Crear el contenedor de GTM y poner `NEXT_PUBLIC_GTM_ID`.
5. Fijar `CRON_SECRET` en Vercel.

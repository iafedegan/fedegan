# Traspaso, accesos y plan de salida

Inventario de lo que FEDEGÁN–FNG debe tener bajo su control al recibir el proyecto (TDR §14 y §15). Nunca se guardan claves en el repositorio: se guardan en el gestor de contraseñas institucional.

## 1. Cuentas y servicios

| Servicio | Para qué | Estado hoy | Responsable institucional |
|---|---|---|---|
| GitHub (`iafedegan/fedegan`) | Código, CI y automatizaciones | Activo | _por designar_ |
| Vercel (proyecto `fedegan`) | Alojamiento, CDN, despliegue, cron | Activo | _por designar_ |
| Supabase (proyecto `FEDEGANWEB`) | Base de datos y archivos | Activo | _por designar_ |
| Microsoft Entra ID | Acceso de funcionarios (SSO) | Pendiente de registrar la aplicación | _por designar_ |
| Google Tag Manager / GA4 | Analítica con consentimiento | Pendiente de crear el contenedor | _por designar_ |
| Dominio `fedegan.org.co` (DNS) | Dirección pública | Sin apuntar al portal nuevo | _por designar_ |
| CONtexto Ganadero | Noticias (API) | Activo; claves en `/admin/apis` | _por designar_ |

**Acción de traspaso**: pasar la propiedad de GitHub, Vercel y Supabase a cuentas institucionales (organización de FEDEGÁN) y dejar a la firma contratista solo con el acceso acordado para el periodo de estabilización.

## 2. Variables de entorno

Se configuran en Vercel → Settings → Environment Variables (Production) y, para trabajar en local, en `.env.local`.

| Variable | Obligatoria | Qué es |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Sí | Conexión pública al CMS (no son secretas) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Escritura del panel. **Secreta** |
| `AUTH_SECRET` | Sí | Firma de sesiones y cifrado de claves del panel. **Secreta**; si cambia hay que volver a cargar las claves de `/admin/apis` |
| `NEXT_PUBLIC_SITE_URL` | Al salir a producción | Dominio público (sitemap, robots, canonical) |
| `CONTEXTO_API_URL`, `CONTEXTO_API_KEY` | Sí* | API de CONtexto (*o guardar la clave desde `/admin/apis`) |
| `CRON_SECRET` | Sí | Protege la tarea diaria de publicación programada |
| `AUTH_MICROSOFT_ENTRA_ID_ID`, `_SECRET`, `_ISSUER` | Para Azure real | Registro de la aplicación en Entra ID |
| `AUTH_DEMO_MODE` | **Quitar en producción** | Permite entrar con cuentas de ejemplo |
| `NEXT_PUBLIC_GTM_ID` | Para analítica | Contenedor de GTM |
| Otras opcionales | No | Ver `.env.example` |

## 3. Recrear el entorno desde cero

1. Crear un proyecto en Supabase y ejecutar en el SQL Editor, en orden, los archivos de `docs/migraciones/` (`000`, `001`, `002`…).
2. Crear el proyecto en Vercel desde el repositorio y cargar las variables de la tabla anterior.
3. Entrar a `/admin` con una cuenta con rol `portal.admin` y cargar el contenido (o restaurarlo con la exportación, ver abajo).
4. Verificar `/api/salud` y `npm run verificar:redirecciones -- <url>`.

## 4. Rotar una clave

- **Clave de CONtexto**: `/admin/apis` → pegar la nueva (se verifica antes de guardarla).
- **Supabase**: Project Settings → API → regenerar y actualizar la variable en Vercel; redesplegar.
- **`AUTH_SECRET`**: generar uno nuevo (`openssl rand -base64 32`), actualizar en Vercel y volver a cargar las claves de `/admin/apis`.

## 5. Plan de salida (sin dependencia del proveedor)

El portal no queda atado a ninguna plataforma:

| Pieza | Estándar | Cómo salir |
|---|---|---|
| Código | Next.js (Node) | Se despliega en cualquier hosting de Node o contenedor (`npm run build && npm start`) |
| Base de datos | PostgreSQL | `pg_dump`, o `npm run exportar` para JSON; el esquema está en `docs/migraciones/` |
| Archivos | Objetos públicos | `npm run exportar -- --archivos` descarga el bucket `media` |
| Contenido migrado | JSON en el repositorio | `src/content/legacy/portal.json` |
| Identidad | OIDC (Entra ID) | Cualquier proveedor OIDC con ajuste mínimo en `src/auth.ts` |
| Redirecciones | Reglas en `next.config.ts` | Se generan solas desde `portal.json` |

`npm run exportar` guarda en `exportacion/<fecha>/` el contenido del CMS; **nunca** exporta las claves de API guardadas en el panel.

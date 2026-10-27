# Portal FEDEGÁN–FNG

Portal institucional de la Federación Colombiana de Ganaderos y hub de su ecosistema digital, construido según el **TDR Ecosistema FEDEGÁN V5.0**: una entrada común con navegación, búsqueda e identidad centralizadas, donde cada línea de valor es un «local».

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** (tokens en `src/app/globals.css`)
- **Supabase** (Postgres + Storage) como CMS propio, con panel en `/admin`
- **Auth.js** con Microsoft Entra ID (modo demostración mientras se conecta Azure)
- **CONtexto Ganadero** (API) para las noticias
- **Vercel** (CDN y despliegue), **GitHub Actions** (CI, salud y rendimiento), PWA instalable

## Cómo correr

```bash
npm install
cp .env.example .env.local   # completar las variables (ver docs/traspaso.md)
npm run dev                  # http://localhost:3000
```

Sin Supabase configurado el portal funciona con el contenido de respaldo de `src/content/`; el panel `/admin` muestra el modo solo lectura.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` / `build` / `start` | Desarrollo, compilación y servidor de producción |
| `npm run lint` | ESLint |
| `npm test` | Pruebas automáticas (búsqueda, cifrado, saneado del diseño, redirecciones) |
| `npm run exportar` | Exporta el contenido del CMS a `exportacion/` (`-- --archivos` incluye los archivos subidos) |
| `npm run verificar:redirecciones -- <url>` | Comprueba que cada URL antigua responde 301 a su nueva ruta |
| `npm run inventario` | Regenera `docs/inventario-componentes.md` |

## Qué cubre del TDR

| Requisito | Dónde |
|---|---|
| Sistema de diseño, librería y catálogo (E1) | `src/components/ui`, `/componentes`, `docs/sistema-de-diseno.md`, `docs/inventario-componentes.md` |
| Navegación, páginas base y legales (E2) | Menú administrable, pie, `/privacidad`, `/terminos`, `/transparencia`, `/mapa-del-sitio` |
| Home, secciones y buscador (E3) | Home configurable con editor de diseño, `/buscador` con relevancia, accesos a servicios |
| Migración con redirecciones 301 (E4) | `src/content/legacy/` (305 páginas, editables en `/admin/paginas`), `src/content/legacy/redirects.ts` (299 redirecciones generadas) |
| Infraestructura, CI y observabilidad (E5) | `.github/workflows/`, `/api/salud`, `/api/vitals`, `docs/operacion.md` |
| Lanzamiento (E6) | `docs/lanzamiento.md` |
| Capacitación y transferencia (E7) | `docs/manual-editor.md`, `docs/traspaso.md`, `docs/arquitectura.md` |
| CMS con publicación programada | `/admin` (campo «Publicar desde» y tarea diaria) |
| Seguridad, SEO y analítica con consentimiento | Cabeceras CSP/HSTS, canonical, datos estructurados, sitemap, GTM tras aceptar cookies |
| Módulo A (SSO internos) | Entra ID listo; falta registrar la aplicación (`docs/traspaso.md`) |

## Documentación

- [`docs/arquitectura.md`](docs/arquitectura.md) — cómo está construido y por qué
- [`docs/operacion.md`](docs/operacion.md) — entornos, monitoreo, respaldos y lista previa al lanzamiento
- [`docs/traspaso.md`](docs/traspaso.md) — cuentas, variables de entorno, rotación de claves y plan de salida
- [`docs/lanzamiento.md`](docs/lanzamiento.md) — cambio de dominio, verificación y marcha atrás
- [`docs/estabilizacion.md`](docs/estabilizacion.md) — periodo posterior al lanzamiento (propuesta)
- [`docs/manual-editor.md`](docs/manual-editor.md) — manual del editor y plan de capacitación
- [`docs/sistema-de-diseno.md`](docs/sistema-de-diseno.md) · [`docs/inventario-componentes.md`](docs/inventario-componentes.md)
- `docs/migraciones/` — SQL de Supabase, en orden (000, 001, …)

## Pendiente de decisiones o credenciales de FEDEGÁN

Dominio definitivo, registro de la aplicación en Entra ID, contenedor de GTM, inventario de URLs del Drupal actual, módulo de registro de usuarios externos (opcional B) y la decisión sobre los demás módulos opcionales.

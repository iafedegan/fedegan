# Portal FEDEGÁN–FNG — base tecnológica

Prototipo funcional del nuevo portal institucional, construido como base técnica real
(no solo maqueta) para el proyecto descrito en **TDR Ecosistema FEDEGAN V5.0**.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 (tokens de diseño en `src/app/globals.css`)
- Arquitectura de componentes: `src/components/ui` (base) + `src/components/blocks` (bloques de página tipo page-builder)

## Cómo correr

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Qué cubre este avance del TDR

| Requisito del TDR | Estado |
|---|---|
| 5.1 Arquitectura de información y navegación por tareas | ✅ Home, navrail, footer |
| 5.1 Diseño modular tipo page builder | ✅ `src/components/blocks/*` son bloques componibles |
| 5.2 Sistema de diseño y tokens | ✅ `globals.css`, ver `/componentes` |
| 5.2 Catálogo visual navegable de componentes | ✅ Ruta `/componentes` |
| 5.2 Demostración de 3 escenarios de cambio de layout | ✅ Demo interactiva en `/componentes` |
| 4.1 Páginas institucionales base | ✅ Quiénes somos, Programas, Normatividad, Servicios, FAQ, Contacto |
| 4.1 Noticias / publicaciones / eventos (listado + detalle) | ✅ Con contenido de ejemplo |
| 4.1 Buscador de contenido | ✅ `/buscador`, búsqueda cliente sobre índice estático |
| 5.3 Redirecciones 301 / tabla de equivalencias | ✅ Ejemplo en `next.config.ts` (`legacyRedirects`) |
| 6.4 Sitemap, robots, metadatos | ✅ `src/app/sitemap.ts`, `robots.ts`, metadata por página |
| 4.1 Landing/accesos a servicios existentes | ✅ Escuela Virtual, TVGAN, Mi FEDEGÁN (landing "próximamente") |

## Qué queda fuera de este avance (requiere decisiones/credenciales de FEDEGÁN)

- **CMS headless real** y operación editorial autónoma (hoy el contenido vive en `src/content/site.ts` como datos de ejemplo).
- **Migración real de contenido** desde el portal Drupal actual (requiere acceso al sitio/BD actual).
- **Infraestructura en nube, CDN, CI/CD y observabilidad** (requiere cuenta cloud del cliente).
- **Identidad**: SSO interno (Microsoft Entra ID) y CIAM externo (Google Identity Platform o equivalente) — módulos opcionales A/B del TDR.
- **Analítica (GTM/GA4) y SEO tooling** — módulos opcionales D/E.
- **Automatizaciones con IA** — módulo opcional F.

Estos puntos están **preparados arquitectónicamente** (componentes desacoplados del contenido,
rutas listas para paginar sobre datos de un CMS, capa de identidad no bloqueante) pero su
implementación real depende de que FEDEGÁN defina proveedor cloud, tenant de Entra ID, y
alcance de los módulos opcionales a contratar.

# Plan de lanzamiento y continuidad

Pasos para pasar de `fedegan.vercel.app` al dominio institucional sin perder contenido ni posicionamiento (TDR §5.3, §6.4 y §14: continuidad editorial y operativa).

## Antes (T − 7 días)

- [ ] Reducir el TTL del DNS de `fedegan.org.co` (p. ej. 300 s).
- [ ] Poner en Vercel: `NEXT_PUBLIC_SITE_URL=https://www.fedegan.org.co`, `CRON_SECRET`, `NEXT_PUBLIC_GTM_ID`, y **quitar `AUTH_DEMO_MODE`**.
- [ ] Registrar la aplicación en Entra ID, cargar `AUTH_MICROSOFT_ENTRA_ID_*` y probar con una cuenta real de cada rol.
- [ ] Cargar el inventario de URLs del Drupal actual y completar las redirecciones (las 299 de las páginas migradas ya se generan solas).
- [ ] Congelar contenido nuevo en el sitio actual desde T − 2 (o anotar lo publicado para repetirlo).
- [ ] Revisar `docs/operacion.md` → «Antes de salir a producción» y el informe de migración (adjuntos rotos que alguien debe reponer).

## Verificación previa (en el entorno definitivo)

```bash
npm test
npm run verificar:redirecciones -- https://www.fedegan.org.co   # debe decir 299/299
curl -s https://www.fedegan.org.co/api/salud                    # ok: true
```

## Día del lanzamiento

1. Agregar el dominio en Vercel y apuntar el DNS.
2. Confirmar HTTPS y que `sitemap.xml` y `robots.txt` usan el dominio nuevo.
3. Ejecutar la verificación de redirecciones y revisar 10 URLs antiguas a mano.
4. Enviar `sitemap.xml` a Google Search Console y comprobar GTM con el consentimiento activo.
5. Avisar al equipo editorial: desde ahora se publica solo en `/admin` y en CONtexto.

## Si algo falla (marcha atrás)

- Vercel → Deployments → *Instant Rollback* al despliegue anterior (segundos).
- Si es de DNS: devolver los registros anteriores (por eso el TTL bajo).
- El sitio actual sigue intacto hasta confirmar el cambio.

## Primeras 72 horas

- Mirar `salud.yml` (debe estar en verde), los logs `[vitals]` de Vercel y Search Console (errores de rastreo y 404).
- Revisar las 404 más visitadas y añadir su redirección en `next.config.ts` (`legacyRedirects`).
- Reunión de cierre con el equipo editorial y primera lista de ajustes.

Después empieza el periodo de estabilización ([`estabilizacion.md`](estabilizacion.md)).

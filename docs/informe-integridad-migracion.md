# Informe de integridad de la migración de contenido (E4)

Generado el 2026-10-23 con `node scripts/migracion/auditar.mjs` sobre `src/content/legacy/portal.json`.

## Resumen

| Medida | Valor |
|---|---|
| Secciones | 14 |
| Páginas migradas | 439 |
| Páginas con redirección 301 desde su URL anterior | 433 |
| Enlaces internos (/seccion/…) | 598 |
| Enlaces internos rotos | 0 |
| Páginas sin sección | 0 |
| Páginas fuera del menú lateral | 0 |
| Nodos del menú sin página | 0 |
| Páginas vacías (vacías también en el origen) | 3 |
| Archivos adjuntos enlazados (PDF, Excel, Word…) | 123 |
| Tableros y videos incrustados | 199 |
| Enlaces a sitios externos | 687 |
| Páginas del portal anterior enlazadas y no migradas | 22 |

## Por sección

| Sección | Páginas | Bloques | Vacías |
|---|---:|---:|---:|
| Programas (`programas`) | 83 | 1020 | 0 |
| Normatividad (`normatividad`) | 8 | 153 | 0 |
| Publicaciones (`publicaciones`) | 125 | 1012 | 2 |
| Cifras del Sector (`cifras-del-sector`) | 50 | 140 | 1 |
| FNG (`fng`) | 72 | 1076 | 0 |
| FEP (`fep`) | 20 | 50 | 0 |
| Sistema Integrado de Gestión (`sistema-integrado-de-gestion`) | 28 | 121 | 0 |
| Cartas de Presidencia (`cartas-de-presidencia`) | 35 | 207 | 0 |
| Servicios (`servicios-fedegan`) | 10 | 98 | 0 |
| Atención a la ciudadanía (`atencion-ciudadania`) | 1 | 23 | 0 |
| Políticas SG-SST (`sg-sst`) | 1 | 31 | 0 |
| Sala de Prensa (`sala-de-prensa`) | 1 | 25 | 0 |
| Campañas y avisos (`pagos-y-campanas`) | 8 | 71 | 0 |
| Columna del Presidente (`columna-presidente`) | 9 | 111 | 0 |

## Hallazgos

### Enlaces internos rotos

Ninguno.

### Páginas vacías

No tienen cuerpo en el portal anterior (verificado en la página original); la página nueva lo indica y remite al portal actual.

- `cifras-interactivas`
- `publicacion-presentaciones/mercado-de-la-carne-coyuntura-y-perspectivas`
- `publicacion-multimedia/una-vaca-por-la-paz`

### Páginas muy cortas (<80 caracteres, sin tabla ni incrustado)

- `publicacion/publicaciones_ventas/ventas`
- `publicacion-multimedia/beneficiarios-en-casanare-donacion-vacas-claro`

### Páginas del portal anterior enlazadas que no se migraron

Responden con la portada de la sección, con error 403 o no son contenido de sección (portada, quiénes somos, noticias, eventos). Los enlaces siguen apuntando al portal anterior.

- `programas/recaudo-cuota-del-fomento-ganadero` (desde `programas`, `programas/inteligencia-de-mercado`)
- `(portada)` (desde `multimedia-general`, `educacion-sanitaria`)
- `quienes-somos` (desde `programa/fomento-al-consumo`, `servicios/vias-terciarias`, `programas/alimentando-la-esperanza`)
- `programas/fiebre-aftosa` (desde `normatividad/parafiscalidad`)
- `programas/tuberculosis-bovina` (desde `normatividad/salud-y-bienestar-animal`)
- `noticias/cifras-preliminares-en-7-semanas-del-ii-ciclo-contra-aftosa-colombia-ha-vacunado-274` (desde `sala-de-prensa/cursos-fedegan-fng`)
- `noticias/ciclo-ii-de-vacunacion-contra-aftosa-programacion-para-inmunizar-los-bovinos-y-bufalinos` (desde `sala-de-prensa/cursos-fedegan-fng`)
- `noticias/historico-de-acuerdo-con-cifras-preliminares-colombia-logro-la-mayor-cobertura-de` (desde `sala-de-prensa/cursos-fedegan-fng`)
- `noticias/fedegan-fng-apoya-la-formacion-de-ganaderos-sostenibles-en-cundinamarca` (desde `sala-de-prensa/cursos-fedegan-fng`)
- `forum` (desde `servicios/chats-y-foros`)
- `noticias/el-antojo-la-finca-donde-medir-cada-decision-convirtio-un-capricho-en-un-referente-bufalino` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/en-nuestra-tierra-la-vista-del-amo-produce-el-ganado-karolyn-corzo-del-rancho-el-herradero` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/cuando-el-mercado-de-la-leche-se-cerro-esta-ganaderia-encontro-en-los-quesos-la-salida-la` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/expectativa-por-censo-del-chino-santandereano-poblacion-podria-superar-los-1000-ejemplares` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/junta-directiva-de-fedegan-manifiesta-su-respaldo-la-candidatura-de-abelardo-de-la` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/colombia-ha-inmunizado-contra-fiebre-aftosa-144-millones-de-bovinos-y-bufalinos` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/ciclo-i-de-2026-ha-vacunado-contra-fiebre-aftosa-el-343-del-hato-ganadero-colombiano` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `noticias/organizacion-mundial-de-sanidad-animal-declaro-amazonas-vaupes-y-miraflores-guaviare-como` (desde `sala-de-prensa/comunicados-y-boletines-de-prensa`)
- `convenio-de-innovacion-con-el-sena` (desde `programas/programa-nacional-de-formacion-de-capital-humano`)
- `node/444` (desde `programas/ganaderia-colombiana-sostenible`)
- `noticias/aplicativo-planeacion-y-produccion-forrajera-dias-de-uso-de-la-pastura-y-recomendaciones` (desde `programas/programa-de-alimentacion-bovina`)
- `noticias/nuevo-proyecto-desarrollo-sostenible-ganadero-en-sucre` (desde `programas/programa-zonas-ganaderas-competitivas`)

## Cómo repetir la verificación

```bash
python3 scripts/migracion/completar.py   # trae del Drupal las páginas enlazadas que falten
node scripts/migracion/auditar.mjs --http # regenera este informe
```

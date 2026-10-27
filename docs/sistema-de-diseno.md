# Sistema de diseño — reglas de uso

- **Tokens** en `src/app/globals.css` (colores `--fg-*`, tipografías `--font-display`/`--font-body`, radios y bordes de 1 px). No use colores sueltos: use variables.
- **Componentes base** `src/components/ui` (Button, Card, Badge, Input, PageHeader, WaveCard, PhotoCard…); **bloques** `src/components/blocks` componen páginas. Catálogo vivo en `/componentes` e inventario completo en [`inventario-componentes.md`](inventario-componentes.md) (se genera con `npm run inventario`).
- **Páginas interiores**: `PageHeader` + `Container`; título en español, una acción primaria por vista.
- **Responsive**: móvil primero; sin scroll horizontal; objetivos táctiles ≥ 40 px (regla `pointer: coarse` en el pie).
- **Accesibilidad**: contraste AA, foco visible, `aria-label` en botones de icono, respetar `prefers-reduced-motion`.
- **Versionado**: cambios al sistema van en un PR propio y se anotan aquí con fecha.

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-23 | Reglas iniciales documentadas |
| 1.1 | 2026-10-26 | Inventario de componentes generado automáticamente |

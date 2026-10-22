# packages/content — Datos del juego

Datos estáticos y textos compartidos entre cliente y servidor.

**Estado:** `board.json` generado y validado.

## Contenido

- `board.json` — tablero completo:
  - 24 mesas, 2 por país.
  - 68 sillas únicas.
  - 28 sillas compartidas.
  - 20 plazas de barra con sus valores.
  - 12 países en orden horario: África, Italia, China, España, URS (Rusia), India, América, Alemania, Turquía, Cuba, Inglaterra y Francia.

## Validación

El archivo cumple las invariantes del juego:

- 24 mesas.
- 68 sillas únicas.
- 28 sillas compartidas.
- 20 plazas de barra.
- Cada mesa tiene exactamente 4 sillas.
- Cada silla compartida pertenece exactamente a 2 mesas.

El mapeo de mesas está documentado en [`docs/referencias/mapeo-mesas.md`](../../docs/referencias/mapeo-mesas.md).

## Pendiente

- `nations.json` con colores, banderas y patrones.
- `rulesets.json` con los presets de reglas (clásica 2009 / 2015).
- `texts/es.json` con los textos de interfaz.

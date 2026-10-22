# packages/content — Datos del juego

Datos estáticos y textos compartidos entre cliente y servidor.

**Estado:** pendiente de implementación.

## Contenido previsto

- `board.json` — 24 mesas, 68 sillas, sillas compartidas y 20 plazas de barra.
- `nations.json` — los 12 países, colores, banderas y patrones.
- `rulesets.json` — presets de reglas (clásica AMIGO 2009 / Rio Grande 2015).
- `texts/es.json` — textos de interfaz y reglas.
- `tools/validate-board.ts` — validación de invariantes del tablero.

Invariantes: 24 mesas, 68 sillas únicas, 28 compartidas, 20 plazas de barra.

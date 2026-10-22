# packages/engine — Motor de reglas

Motor de reglas **puro y determinista**, sin React ni Three.js. Se usa en el cliente, en el servidor y en los tests.

**Estado:** pendiente de implementación.

## Contenido previsto

- `src/game.ts` — creación de partida, estado y turnos.
- `src/moves.ts` — jugadas legales, validación y aplicación.
- `src/scoring.ts` — puntuación por mesa, sillas compartidas, comodines y barra.
- `src/endgame.ts` — condiciones de fin y puntuación final.
- `src/rng.ts` — aleatoriedad con semilla.
- `src/types.ts` — tipos compartidos.
- `tests/` — unitarios, propiedades y validación del tablero.

Reglas de referencia: [`docs/REGLAS.md`](../../docs/REGLAS.md).

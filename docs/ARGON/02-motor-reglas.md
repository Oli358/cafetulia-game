# Fase 2 — Motor de reglas

**Objetivo:** implementar el motor de reglas puro, completo y probado.

```text
TAREA: Implementa el motor de reglas de Cafetulia en packages/engine.

Contexto: lee 00-contexto.md, docs/REGLAS.md y packages/content/board.json.

ESTRUCTURA SUGERIDA
- src/types.ts       Tipos: Nation, Gender, Tile, Seat, Table, Player, GameState, Move.
- src/board.ts       Carga y valida board.json.
- src/rng.ts         RNG con semilla (determinista).
- src/setup.ts       createGame(config, seed): baraja, reparte 5 fichas, elige jugador inicial.
- src/legal.ts       getLegalMoves(state, playerId).
- src/moves.ts       applyMove(state, move): valida, aplica y devuelve estado + eventos.
- src/scoring.ts     scorePlacement(state, placement) con desglose por mesa.
- src/endgame.ts     isTerminal(state), finalScores(state).
- src/index.ts       Exporta la API pública.

REGLAS QUE DEBES CUBRIR
1. Sentar 1 o 2 invitados en mesas, o 1 en la barra, o cambiar un comodín.
2. Nacionalidad: la ficha debe coincidir con una de las nacionalidades permitidas por la silla.
3. Equilibrio de sexos por mesa: 0, 1M+1F, 1M+2F, 2M+1F, 2M+2F.
4. Invitado solo: no permitido, salvo silla compartida con mesa vecina ocupada.
5. Apertura especial del jugador inicial: una ficha sin puntuar si todas las sillas están vacías.
6. Abrir una mesa vacía: si la primera ficha no puntúa, hay que colocar la pareja en el mismo turno.
7. Cada ficha colocada debe puntuar, salvo la apertura.
8. Puntuación: 2→2, 3→3, 4→4; misma nacionalidad: 4, 6, 8.
9. Silla compartida: puntúa en las dos mesas.
10. Dos fichas: se evalúan en orden.
11. Mesa de una sola nacionalidad: reduce la mano en 1 de forma permanente.
12. Comodín: sexo fijo, nacionalidad elegida al sentarse; no va a la barra; cambio sin puntos y sin robar.
13. Barra: orden 1→20, valores +1..+5 y negativos; una ficha por turno; saldo negativo permitido en v1.0.
14. Fin: última silla, plaza 20, jugador sin fichas y sin robar, robar la cuarta por el final.
15. Puntuación final: -5 por ficha en mano, -10 por comodín; empate = victoria compartida.

TESTS OBLIGATORIOS
- Unitarios de cada regla y de cada caso límite de la lista.
- Test de validación del tablero: 24/68/28/20.
- Test de propiedades con fast-check: 1.000 partidas aleatorias con RNG semilla.
  * Ningún estado ilegal.
  * Siempre termina.
  * La puntuación final coincide con la reconstrucción desde el log.
- Test de determinismo: misma semilla = misma partida.

CRITERIOS DE ACEPTACIÓN
- pnpm typecheck y pnpm test en verde.
- 1.000 partidas simuladas sin errores.
- El motor no importa React, Three ni DOM.

AL TERMINAR
- Actualiza docs/SESIONES.md y docs/DECISIONES.md si hace falta.
- Commit: feat: motor de reglas y tests.
- Push a main.
```

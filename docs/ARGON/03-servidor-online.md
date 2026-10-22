# Fase 3 — Servidor online

**Objetivo:** montar el servidor autoritativo con salas, reconexión y persistencia.

```text
TAREA: Implementa el servidor online de Cafetulia en apps/server con Colyseus.

Contexto: lee 00-contexto.md, docs/ARQUITECTURA.md y el motor de packages/engine.

FUNCIONALIDAD
1. Salas privadas de 2 a 4 jugadores con código de 6 caracteres y link directo.
2. Entrada como invitado: nickname + token guardado en el dispositivo. Sin cuentas.
3. El servidor valida todas las jugadas con packages/engine. El cliente solo propone.
4. Configuración de sala antes de empezar:
   - Número de jugadores (2–4).
   - Bots: cantidad y nivel (fácil, medio, difícil), o sin bots.
   - Jugador inicial: aleatorio.
   - Temporizador: activado/desactivado y segundos por turno (máximo 180).
   - Saldo negativo permitido en v1.0.
5. Espectadores: entran en modo solo lectura.
6. Reconexión de 15 segundos; después, expulsión.
   - La mano del expulsado vuelve a la bolsa.
   - Los invitados ya sentados se quedan en el tablero.
   - El expulsado puede volver como espectador.
   - En 2 jugadores, si uno es expulsado, la partida termina y gana quien queda.
7. Temporizador por turno:
   - Al agotarse, el servidor hace una jugada automática sensata: si hay una colocación legal que puntúe, la hace; si no, manda a la barra la ficha menos valiosa; si no puede, pasa.
   - El aviso va al registro de eventos, nunca al chat.
8. Chat de texto con emotes:
   - Canal separado del registro de eventos.
   - Efímero: se difumina con la inactividad y reaparece al escribir.
   - Sin persistencia en base de datos.
9. Persistencia:
   - SQLite + Drizzle para salas, partidas en curso e historial corto de 5 partidas.
   - Guardar cada jugada como evento para poder reconstruir la partida.
10. Revancha: solo si todos votan sí. Si no, se vuelve a la sala.
11. Compartir resultado: el cliente genera una imagen; el servidor solo aporta los datos.

API MÍNIMA
- GET /health
- POST /rooms (crear sala)
- GET /rooms/:code (comprobar sala)
- WebSocket Colyseus para el juego.

TESTS
- Unitarios de la lógica de sala y del temporizador.
- E2E con dos clientes: crear sala, unirse, jugar, reconectar y terminar.
- Test de expulsión: mano a la bolsa, sentados se quedan, espectador al volver.

CRITERIOS DE ACEPTACIÓN
- Dos navegadores distintos pueden jugar una partida completa.
- La reconexión funciona y no hay desincronización.
- El servidor rechaza jugadas ilegales con un error tipado.
- pnpm typecheck y pnpm test en verde.

AL TERMINAR
- Actualiza docs/SESIONES.md.
- Commit: feat: servidor online con salas y reconexión.
- Push a main.
```

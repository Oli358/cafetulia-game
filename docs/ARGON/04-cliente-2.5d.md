# Fase 4 — Cliente 2.5D

**Objetivo:** construir el cliente jugable con tablero 2D, piezas 3D y UI responsive.

```text
TAREA: Implementa el cliente de Cafetulia en apps/web.

Contexto: lee 00-contexto.md, docs/ARTE.md, docs/ARQUITECTURA.md y packages/content/board.json.

BASE
- Vite + React + TypeScript.
- React Three Fiber + Drei para las piezas 3D.
- Zustand para el estado del cliente.
- Tailwind CSS para la interfaz.
- Español en toda la interfaz.

PANTALLAS
1. Portada: "Cafetulia", crear mesa, unirse por código, ajustes.
2. Lobby: jugadores, bots, espectadores, temporizador, opciones, botón de listo.
3. Partida:
   - Tablero 2D fiel a board.json.
   - Fichas, sillas, mesas y barra en 3D, sobresaliendo ligeramente (2.5D papercraft).
   - Cámara en picado o ligeramente inclinada, fija, con zoom y paneo.
   - Mano del jugador abajo; manos de los rivales visibles (son públicas).
   - Marcador, barra, turno activo, temporizador, chat y registro de eventos separados.
   - Detalle de mesa: país, ocupantes, equilibrio de sexos y puntos potenciales.
   - Resaltado de jugadas legales y vista previa de puntos.
4. Final: recuento, penalizaciones, ganador, revancha, compartir resultado.
5. Reglas/ayuda: tutorial sencillo y reglamento consultable.

INTERACCIÓN
- Toca una carta y luego una silla; en escritorio también se puede arrastrar.
- Sillas legales resaltadas; ilegales atenuadas.
- Vista previa: "Mesa Francia: 3er invitado +3; mesa compartida: 4º +4 = +7".
- Si no hay jugada legal en mesas, se ilumina la barra y se explica por qué.
- Confirmación clara antes de una jugada con puntos negativos.
- "¿Por qué no puedo?" con explicación contextual.

RESPONSIVE
- Móvil vertical: tablero arriba, mano en hoja inferior, rivales plegables.
- Escritorio: tablero central, mano abajo, marcador al lado.
- Objetivo: 60 fps en móvil de gama media, carga inicial < 10 MB.
- Modo 2D de respaldo si el rendimiento o WebGL fallan.

PWA
- Manifest, iconos, modo standalone, safe areas.
- Instalable en iPhone y Android.

CRITERIOS DE ACEPTACIÓN
- Se puede jugar una partida completa contra el servidor local.
- No se puede hacer una jugada ilegal desde la interfaz.
- Funciona en móvil y escritorio.
- pnpm typecheck, pnpm test y pnpm build en verde.

AL TERMINAR
- Actualiza docs/SESIONES.md.
- Commit: feat: cliente 2.5D y UI responsive.
- Push a main.
```

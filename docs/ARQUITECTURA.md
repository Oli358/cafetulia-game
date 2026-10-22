# Arquitectura

> Documento de planificación. No hay código todavía. Última actualización: 2026-10-22.

## 1. Stack

| Capa | Tecnología |
|---|---|
| Cliente | Vite + React + TypeScript |
| 3D | React Three Fiber + Drei |
| Estado cliente | Zustand |
| Estilos | Tailwind CSS + componentes propios |
| Animación UI | Motion / CSS |
| Animación 3D | React Spring / maath |
| Servidor | Node.js + Colyseus |
| Persistencia | SQLite + Drizzle (migrable a Postgres) |
| Sonido | Howler |
| PWA | vite-plugin-pwa |
| Tests | Vitest + fast-check + Playwright |
| Deploy | Render (cliente y servidor) |

## 2. Monorepo

```text
cafe-international/
├─ apps/
│  ├─ web/          Cliente
│  └─ server/       Servidor
├─ packages/
│  ├─ engine/       Reglas puras y deterministas
│  ├─ content/      board.json, países, textos, presets
│  └─ ui/           Componentes compartidos
├─ tools/           Scripts de assets y datos
├─ e2e/             Playwright
└─ docs/
```

**Regla de oro:** `packages/engine` no importa React, Three ni nada del navegador. Se puede ejecutar en Node, en el navegador y en tests sin cambios.

## 3. Modelo de datos

### Tablero

- `Table`: id, país, lista de 4 asientos.
- `Seat`: id, lista de mesas a las que pertenece (1 o 2), ocupante opcional.
- `Bar`: 20 posiciones con valor y ocupante opcional.
- Invariantes que validará un test:
  - 24 mesas.
  - 68 asientos únicos.
  - 28 asientos compartidos por exactamente 2 mesas.
  - 20 posiciones de barra.
  - Cada mesa tiene exactamente 4 asientos.

### Estado de partida

```ts
type GameState = {
  players: Player[]
  bag: Tile[]
  hands: Record<PlayerId, Tile[]>
  tables: Table[]
  seats: Seat[]
  bar: (Tile | null)[]
  turn: PlayerId
  handSize: Record<PlayerId, number>
  phase: 'lobby' | 'playing' | 'finished'
  log: MoveEvent[]
}
```

### Ficha

```ts
type Tile = {
  id: string
  nation: Nation | 'joker'
  gender: 'M' | 'F'
  jokerNation?: Nation   // solo si es comodín y está sentado
}
```

### Jugada

```ts
type Move =
  | { type: 'seat';   placements: Placement[] }
  | { type: 'bar';    tileId: string }
  | { type: 'swap';   seatId: string; tileId: string }
```

## 4. Motor de reglas

Funciones puras principales:

- `createGame(config, seed)` — crea la partida y reparte.
- `getLegalMoves(state, playerId)` — jugadas legales para la UI, las pistas y los bots.
- `applyMove(state, move)` — valida, aplica y devuelve estado nuevo + eventos.
- `scorePlacement(state, placement)` — desglose de puntos por mesa.
- `isTerminal(state)` — condiciones de fin.
- `finalScores(state)` — puntuación final con penalizaciones.

**Determinismo:** toda la aleatoriedad usa un RNG con semilla, para poder reproducir partidas, tests y replays.

## 5. Servidor autoritativo

Flujo de una jugada:

1. El cliente propone una jugada (puede previsualizarla localmente con el mismo motor).
2. El servidor valida con `getLegalMoves` + `applyMove`.
3. Si es ilegal, devuelve un error tipado y no cambia el estado.
4. Si es legal, aplica, emite eventos y sincroniza el estado.
5. El cliente actualiza la UI.

**Ventajas:** no hay trampas, no hay desincronización y las reglas viven en un solo sitio.

## 6. Salas y reconexión

- Sala privada con código de 6 caracteres y link directo.
- Jugador invitado con token guardado en el dispositivo; sin cuenta.
- 15 segundos de reconexión; después, expulsión.
- Mano del expulsado a la bolsa; invitados sentados se quedan.
- El expulsado puede volver como espectador.
- Persistencia de la partida para reanudarla si el servidor se reinicia.

## 7. Persistencia

- SQLite para salas, partidas en curso e historial corto.
- Cada jugada se guarda como evento para poder reconstruir la partida.
- Drizzle como ORM; migración a Postgres cuando haga falta escalar.
- **v1.1:** cuentas sencillas, estadísticas globales y dashboard de administrador.

## 8. Tiempo real

- Colyseus gestiona salas, presencia, mensajes y reconexión.
- El estado se sincroniza tras cada jugada; el estado es pequeño (100 fichas, 68 asientos, 20 plazas de barra).
- Chat y eventos de turno van por canales separados.
- Temporizador por turno gestionado por el servidor; al agotarse, jugada automática sensata.

## 9. Espectadores y bots

- **Espectadores:** se unen a la sala en modo solo lectura; ven el tablero y las manos públicas.
- **Bots:** usan `getLegalMoves` + heurística; niveles básico, medio y difícil. Configurables en la sala antes de empezar.

## 10. Testing

| Tipo | Herramienta | Qué cubre |
|---|---|---|
| Unitario | Vitest | Puntuación, género, sillas compartidas, comodines, barra, fin |
| Propiedades | fast-check | 1.000 partidas aleatorias sin estados ilegales |
| Validación de tablero | Vitest | 24 / 68 / 28 / 20 |
| E2E | Playwright | Dos navegadores, sala, reconexión, fin de partida |
| Rendimiento | Lighthouse + DevTools | 60 fps en gama media, <10 MB inicial |
| Visual | Playwright | Capturas de pantallas clave |

## 11. Despliegue

- **Render** para cliente y servidor (plan gratuito).
- El plan gratuito se duerme por inactividad; se valorará keep-alive o una alternativa gratuita si molesta.
- Dominio propio más adelante; mientras, URL de Render.
- Variables de entorno en el panel de Render; nunca en el cliente.
- CI con GitHub Actions: lint, typecheck, tests y build.

## 12. Seguridad y privacidad

- Servidor autoritativo: el cliente nunca decide el estado.
- Validación con Zod en los mensajes.
- Límite de mensajes de chat y saneado de nicknames.
- Sin fotos, voz, nombres reales ni datos personales.
- Token de admin en variable de entorno para el dashboard futuro.
- HTTPS/WSS.

## 13. Rendimiento en móvil

- Presupuesto: <10 MB de carga inicial, <150k triángulos, <100 draw calls, 60 fps.
- Instancing para sillas, mesas y posiciones de barra.
- Texturas en atlas y comprimidas; luces horneadas; sombras suaves.
- Postprocessing solo en escritorio.
- **Modo 2D de respaldo** para móviles lentos, accesibilidad o fallo de WebGL.

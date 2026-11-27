# Guía de estructura del proyecto

> Cafetulia — base estable del TFG. Última actualización: 28/11/2026.
> Este documento explica qué hay en cada carpeta y archivo, qué lenguaje usa y por dónde empezar a leer.

## 1. Resumen rápido

Cafetulia es un **monorepo de TypeScript** gestionado con **pnpm workspaces**:

- **Cliente:** React 19 + Vite 8 + Tailwind CSS 4 + Three.js/React Three Fiber para el vaso 3D.
- **Servidor:** Node.js 24 (22.5+ obligatorio) + Express 4 + Zod + SQLite (`node:sqlite`).
- **Motor de reglas:** TypeScript puro, sin React, sin DOM y sin Three.
- **Tiempo real:** REST con polling cada 1,5 s desde el cliente. Colyseus existe como transporte opcional/legado (`ENABLE_COLYSEUS=1`), pero el flujo real usa la API REST.
- **Calidad:** Vitest para unitarias/propiedades, Playwright para E2E, ESLint + Prettier, TypeScript estricto.
- **Despliegue:** Render (`render.yaml`) con Node 24, plan free y SQLite efímero en `/tmp`.

## 2. Árbol principal

```text
cafe-international/
├─ apps/
│  ├─ web/                  Cliente React + Vite + PWA
│  │  ├─ index.html         Entrada HTML específica del cliente
│  │  ├─ public/            Assets estáticos del cliente
│  │  └─ src/               Código real del cliente
│  └─ server/               Servidor Express + salas + SQLite
│     └─ src/
├─ packages/
│  ├─ engine/               Motor de reglas puro
│  ├─ content/              board.json y tipos del tablero
│  └─ ui/                   Tokens, colores, naciones, monedas, perfiles
├─ e2e/                     Pruebas Playwright
├─ tools/                   Scripts de validación
├─ public/                  Assets servidos por Vite/servidor
├─ docs/                    Documentación del proyecto
├─ src/                     Shim de entrada de Vite (no es la app real)
├─ index.html               Entrada HTML que usa Vite en la raíz
├─ server.ts                Servidor full-stack (API + Vite/estático)
├─ vite.config.ts           Configuración de Vite
├─ vitest.config.ts         Configuración de Vitest
├─ playwright.config.ts     Configuración de Playwright
├─ package.json             Scripts y dependencias raíz
├─ pnpm-workspace.yaml      Paquetes del monorepo
├─ pnpm-lock.yaml           Lockfile
├─ tsconfig*.json           Configuración TypeScript
├─ eslint.config.js         ESLint
├─ render.yaml              Blueprint de Render
├─ .github/workflows/       CI y keepalive
├─ README.md                Presentación (parcialmente desactualizada)
├─ AGENTS.md                Instrucciones para agentes
├─ CAMBIOS.md               Registro de cambios
└─ LICENSE.md               Licencia
```

Carpetas generadas que **no se editan a mano**:

- `node_modules/`: dependencias.
- `dist/`: build de producción.
- `test-results/`: artefactos de Playwright.
- `.opencode/`: configuración local de OpenCode.

## 3. Lenguajes y tecnologías

| Lenguaje/tecnología | Dónde se usa |
|---|---|
| **TypeScript (`*.ts`)** | Motor, servidor, store, utilidades, configuración |
| **TSX (`*.tsx`)** | Componentes React y escenas 3D |
| **CSS + Tailwind 4** | `apps/web/src/index.css` y clases utilitarias |
| **HTML** | `index.html`, `apps/web/index.html` |
| **JSON** | `board.json`, `package.json`, `manifest.webmanifest` |
| **YAML** | `render.yaml`, workflows de GitHub |
| **Markdown** | `docs/`, README, chats |
| **GLB** | Modelos 3D de ingredientes en `public/models/` |
| **PNG/WebP/JPG/SVG** | Logo, iconos, retratos, fondos, capturas |
| **SQLite** | Persistencia del servidor (`node:sqlite`, no ORM) |

Stack principal:

- React 19, React DOM 19, Vite 8, Tailwind CSS 4.
- Three.js 0.174, `@react-three/fiber` 9, `@react-three/drei` 10.
- Motion 12 para animaciones, Zustand 5 para estado del cliente.
- Express 4, Zod, `node:sqlite`, `colyseus` opcional.
- Vitest 3, Playwright, `fast-check`, ESLint, Prettier.
- pnpm 12, Node 24 LTS recomendado.

## 4. `apps/web` — cliente

### Entrada

- **`apps/web/src/main.tsx`**: monta React en `#root` y registra el service worker en producción.
- **`apps/web/src/App.tsx`**: router de pantallas (`title`, `lobby`, `playing`, `finished`), polling de sala, latido `/health` mientras hay sala/partida, guard de orientación y capa de modales.
- **`apps/web/src/index.css`**: Tailwind, variables de diseño, texturas de papel, fondos, animaciones y estilos del tablero.

### Pantallas y componentes (`apps/web/src/components/`)

| Archivo | Qué contiene |
|---|---|
| `Screens.tsx` | `LobbyScreen`, `PlayingScreen` y reexport de `FinishedScreen`; cabecera, marcador, mano, popovers y flujo de partida |
| `ResultScreen.tsx` | Pantalla final, clasificación, revancha y postal de despedida |
| `IllustratedBoard.tsx` | Tablero 2D principal: 24 mesas, 68 sillas, barra, zoom móvil y selección |
| `PapercraftBoard.tsx` | Tablero/diorama 3D que se carga de forma perezosa para el modal «Ver café» |
| `Modals.tsx` | Ajustes, reglas, tutorial, estadísticas, `AnchoredPopover` y capa de modales |
| `CoinTray.tsx` | Fichas de 1/5/10, total animado y vuelo de monedas |
| `PlayerName.tsx` | Nombres de fundador, dorado, aura de corazones |
| `TitlePickers.tsx` | Selectores de avatar y subtítulos |
| `TutorialContent.tsx` | Contenido por capítulos del tutorial |

### Portada y menú 3D (`apps/web/src/title/`)

| Archivo | Qué contiene |
|---|---|
| `TitleExperience.tsx` | Portada, scroll de dos actos, carta de reserva, giro del vaso y entrada a sala |
| `CoffeeMenuScene.tsx` | Escena Three.js del vaso, etiquetas, ingredientes, luces y arrastre |
| `menuModes.ts` | Los tres mundos (`Unirse`, `Reservar`, `Café solo`) y sus ingredientes |
| `cupLabelTexture.ts` | Etiquetas dibujadas en canvas para el vaso |
| `FloatingMenuPapers.tsx` | Papeles de comanda flotantes del póster |
| `LobbyFloatingIngredients.tsx` | Ingredientes decorativos del lobby |

### Estado y utilidades

- **`store/gameStore.ts`**: estado global Zustand y acciones (crear/unirse, snapshot, movimientos, chat, avatares, rematch, historial). Aquí están las llamadas `fetch` a la API.
- **`art/CharacterPortrait.tsx`**: retratos SVG, banderas, logo, avatares y piezas visuales.
- **`audio/soundEngine.ts`**: Web Audio, SFX y música lo-fi con tres atmósferas.
- **`utils/moveHelper.ts`**: previsualización de jugadas, inspección de sillas y estadísticas locales.
- **`utils/achievements.ts`**: cálculo de logros.
- **`utils/playerFlair.ts`**: detección de fundadores y aura.
- **`i18n/`, `scene/`, `state/`, `ui/`**: carpetas/archivos placeholder vacíos; no son la app real.

## 5. `apps/server` — servidor

| Archivo | Qué contiene |
|---|---|
| `src/index.ts` | `createApp` (Express), `createColyseusServer` opcional y exportaciones |
| `src/api/index.ts` | Rutas REST: `/health`, `/rooms`, join, config, ready, bots, start, moves, chat, rematch, leave, history. Valida con Zod y exige token Bearer |
| `src/api/rateLimit.ts` | Rate limiting en memoria por IP/acción |
| `src/rooms/roomManager.ts` | **Núcleo autoritativo**: salas, miembros, configuración, turnos, bots, reconexión, presencia, persistencia |
| `src/rooms/index.ts` | Registro de salas y envoltorio opcional de Colyseus |
| `src/persistence/index.ts` | SQLite con `node:sqlite`: salas, movimientos e historial |
| `src/security.ts` | Cabeceras de seguridad y política de origen |
| `src/server.test.ts` | Tests de API, salas, reconexión, seguridad y persistencia |

El **servidor es la autoridad**: el cliente propone movimientos y el servidor los valida con `packages/engine` antes de aplicarlos.

## 6. `packages/engine` — motor puro

Sin React, sin Three y sin DOM. Es la parte más importante para el TFG.

| Archivo | Qué contiene |
|---|---|
| `types.ts` | Tipos base: `GameState`, `Move`, `Nation`, `Tile`, `Seat`, `Placement`, eventos... |
| `board.ts` | Construcción y validación del tablero |
| `setup.ts` | Reparto inicial, mazo, bolsa y estado de partida |
| `legal.ts` | Generación y validación de jugadas legales |
| `moves.ts` | Aplicación de movimientos y eventos |
| `scoring.ts` | Puntuación de mesas, sillas y barra |
| `endgame.ts` | Condiciones de fin y puntuaciones finales |
| `bot.ts` | IA de los bots |
| `rng.ts` | RNG determinista con semilla |
| `index.ts` | Barrel de exportaciones |

Tests: `packages/engine/tests/` (reglas, tablero y simulación de 1.000 partidas con `fast-check`).

## 7. `packages/content` — datos del tablero

- **`board.json`**: fuente de verdad del tablero (24 mesas, 68 sillas, 28 compartidas, 20 plazas de barra, 12 países).
- **`src/index.ts`**: tipos `BoardData`, `NationDefinition`, etc., y exporta `boardData`.
- **`README.md`**: notas del formato.

No se inventan países, mesas ni sillas: todo sale de aquí.

## 8. `packages/ui` — diseño y dominio compartido

- **`src/index.ts`**: tokens de diseño (colores, radios), estilos de monedas, metadatos visuales de las 12 naciones, perfiles de personajes, modos/estilos de subtítulos, frases del día y utilidades compartidas.

## 9. `e2e`, `tools` y `public`

- **`e2e/tests/smoke.spec.ts`**: suite Playwright (portada, menú, lobby, partida, final, reconexión, fundadores, WebGL).
- **`e2e/src/index.ts`**: constante con el nombre de la suite.
- **`tools/src/index.ts`**: validación del tablero (`validateBoardData`).
- **`public/`**: assets servidos por Vite/servidor: iconos PWA, manifest, `sw.js`, modelos GLB, fondos y marca.
- **`apps/web/public/`**: copia de assets para la configuración Vite específica del cliente. Mantener ambas sincronizadas.

## 10. `docs` — documentación

| Documento | Contenido |
|---|---|
| `PLAN.md` | Visión, alcance, stack y riesgos |
| `REGLAS.md` | Reglamento operativo y casos límite |
| `ARQUITECTURA.md` | Arquitectura, datos y despliegue |
| `ARTE.md` / `ARTE_BIBLE.md` | Dirección de arte y biblia visual |
| `ROADMAP.md` | Versiones y fases |
| `DECISIONES.md` | Registro de decisiones (D-001…) |
| `SESIONES.md` | Registro de sesiones |
| `SEGURIDAD.md` | Auditoría, tokens, rate limiting y estado oculto |
| `DESPLIEGUE-RENDER.md` | Guía operativa de Render |
| `CREDITOS.md` | Modelos 3D, fondos y licencias |
| `CHAT-*.md` | Transcripciones de sesiones |
| `ARGON/` | Contexto y prompts de las fases |
| `referencias/` | Capturas, fotos del tablero y assets de marca |

## 11. Flujo de una partida

1. El cliente entra en `TitleExperience` y crea/une a una sala con `gameStore`.
2. `POST /rooms` o `/rooms/:code/join` crea/une al jugador; el servidor devuelve un `RoomSnapshot` y un token.
3. El cliente cambia a `LobbyScreen`; el poll `GET /rooms/:code` cada 1,5 s mantiene el estado.
4. Al empezar, el servidor crea el `GameState` con `packages/engine` y reparte fichas.
5. El cliente muestra `PlayingScreen` con `IllustratedBoard`; al tocar una ficha, `moveHelper` previsualiza sillas legales.
6. El movimiento se envía a `POST /rooms/:code/moves`; el servidor valida con el motor, aplica, guarda en SQLite y emite eventos.
7. El poll actualiza el snapshot; el cliente reproduce monedas, callouts y cambios de turno.
8. Al terminar, `ResultScreen` muestra clasificación, logros, revancha y vuelta a la sala.

## 12. Por dónde empezar a leer (TFG)

1. **Reglas:** `docs/REGLAS.md`.
2. **Tipos y motor:** `packages/engine/src/types.ts` → `setup.ts` → `legal.ts` → `moves.ts` → `scoring.ts` → `endgame.ts`.
3. **Datos:** `packages/content/board.json` y `packages/content/src/index.ts`.
4. **Servidor autoritativo:** `apps/server/src/rooms/roomManager.ts` y `apps/server/src/api/index.ts`.
5. **Cliente:** `apps/web/src/store/gameStore.ts` → `apps/web/src/components/Screens.tsx` → `IllustratedBoard.tsx`.
6. **Portada/menú 3D:** `apps/web/src/title/TitleExperience.tsx` → `CoffeeMenuScene.tsx` → `menuModes.ts`.
7. **Despliegue:** `docs/DESPLIEGUE-RENDER.md`.

## 13. Comandos

```bash
npx pnpm install
npx pnpm dev          # full-stack en http://127.0.0.1:3000
npx pnpm typecheck
npx pnpm lint
npx pnpm test         # Vitest
npx pnpm test:e2e     # Playwright
npx pnpm build
```

## 14. Notas importantes

- **Node 22.5+ obligatorio** por `node:sqlite`; recomendado Node 24 LTS.
- El **README** todavía menciona Colyseus, 49 tests y 2 E2E; el estado real es REST por defecto, **61 tests** y **6 E2E**. La fuente fiable es el código y `docs/SESIONES.md`.
- `src/` en la raíz **no es la app real**: es un shim que reexporta `apps/web/src/App.tsx` y su CSS. El código real está en `apps/web/src`.
- `apps/web/src/i18n`, `scene`, `state`, `ui` y `index.ts` son placeholders vacíos.
- `dist/`, `node_modules/` y `test-results/` son generados; no se editan.
- El plan free de Render duerme el servicio sin tráfico; el cliente manda latidos solo mientras hay lobby/partida/final. Las salas se pierden si el servidor se reinicia porque SQLite está en `/tmp`.
- El proyecto queda **congelado como base del TFG**: no añadir funcionalidad nueva hasta integrar base de datos, automatizaciones y logros.

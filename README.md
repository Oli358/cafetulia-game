# Cafetulia

> Juego digital cozy inspirado en *Café International* (Rudi Hoffmann, 1989).
> Repositorio: <https://github.com/Oli358/cafetulia-game>
> Nombre comercial decidido: **Cafetulia**.

Juego digital cozy, online y para **2–4 jugadores**, basado en **Café International** (Rudi Hoffmann, 1989, Spiel des Jahres). La propuesta es un **diorama 2.5D**: tablero 2D fiel al original + fichas, sillas, mesas y barra en 3D tipo papercraft. PWA jugable en móvil y PC.

---

## Estado actual

- **v1.4 integrada y verificada (entrega v7): portada y lobby como escena viva de café, 20 SFX de interfaz diferenciados, música lo-fi de 24 compases con 5 capas, crossfades y ducking, más todas las mejoras de la v6 (cabecera en dos filas, menús exclusivos, `Cambiar comodín`, final escenificado y placa `O & A`).**
- Monorepo con pnpm workspaces, TypeScript estricto, ESLint, Prettier, Vitest y Playwright.
- Motor de reglas determinista en `packages/engine`: **49 tests en verde** (motor + servidor + helpers v6/v7) y **1.000 partidas simuladas** con `fast-check`.
- `packages/content/board.json` validado: **24 mesas, 68 sillas, 28 compartidas y 20 plazas de barra**.
- Servidor autoritativo con Colyseus: salas privadas de 6 caracteres, 2–4 jugadores, bots, reconexión de 15 s, temporizador, chat efímero, revancha, persistencia SQLite y **avatares de perfil**.
- Cliente rediseñado (v6 + v7):
  - **Portada, lobby, partida y pantalla final sin scroll** en 1920×900, 1280×800 y 390×844.
  - **Portada como escena de café**: ventana arqueada, planta, gato dormido, tocadiscos, taza humeante, avatar sentado en la barra, saludo horario personalizado, frase del día y carta de menú con iconos SVG y microcopy.
  - **Lobby como mesa preparada**: 4 sillas alrededor del mantel, código de sala en servilleta con sello de copiado, sello de «Listo en mesa» y controles táctiles segmentados.
  - **Sonido del café y música viva**: 20 SFX de UI diferenciados + 12 SFX de juego, progresión lo-fi de 24 compases con scheduler Web Audio, 3 atmósferas (`Tertulia`, `Lluvia`, `Noche`), crossfade por pantalla y ducking automático.
  - **Cabecera estable en dos filas**, **menús mutuamente excluyentes (`activeOverlay`)**, **jerarquía clara del tablero**, **fichas 1:1 con caricatura 3/4**, **Cambiar comodín explicado** y **pantalla final escenificada (`FinishedScreen`)** con placa **O & A**.
- Verificado: `typecheck`, `lint`, `build`, **49 tests**, E2E de Playwright y capturas `docs/referencias/ui-v7-*.png`.
- **Requiere Node 22.5+** (usa `node:sqlite`). Recomendado Node 24 LTS.
- Montaje local de producción con PWA instalable mediante HTTPS temporal; mano centrada, iconos 192/512 y service worker corregido. Pendiente: prueba física en iPhone/Android real con la checklist de `CAMBIOS.md` y despliegue en Render.

## Comandos

```bash
npx pnpm install
npx pnpm typecheck
npx pnpm test
npx pnpm test:e2e
npx pnpm build
npx pnpm lint
npx pnpm dev
```

> `npx pnpm dev` arranca el servidor full-stack (API + Vite) en <http://localhost:3000>.
> `pnpm` no está instalado globalmente en este equipo; usa `npx pnpm ...` o instala pnpm.

---

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/PLAN.md`](docs/PLAN.md) | Plan maestro: visión, alcance, stack y riesgos |
| [`docs/REGLAS.md`](docs/REGLAS.md) | Reglamento operativo y casos límite |
| [`docs/DECISIONES.md`](docs/DECISIONES.md) | Registro de decisiones del proyecto |
| [`docs/SESIONES.md`](docs/SESIONES.md) | Registro de sesiones de trabajo |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | Stack, arquitectura, datos y despliegue |
| [`docs/ARTE.md`](docs/ARTE.md) | Dirección de arte y pipeline de assets |
| [`docs/ARTE_BIBLE.md`](docs/ARTE_BIBLE.md) | Biblia visual: paleta, cámara, materiales, personajes, UI y animaciones |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Versiones, fechas y alcance |
| [`docs/NOMBRES.md`](docs/NOMBRES.md) | Brainstorming de nombres |
| [`docs/ARGON/`](docs/ARGON/README.md) | Contexto y prompts para Gemini 4 Argon |
| [`packages/content/board.json`](packages/content/board.json) | Datos validados del tablero |

---

## Estructura del repositorio

```text
cafe-international/
├─ apps/
│  ├─ web/          Cliente React + React Three Fiber + UI + PWA
│  └─ server/       Servidor Colyseus + persistencia + API
├─ packages/
│  ├─ engine/       Motor de reglas puras (sin React ni Three)
│  ├─ content/      Datos: board.json, países, textos, presets
│  └─ ui/           Componentes de UI compartidos
├─ tools/           Importar tablero, optimizar assets, scripts
├─ e2e/             Pruebas end-to-end con Playwright
└─ docs/            Documentación del proyecto
```

---

## Reglas en una frase

Cada jugador siembra invitados en las mesas de su nacionalidad, respetando el equilibrio de sexos y aprovechando las **sillas compartidas** entre dos mesas; quien no encuentra sitio va a la **barra**, que reparte puntos al principio y penalizaciones después. Gana quien más puntos tiene al final.

---

## Notas legales

- Proyecto privado; **todos los derechos reservados** mientras no se decida licencia.
- Las mecánicas del juego no se protegen, pero el arte, el logotipo y el nombre original sí.
- El arte final será **original** (inspirado en el estilo cómico y papercraft, sin copiar assets oficiales) para permitir una futura monetización sin conflictos.
- No se usarán fotos, nombres reales ni notas de voz de los jugadores.

---

## Cómo se trabajará

- Cada sesión de trabajo se registra en [`docs/SESIONES.md`](docs/SESIONES.md).
- Cada decisión relevante se registra en [`docs/DECISIONES.md`](docs/DECISIONES.md).
- El roadmap y el alcance viven en [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Los cambios se subirán a GitHub cuando el repositorio tenga nombre definitivo.

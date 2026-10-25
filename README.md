# Cafetulia

> Juego digital cozy inspirado en *Café International* (Rudi Hoffmann, 1989).
> Repositorio: <https://github.com/Oli358/cafetulia-game>
> Nombre comercial decidido: **Cafetulia**.

Juego digital cozy, online y para **2–4 jugadores**, basado en **Café International** (Rudi Hoffmann, 1989, Spiel des Jahres). La propuesta es un **diorama 2.5D**: tablero 2D fiel al original + fichas, sillas, mesas y barra en 3D tipo papercraft. PWA jugable en móvil y PC.

---

## Estado actual

- **v1.1 — Rediseño de UI integrado y verificado en local.**
- Monorepo con pnpm workspaces, TypeScript estricto, ESLint, Prettier, Vitest y Playwright.
- Motor de reglas determinista en `packages/engine`: **44 tests en verde** (motor + servidor + helpers) y **1.000 partidas simuladas** con `fast-check`.
- `packages/content/board.json` validado: **24 mesas, 68 sillas, 28 compartidas y 20 plazas de barra**.
- Servidor autoritativo con Colyseus: salas privadas de 6 caracteres, 2–4 jugadores, bots, reconexión de 15 s, temporizador, chat efímero, revancha y persistencia SQLite.
- Cliente rediseñado: **pantalla única sin scroll**, tablero ilustrado de 13×13 con mesas, sillas y barra central, **24 personajes con nombre y frase**, cartas 2:3, fichas con retrato y bandera, **monedas 1/5/10** con vuelo al puntuar y al penalizar, modal **“Ver café”** 3D, cajón de registro/chat y PWA básica.
- Verificado en local: `typecheck`, `lint`, `build`, **44 tests**, E2E de Playwright, `/health`, creación de salas y **sin scroll en 1280×800 y 390×844**.
- **Requiere Node 22.5+** (usa `node:sqlite`). Recomendado Node 24 LTS. En este equipo está instalado Node 24.20.0.
- Pendiente: desplegar en Render, probar en iPhone/Android reales, añadir service worker/offline y reducir el bundle (~830 KB).

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

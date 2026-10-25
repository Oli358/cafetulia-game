# Cafetulia

> Juego digital cozy inspirado en *Café International* (Rudi Hoffmann, 1989).
> Repositorio: <https://github.com/Oli358/cafetulia-game>
> Nombre comercial decidido: **Cafetulia**.

Juego digital cozy, online y para **2–4 jugadores**, basado en **Café International** (Rudi Hoffmann, 1989, Spiel des Jahres). La propuesta es un **diorama 2.5D**: tablero 2D fiel al original + fichas, sillas, mesas y barra en 3D tipo papercraft. PWA jugable en móvil y PC.

---

## Estado actual

- **v1.3 integrada y verificada (entrega v6): cabecera estable en dos filas, menús exclusivos en portal dentro del viewport, `Cambiar comodín` explicado, final escenificado con confeti y créditos `O & A`, caricaturas 3/4 y dock translúcido. Próximo pase: menú personalizado, SFX de UI y música con variación.**
- Monorepo con pnpm workspaces, TypeScript estricto, ESLint, Prettier, Vitest y Playwright.
- Motor de reglas determinista en `packages/engine`: **48 tests en verde** (motor + servidor + helpers) y **1.000 partidas simuladas** con `fast-check`.
- `packages/content/board.json` validado: **24 mesas, 68 sillas, 28 compartidas y 20 plazas de barra**.
- Servidor autoritativo con Colyseus: salas privadas de 6 caracteres, 2–4 jugadores, bots, reconexión de 15 s, temporizador, chat efímero, revancha, persistencia SQLite y **avatares de perfil**.
- Cliente rediseñado (v6):
  - **Portada, lobby, partida y pantalla final sin scroll** en 1920×900, 1280×800 y 390×844.
  - **Cabecera estable en dos filas**: acciones fijas en una sola fila superior y marcador compacto con `formatScoreEs` (`1.234`, `9.999`) en la segunda fila.
  - **Menús mutuamente excluyentes (`activeOverlay`)** y popovers renderizados en portal siempre dentro del viewport (`<AnchoredPopover>`).
  - **Jerarquía clara del tablero**: banderas de mesa discretas (`14px`) frente a fichas sentadas cuadradas prominentes (`6.5%`), sillas compartidas bicolores y sillas vacías neutras.
  - **Fichas 1:1 con bandera de fondo y caricatura 3/4 original**, sin texto impreso; el detalle aparece al seleccionar; clic/tap como interacción principal + drag opcional.
  - **Cambiar comodín** explicado paso a paso en popover contextual con confirmación.
  - **Pantalla final escenificada (`FinishedScreen`)**: sello `¡FINAL!`, ganador destacado, lluvia de confeti de papel, clasificación escalonada, créditos y dedicatoria **O & A**.
  - **Monedas 1 negra, 5 roja, 10 azul**, pilas exactas, animación **coin flip** 3D y sonido arcade sintetizado de dos notas ascendentes.
  - **16 avatares prehechos**, **subtítulos de eventos** (Cómic, Café, Arcade) y **Café Vivo 3D** con carga diferida (`React.lazy` + `Suspense`).
- Verificado: `typecheck`, `lint`, `build`, **48 tests**, E2E de Playwright y 6 capturas `docs/referencias/ui-v6-*.png`.
- **Requiere Node 22.5+** (usa `node:sqlite`). Recomendado Node 24 LTS.
- Pendiente: convertir la portada/lobby en una escena de café personalizada, añadir SFX diferenciados por acción, ampliar la música lo-fi con capas y variación, probar en iPhone/Android reales y desplegar en Render.

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

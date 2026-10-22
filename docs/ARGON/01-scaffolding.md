# Fase 1 — Scaffolding del monorepo

**Objetivo:** dejar el monorepo listo, sin implementar todavía la lógica del juego.

```text
TAREA: Scaffolding del monorepo de Cafetulia.

Contexto: acabas de leer 00-contexto.md. El repositorio ya tiene documentación y packages/content/board.json.

Haz lo siguiente:

1. Crea un monorepo con pnpm workspaces en la raíz:
   - apps/web
   - apps/server
   - packages/engine
   - packages/content
   - packages/ui
   - tools
   - e2e

2. Configura en la raíz:
   - package.json con scripts: dev, build, test, test:e2e, lint, typecheck, format.
   - tsconfig.base.json con TypeScript estricto.
   - .editorconfig, .prettierrc, eslint.config.js.
   - vitest.config.ts.
   - playwright.config.ts.

3. En cada paquete:
   - package.json con nombre @cafetulia/<paquete>, type module, scripts.
   - tsconfig.json que extienda el base.
   - src/index.ts vacío o con un export mínimo.

4. En apps/web:
   - Vite + React + TypeScript.
   - Dependencias: react, react-dom, three, @react-three/fiber, @react-three/drei, zustand, tailwindcss.
   - Estructura src/ con carpetas scene, ui, state, i18n.
   - Página inicial que diga "Cafetulia" y nada más.

5. En apps/server:
   - Node + TypeScript + Colyseus.
   - Estructura src/ con rooms, persistence, api.
   - Endpoint /health que devuelva { status: "ok" }.

6. En packages/engine:
   - Dependencias: ninguna de React/Three.
   - Un test que valide packages/content/board.json:
     * 24 mesas.
     * 68 sillas únicas.
     * 28 sillas compartidas.
     * 20 plazas de barra.
     * Cada mesa tiene 4 sillas.
     * Cada silla compartida pertenece exactamente a 2 mesas.

7. No implementes todavía reglas, servidor ni escena 3D.

CRITERIOS DE ACEPTACIÓN
- pnpm install funciona.
- pnpm typecheck pasa.
- pnpm test pasa, incluido el test de validación del tablero.
- pnpm build pasa.
- El README.md raíz se actualiza con los comandos.

AL TERMINAR
- Actualiza docs/SESIONES.md con la sesión.
- Commit: chore: scaffolding del monorepo.
- Push a main.
```
